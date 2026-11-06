"use client";

import { formatRange, shopClock } from "@/lib/hours";
import { useMinuteClock } from "@/lib/useMinuteClock";
import type { WeekHours } from "@/lib/types";

export function TodayHours({ hours }: { hours: WeekHours }) {
  const minute = useMinuteClock();
  if (!minute) return <>Open 7 days</>;
  const { day } = shopClock(new Date(minute * 60_000));
  return <>{formatRange(hours[day])}</>;
}
