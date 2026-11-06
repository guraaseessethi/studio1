import Image from "next/image";
import { SanityImage } from "./SanityImage";
import { TodayHours } from "./TodayHours";
import type { ShopImages } from "@/lib/content/types";
import type { SiteSettings } from "@/lib/types";
import ui from "./ui.module.css";
import styles from "./Hero.module.css";

export function Hero({ settings, images }: { settings: SiteSettings; images: ShopImages }) {
  return (
    <section aria-labelledby="hero-title" className={styles.hero}>
      <div className={`${ui.container} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span>Barrie · Yonge St</span>
            <span aria-hidden="true" className={styles.rule} />
            <span>Walk-ins and online booking</span>
          </p>
          <h1 id="hero-title" className={styles.title}>
            Sharp cuts.
            <br />
            Clean lines.
            <br />
            <em>Studio-level</em>
            <br />
            service.
          </h1>
          <p className={styles.intro}>
            Skin fades, scissor cuts, beard detailing, hot towel shaves, kids and seniors cuts, in a clean shop
            on Yonge Street where the details still matter.
          </p>
          <div className={styles.actions}>
            <a href="#book" className={ui.btnLg}>
              Book appointment
            </a>
            <a href="#services" className={ui.btnOutline}>
              View services
            </a>
          </div>
          <dl className={styles.stats}>
            {settings.heroStats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <dt className="visually-hidden">{s.label}</dt>
                <dd className={styles.value}>{s.value}</dd>
                <dd className={styles.label} aria-hidden="true">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.photos}>
          <div className={styles.main}>
            {images.hero ? (
              <SanityImage image={images.hero} sizes="(min-width: 1024px) 460px, 60vw" priority className="photo" />
            ) : (
              <Image
                src="/images/shop-owner.webp"
                alt="Inside Studio 1 Barbershop, a barber at his chair in front of the mural wall"
                fill
                sizes="(min-width: 1024px) 460px, 60vw"
                priority
                className="photo"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
          <div className={styles.side}>
            <div className={styles.small}>
              {images.heroSmall ? (
                <SanityImage image={images.heroSmall} sizes="(min-width: 1024px) 300px, 40vw" className="photo" />
              ) : (
                <Image
                  src="/images/hero-clippers.jpg"
                  alt="Clippers and scissors on a barber station mat"
                  fill
                  sizes="(min-width: 1024px) 300px, 40vw"
                  className="photo"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
            <div className={styles.today}>
              <span className={styles.todayLabel}>Today</span>
              <span className={styles.todayHours}>
                <TodayHours hours={settings.hours} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
