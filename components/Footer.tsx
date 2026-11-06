import Image from "next/image";
import { Year } from "./Year";
import styles from "./Footer.module.css";

type Props = { phone: string; phoneHref: string; booksyUrl: string };

export function Footer({ phone, phoneHref, booksyUrl }: Props) {
  return (
    <footer className={styles.footer} data-theme="dark">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image src="/brand/logo-cream.png" alt="" width={70} height={84} className={styles.logo} />
          <span className={styles.words}>
            <span className={styles.name}>Studio 1 Barbershop</span>
            <span>Clean cuts. Sharp service.</span>
          </span>
        </div>
        <div className={styles.links}>
          <a href={booksyUrl} target="_blank" rel="noopener noreferrer">
            Booksy
          </a>
          <a href={`tel:${phoneHref}`}>{phone}</a>
        </div>
        <span>
          © <Year /> Studio 1 Barbershop · Barrie, Ontario
        </span>
      </div>
    </footer>
  );
}
