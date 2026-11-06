import { getContacts } from "@/lib/contacts";
import { hasProject } from "@/sanity/lib/env";
import type { PaymentProvider } from "./types";

export const interacProvider: PaymentProvider = {
  id: "interac",
  label: "Interac e-Transfer",
  description: "We email you our e-Transfer address with your booking. Send it before your visit.",
  tag: "Details sent by email",
  // Offered once the owner has entered an e-Transfer address in Contacts.
  // With no Sanity project (local preview) it stays visible so the UI can be checked.
  async isEnabled() {
    if (!hasProject) return true;
    return Boolean((await getContacts()).etransferEmail);
  },
  async onBookingCreated(booking, { contacts, settings }) {
    const email = contacts.etransferEmail ?? "[Ask: e-Transfer email]";
    const deadline = settings.etransferDeadline;
    const amount = booking.total;
    return {
      paymentStatus: "awaiting-etransfer",
      etransfer: { email, amount, deadline, instructions: contacts.etransferInstructions },
      emailLines: [
        `Send an Interac e-Transfer of $${amount.toFixed(2)} to ${email}.`,
        `Put your reference number ${booking.reference} in the message.`,
        `Deadline: ${deadline}`,
        ...(contacts.etransferInstructions ? [contacts.etransferInstructions] : []),
      ],
    };
  },
};
