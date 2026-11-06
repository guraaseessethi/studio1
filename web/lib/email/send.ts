import "server-only";
import { Resend } from "resend";
import { render, toPlainText } from "@react-email/components";
import { createElement } from "react";
import { longDate } from "@/lib/booking/dates";
import type { Contacts } from "@/lib/contacts";
import { formatClock } from "@/lib/hours";
import type { BookingData, PaymentOutcome } from "@/lib/payments/types";
import type { SiteSettings } from "@/lib/types";
import { BookingEmail, type BookingEmailProps, type EmailRow } from "./templates/BookingEmail";

export type EmailStatus = "sent" | "partial" | "failed" | "skipped";

const money = (n: number) => `$${n.toFixed(2)}`;

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Where the owner's Studio lives (the hosted Studio URL), no trailing slash. */
export const studioUrl = () => (process.env.STUDIO_URL ?? "https://www.sanity.io/manage").replace(/\/$/, "");

function from(settings: SiteSettings) {
  return `${settings.businessName} <${process.env.BOOKING_FROM_EMAIL || "onboarding@resend.dev"}>`;
}

async function deliver(to: string, subject: string, props: BookingEmailProps, settings: SiteSettings, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const html = await render(createElement(BookingEmail, props));
    const { error } = await new Resend(key).emails.send({
      from: from(settings),
      to,
      subject,
      html,
      text: toPlainText(html),
      replyTo,
    });
    if (error) {
      console.error("[email] Resend rejected a message:", error.name);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send failed:", err instanceof Error ? err.message : "unknown error");
    return false;
  }
}

type Details = Pick<BookingData, "reference" | "serviceName" | "tierLabel" | "barberName" | "date" | "time" | "durationMinutes" | "total">;

function detailRows(b: Details, tierNote: boolean): EmailRow[] {
  return [
    ["Reference", b.reference],
    ["Service", b.tierLabel && tierNote ? `${b.serviceName} (${b.tierLabel.toLowerCase()})` : b.serviceName],
    ["Barber", b.barberName],
    ["Date", longDate(b.date)],
    ["Time", `${formatClock(b.time)} (${b.durationMinutes} min)`],
    ["Total with HST", money(b.total)],
  ];
}

function shopFooter(s: SiteSettings): string[] {
  return [
    `${s.businessName} · ${s.street}, ${s.city}, ${s.region} ${s.postalCode}`,
    `Questions? Call ${s.phone}.`,
  ];
}

/** Customer, owner and (when a barber was chosen) barber emails for a new request. */
export async function sendNewBookingEmails(
  b: BookingData,
  outcome: PaymentOutcome,
  contacts: Contacts,
  settings: SiteSettings,
): Promise<EmailStatus> {
  const jobs: Promise<boolean>[] = [];
  const studioLink = `${studioUrl()}/intent/edit/id=${encodeURIComponent(b.id)};type=booking/`;

  if (b.email) {
    jobs.push(
      deliver(
        b.email,
        `Booking request received · ${b.reference}`,
        {
          preview: `We have your request for ${longDate(b.date)} at ${formatClock(b.time)}.`,
          heading: "Booking request received",
          intro: `Thanks ${b.customerName.split(" ")[0]}. Studio 1 will confirm your time. Keep this reference: ${b.reference}.`,
          rows: detailRows(b, true),
          sectionTitle: "How to pay",
          sectionLines: outcome.emailLines,
          footerLines: [`Cancellation policy: ${settings.cancellationPolicy}`, ...shopFooter(settings)],
        },
        settings,
        contacts.ownerEmail,
      ),
    );
  }

  const staffProps: BookingEmailProps = {
    preview: `${b.customerName} · ${longDate(b.date)} ${formatClock(b.time)} · ${b.serviceName}`,
    heading: "New booking request",
    intro: "A client asked for this time on the website. Open it in the Studio to confirm.",
    rows: [
      ...detailRows(b, true),
      ["Customer", b.customerName],
      ["Mobile", b.mobile],
      ["Email", b.email || "Not given"],
      ["Notes", b.notes || "None"],
      ["Payment", b.paymentMethod === "interac" ? "Interac e-Transfer (awaiting)" : b.paymentMethod === "shop" ? "Pay at the shop" : "Card"],
    ],
    action: { label: "Open in Studio", href: studioLink },
    footerLines: [`Sent from the ${settings.businessName} website.`],
  };
  const staffSubject = `New booking request · ${longDate(b.date)} ${formatClock(b.time)} · ${b.customerName}`;
  const staff = new Set<string>();
  if (contacts.ownerEmail) staff.add(contacts.ownerEmail);
  if (!b.anyBarber) {
    // Only a barber the client chose by name is emailed; "No preference" goes to the owner alone.
    const own = contacts.barberEmails.find((x) => x.barberId === b.barberId);
    if (own) staff.add(own.email);
  }
  for (const to of staff) jobs.push(deliver(to, staffSubject, staffProps, settings));

  if (jobs.length === 0) return "skipped";
  const results = await Promise.all(jobs);
  return results.every(Boolean) ? "sent" : results.some(Boolean) ? "partial" : "failed";
}

export type StatusChange = "confirmed" | "cancelled";

export async function sendStatusEmail(
  b: Pick<BookingData, "reference" | "serviceName" | "barberName" | "date" | "time" | "durationMinutes" | "customerName" | "email" | "total" | "tierLabel">,
  change: StatusChange,
  contacts: Contacts,
  settings: SiteSettings,
): Promise<boolean> {
  const confirmed = change === "confirmed";
  return deliver(
    b.email,
    confirmed ? `Booking confirmed · ${b.reference}` : `Booking cancelled · ${b.reference}`,
    {
      preview: confirmed ? `You're booked for ${longDate(b.date)} at ${formatClock(b.time)}.` : `Your booking ${b.reference} was cancelled.`,
      heading: confirmed ? "You're booked" : "Booking cancelled",
      intro: confirmed
        ? `Thanks ${b.customerName.split(" ")[0]}, your time is confirmed. See you at the shop.`
        : `Hi ${b.customerName.split(" ")[0]}, your booking was cancelled. To book another time, visit our website or call ${settings.phone}.`,
      rows: detailRows(b, true),
      footerLines: confirmed ? [`Cancellation policy: ${settings.cancellationPolicy}`, ...shopFooter(settings)] : shopFooter(settings),
    },
    settings,
    contacts.ownerEmail,
  );
}
