import { WEEKDAYS, type Weekday } from "./types";

const SHORT: Record<Weekday, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

/** ["mon","tue","wed","fri"] -> "Mon to Wed, Fri". Empty means every open day. */
export function formatDays(days: Weekday[]): string {
  if (days.length === 0 || days.length === 7) return "Every day the shop is open";
  const idx = WEEKDAYS.map((d, i) => (days.includes(d) ? i : -1)).filter((i) => i >= 0);
  const runs: number[][] = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1] === i - 1) last.push(i);
    else runs.push([i]);
  }
  return runs
    .map((r) => (r.length === 1 ? SHORT[WEEKDAYS[r[0]]] : r.length === 2 ? `${SHORT[WEEKDAYS[r[0]]]}, ${SHORT[WEEKDAYS[r[1]]]}` : `${SHORT[WEEKDAYS[r[0]]]} to ${SHORT[WEEKDAYS[r[r.length - 1]]]}`))
    .join(", ");
}
