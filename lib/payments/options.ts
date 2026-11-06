import type { PaymentOption } from "./types";

/**
 * Options drawn on the Payment step. Phase E replaces this with the provider registry
 * (shop, Interac, and Helcim once enabled).
 */
export async function getPaymentOptions(): Promise<PaymentOption[]> {
  return [
    { id: "shop", label: "Pay at the shop", description: "Cash, debit or card after your cut.", tag: "Nothing to pay now" },
    {
      id: "interac",
      label: "Interac e-Transfer",
      description: "We email you our e-Transfer address with your booking. Send it before your visit.",
      tag: "Details sent by email",
    },
  ];
}
