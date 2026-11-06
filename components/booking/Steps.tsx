"use client";

import { useState } from "react";
import { dayParts, longDate } from "@/lib/booking/dates";
import { type Details, detailErrors, formatMobile } from "@/lib/booking/schema";
import { NO_PREFERENCE } from "@/lib/booking/slots";
import { type BookingState, resetBooking, setBooking } from "@/lib/bookingStore";
import { formatClock } from "@/lib/hours";
import { GROUP_LABELS, GROUP_ORDER, cad, minutesLabel, priceLabel } from "@/lib/format";
import { Icon } from "@/components/Icon";
import type { ConsoleProps, View } from "./types";
import styles from "./Console.module.css";

type StepProps = { s: BookingState; v: View } & Pick<ConsoleProps, "services" | "barbers" | "paymentOptions" | "settings">;

/* 01 Service */
export function StepService({ s, v, services }: StepProps) {
  const groups = GROUP_ORDER.filter((g) => services.some((x) => x.group === g));
  return (
    <>
      {groups.map((g) => (
        <div key={g} role="group" aria-label={GROUP_LABELS[g]} className={styles.group}>
          <span className={styles.groupLabel}>{GROUP_LABELS[g]}</span>
          <div className={styles.options}>
            {services
              .filter((x) => x.group === g)
              .map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className={styles.option}
                  aria-pressed={x.id === s.serviceId}
                  onClick={() => setBooking({ serviceId: x.id, tier: "standard", time: null })}
                >
                  <span className={styles.optionName}>{x.name}</span>
                  <span className={styles.optionMeta}>
                    {minutesLabel(x)} · {priceLabel(x)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
      {v.service?.price2 && v.service.duration2 && (
        <div role="group" aria-label="Appointment length" className={styles.group}>
          <span className={styles.groupLabel}>Which length?</span>
          <div className={styles.options}>
            <button
              type="button"
              className={styles.option}
              aria-pressed={v.tier === "standard"}
              onClick={() => setBooking({ tier: "standard", time: null })}
            >
              <span className={styles.optionName}>Standard</span>
              <span className={styles.optionMeta}>
                {v.service.duration} min · {cad(v.service.price)}
              </span>
            </button>
            <button
              type="button"
              className={styles.option}
              aria-pressed={v.tier === "longer"}
              onClick={() => setBooking({ tier: "longer", time: null })}
            >
              <span className={styles.optionName}>{v.service.tier2Label ?? "Longer appointment"}</span>
              <span className={styles.optionMeta}>
                {v.service.duration2} min · {cad(v.service.price2)}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* 02 Barber */
export function StepBarber({ s, v }: StepProps) {
  const pick = (barberId: string) => setBooking({ barberId, time: null });
  return (
    <div className={styles.options}>
      {v.eligible.map((b) => (
        <button key={b.id} type="button" className={styles.option} aria-pressed={v.barberId === b.id} onClick={() => pick(b.id)}>
          <span className={styles.optionGroup}>{b.title}</span>
          <span className={styles.optionName}>{b.name}</span>
          <span className={styles.optionMeta}>{b.specialties.length ? b.specialties.join(", ") : "Any service"}</span>
        </button>
      ))}
      <button
        type="button"
        className={styles.option}
        aria-pressed={s.barberId === NO_PREFERENCE}
        onClick={() => pick(NO_PREFERENCE)}
      >
        <span className={styles.optionGroup}>First available</span>
        <span className={styles.optionName}>No preference</span>
        <span className={styles.optionMeta}>Fastest way in</span>
      </button>
    </div>
  );
}

/* 03 Date and time */
export function StepWhen({ s, v, settings }: StepProps) {
  const times = s.date ? (v.daySlots[s.date] ?? []) : [];
  const ready = !v.loading && !v.loadError && v.busy !== null;
  const hoursOpen = s.date
    ? (() => {
        const t = times;
        return t.length ? `${formatClock(t[0].time)} to ${formatClock(t[t.length - 1].time)} starts` : "";
      })()
    : "";

  if (v.loadError) {
    return (
      <div role="alert" className={styles.notice}>
        <p>We couldn&apos;t load open times. Check your connection and try again, or call {settings.phone}.</p>
        <button type="button" className={styles.link} onClick={v.retry}>
          Try again
        </button>
      </div>
    );
  }
  if (!ready) return <p className={styles.muted} role="status">Loading open times…</p>;

  return (
    <>
      <div role="group" aria-label="Day" className={styles.days}>
        {v.dates.map((d, i) => {
          const p = dayParts(d);
          const count = v.daySlots[d]?.length ?? 0;
          return (
            <button
              key={d}
              type="button"
              className={styles.day}
              aria-pressed={d === s.date}
              disabled={count === 0}
              aria-label={`${longDate(d)}, ${count ? `${count} times open` : "no times open"}`}
              onClick={() => setBooking({ date: d, time: null })}
            >
              <span className={styles.dayDow}>{i === 0 ? "Today" : p.dow}</span>
              <span className={styles.dayNum}>{p.num}</span>
              <span className={styles.dayMon}>{p.mon}</span>
            </button>
          );
        })}
      </div>
      {!s.date ? (
        <p className={styles.muted}>Pick a day to see open times.</p>
      ) : (
        <>
          <span className={styles.groupLabel}>{hoursOpen ? `Open times · ${hoursOpen}` : "Open times"}</span>
          <div role="group" aria-label="Time" className={styles.times}>
            {times.map((t) => (
              <button
                key={t.time}
                type="button"
                className={styles.time}
                aria-pressed={t.time === s.time}
                onClick={() => setBooking({ time: t.time })}
              >
                {formatClock(t.time)}
              </button>
            ))}
          </div>
          {times.length === 0 && <p className={styles.muted}>No open times that day. Try another day or barber.</p>}
        </>
      )}
    </>
  );
}

/* 04 Details */
export function StepDetails({ s }: StepProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof Details, boolean>>>({});
  const errors = detailErrors({ name: s.name, mobile: s.mobile, email: s.email, notes: s.notes });
  const show = (k: keyof Details) => (touched[k] ? errors[k] : undefined);
  const blur = (k: keyof Details) => () => setTouched((t) => ({ ...t, [k]: true }));

  const err = (k: keyof Details) => (
    <span id={`err-${k}`} className={styles.error} role={show(k) ? "alert" : undefined}>
      {show(k)}
    </span>
  );

  return (
    <div className={styles.form}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          value={s.name}
          aria-invalid={!!show("name")}
          aria-describedby="err-name"
          onChange={(e) => setBooking({ name: e.target.value })}
          onBlur={blur("name")}
        />
        {err("name")}
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Mobile</span>
        <input
          type="tel"
          name="mobile"
          inputMode="tel"
          autoComplete="tel-national"
          required
          placeholder="(705) 555-0123"
          value={s.mobile}
          aria-invalid={!!show("mobile")}
          aria-describedby="err-mobile"
          onChange={(e) => setBooking({ mobile: formatMobile(e.target.value) })}
          onBlur={blur("mobile")}
        />
        {err("mobile")}
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Email (recommended)</span>
        <input
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          value={s.email}
          aria-invalid={!!show("email")}
          aria-describedby="hint-email err-email"
          onChange={(e) => setBooking({ email: e.target.value })}
          onBlur={blur("email")}
        />
        <span id="hint-email" className={styles.hint}>
          Add it and we email your confirmation and any payment details.
        </span>
        {err("email")}
      </label>
      <label className={`${styles.field} ${styles.wide}`}>
        <span className={styles.fieldLabel}>Notes for your barber</span>
        <textarea
          name="notes"
          rows={3}
          maxLength={300}
          placeholder="e.g. low fade, keep length on top"
          value={s.notes}
          aria-describedby="hint-notes"
          onChange={(e) => setBooking({ notes: e.target.value })}
        />
        <span id="hint-notes" className={styles.hint}>
          {s.notes.length} of 300
        </span>
      </label>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={s.website}
            onChange={(e) => setBooking({ website: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

/* 05 Payment */
export function StepPayment({ s, v, paymentOptions, settings }: StepProps) {
  return (
    <>
      <div role="radiogroup" aria-label="Payment method" className={styles.payOptions}>
        {paymentOptions.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={s.payment === p.id}
            className={`${styles.option} ${styles.pay}`}
            onClick={() => setBooking({ payment: p.id })}
          >
            <span className={styles.payHead}>
              <span className={styles.optionName}>{p.label}</span>
              <span className={styles.dot} aria-hidden="true" />
            </span>
            <span className={styles.payDesc}>{p.description}</span>
            <span className={styles.payTag}>{p.tag}</span>
          </button>
        ))}
      </div>
      {v.quote && (
        <dl className={styles.totals}>
          <div>
            <dt>{v.service?.name}</dt>
            <dd>{cad(v.quote.subtotal)}</dd>
          </div>
          <div>
            <dt>HST ({settings.hstRate}%)</dt>
            <dd>{cad(v.quote.hst)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>Total</dt>
            <dd>{cad(v.quote.total)}</dd>
          </div>
        </dl>
      )}
      <p className={styles.hint}>Tips can be added in the shop.</p>
    </>
  );
}

/* 06 Confirm */
export function StepConfirm({ s, v, settings, onSend }: StepProps & { onSend: () => void }) {
  const sending = s.submit.status === "sending";
  const cells: [string, string][] = [
    ["Service", v.service ? `${v.service.name}${v.tier === "longer" && v.chosen?.label ? ` (${v.chosen.label.toLowerCase()})` : ""}` : "—"],
    ["Barber", v.barberName ?? "—"],
    ["Date", s.date ? longDate(s.date) : "—"],
    ["Time", s.time ? formatClock(s.time) : "—"],
    ["Name", s.name || "—"],
    ["Mobile", s.mobile || "—"],
    ["Email", s.email || "Not given"],
    ["Payment", v.paymentLabel ?? "—"],
    ["Total with HST", v.quote ? cad(v.quote.total) : "—"],
  ];
  return (
    <>
      <dl className={styles.review}>
        {cells.map(([k, val]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>
      {s.submit.status === "error" && (
        <p role="alert" className={styles.alert}>
          {s.submit.message}
        </p>
      )}
      <div className={styles.sendRow}>
        <button type="button" className={styles.send} onClick={onSend} disabled={sending}>
          {sending ? "Sending…" : "Send booking request"}
        </button>
        {settings.showBooksyLink && (
          <span className={styles.hint}>
            Want it locked in right now?{" "}
            <a href={settings.booksyUrl} target="_blank" rel="noopener noreferrer">
              Book instantly on Booksy
            </a>
          </span>
        )}
      </div>
    </>
  );
}

/* After sending */
export function Success({ s, settings }: { s: BookingState; settings: ConsoleProps["settings"] }) {
  if (s.submit.status !== "sent") return null;
  const r = s.submit.result;
  return (
    <div className={styles.success}>
      <span className={styles.tick} aria-hidden="true">
        <Icon name="check" size={24} strokeWidth={2.2} />
      </span>
      <h3 className={styles.successTitle} tabIndex={-1} data-step-heading>
        Request sent
      </h3>
      <p className={styles.ref}>
        Reference <strong>{r.reference}</strong>
      </p>
      <p className={styles.successText}>
        {r.serviceName} with {r.barberName} on {longDate(r.date)} at {formatClock(r.time)}. Studio 1 will confirm your time.{" "}
        {r.emailed ? `A confirmation is on its way to ${s.email}.` : s.email ? `We couldn't send the confirmation email, so keep this reference. We'll contact you on ${s.mobile}.` : `We'll contact you on ${s.mobile}.`}
      </p>
      {r.etransfer && (
        <div className={styles.etransfer}>
          <span className={styles.groupLabel}>Pay by Interac e-Transfer</span>
          <p>
            Send <strong>{cad(r.etransfer.amount)}</strong> to <strong>{r.etransfer.email}</strong> {r.etransfer.deadline}. Put your
            reference number <strong>{r.reference}</strong> in the message.
          </p>
          {r.etransfer.instructions && <p>{r.etransfer.instructions}</p>}
        </div>
      )}
      <div className={styles.after}>
        <span className={styles.groupLabel}>What happens next</span>
        <ol>
          <li>Studio 1 and {r.barberName === "No preference" ? "your barber" : r.barberName} get your request.</li>
          <li>We confirm your time. Questions? Call {settings.phone}.</li>
          <li>Come in at your time and sit down.</li>
        </ol>
      </div>
      <div className={styles.successActions}>
        <button type="button" className={styles.link} onClick={resetBooking}>
          Book another
        </button>
        {settings.showBooksyLink && (
          <a href={settings.booksyUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Book instantly on Booksy
          </a>
        )}
      </div>
    </div>
  );
}
