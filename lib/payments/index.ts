import { helcimProvider } from "./helcim";
import { interacProvider } from "./interac";
import { shopProvider } from "./shop";
import type { PaymentId, PaymentOption, PaymentProvider } from "./types";

/** Order here is the order shown on the Payment step. */
const PROVIDERS: PaymentProvider[] = [shopProvider, interacProvider, helcimProvider];

export async function enabledProviders(): Promise<PaymentProvider[]> {
  const flags = await Promise.all(PROVIDERS.map((p) => p.isEnabled()));
  return PROVIDERS.filter((_, i) => flags[i]);
}

export async function enabledProvider(id: string): Promise<PaymentProvider | undefined> {
  return (await enabledProviders()).find((p) => p.id === (id as PaymentId));
}

export const toOption = ({ id, label, description, tag }: PaymentProvider): PaymentOption => ({ id, label, description, tag });
