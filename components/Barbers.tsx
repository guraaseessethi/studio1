"use client";

import { useState } from "react";
import { startBooking } from "@/lib/bookingStore";
import type { Barber } from "@/lib/content/types";
import { formatDays } from "@/lib/days";
import { SanityImage } from "./SanityImage";
import ui from "./ui.module.css";
import styles from "./Barbers.module.css";

export function Barbers({ barbers }: { barbers: Barber[] }) {
  const [id, setId] = useState(barbers[0]?.id);
  const current = barbers.find((b) => b.id === id) ?? barbers[0];
  if (!current) return null;

  return (
    <section id="barbers" tabIndex={-1} aria-labelledby="barbers-title" className={styles.section}>
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.titleBlock}>
            <span className={ui.eyebrow}>03 / The team</span>
            <h2 id="barbers-title" className={ui.h2}>
              The barbers
            </h2>
          </div>
          <p className={styles.lead}>Pick the chair that fits how you want to look.</p>
        </div>

        <div role="group" aria-label="Barbers" className={styles.cards}>
          {barbers.map((b) => (
            <button key={b.id} type="button" className={styles.card} aria-pressed={b.id === current.id} onClick={() => setId(b.id)}>
              <span className={styles.thumb}>
                {b.photo ? (
                  <SanityImage image={b.photo} sizes="(min-width: 1024px) 200px, 45vw" className="photo" alt="" />
                ) : (
                  <span className={styles.placeholder}>Photo</span>
                )}
              </span>
              <span className={styles.cardName}>{b.name}</span>
              <span className={styles.cardRole}>{b.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.detail} aria-live="polite">
          <div className={styles.photo}>
            {current.photo ? (
              <SanityImage image={current.photo} sizes="(min-width: 1024px) 600px, 100vw" className="photo" />
            ) : (
              <span className={styles.placeholder}>Photo of {current.name} coming soon</span>
            )}
          </div>
          <div className={styles.body}>
            {current.title && <span className={styles.role}>{current.title}</span>}
            <span className={styles.name}>
              {current.name}
              {current.nickname && <span className={styles.nick}> “{current.nickname}”</span>}
            </span>
            {current.bio && <p className={styles.bio}>{current.bio}</p>}
            <dl className={styles.facts}>
              <div>
                <dt>Clients book for</dt>
                <dd>{current.specialties.length ? current.specialties.join(", ") : "[Ask: what clients book them for]"}</dd>
              </div>
              <div>
                <dt>Days</dt>
                <dd>{formatDays(current.workingDays)}</dd>
              </div>
            </dl>
            <button type="button" className={ui.btnLg} onClick={() => startBooking({ barberId: current.id })}>
              Book with {current.name}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
