import { defineField, defineType } from "sanity";
import { apiVersion } from "../lib/env";

/** ID is always "private.contacts" (dotted, so never served publicly). */
export const contacts = defineType({
  name: "contacts",
  title: "Contacts (private)",
  type: "document",
  liveEdit: true,
  fields: [
    defineField({
      name: "ownerEmail",
      title: "Your email for new booking alerts",
      type: "string",
      validation: (r) => r.email(),
    }),
    defineField({
      name: "barberEmails",
      title: "Barber emails",
      description: "Each barber gets an email when a client books with them.",
      type: "array",
      of: [
        {
          type: "object",
          name: "barberEmail",
          fields: [
            defineField({ name: "barber", type: "reference", to: [{ type: "barber" }], weak: true, validation: (r) => r.required() }),
            defineField({ name: "email", type: "string", validation: (r) => r.required().email() }),
          ],
          preview: { select: { title: "barber.name", subtitle: "email" } },
        },
      ],
      validation: (r) =>
        r
          .custom(async (value, ctx) => {
            const client = ctx.getClient({ apiVersion });
            const barbers = await client.fetch<{ _id: string; name: string }[]>(
              `*[_type == "barber" && active != false && !(_id in path("drafts.**"))]{_id, name}`,
            );
            const have = new Set(
              ((value as { barber?: { _ref?: string }; email?: string }[] | undefined) ?? [])
                .filter((x) => x.email)
                .map((x) => x.barber?._ref),
            );
            const missing = barbers.filter((b) => !have.has(b._id)).map((b) => b.name);
            return missing.length ? `No email yet for: ${missing.join(", ")}. They will not get booking alerts.` : true;
          })
          .warning(),
    }),
    defineField({
      name: "etransferEmail",
      title: "Interac e-Transfer email",
      description: "Where clients send e-Transfers. Turn on autodeposit for this address.",
      type: "string",
      validation: (r) => r.email(),
    }),
    defineField({
      name: "etransferInstructions",
      title: "Extra e-Transfer instructions",
      type: "text",
      rows: 3,
    }),
  ],
  preview: { prepare: () => ({ title: "Contacts (private)" }) },
});
