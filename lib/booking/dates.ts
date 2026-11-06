import { TIME_ZONE } from "@/lib/defaults";
import { shopClock } from "@/lib/hours";
import type { Weekday } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

const KEYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const utc = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Today's date (YYYY-MM-DD), minutes since midnight and weekday, in the shop's time zone. */
export function shopToday(at: Date): { date: string; minutes: number; weekday: Weekday } {
  const { day, minutes } = shopClock(at);
  return { date: dateFmt.format(at), minutes, weekday: day };
}

export function addDays(date: string, n: number): string {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): Weekday {
  return KEYS[utc(date).getUTCDay()];
}

/** The next `count` dates starting today. */
export function nextDates(at: Date, count = 14): string[] {
  const today = shopToday(at).date;
  return Array.from({ length: count }, (_, i) => addDays(today, i));
}

export function dayParts(date: string): { dow: string; num: number; mon: string } {
  const d = utc(date);
  return { dow: DOW[d.getUTCDay()], num: d.getUTCDate(), mon: MON[d.getUTCMonth()] };
}

/** "Mon Nov 9" */
export function longDate(date: string): string {
  const { dow, num, mon } = dayParts(date);
  return `${dow} ${mon} ${num}`;
}
