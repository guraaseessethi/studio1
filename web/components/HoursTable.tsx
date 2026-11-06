"use client";

import { formatRange, shopClock } from "@/lib/hours";
import { useMinuteClock } from "@/lib/useMinuteClock";
import { WEEKDAYS, WEEKDAY_LABELS, type WeekHours } from "@/lib/types";
import styles from "./Visit.module.css";

export function HoursTable({ hours }: { hours: WeekHours }) {
  const minute = useMinuteClock();
  const today = minute ? shopClock(new Date(minute * 60_000)).day : null;
  return (
    <table className={styles.hours}>
      <caption className="visually-hidden">Opening hours</caption>
      <tbody>
        {WEEKDAYS.map((d) => (
          <tr key={d} className={d === today ? styles.today : undefined} aria-current={d === today ? "date" : undefined}>
            <th scope="row">{WEEKDAY_LABELS[d]}</th>
            <td>{formatRange(hours[d])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
