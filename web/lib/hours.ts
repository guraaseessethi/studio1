import { TIME_ZONE } from "./defaults";
import { WEEKDAYS, type DayHours, type Weekday, type WeekHours } from "./types";

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "18:00" -> "6pm", "09:30" -> "9:30am" */
export function formatClock(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatRange(day: DayHours): string {
  return day ? `${formatClock(day.open)} to ${formatClock(day.close)}` : "Closed";
}

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const SHORT_TO_KEY: Record<string, Weekday> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

/** Current weekday and minutes-since-midnight in the shop's time zone. */
export function shopClock(at: Date): { day: Weekday; minutes: number } {
  const p = Object.fromEntries(parts.formatToParts(at).map((x) => [x.type, x.value]));
  return { day: SHORT_TO_KEY[p.weekday], minutes: Number(p.hour) * 60 + Number(p.minute) };
}

export type ShopStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: Weekday; today: boolean };

export function shopStatus(hours: WeekHours, at: Date): ShopStatus {
  const { day, minutes } = shopClock(at);
  const today = hours[day];
  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, closesAt: today.close };
  }
  if (today && minutes < toMinutes(today.open)) {
    return { open: false, opensAt: today.open, opensDay: day, today: true };
  }
  const start = WEEKDAYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const key = WEEKDAYS[(start + i) % 7];
    const next = hours[key];
    if (next) return { open: false, opensAt: next.open, opensDay: key, today: false };
  }
  return { open: false, opensAt: "09:00", opensDay: day, today: false };
}

export function statusLabel(status: ShopStatus): string {
  if (status.open) return `Open now, until ${formatClock(status.closesAt)}`;
  if (status.today) return `Closed, opens ${formatClock(status.opensAt)}`;
  const names: Record<Weekday, string> = {
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  };
  return `Closed, opens ${names[status.opensDay]} ${formatClock(status.opensAt)}`;
}
