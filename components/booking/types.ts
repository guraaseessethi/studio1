import type { Barber, Service } from "@/lib/content/types";
import type { Busy, Slot } from "@/lib/booking/slots";
import type { WeekHours } from "@/lib/types";
import type { PaymentOption } from "@/lib/payments/types";
import type { Tier } from "@/lib/bookingStore";

export type BookingSettings = {
  hstRate: number;
  slotIntervalMinutes: number;
  leadTimeMinutes: number;
  hours: WeekHours;
  showBooksyLink: boolean;
  booksyUrl: string;
  phone: string;
};

export type ConsoleProps = {
  services: Service[];
  barbers: Barber[];
  paymentOptions: PaymentOption[];
  settings: BookingSettings;
};

/** Everything the steps need, derived once per render in the Console. */
export type View = {
  service?: Service;
  tier: Tier;
  chosen?: { price: number; duration: number; label?: string };
  eligible: Barber[];
  barberId: string | null;
  barberName?: string;
  dates: string[];
  daySlots: Record<string, Slot[]>;
  busy: Busy[] | null;
  loading: boolean;
  loadError: boolean;
  retry: () => void;
  quote?: { subtotal: number; hst: number; total: number };
  paymentLabel?: string;
};
