import Image from "next/image";
import { Icon } from "./Icon";
import ui from "./ui.module.css";
import styles from "./Header.module.css";

const NAV = [
  ["Barbers", "#barbers"],
  ["Services", "#services"],
  ["Gallery", "#gallery"],
  ["Reviews", "#reviews"],
  ["Visit", "#visit"],
] as const;

export function Header({ phoneHref }: { phoneHref: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} aria-label="Studio 1 Barbershop, back to top">
          <Image
            src="/brand/logo-black.png"
            alt=""
            width={96}
            height={116}
            priority
            className={styles.logo}
          />
          <span className={styles.wordmark}>
            <span className={styles.name}>Studio 1</span>
            <span className={styles.sub}>Barbershop</span>
          </span>
        </a>

        <nav aria-label="Main" className={styles.nav}>
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <a href="#book" className={`${ui.btn} ${styles.cta}`}>
          Book appointment
        </a>

        <a href={`tel:${phoneHref}`} aria-label="Call Studio 1" className={styles.call}>
          <Icon name="phone" size={18} strokeWidth={1.8} />
        </a>
      </div>
    </header>
  );
}
