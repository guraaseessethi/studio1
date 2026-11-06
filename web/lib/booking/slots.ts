import type { Barber, Service } from "@/lib/content/types";
import { toMinutes } from "@/lib/hours";
import type { WeekHours } from "@/lib/types";
import { shopToday, weekdayOf } from "./dates";

/** One existing booking, reduced to the times it blocks. Safe to send to the browser. */
export type Busy = { barberId: string; date: string; start: number; end: number };

export type Slot = { time: string; barberIds: string[] };

export type SlotInput = {
  date: string;
  now: Date;
  hours: WeekHours;
  interval: number;
  leadMinutes: number;
  duration: number;
  /** Barbers who offer the chosen service. */
  barbers: Barber[];
  /** A barber id, or "any" for no preference. */
  barberId: string;
  busy: Busy[];
};

export const NO_PREFERENCE = "any";

export function offersService(barber: Barber, serviceId: string): boolean {
  return barber.serviceIds.length === 0 || barber.serviceIds.includes(serviceId);
}

export function eligibleBarbers(barbers: Barber[], service: Service): Barber[] {
  return barbers.filter((b) => offersService(b, service.id));
}

export const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Open slots for one day. A slot needs the shop open for the whole service, a barber
 * who works that weekday and has nothing overlapping, and a start after now + lead time.
 */
export function slotsForDay(input: SlotInput): Slot[] {
  const { date, now, hours, interval, leadMinutes, duration, barbers, barberId, busy } = input;
  const weekday = weekdayOf(date);
  const day = hours[weekday];
  if (!day) return [];

  const today = shopToday(now);
  if (date < today.date) return [];
  const earliest = date === today.date ? today.minutes + leadMinutes : 0;

  const working = barbers
    .filter((b) => barberId === NO_PREFERENCE || b.id === barberId)
    .filter((b) => b.workingDays.length === 0 || b.workingDays.includes(weekday));
  if (working.length === 0) return [];

  const open = toMinutes(day.open);
  const close = toMinutes(day.close);
  const todays = busy.filter((x) => x.date === date);
  const slots: Slot[] = [];

  for (let start = open; start + duration <= close; start += interval) {
    if (start < earliest) continue;
    const end = start + duration;
    const free = working.filter((b) => !todays.some((x) => x.barberId === b.id && start < x.end && end > x.start));
    if (free.length > 0) slots.push({ time: hhmm(start), barberIds: free.map((b) => b.id) });
  }
  return slots;
}

/** For "No preference": the free barber with the lightest day so the chairs stay balanced. */
export function pickBarber(freeIds: string[], busy: Busy[], date: string): string {
  const load = (id: string) => busy.filter((x) => x.barberId === id && x.date === date).length;
  return [...freeIds].sort((a, b) => load(a) - load(b))[0];
}
