"use client";

import { useCallback, useEffect, useRef } from "react";
import type { GalleryItem } from "@/lib/content/types";
import { Icon } from "./Icon";
import { SanityImage } from "./SanityImage";
import styles from "./Lightbox.module.css";

type Props = { items: GalleryItem[]; index: number | null; onIndex: (i: number) => void; onClose: () => void };

export function Lightbox({ items, index, onIndex, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const count = items.length;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + count) % count);
    },
    [index, count, onIndex],
  );

  const item = index !== null ? items[index] : undefined;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Photo viewer"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      {item && (
        <div className={styles.frame}>
          <div className={styles.top}>
            <span className={styles.count} aria-live="polite">
              {index! + 1} of {count}
            </span>
            <button type="button" className={styles.btn} aria-label="Close photo viewer" onClick={onClose} autoFocus>
              <Icon name="close" size={20} strokeWidth={1.8} />
            </button>
          </div>
          <div className={styles.stage}>
            <button type="button" className={styles.btn} aria-label="Previous photo" onClick={() => step(-1)}>
              <Icon name="chevronLeft" size={22} strokeWidth={1.8} />
            </button>
            <div className={styles.image}>
              <SanityImage image={item} sizes="90vw" />
            </div>
            <button type="button" className={styles.btn} aria-label="Next photo" onClick={() => step(1)}>
              <Icon name="chevronRight" size={22} strokeWidth={1.8} />
            </button>
          </div>
          {(item.caption || item.alt) && <p className={styles.caption}>{item.caption || item.alt}</p>}
        </div>
      )}
    </dialog>
  );
}
