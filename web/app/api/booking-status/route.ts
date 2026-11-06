import { NextResponse, type NextRequest } from "next/server";
import { parseWebhook } from "@/lib/sanity/webhook";
import { mapSettings } from "@/lib/content";
import { getContacts } from "@/lib/contacts";
import { sendStatusEmail } from "@/lib/email/send";
import { serverClient } from "@/lib/sanity/server";

type Doc = {
  _id: string;
  _rev: string;
  status?: string;
  notifiedStatus?: string;
  reference?: string;
  serviceName?: string;
  serviceTier?: string;
  barberName?: string;
  date?: string;
  startTime?: string;
  durationMinutes?: number;
  customerName?: string;
  email?: string;
  total?: number;
};

/**
 * Sanity webhook on booking updates. Emails the customer once when a booking is
 * confirmed or cancelled; `notifiedStatus` on the booking prevents repeats.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_BOOKING_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Webhook secret is not set" }, { status: 503 });

  const { valid, body } = await parseWebhook<{ _id?: string }>(request, secret);
  if (!valid) return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  const id = body?._id;
  if (!id || !id.startsWith("booking.")) return NextResponse.json({ ok: true, skipped: "not a booking" });

  const doc = await serverClient.fetch<Doc | null>(
    `*[_id == $id][0]{ _id, _rev, status, notifiedStatus, reference, serviceName, serviceTier, barberName, date, startTime, durationMinutes, customerName, email, total }`,
    { id },
    { cache: "no-store" },
  );
  if (!doc) return NextResponse.json({ ok: true, skipped: "missing" });

  const change = doc.status === "confirmed" || doc.status === "cancelled" ? doc.status : null;
  if (!change || doc.notifiedStatus === change) return NextResponse.json({ ok: true, skipped: "nothing to send" });
  if (!doc.email || !doc.reference || !doc.date || !doc.startTime || !doc.customerName) {
    return NextResponse.json({ ok: true, skipped: "no customer email" });
  }

  // Claim this status change first. If two webhook calls race, only one wins the revision check.
  try {
    await serverClient.patch(id).ifRevisionId(doc._rev).set({ notifiedStatus: change }).commit();
  } catch {
    return NextResponse.json({ ok: true, skipped: "already handled" });
  }

  const settings = mapSettings(
    await serverClient.fetch(
      `*[_id == "siteSettings"][0]{ businessName, phone, street, city, region, postalCode, cancellationPolicy }`,
      {},
      { cache: "no-store" },
    ),
  );
  const sent = await sendStatusEmail(
    {
      reference: doc.reference,
      serviceName: doc.serviceName ?? "Appointment",
      tierLabel: doc.serviceTier === "longer" ? "Longer appointment" : undefined,
      barberName: doc.barberName ?? "Studio 1",
      date: doc.date,
      time: doc.startTime,
      durationMinutes: doc.durationMinutes ?? 0,
      customerName: doc.customerName,
      email: doc.email,
      total: doc.total ?? 0,
    },
    change,
    await getContacts(),
    settings,
  );

  if (!sent) {
    // Give the next webhook retry another chance.
    const restore = serverClient.patch(id);
    await (doc.notifiedStatus ? restore.set({ notifiedStatus: doc.notifiedStatus }) : restore.unset(["notifiedStatus"])).commit();
    return NextResponse.json({ ok: false, error: "Email failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sent: change });
}
