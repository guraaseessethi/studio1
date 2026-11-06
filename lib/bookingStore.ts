"use client";

import { useSyncExternalStore } from "react";
import { scrollToId } from "@/lib/smoothScroll";

export type Tier = "standard" | "longer";

export type BookingState = {
  step: number;
  serviceId: string | null;
  tier: Tier;
  /** A barber id, "any" for no preference, or null when not chosen yet. */
  barberId: string | null;
};

export const INITIAL_BOOKING: BookingState = { step: 0, serviceId: null, tier: "standard", barberId: null };

let state: BookingState = INITIAL_BOOKING;
const listeners = new Set<() => void>();

export function getBooking(): BookingState {
  return state;
}

export function setBooking(patch: Partial<BookingState> | ((s: BookingState) => Partial<BookingState>)) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function resetBooking() {
  state = INITIAL_BOOKING;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useBooking(): BookingState {
  return useSyncExternalStore(subscribe, getBooking, () => INITIAL_BOOKING);
}

/**
 * Opens the booking console. A service alone lands on step 2 (barber);
 * a barber alone lands on step 1 (service) with that barber kept; both land on step 3.
 */
export function startBooking({ serviceId, barberId }: { serviceId?: string; barberId?: string } = {}) {
  setBooking((s) => ({
    serviceId: serviceId ?? s.serviceId,
    tier: serviceId && serviceId !== s.serviceId ? "standard" : s.tier,
    barberId: barberId ?? s.barberId,
    step: serviceId ? (barberId ? 2 : 1) : s.step,
  }));
  scrollToId("book");
}
