import { defineField, defineType } from "sanity";
import { StatusBadge } from "../components/StatusBadge";
import { niceDate, niceTime } from "../lib/format";

export const BOOKING_STATUSES = [
  { title: "New (needs confirming)", value: "new" },
  { title: "Confirmed", value: "confirmed" },
  { title: "Completed", value: "completed" },
  { title: "No-show", value: "no-show" },
  { title: "Cancelled", value: "cancelled" },
];

export const PAYMENT_STATUSES = [
  { title: "Unpaid (pays at the shop)", value: "unpaid" },
  { title: "Awaiting e-Transfer", value: "awaiting-etransfer" },
  { title: "Paid", value: "paid" },
];

const locked = { readOnly: true } as const;

/**
 * Bookings live at IDs like "booking.<uuid>". Sanity only serves IDs that contain
 * a "." to signed-in users or requests with a token, so they never reach the public API.
 * liveEdit: changes save straight away, no Publish button to forget.
 */
export const booking = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  liveEdit: true,
  fields: [
    defineField({ name: "status", type: "string", options: { list: BOOKING_STATUSES, layout: "dropdown" }, initialValue: "new", validation: (r) => r.required() }),
    defineField({ name: "paymentStatus", type: "string", options: { list: PAYMENT_STATUSES, layout: "dropdown" }, initialValue: "unpaid" }),
    defineField({ name: "internalNotes", title: "Notes for the shop (private)", type: "text", rows: 3 }),
    defineField({ name: "reference", title: "Reference number", type: "string", ...locked }),
    defineField({ name: "date", title: "Date", type: "string", description: "YYYY-MM-DD", validation: (r) => r.required().regex(/^\d{4}-\d{2}-\d{2}$/) }),
    defineField({ name: "startTime", title: "Start time", type: "string", description: "24-hour, e.g. 14:30", validation: (r) => r.required().regex(/^\d{2}:\d{2}$/) }),
    defineField({ name: "durationMinutes", title: "Chair time (minutes)", type: "number" }),
    defineField({ name: "serviceName", title: "Service", type: "string", ...locked }),
    defineField({ name: "serviceTier", title: "Appointment length", type: "string", options: { list: ["standard", "longer"] }, ...locked }),
    defineField({ name: "serviceRef", title: "Service (link)", type: "reference", to: [{ type: "service" }], weak: true, ...locked }),
    defineField({ name: "barberName", title: "Barber", type: "string", ...locked }),
    defineField({ name: "barberRef", title: "Barber (link)", type: "reference", to: [{ type: "barber" }], weak: true, ...locked }),
    defineField({ name: "customerName", title: "Customer", type: "string", ...locked }),
    defineField({ name: "mobile", type: "string", ...locked }),
    defineField({ name: "email", type: "string", ...locked }),
    defineField({ name: "notes", title: "Customer notes", type: "text", rows: 2, ...locked }),
    defineField({ name: "paymentMethod", type: "string", options: { list: ["shop", "interac", "helcim"] }, ...locked }),
    defineField({ name: "subtotal", type: "number", ...locked }),
    defineField({ name: "hst", title: "HST", type: "number", ...locked }),
    defineField({ name: "total", type: "number", ...locked }),
    defineField({ name: "emailStatus", title: "Email status", type: "string", ...locked }),
    defineField({ name: "notifiedStatus", type: "string", hidden: true, ...locked }),
    defineField({ name: "createdAt", type: "datetime", ...locked }),
  ],
  orderings: [
    { title: "Date and time", name: "when", by: [{ field: "date", direction: "asc" }, { field: "startTime", direction: "asc" }] },
  ],
  preview: {
    select: { date: "date", time: "startTime", name: "customerName", service: "serviceName", barber: "barberName", status: "status" },
    prepare: ({ date, time, name, service, barber, status }) => ({
      title: `${niceDate(date)} · ${niceTime(time)} · ${name ?? "Customer"}`,
      subtitle: `${service ?? "Service"} with ${barber ?? "any barber"} · ${BOOKING_STATUSES.find((s) => s.value === status)?.title.split(" (")[0] ?? status}`,
      media: <StatusBadge status={status} />,
    }),
  },
});
