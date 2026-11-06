"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { GalleryItem } from "@/lib/content/types";
import { scrollToId } from "@/lib/smoothScroll";
import { Lightbox } from "./Lightbox";
import { SanityImage } from "./SanityImage";
import ui from "./ui.module.css";
import styles from "./Gallery.module.css";

const PHONE = "(max-width: 767px)";

function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function Gallery({ items }: { items: GalleryItem[] }) {
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const perPage = phone ? 6 : 8;
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const [requested, setPage] = useState(1);
  const page = Math.min(requested, pages);
  const [open, setOpen] = useState<number | null>(null);
  const start = (page - 1) * perPage;
  const visible = items.slice(start, start + perPage);

  const go = useCallback((p: number) => {
    setPage(p);
    scrollToId("gallery", { updateHash: false });
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="gallery" tabIndex={-1} aria-labelledby="gallery-title" className={styles.section}>
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.head}>
          <div className={styles.titleBlock}>
            <span className={ui.eyebrow}>05 / Gallery</span>
            <h2 id="gallery-title" className={ui.h2}>
              Work from the chair
            </h2>
          </div>
          <span className={styles.hint}>Hover to see it in colour</span>
        </div>

        <ul className={styles.grid}>
          {visible.map((item, i) => (
            <li key={item.key}>
              <button
                type="button"
                className={styles.tile}
                aria-label={`View photo ${start + i + 1} of ${items.length}: ${item.alt}`}
                onClick={() => setOpen(start + i)}
              >
                <SanityImage image={item} sizes="(min-width: 1024px) 300px, (min-width: 768px) 25vw, 50vw" className="photo" alt="" />
              </button>
            </li>
          ))}
        </ul>

        {pages > 1 && (
          <nav aria-label="Gallery pages" className={styles.pager}>
            <button type="button" className={styles.pageBtn} disabled={page === 1} onClick={() => go(page - 1)} aria-label="Previous page">
              ←
            </button>
            {Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={styles.pageBtn}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
                onClick={() => go(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" className={styles.pageBtn} disabled={page === pages} onClick={() => go(page + 1)} aria-label="Next page">
              →
            </button>
          </nav>
        )}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
