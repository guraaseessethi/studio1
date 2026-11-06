import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      description: "Copy it word for word from Google or Booksy.",
      type: "text",
      rows: 4,
      validation: (r) => r.required().max(400),
    }),
    defineField({ name: "author", title: "Name", description: "First name and last initial, e.g. Nikita S.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "source", type: "string", options: { list: ["Google", "Booksy"], layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "barber", title: "Barber they mention", type: "reference", to: [{ type: "barber" }], weak: true }),
    defineField({ name: "link", title: "Link to the review", type: "url" }),
    defineField({ name: "show", title: "Show on website", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "author", subtitle: "quote", source: "source", show: "show" },
    prepare: ({ title, subtitle, source, show }) => ({
      title: `${title ?? "No name"} · ${source ?? "?"}${show ? "" : " · Hidden"}`,
      subtitle,
    }),
  },
});
