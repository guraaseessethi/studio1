export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** "HH:mm" in shop-local time, or null when closed all day. */
export type DayHours = { open: string; close: string } | null;
export type WeekHours = Record<Weekday, DayHours>;

export type HeroStat = { value: string; label: string };

export type SiteSettings = {
  businessName: string;
  phone: string;
  phoneHref: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  hours: WeekHours;
  google: { rating: number; count: number; url: string };
  booksy: { rating: number; count: number; url: string };
  ticker: string[];
  heroStats: HeroStat[];
  hstRate: number;
  slotIntervalMinutes: number;
  leadTimeMinutes: number;
  showBooksyLink: boolean;
  cancellationPolicy: string;
  etransferDeadline: string;
};
