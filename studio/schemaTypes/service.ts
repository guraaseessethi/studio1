import { defineField, defineType } from "sanity";

export const SERVICE_GROUPS = [
  { title: "Haircuts", value: "haircuts" },
  { title: "Beard and Shave", value: "beard-shave" },
  { title: "Combos", value: "combos" },
  { title: "Kids and Seniors", value: "kids-seniors" },
  { title: "Add-ons", value: "add-ons" },
];

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "group",
      type: "string",
      options: { list: SERVICE_GROUPS, layout: "dropdown" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      description: "One short line, 120 characters at most.",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(120),
    }),
    defineField({ name: "price", title: "Price ($)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "duration", title: "Chair time (minutes)", type: "number", validation: (r) => r.required().integer().min(5) }),
    defineField({
      name: "price2",
      title: "Longer appointment price ($)",
      description: "Only if this service has a second, higher price.",
      type: "number",
      validation: (r) =>
        r.min(0).custom((value, ctx) => {
          const parent = ctx.parent as { price?: number } | undefined;
          return value && parent?.price && value <= parent.price ? "Should be higher than the first price" : true;
        }),
    }),
    defineField({
      name: "tier2Label",
      title: "Longer appointment: what you get",
      description: "Short label, e.g. “Extended cut”. Shown next to the second price.",
      type: "string",
      validation: (r) => r.max(40),
      hidden: ({ parent }) => !parent?.price2,
    }),
    defineField({
      name: "duration2",
      title: "Longer appointment chair time (minutes)",
      type: "number",
      validation: (r) => r.integer().min(5),
      hidden: ({ parent }) => !parent?.price2,
    }),
    defineField({
      name: "addon",
      title: "Suggested add-on",
      type: "reference",
      to: [{ type: "service" }],
      weak: true,
    }),
    defineField({ name: "active", title: "Show on website and take bookings", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Sort number", description: "Lower numbers show first within a group.", type: "number", initialValue: 100 }),
  ],
  orderings: [
    { title: "Group, then sort number", name: "groupOrder", by: [{ field: "group", direction: "asc" }, { field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", group: "group", price: "price", price2: "price2", active: "active" },
    prepare: ({ title, group, price, price2, active }) => ({
      title,
      subtitle: `${SERVICE_GROUPS.find((g) => g.value === group)?.title ?? "No group"} · $${price ?? "?"}${price2 ? ` / $${price2}` : ""}${active === false ? " · Hidden" : ""}`,
    }),
  },
});
