import type { PaymentProvider } from "./types";

export const shopProvider: PaymentProvider = {
  id: "shop",
  label: "Pay at the shop",
  description: "Cash, debit or card after your cut.",
  tag: "Nothing to pay now",
  isEnabled: () => true,
  async onBookingCreated(booking) {
    return {
      paymentStatus: "unpaid",
      emailLines: [`Pay at the shop after your appointment. Total with HST: $${booking.total.toFixed(2)}.`],
    };
  },
};
