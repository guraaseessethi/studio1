"use client";

import { useSyncExternalStore } from "react";
import { scrollToId } from "@/lib/smoothScroll";
import type { BookingSuccess } from "@/lib/booking/schema";

export type Tier = "standard" | "longer";

export type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; result: BookingSuccess }
  | { status: "error"; message: string };

export type BookingState = {
  step: number;
  serviceId: string | null;
  tier: Tier;
  /** A barber id, "any" for no preference, or null when not chosen yet. */
  barberId: string | null;
  date: string | null;
  time: string | null;
  name: string;
  mobile: string;
  email: string;
  notes: string;
  payment: string | null;
  /** Honeypot. Stays empty for real visitors. */
  website: string;
  /** Bumped whenever step 3 should re-read live availability. */
  availKey: number;
  submit: SubmitState;
};

export const INITIAL_BOOKING: BookingState = {
  step: 0,
  serviceId: null,
  tier: "standard",
  barberId: null,
  date: null,
  time: null,
  name: "",
  mobile: "",
  email: "",
  notes: "",
  payment: null,
  website: "",
  availKey: 0,
  submit: { status: "idle" },
};

let state: BookingState = INITIAL_BOOKING;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const getBooking = () => state;

export function setBooking(patch: Partial<BookingState> | ((s: BookingState) => Partial<BookingState>)) {
  const prev = state;
  const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
  // Entering the date and time step always re-reads live availability.
  if (next.step === 2 && prev.step !== 2) next.availKey = prev.availKey + 1;
  state = next;
  emit();
}

export function resetBooking() {
  state = { ...INITIAL_BOOKING, availKey: state.availKey + 1 };
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useBooking = (): BookingState => useSyncExternalStore(subscribe, getBooking, () => INITIAL_BOOKING);

/**
 * Opens the booking console. A service alone lands on step 2 (barber);
 * a barber alone lands on step 1 (service) with that barber kept; both land on step 3.
 */
export function startBooking({ serviceId, barberId }: { serviceId?: string; barberId?: string } = {}) {
  setBooking((s) => {
    const finished = s.submit.status === "sent";
    const base = finished ? { ...INITIAL_BOOKING, availKey: s.availKey + 1 } : s;
    return {
      ...base,
      serviceId: serviceId ?? base.serviceId,
      tier: serviceId && serviceId !== base.serviceId ? "standard" : base.tier,
      barberId: barberId ?? base.barberId,
      step: serviceId ? (barberId ? 2 : 1) : base.step,
      submit: finished ? { status: "idle" } : base.submit,
    };
  });
  scrollToId("book");
}
