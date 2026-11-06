const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-09" -> "Mon Nov 9" */
export function niceDate(iso?: string): string {
  if (!iso) return "No date";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DAYS[dt.getUTCDay()]} ${MONTHS[m - 1]} ${d}`;
}

/** "14:30" -> "2:30pm" */
export function niceTime(hhmm?: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 || 12;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""}${h >= 12 ? "pm" : "am"}`;
}

/** Today's date (YYYY-MM-DD) in the shop's time zone. */
export function todayInShop(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
}

export const TIME_OPTIONS = Array.from({ length: 36 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  const value = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  return { title: niceTime(value), value };
});
