import "server-only";
import { serverClient } from "@/lib/sanity/server";
import { hasProject } from "@/lib/sanity/env";

export type Contacts = {
  ownerEmail?: string;
  etransferEmail?: string;
  etransferInstructions?: string;
  barberEmails: { barberId: string; email: string }[];
};

const EMPTY: Contacts = { barberEmails: [] };

/** Private contacts. Needs the Sanity token; without it Sanity returns nothing. */
export async function getContacts(): Promise<Contacts> {
  if (!hasProject) return EMPTY;
  const doc = await serverClient.fetch<{
    ownerEmail?: string;
    etransferEmail?: string;
    etransferInstructions?: string;
    barberEmails?: { barberId?: string; email?: string }[];
  } | null>(
    `*[_id == "private.contacts"][0]{ ownerEmail, etransferEmail, etransferInstructions, "barberEmails": barberEmails[]{ "barberId": barber._ref, email } }`,
    {},
    { cache: "no-store" },
  );
  if (!doc) return EMPTY;
  return {
    ownerEmail: doc.ownerEmail || undefined,
    etransferEmail: doc.etransferEmail || undefined,
    etransferInstructions: doc.etransferInstructions || undefined,
    barberEmails: (doc.barberEmails ?? []).flatMap((b) => (b.barberId && b.email ? [{ barberId: b.barberId, email: b.email }] : [])),
  };
}
