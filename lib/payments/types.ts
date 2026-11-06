import type { Contacts } from "@/lib/contacts";
import type { SiteSettings } from "@/lib/types";

export type PaymentId = "shop" | "interac" | "helcim";

export type PaymentStatus = "unpaid" | "awaiting-etransfer" | "paid";

/** What the Payment step needs to draw one option. Safe for the browser. */
export type PaymentOption = {
  id: PaymentId;
  label: string;
  description: string;
  tag: string;
};

/** A booking as the payment providers and emails see it. */
export type BookingData = {
  id: string;
  reference: string;
  serviceName: string;
  tierLabel?: string;
  barberId: string;
  barberName: string;
  /** True when the client chose "No preference". */
  anyBarber: boolean;
  date: string;
  time: string;
  durationMinutes: number;
  customerName: string;
  mobile: string;
  email: string;
  notes: string;
  paymentMethod: PaymentId;
  subtotal: number;
  hst: number;
  total: number;
};

export type PaymentContext = { contacts: Contacts; settings: SiteSettings };

export type PaymentOutcome = {
  paymentStatus: PaymentStatus;
  /** Extra block for the on-screen success message. */
  etransfer?: { email: string; amount: number; deadline: string; instructions?: string };
  /** Paragraphs for the "How to pay" part of the emails. */
  emailLines: string[];
};

/**
 * One way to pay. The Payment step draws every enabled provider, so adding a provider
 * means adding a file here and listing it in `index.ts`, with no UI change.
 */
export interface PaymentProvider extends PaymentOption {
  isEnabled(): boolean | Promise<boolean>;
  onBookingCreated(booking: BookingData, ctx: PaymentContext): Promise<PaymentOutcome>;
}
