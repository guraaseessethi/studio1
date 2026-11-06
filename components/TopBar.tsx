"use client";

import { shopStatus, statusLabel } from "@/lib/hours";
import { useMinuteClock } from "@/lib/useMinuteClock";
import type { WeekHours } from "@/lib/types";
import styles from "./TopBar.module.css";

type Props = {
  hours: WeekHours;
  phone: string;
  phoneHref: string;
  address: string;
};

export function TopBar({ hours, phone, phoneHref, address }: Props) {
  const minute = useMinuteClock();
  const status = minute ? shopStatus(hours, new Date(minute * 60_000)) : null;
  const label = status ? statusLabel(status) : "See hours below";

  return (
    <div className={styles.bar} data-theme="dark">
      <div className={styles.inner}>
        <span className={styles.status} role="status">
          <span className={status?.open ? styles.dotOpen : styles.dot} aria-hidden="true" />
          {label}
        </span>
        <div className={styles.links}>
          <a href={`tel:${phoneHref}`}>{phone}</a>
          <span>{address}</span>
          <a href="#book" className={styles.book}>
            Book online
          </a>
        </div>
      </div>
    </div>
  );
}

