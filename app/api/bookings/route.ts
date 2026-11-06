import { NextResponse, type NextRequest } from "next/server";
import { bookingConfigured, createBooking } from "@/lib/booking/server";
import { type BookingFailure, bookingRequestSchema } from "@/lib/booking/schema";
import { allowBooking } from "@/lib/rateLimit";

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const failure = (code: BookingFailure["code"], message: string, status: number, headers?: Record<string, string>) =>
  json({ ok: false, code, message } satisfies BookingFailure, status, headers);

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return failure("validation", "We couldn't read that request.", 400);
  }

  const parsed = bookingRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return failure("validation", first?.message ?? "Please check your details and try again.", 400);
  }

  // Honeypot: a person never fills the hidden field. Look successful, save nothing.
  if (parsed.data.website) {
    return json({ ok: true, reference: "S1-0000-0000", barberName: "Studio 1", serviceName: "", date: parsed.data.date, time: parsed.data.time, total: 0, payment: "", emailed: false });
  }

  if (!bookingConfigured()) {
    return failure("unavailable", "Online booking isn't switched on yet. Please call the shop to book.", 503);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const limit = await allowBooking(ip);
  if (!limit.ok) {
    return failure("rate_limited", "Too many booking requests from this connection. Please try again later or call the shop.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  try {
    const result = await createBooking(parsed.data);
    return json(result, result.ok ? 200 : result.code === "slot_taken" ? 409 : result.code === "validation" ? 400 : 503);
  } catch (err) {
    console.error("[booking] failed:", err instanceof Error ? err.message : "unknown error");
    return failure("server", "Something went wrong and your request was not saved. Please try again or call the shop.", 500);
  }
}
