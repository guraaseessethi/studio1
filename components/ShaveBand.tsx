import Image from "next/image";
import { SanityImage } from "./SanityImage";
import { BookButton } from "./BookButton";
import type { ImageData, Service } from "@/lib/content/types";
import { money } from "@/lib/format";
import ui from "./ui.module.css";
import styles from "./ShaveBand.module.css";

export function ShaveBand({ services, image }: { services: Service[]; image?: ImageData }) {
  const find = (name: string) => services.find((s) => s.name === name);
  const shave = find("Traditional Facial Shave");
  const parts = [
    ["Beard shaping and detailing", find("Beard Shaping and Detailing")],
    ["Traditional facial shave", shave],
    ["Hot towel head shave", find("Hot Towel Head Shave")],
  ] as const;
  const sentence = parts
    .filter(([, s]) => s)
    .map(([label, s]) => `${label} from ${money(s!.price)}.`)
    .join(" ");

  return (
    <section aria-labelledby="band-title" className={styles.band} data-theme="dark">
      {image ? (
        <SanityImage image={image} sizes="100vw" className={styles.photo} alt="" />
      ) : (
        <Image src="/images/shave-band.jpg" alt="" fill sizes="100vw" className={styles.photo} style={{ objectFit: "cover" }} />
      )}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={`${ui.container} ${styles.inner}`}>
        <span className={ui.eyebrowDark}>04 / The finish</span>
        <h2 id="band-title" className={styles.title}>
          Beard work &amp;
          <br />
          <em>hot towel shaves.</em>
        </h2>
        {sentence && <p className={styles.text}>{sentence}</p>}
        <BookButton serviceId={shave?.id} className={ui.btnLight}>
          Book a shave
        </BookButton>
      </div>
    </section>
  );
}
