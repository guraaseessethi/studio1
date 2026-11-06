"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(id);
}

const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => 0;

/** Minutes since epoch, ticking on the client; 0 during server render. */
export function useMinuteClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
