import type { Service } from "@/lib/content/types";

export const GROUP_LABELS: Record<Service["group"], string> = {
  haircuts: "Haircuts",
  "beard-shave": "Beard and Shave",
  combos: "Combos",
  "kids-seniors": "Kids and Seniors",
  "add-ons": "Add-ons",
};

export const GROUP_ORDER: Service["group"][] = ["haircuts", "beard-shave", "combos", "kids-seniors", "add-ons"];

/** "$37" or "$37 / $57" */
export function priceLabel(s: Pick<Service, "price" | "price2">): string {
  return s.price2 ? `${money(s.price)} / ${money(s.price2)}` : money(s.price);
}

/** "30 min" or "30 / 45 min" */
export function minutesLabel(s: Pick<Service, "duration" | "duration2">): string {
  return s.duration2 ? `${s.duration} / ${s.duration2} min` : `${s.duration} min`;
}

export function cad(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** "$57 · Longer appointment, 45 min" for services with a second tier. */
export function tierNote(s: Pick<Service, "price2" | "duration2" | "tier2Label">): string | null {
  if (!s.price2 || !s.duration2) return null;
  return `${money(s.price2)} · ${s.tier2Label ?? "Longer appointment"}, ${s.duration2} min`;
}
