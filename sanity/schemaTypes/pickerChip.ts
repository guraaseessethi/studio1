import { defineField, defineType } from "sanity";

export const pickerChip = defineType({
  name: "pickerChip",
  title: "Picker chip",
  type: "document",
  fields: [
    defineField({ name: "label", description: "The button text, e.g. Skin fade.", type: "string", validation: (r) => r.required().max(24) }),
    defineField({ name: "service", type: "reference", to: [{ type: "service" }], validation: (r) => r.required() }),
    defineField({ name: "addonText", title: "Suggested add-on text", description: "e.g. Neck Detailing ($20)", type: "string", validation: (r) => r.max(60) }),
    defineField({ name: "order", title: "Sort number", type: "number", initialValue: 100 }),
  ],
  orderings: [{ title: "Sort number", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "label", subtitle: "service.name" } },
});
