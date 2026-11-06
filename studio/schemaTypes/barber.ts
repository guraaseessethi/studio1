import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const WORKING_DAYS = [
  { title: "Monday", value: "mon" },
  { title: "Tuesday", value: "tue" },
  { title: "Wednesday", value: "wed" },
  { title: "Thursday", value: "thu" },
  { title: "Friday", value: "fri" },
  { title: "Saturday", value: "sat" },
  { title: "Sunday", value: "sun" },
];

export const barber = defineType({
  name: "barber",
  title: "Barber",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "barber", newItemPosition: "after" }),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", description: "e.g. Master barber", type: "string" }),
    defineField({ name: "nickname", description: "Optional, shown in quotes.", type: "string" }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
      description: "A placeholder card shows until a photo is added.",
      fields: [
        defineField({
          name: "alt",
          title: "Describe the photo",
          type: "string",
          validation: (r) =>
            r.custom((value, ctx) => {
              const photo = (ctx.parent as { asset?: unknown } | undefined)?.asset;
              return photo && !value ? "Describe the photo for screen readers" : true;
            }),
        }),
      ],
    }),
    defineField({ name: "bio", type: "text", rows: 3, description: "One or two lines, 200 characters at most.", validation: (r) => r.max(200) }),
    defineField({
      name: "specialties",
      title: "Clients book for",
      description: "Short tags, e.g. Skin fades.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "workingDays",
      title: "Working days",
      description: "Leave empty to work every day the shop is open.",
      type: "array",
      of: [{ type: "string" }],
      options: { list: WORKING_DAYS, layout: "grid" },
    }),
    defineField({
      name: "services",
      title: "Services offered",
      description: "Leave empty to offer every service.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
    }),
    defineField({ name: "active", title: "Show on website and take bookings", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "name", role: "title", active: "active", media: "photo" },
    prepare: ({ title, role, active, media }) => ({
      title,
      subtitle: `${active === false ? "Hidden" : "Active"}${role ? ` · ${role}` : ""}`,
      media,
    }),
  },
});
