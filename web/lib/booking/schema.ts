import { z } from "zod";

export const digitsOnly = (v: string) => v.replace(/\D/g, "");

/** Typing helper: "7058811976" -> "(705) 881-1976", building up as you type. */
export function formatMobile(raw: string): string {
  let d = digitsOnly(raw);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const detailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "That name is too long"),
  mobile: z.string().refine((v) => digitsOnly(v).length === 10, "Enter a 10-digit mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  notes: z.string().max(300, "Keep notes to 300 characters"),
});

export type Details = z.infer<typeof detailsSchema>;

export function detailErrors(d: Details): Partial<Record<keyof Details, string>> {
  const res = detailsSchema.safeParse(d);
  if (res.success) return {};
  const out: Partial<Record<keyof Details, string>> = {};
  for (const issue of res.error.issues) {
    const key = issue.path[0] as keyof Details;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** What the browser sends to POST /api/bookings. The server re-checks everything. */
export const bookingRequestSchema = detailsSchema.extend({
  serviceId: z.string().min(1),
  tier: z.enum(["standard", "longer"]),
  barberId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  payment: z.string().min(1),
  /** Honeypot: real visitors never see or fill this. */
  website: z.string().max(200).optional(),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export type BookingSuccess = {
  ok: true;
  reference: string;
  barberName: string;
  serviceName: string;
  date: string;
  time: string;
  total: number;
  payment: string;
  emailed: boolean;
  /** Shown on the success screen when paying by e-Transfer. */
  etransfer?: { email: string; amount: number; deadline: string; instructions?: string };
};

export type BookingFailure = {
  ok: false;
  code: "validation" | "slot_taken" | "rate_limited" | "unavailable" | "server";
  message: string;
};

export type BookingResponse = BookingSuccess | BookingFailure;
