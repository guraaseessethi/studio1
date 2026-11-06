import "server-only";
import { randomUUID } from "node:crypto";
import { mapSettings } from "@/lib/content";
import type { Barber, Service } from "@/lib/content/types";
import { getContacts } from "@/lib/contacts";
import { sendNewBookingEmails } from "@/lib/email/send";
import { enabledProvider } from "@/lib/payments";
import type { BookingData } from "@/lib/payments/types";
import { serverClient } from "@/lib/sanity/server";
import { toMinutes } from "@/lib/hours";
import type { SiteSettings, Weekday } from "@/lib/types";
import { hasProject } from "@/sanity/lib/env";
import { nextDates, shopToday } from "./dates";
import { quote, tierOf } from "./pricing";
import type { BookingFailure, BookingRequest, BookingSuccess } from "./schema";
import { type Busy, NO_PREFERENCE, eligibleBarbers, pickBarber, slotsForDay } from "./slots";

const fresh = { cache: "no-store" } as const;
const LIVE = `["new","confirmed"]`;

type RawSettings = Parameters<typeof mapSettings>[0];

/** Everything the booking checks need, read straight from Sanity (never from the page cache). */
async function loadContext(serviceId: string) {
  const raw = await serverClient.fetch<{
    settings: RawSettings;
    service: (Omit<Service, "id" | "addonId"> & { _id: string }) | null;
    barbers: { _id: string; name: string; workingDays?: Weekday[]; serviceIds?: string[] }[];
  }>(
    `{
      "settings": *[_id == "siteSettings"][0]{
        businessName, phone, street, city, region, postalCode, hours, hstRate,
        slotIntervalMinutes, leadTimeMinutes, cancellationPolicy, etransferDeadline
      },
      "service": *[_type == "service" && _id == $serviceId && active != false][0]{
        _id, name, group, description, price, duration, price2, duration2, tier2Label
      },
      "barbers": *[_type == "barber" && active != false]{ _id, name, workingDays, "serviceIds": services[]._ref }
    }`,
    { serviceId },
    fresh,
  );
  const settings: SiteSettings = mapSettings(raw.settings);
  const service: Service | null = raw.service ? { ...raw.service, id: raw.service._id } : null;
  const barbers: Barber[] = raw.barbers.map((b) => ({
    id: b._id,
    name: b.name,
    slug: "",
    specialties: [],
    workingDays: b.workingDays ?? [],
    serviceIds: (b.serviceIds ?? []).filter(Boolean),
  }));
  return { settings, service, barbers };
}

type DayRow = { _id: string; _createdAt: string; barberId: string; startTime: string; durationMinutes: number };

async function liveBookingsOn(date: string): Promise<DayRow[]> {
  return serverClient.fetch<DayRow[]>(
    `*[_type == "booking" && date == $date && status in ${LIVE}]{ _id, _createdAt, "barberId": barberRef._ref, startTime, durationMinutes }`,
    { date },
    fresh,
  );
}

const toBusy = (rows: DayRow[], date: string): Busy[] =>
  rows
    .filter((r) => r.barberId)
    .map((r) => {
      const start = toMinutes(r.startTime);
      return { barberId: r.barberId, date, start, end: start + r.durationMinutes };
    });

async function nextReference(date: string): Promise<string> {
  const yymm = date.slice(2, 4) + date.slice(5, 7);
  const id = `private.counter.${yymm}`;
  await serverClient.createIfNotExists({ _id: id, _type: "bookingCounter", value: 0 });
  const updated = await serverClient.patch(id).inc({ value: 1 }).commit<{ value: number }>();
  return `S1-${yymm}-${String(updated.value).padStart(4, "0")}`;
}

const fail = (code: BookingFailure["code"], message: string): BookingFailure => ({ ok: false, code, message });

export const bookingConfigured = () => hasProject && Boolean(process.env.SANITY_API_WRITE_TOKEN);

