"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nextDates } from "@/lib/booking/dates";
import { quote } from "@/lib/booking/pricing";
import { tierOf } from "@/lib/booking/pricing";
import { detailErrors } from "@/lib/booking/schema";
import type { BookingRequest, BookingResponse } from "@/lib/booking/schema";
import { type Busy, NO_PREFERENCE, type Slot, eligibleBarbers, slotsForDay } from "@/lib/booking/slots";
import { setBooking, useBooking } from "@/lib/bookingStore";
import { useMinuteClock } from "@/lib/useMinuteClock";
import ui from "@/components/ui.module.css";
import { StepBarber, StepConfirm, StepDetails, StepPayment, StepService, StepWhen, Success } from "./Steps";
import { Summary } from "./Summary";
import type { ConsoleProps, View } from "./types";
import styles from "./Console.module.css";

const STEPS = [
  { tab: "01 · Service", title: "Choose your service" },
  { tab: "02 · Barber", title: "Pick your barber" },
  { tab: "03 · Date and time", title: "Pick a day and time" },
  { tab: "04 · Details", title: "Your details" },
  { tab: "05 · Payment", title: "How do you want to pay?" },
  { tab: "06 · Confirm", title: "Check and confirm" },
];

/** Live busy times, re-read each time the date step opens. */
function useBusy(enabled: boolean, key: number) {
  const [retry, setRetry] = useState(0);
  const [res, setRes] = useState<{ key: string; busy?: Busy[]; error?: boolean } | null>(null);
  const current = `${key}:${retry}`;

  useEffect(() => {
    if (!enabled) return;
    let off = false;
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ busy: Busy[] }>) : Promise.reject(new Error("bad status"))))
      .then((d) => !off && setRes({ key: current, busy: d.busy }))
      .catch(() => !off && setRes({ key: current, error: true }));
    return () => {
      off = true;
    };
  }, [enabled, current]);

  const done = res?.key === current;
  return {
    busy: res?.busy ?? null,
    loading: enabled && !done,
    error: enabled && done && !!res?.error,
    retry: () => setRetry((n) => n + 1),
  };
}

