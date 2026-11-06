import type { Service } from "@/lib/content/types";
import type { Tier } from "@/lib/bookingStore";

export function tierOf(service: Service, tier: Tier): { price: number; duration: number; label?: string } {
  if (tier === "longer" && service.price2 && service.duration2) {
    return { price: service.price2, duration: service.duration2, label: service.tier2Label };
  }
  return { price: service.price, duration: service.duration };
}

/** Whole-cent maths so totals never drift. */
export function quote(price: number, hstRate: number): { subtotal: number; hst: number; total: number } {
  const subtotal = Math.round(price * 100);
  const hst = Math.round((subtotal * hstRate) / 100);
  return { subtotal: subtotal / 100, hst: hst / 100, total: (subtotal + hst) / 100 };
}
