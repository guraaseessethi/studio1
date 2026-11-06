import { longDate } from "@/lib/booking/dates";
import { formatClock } from "@/lib/hours";
import { cad } from "@/lib/format";
import type { BookingState } from "@/lib/bookingStore";
import type { View } from "./types";
import styles from "./Console.module.css";

export function Summary({ s, v }: { s: BookingState; v: View }) {
  const dash = "—";
  const row = (label: string, value: string, accent = false) => (
    <div className={styles.sumRow}>
      <dt>{label}</dt>
      <dd className={accent ? styles.sumAccent : undefined}>{value}</dd>
    </div>
  );
  return (
    <aside aria-label="Booking summary" className={styles.summary}>
      <span className={styles.sumTitle}>Live summary</span>
      <dl className={styles.sumList}>
        {row("Service", v.service ? `${v.service.name}${v.chosen?.label && v.tier === "longer" ? ` (${v.chosen.label.toLowerCase()})` : ""}` : dash)}
        {row("Barber", v.barberName ?? dash)}
        <div className={styles.sumPair}>
          {row("Date", s.date ? longDate(s.date) : dash)}
          {row("Time", s.time ? formatClock(s.time) : dash)}
        </div>
        <div className={`${styles.sumPair} ${styles.sumDivider}`}>
          {row("Chair time", v.chosen ? `${v.chosen.duration} min` : dash)}
          {row("Price", v.quote ? cad(v.quote.subtotal) : dash, true)}
        </div>
        {v.quote && row("Total with HST", cad(v.quote.total))}
        {row("Payment", v.paymentLabel ?? dash)}
      </dl>
      <p className={styles.sumNote}>You&apos;ll get a confirmation email if you add one. Studio 1 and your barber are emailed too.</p>
    </aside>
  );
}
