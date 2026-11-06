"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import styles from "./MobileBar.module.css";

type Props = { phone: string; phoneHref: string; street: string };

const MENU_LINKS = [
  ["Services", "#services"],
  ["Gallery", "#gallery"],
  ["Reviews", "#reviews"],
  ["Book the chair", "#book"],
  ["Hours and directions", "#visit"],
] as const;

export function MobileBar({ phone, phoneHref, street }: Props) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>("a[href], button");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <nav aria-label="Quick navigation" className={styles.bar}>
        <a href="#services" className={styles.item}>
          <Icon name="scissors" size={20} strokeWidth={1.6} />
          Services
        </a>
        <a href="#barbers" className={styles.item}>
          <Icon name="person" size={20} strokeWidth={1.6} />
          Barbers
        </a>
        <a href="#book" className={`${styles.item} ${styles.book}`}>
          <Icon name="calendar" size={20} strokeWidth={1.8} />
          Book
        </a>
        <button
          ref={openerRef}
          type="button"
          className={styles.item}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" size={20} strokeWidth={1.6} />
          Menu
        </button>
      </nav>

      {open && (
        <div className={styles.backdrop} onClick={close}>
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className={styles.sheet}
            onClick={(e) => {
              e.stopPropagation();
              if ((e.target as Element).closest("a")) setOpen(false);
            }}
          >
            <span aria-hidden="true" className={styles.grip} />
            <div className={styles.sheetHead}>
              <Image src="/brand/logo-black.png" alt="Studio 1 Barbershop" width={45} height={54} className={styles.logo} />
              <button ref={closeRef} type="button" className={styles.close} aria-label="Close menu" onClick={close}>
                <Icon name="close" size={18} strokeWidth={1.8} />
              </button>
            </div>
            {MENU_LINKS.map(([label, href]) => (
              <a key={href} href={href} className={styles.link}>
                {label}
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </a>
            ))}
            <p className={styles.meta}>
              <a href={`tel:${phoneHref}`}>{phone}</a> · {street}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