export async function createBooking(req: BookingRequest): Promise<BookingSuccess | BookingFailure> {
  const now = new Date();
  const { settings, service, barbers } = await loadContext(req.serviceId);

  if (!service) return fail("validation", "That service is no longer available. Please pick another.");
  if (req.tier === "longer" && !(service.price2 && service.duration2)) return fail("validation", "That appointment length isn't available.");

  const provider = await enabledProvider(req.payment);
  if (!provider) return fail("validation", "That payment option isn't available. Please pick another.");

  const eligible = eligibleBarbers(barbers, service);
  if (req.barberId !== NO_PREFERENCE && !eligible.some((b) => b.id === req.barberId)) {
    return fail("validation", "That barber isn't available for this service. Please pick another.");
  }
  if (!nextDates(now, 14).includes(req.date)) return fail("slot_taken", "That day can't be booked online. Please pick another.");

  const chosen = tierOf(service, req.tier);
  const rows = await liveBookingsOn(req.date);
  const busy = toBusy(rows, req.date);
  const slot = slotsForDay({
    date: req.date,
    now,
    hours: settings.hours,
    interval: settings.slotIntervalMinutes,
    leadMinutes: settings.leadTimeMinutes,
    duration: chosen.duration,
    barbers: eligible,
    barberId: req.barberId,
    busy,
  }).find((s) => s.time === req.time);
  if (!slot) return fail("slot_taken", "Sorry, that time was just taken. Please pick another.");

  const barberId = req.barberId === NO_PREFERENCE ? pickBarber(slot.barberIds, busy, req.date) : req.barberId;
  const barber = eligible.find((b) => b.id === barberId) as Barber;

  const money = quote(chosen.price, settings.hstRate);
  const id = `booking.${randomUUID()}`;
  const reference = await nextReference(shopToday(now).date);
  const email = (req.email ?? "").trim();

  const data: BookingData = {
    id,
    reference,
    serviceName: service.name,
    tierLabel: req.tier === "longer" ? (service.tier2Label ?? "Longer appointment") : undefined,
    barberId,
    barberName: barber.name,
    anyBarber: req.barberId === NO_PREFERENCE,
    date: req.date,
    time: req.time,
    durationMinutes: chosen.duration,
    customerName: req.name.trim(),
    mobile: req.mobile,
    email,
    notes: (req.notes ?? "").trim(),
    paymentMethod: provider.id,
    ...money,
  };

  const contacts = await getContacts();
  let outcome;
  try {
    outcome = await provider.onBookingCreated(data, { contacts, settings });
  } catch (err) {
    console.error("[booking] payment provider failed:", err instanceof Error ? err.message : "unknown error");
    return fail("unavailable", `That payment option isn't working right now. Please choose another or call ${settings.phone}.`);
  }

  // Save first. Emails come after and can never block the booking.
  await serverClient.create({
    _id: id,
    _type: "booking",
    reference,
    status: "new",
    paymentStatus: outcome.paymentStatus,
    serviceRef: { _type: "reference", _ref: service.id, _weak: true },
    serviceName: service.name,
    serviceTier: req.tier,
    barberRef: { _type: "reference", _ref: barberId, _weak: true },
    barberName: data.anyBarber ? `${barber.name} (no preference)` : barber.name,
    date: req.date,
    startTime: req.time,
    durationMinutes: chosen.duration,
    customerName: data.customerName,
    mobile: data.mobile,
    email,
    notes: data.notes,
    paymentMethod: provider.id,
    subtotal: money.subtotal,
    hst: money.hst,
    total: money.total,
    emailStatus: "pending",
    createdAt: now.toISOString(),
  });

  // Two requests can pass the check above together. The earlier-created booking keeps the slot.
  const start = toMinutes(req.time);
  const mine = await serverClient.fetch<{ _createdAt: string } | null>(`*[_id == $id][0]{ _createdAt }`, { id }, fresh);
  const clash = (await liveBookingsOn(req.date)).find(
    (r) =>
      r._id !== id &&
      r.barberId === barberId &&
      start < toMinutes(r.startTime) + r.durationMinutes &&
      start + chosen.duration > toMinutes(r.startTime) &&
      (r._createdAt < (mine?._createdAt ?? "") || (r._createdAt === mine?._createdAt && r._id < id)),
  );
  if (clash) {
    await serverClient.delete(id);
    return fail("slot_taken", "Sorry, that time was just taken. Please pick another.");
  }

  const emailStatus = await sendNewBookingEmails(data, outcome, contacts, settings);
  await serverClient.patch(id).set({ emailStatus }).commit().catch((err) => {
    console.error("[booking] could not record email status:", err instanceof Error ? err.message : "unknown error");
  });

  return {
    ok: true,
    reference,
    barberName: data.barberName,
    serviceName: service.name,
    date: req.date,
    time: req.time,
    total: money.total,
    payment: provider.label,
    emailed: Boolean(email) && (emailStatus === "sent" || emailStatus === "partial"),
    etransfer: outcome.etransfer,
  };
}
