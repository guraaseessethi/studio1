import type { SiteSettings } from "@/lib/types";
import { HoursTable } from "./HoursTable";
import ui from "./ui.module.css";
import styles from "./Visit.module.css";

export function Visit({ settings: s }: { settings: SiteSettings }) {
  const place = `${s.businessName}, ${s.street}, ${s.city}, ${s.region}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`;

  return (
    <section id="visit" tabIndex={-1} aria-labelledby="visit-title" className={styles.section}>
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.info}>
          <span className={ui.eyebrow}>08 / Visit</span>
          <h2 id="visit-title" className={ui.h2}>
            Find the studio.
          </h2>
          <div className={styles.contact}>
            <div>
              <span className={styles.label}>Address</span>
              <address className={styles.address}>
                {s.street}
                <br />
                {s.city}, {s.region} {s.postalCode}
              </address>
            </div>
            <div>
              <span className={styles.label}>Phone</span>
              <a href={`tel:${s.phoneHref}`} className={styles.phone}>
                {s.phone}
              </a>
            </div>
          </div>
          <HoursTable hours={s.hours} />
        </div>

        <div className={styles.map}>
          <iframe
            title={`Map showing ${s.businessName} at ${s.street}, ${s.city}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a href={directions} target="_blank" rel="noopener noreferrer" className={styles.directions}>
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
