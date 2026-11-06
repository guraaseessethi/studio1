import { cacheLife, cacheTag } from "next/cache";
import { enabledProviders, toOption } from "./index";
import type { PaymentOption } from "./types";

/** Options drawn on the Payment step. Refreshes when the owner edits Contacts. */
export async function getPaymentOptions(): Promise<PaymentOption[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("sanity", "contacts");
  return (await enabledProviders()).map(toOption);
}
