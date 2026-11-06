import type { SiteSettings } from "./types";

export const TIME_ZONE = "America/Toronto";

/** Coordinates from the Google listing. */
export const GEO = { latitude: 44.3715535, longitude: -79.6721404 };

/** The name exactly as Google spells it, for structured data. */
export const GOOGLE_NAME = "Studio 1 BARBERSHOP";

export const DEFAULT_TITLE = "Studio 1 Barbershop | Barber in Barrie on Yonge St";
export const DEFAULT_DESCRIPTION =
  "Fades, cuts, beard work and hot towel shaves in Barrie. 4.9 on Google, open 7 days. Book online.";

export const BOOKSY_URL =
  "https://booksy.com/en-ca/21023_studio-1-barbershop_barbershop_893463_barrie";
export const GOOGLE_URL =
  "https://www.google.com/maps/place/Studio+1+BARBERSHOP/@44.3715535,-79.6721404,17z";

/**
 * Verified facts from the content doc. Used as the fallback when Sanity has no
 * Site settings yet, and as the source for the seed script.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Studio 1 Barbershop",
  phone: "(705) 881-1976",
  phoneHref: "+17058811976",
  street: "279 Yonge St, Unit 5",
  city: "Barrie",
  region: "ON",
  postalCode: "L4N 7T9",
  hours: {
    mon: { open: "09:00", close: "18:00" },
    tue: { open: "09:00", close: "18:00" },
    wed: { open: "09:00", close: "18:00" },
    thu: { open: "09:00", close: "20:00" },
    fri: { open: "09:00", close: "20:00" },
    sat: { open: "09:00", close: "18:00" },
    sun: { open: "10:00", close: "17:00" },
  },
  google: { rating: 4.9, count: 309, url: GOOGLE_URL },
  booksy: { rating: 5.0, count: 298, url: BOOKSY_URL },
  ticker: [
    "★ 4.9 on Google",
    "5.0 on Booksy",
    "Skin fades",
    "Hot towel shaves",
    "Straight razor",
    "Beard detailing",
    "Kids + seniors",
    "Open 7 days",
    "Yonge St, Barrie",
  ],
  heroStats: [
    { value: "4.9", label: "Google" },
    { value: "5.0", label: "Booksy" },
    { value: "600+", label: "Reviews" },
    { value: "7", label: "Days a week" },
  ],
  hstRate: 13,
  slotIntervalMinutes: 30,
  leadTimeMinutes: 60,
  showBooksyLink: true,
  cancellationPolicy: "[Ask: cancellation policy]",
  etransferDeadline: "[Ask: e-Transfer deadline]",
};
