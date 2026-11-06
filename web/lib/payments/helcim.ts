import type { PaymentProvider } from "./types";

/**
 * Helcim card payments. Disabled until PAYMENTS_HELCIM_ENABLED=true and HELCIM_API_TOKEN are set,
 * and while disabled no Helcim code runs and the option never shows.
 *
 * TODO(helcim) to finish this provider:
 *  1. Server: call Helcim's HelcimPay.js "initialize" endpoint with the booking total
 *     (amount from the server-side quote, never the browser) and keep the returned checkoutToken
 *     and secretToken with the pending booking.
 *  2. Client: open the HelcimPay.js modal with the checkoutToken from a new step after Confirm
 *     (the design has a "Secure payment" modal for this), and post the transaction response back.
 *  3. Server: validate the response hash with the secretToken before trusting it.
 *  4. Server: on a valid hash, mark the booking paymentStatus "paid" and email the receipt.
 */
export const helcimProvider: PaymentProvider = {
  id: "helcim",
  label: "Pay by card now",
  description: "Pay online now. Walk in and sit down, nothing to pay at the chair.",
  tag: "Secured by Helcim",
  isEnabled: () => process.env.PAYMENTS_HELCIM_ENABLED === "true" && Boolean(process.env.HELCIM_API_TOKEN),
  async onBookingCreated() {
    throw new Error("Helcim payments are not implemented yet. See the TODO list in lib/payments/helcim.ts.");
  },
};