export function BookingConsole({ services, barbers, paymentOptions, settings }: ConsoleProps) {
  const s = useBooking();
  const minute = useMinuteClock();
  const now = useMemo(() => (minute ? new Date(minute * 60_000) : null), [minute]);
  const avail = useBusy(s.step === 2, s.availKey);

  const view = useMemo<View>(() => {
    const service = services.find((x) => x.id === s.serviceId);
    const tier = service?.price2 ? s.tier : "standard";
    const chosen = service ? tierOf(service, tier) : undefined;
    const eligible = service ? eligibleBarbers(barbers, service) : [];
    const barberId = s.barberId === NO_PREFERENCE || eligible.some((b) => b.id === s.barberId) ? s.barberId : null;
    const dates = now ? nextDates(now, 14) : [];
    const daySlots: Record<string, Slot[]> = {};
    if (now && chosen && barberId) {
      for (const date of dates) {
        daySlots[date] = slotsForDay({
          date,
          now,
          hours: settings.hours,
          interval: settings.slotIntervalMinutes,
          leadMinutes: settings.leadTimeMinutes,
          duration: chosen.duration,
          barbers: eligible,
          barberId,
          busy: avail.busy ?? [],
        });
      }
    }
    return {
      service,
      tier,
      chosen,
      eligible,
      barberId,
      barberName: barberId === NO_PREFERENCE ? "No preference" : barbers.find((b) => b.id === barberId)?.name,
      dates,
      daySlots,
      busy: avail.busy,
      loading: avail.loading,
      loadError: avail.error,
      retry: avail.retry,
      quote: chosen ? quote(chosen.price, settings.hstRate) : undefined,
      paymentLabel: paymentOptions.find((p) => p.id === s.payment)?.label,
    };
  }, [services, barbers, paymentOptions, settings, s.serviceId, s.tier, s.barberId, s.payment, now, avail.busy, avail.loading, avail.error, avail.retry]);

  const timeOk = !!(s.date && s.time && (!now || !view.busy || view.daySlots[s.date]?.some((x) => x.time === s.time)));
  const valid = [
    !!view.service,
    !!view.barberId,
    timeOk,
    Object.keys(detailErrors({ name: s.name, mobile: s.mobile, email: s.email, notes: s.notes })).length === 0,
    !!s.payment && paymentOptions.some((p) => p.id === s.payment),
    true,
  ];
  const firstInvalid = valid.indexOf(false);
  const furthest = firstInvalid === -1 ? 5 : firstInvalid;
  const step = Math.min(s.step, furthest);
  const sent = s.submit.status === "sent";

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.querySelector<HTMLElement>("#book [data-step-heading]")?.focus({ preventScroll: true });
  }, [step, sent]);

  const send = async () => {
    if (!view.service || !s.barberId || !s.date || !s.time || !s.payment) return;
    setBooking({ submit: { status: "sending" } });
    const payload: BookingRequest = {
      serviceId: view.service.id,
      tier: view.tier,
      barberId: view.barberId as string,
      date: s.date,
      time: s.time,
      name: s.name,
      mobile: s.mobile,
      email: s.email,
      notes: s.notes,
      payment: s.payment,
      website: s.website,
    };
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BookingResponse;
      if (data.ok) setBooking({ submit: { status: "sent", result: data } });
      else if (data.code === "slot_taken") setBooking({ submit: { status: "error", message: data.message }, step: 2, time: null });
      else setBooking({ submit: { status: "error", message: data.message } });
    } catch {
      setBooking({ submit: { status: "error", message: `We couldn't send that. Check your connection, or call ${settings.phone}.` } });
    }
  };

  const props = { s, v: view, services, barbers, paymentOptions, settings };
  const goBack = () => setBooking({ step: Math.max(0, step - 1), submit: { status: "idle" } });
  const goNext = () => valid[step] && step < 5 && setBooking({ step: step + 1 });

  return (
    <section id="book" tabIndex={-1} aria-labelledby="book-title" className={styles.section} data-theme="dark">
      <div className={`${ui.container} ${styles.inner}`}>
        <div className={styles.head}>
          <span className={ui.eyebrowDark}>07 / Booking</span>
          <h2 id="book-title" className={styles.title}>
            Book the chair.
          </h2>
          <p className={styles.lead}>Six quick steps. Pay at the shop or by e-Transfer, and Studio 1 confirms your request.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.panel}>
            <nav aria-label="Booking steps">
              <ol className={styles.steps}>
                {STEPS.map((t, i) => (
                  <li key={t.tab}>
                    <button
                      type="button"
                      className={styles.stepTab}
                      aria-current={i === step ? "step" : undefined}
                      disabled={sent || i > furthest}
                      aria-label={`Step ${i + 1}: ${t.tab.slice(5)}`}
                      onClick={() => setBooking({ step: i, submit: { status: "idle" } })}
                    >
                      <span aria-hidden="true">
                        <span className={styles.tabNum}>{t.tab.slice(0, 2)}</span>
                        <span className={styles.tabText}> · {t.tab.slice(5)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <p className="visually-hidden" role="status" aria-live="polite">
              {sent ? "Request sent." : `Step ${step + 1} of 6: ${STEPS[step].title}`}
            </p>

            <div className={styles.body}>
              {sent ? (
                <Success s={s} settings={settings} />
              ) : (
                <>
                  <h3 tabIndex={-1} className={styles.stepTitle} data-step-heading>
                    {STEPS[step].title}
                  </h3>
                  {step === 0 && <StepService {...props} />}
                  {step === 1 && <StepBarber {...props} />}
                  {step === 2 && <StepWhen {...props} />}
                  {step === 3 && <StepDetails {...props} />}
                  {step === 4 && <StepPayment {...props} />}
                  {step === 5 && <StepConfirm {...props} onSend={send} />}
                </>
              )}
            </div>

            {!sent && (
              <div className={styles.nav}>
                <button type="button" className={styles.back} disabled={step === 0} onClick={goBack}>
                  ← Back
                </button>
                {step < 5 && (
                  <button type="button" className={styles.next} disabled={!valid[step]} onClick={goNext}>
                    Continue →
                  </button>
                )}
              </div>
            )}
          </div>

          <Summary s={s} v={view} />
        </div>
      </div>
    </section>
  );
}
