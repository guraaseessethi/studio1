"use client";

import { useRef, useState } from "react";
import { startBooking } from "@/lib/bookingStore";
import type { Service } from "@/lib/content/types";
import { GROUP_LABELS, GROUP_ORDER, minutesLabel, priceLabel, tierNote } from "@/lib/format";
import ui from "./ui.module.css";
import styles from "./ServiceBoard.module.css";

export function ServiceBoard({ services, hstRate }: { services: Service[]; hstRate: number }) {
  const groups = GROUP_ORDER.filter((g) => services.some((s) => s.group === g));
  const [group, setGroup] = useState(groups[0]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const rows = services.filter((s) => s.group === group);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home" || e.key === "End" || dir) {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : e.key === "End" ? groups.length - 1 : (i + dir + groups.length) % groups.length;
      setGroup(groups[next]);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section id="services" tabIndex={-1} aria-labelledby="services-title" className={styles.section}>
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.titleBlock}>
            <span className={ui.eyebrow}>02 / Services</span>
            <h2 id="services-title" className={ui.h2}>
              The service board
            </h2>
          </div>
          <div role="tablist" aria-label="Service groups" className={styles.tabs}>
            {groups.map((g, i) => (
              <button
                key={g}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${g}`}
                aria-selected={g === group}
                aria-controls="service-rows"
                tabIndex={g === group ? 0 : -1}
                className={styles.tab}
                onClick={() => setGroup(g)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        <ol id="service-rows" role="tabpanel" aria-labelledby={`tab-${group}`} className={styles.rows}>
          {rows.map((s, i) => {
            const note = tierNote(s);
            return (
              <li key={s.id} className={styles.row}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.main}>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.desc}>{s.description}</span>
                  {note && <span className={styles.tier}>{note}</span>}
                </div>
                <span className={styles.mins}>{minutesLabel(s)}</span>
                <span className={styles.price}>{priceLabel(s)}</span>
                <button type="button" className={styles.book} onClick={() => startBooking({ serviceId: s.id })}>
                  Book this ↗
                  <span className="visually-hidden"> {s.name}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className={styles.note}>
          Prices are before {hstRate}% HST. Where a service lists two prices, the second is the longer appointment.
        </p>
      </div>
    </section>
  );
}
