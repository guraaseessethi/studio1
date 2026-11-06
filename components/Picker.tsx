"use client";

import { useState } from "react";
import { startBooking } from "@/lib/bookingStore";
import type { Chip, Service } from "@/lib/content/types";
import { minutesLabel, priceLabel } from "@/lib/format";
import ui from "./ui.module.css";
import styles from "./Picker.module.css";

type Props = { chips: Chip[]; services: Service[] };

export function Picker({ chips, services }: Props) {
  const [chipId, setChipId] = useState<string | null>(null);
  const chip = chips.find((c) => c.id === chipId);
  const service = chip ? services.find((s) => s.id === chip.serviceId) : undefined;
  const addon = chip?.addonText || (service?.addonId ? services.find((s) => s.id === service.addonId)?.name : undefined);

  return (
    <section aria-labelledby="picker-title" className={styles.section} data-theme="dark">
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.intro}>
          <span className={ui.eyebrowDark}>01 / Choose your cut</span>
          <h2 id="picker-title" className={`${ui.h2} ${styles.title}`}>
            What are you
            <br />
            coming in for?
          </h2>
          <p className={styles.lead}>
            Tap a service. You&apos;ll see the price, chair time and a good add-on, then go straight to booking.
          </p>
        </div>

        <div className={styles.picker}>
          <div role="group" aria-label="Services" className={styles.chips}>
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.chip}
                aria-pressed={c.id === chipId}
                onClick={() => setChipId(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className={styles.panel} aria-live="polite">
            {!service ? (
              <div className={styles.empty}>
                <span className={styles.emptyLabel}>Waiting for your pick</span>
                <span>Pick a service above to see your recommendation.</span>
              </div>
            ) : (
              <>
                <div className={styles.rec}>
                  <div className={styles.recMain}>
                    <span className={styles.recLabel}>Recommended</span>
                    <span className={styles.recName}>{service.name}</span>
                    <span className={styles.recDesc}>{service.description}</span>
                  </div>
                  <div className={styles.facts}>
                    <div>
                      <span className={styles.recLabel}>Price</span>
                      <span className={styles.fact}>{priceLabel(service)}</span>
                    </div>
                    <div>
                      <span className={styles.recLabel}>Chair time</span>
                      <span className={styles.fact}>{minutesLabel(service)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.foot}>
                  {addon ? (
                    <span className={styles.addon}>
                      Good add-on: <strong>{addon}</strong>
                    </span>
                  ) : (
                    <span />
                  )}
                  <button type="button" className={ui.btnLight} onClick={() => startBooking({ serviceId: service.id })}>
                    Book this
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
