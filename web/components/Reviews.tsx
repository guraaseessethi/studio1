import type { Review } from "@/lib/content/types";
import type { SiteSettings } from "@/lib/types";
import ui from "./ui.module.css";
import styles from "./Reviews.module.css";

export function Reviews({ reviews, settings }: { reviews: Review[]; settings: SiteSettings }) {
  const { google, booksy } = settings;
  const badge = (name: string, b: { rating: number; count: number; url: string }) => (
    <a
      href={b.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.badge}
      aria-label={`${b.rating.toFixed(1)} stars from ${b.count} reviews on ${name}, opens in a new tab`}
    >
      <span className={styles.badgeValue}>{b.rating.toFixed(1)} ★</span>
      <span className={styles.badgeLabel}>
        {b.count} on {name}
      </span>
    </a>
  );

  return (
    <section id="reviews" tabIndex={-1} aria-labelledby="reviews-title" className={styles.section}>
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.titleBlock}>
            <span className={ui.eyebrow}>06 / Reviews</span>
            <h2 id="reviews-title" className={ui.h2}>
              Reviews from the chair
            </h2>
          </div>
          <div className={styles.badges}>
            {badge("Google", google)}
            {badge("Booksy", booksy)}
          </div>
        </div>

        {reviews.length > 0 && (
          <ul className={styles.cards}>
            {reviews.map((r) => (
              <li key={r.id}>
                <figure className={styles.card}>
                  <span aria-hidden="true" className={styles.mark}>
                    “
                  </span>
                  <blockquote className={styles.quote}>{r.quote}</blockquote>
                  <figcaption className={styles.caption}>
                    <span>
                      {r.author} · {r.source}
                    </span>
                    {r.barberName && <span>with {r.barberName}</span>}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
