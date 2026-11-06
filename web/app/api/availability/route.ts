import { NextResponse } from "next/server";
import { hasProject } from "@/lib/sanity/env";
import { shopToday, addDays } from "@/lib/booking/dates";
import { toMinutes } from "@/lib/hours";
import { serverClient } from "@/lib/sanity/server";
import type { Busy } from "@/lib/booking/slots";

type Row = { barberId: string | null; date: string; startTime: string; durationMinutes: number };

/** Busy times only (no customer details). Always fresh: bookings change by the minute. */
export async function GET() {
  const today = shopToday(new Date()).date;
  if (!hasProject) return NextResponse.json({ busy: [] satisfies Busy[] }, { headers: { "Cache-Control": "no-store" } });

  const rows = await serverClient.fetch<Row[]>(
    `*[_type == "booking" && status in ["new","confirmed"] && date >= $from && date <= $to]{
      "barberId": barberRef._ref, date, startTime, durationMinutes
    }`,
    { from: today, to: addDays(today, 15) },
    { cache: "no-store" },
  );
  const busy: Busy[] = rows
    .filter((r) => r.barberId)
    .map((r) => {
      const start = toMinutes(r.startTime);
      return { barberId: r.barberId as string, date: r.date, start, end: start + r.durationMinutes };
    });
  return NextResponse.json({ busy }, { headers: { "Cache-Control": "no-store" } });
}
