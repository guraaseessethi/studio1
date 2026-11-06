export type PaymentId = "shop" | "interac" | "helcim";

/** What the Payment step needs to draw one option. Safe for the browser. */
export type PaymentOption = {
  id: PaymentId;
  label: string;
  description: string;
  tag: string;
};
