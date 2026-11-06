import styles from "./Ticker.module.css";

export function Ticker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {items.map((label, i) => (
        <li key={`${label}-${i}`} className={styles.item}>
          {label}
          <span aria-hidden="true" className={styles.sep}>
            ·
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.ticker} aria-label="Highlights" role="region">
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
