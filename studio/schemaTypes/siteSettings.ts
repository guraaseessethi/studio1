import { defineField, defineType } from "sanity";
import { TIME_OPTIONS } from "../lib/format";

const DAYS = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
] as const;

const dayHours = defineType({
  name: "dayHours",
  title: "Day hours",
  type: "object",
  fields: [
    defineField({ name: "closed", title: "Closed all day", type: "boolean", initialValue: false }),
    defineField({
      name: "open",
      title: "Opens",
      type: "string",
      options: { list: TIME_OPTIONS },
      hidden: ({ parent }) => parent?.closed,
    }),
    defineField({
      name: "close",
      title: "Closes",
      type: "string",
      options: { list: TIME_OPTIONS },
      hidden: ({ parent }) => parent?.closed,
    }),
  ],
  preview: {
    select: { closed: "closed", open: "open", close: "close" },
    prepare: ({ closed, open, close }) => ({ title: closed ? "Closed" : `${open ?? "?"} to ${close ?? "?"}` }),
  },
});

const rating = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { columns: 3 },
    fields: [
      defineField({ name: "rating", type: "number", validation: (r) => r.required().min(1).max(5) }),
      defineField({ name: "count", title: "Number of reviews", type: "number", validation: (r) => r.required().integer().min(0) }),
      defineField({ name: "url", title: "Link to reviews", type: "url", validation: (r) => r.required() }),
    ],
  });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "business", title: "Business", default: true },
    { name: "hours", title: "Hours" },
    { name: "home", title: "Homepage" },
    { name: "booking", title: "Booking" },
    { name: "seo", title: "Search and sharing" },
  ],
  fields: [
    defineField({ name: "businessName", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "phone", type: "string", group: "business", description: "Shown on the site as typed, e.g. (705) 881-1976", validation: (r) => r.required() }),
    defineField({ name: "street", title: "Street address", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "city", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "region", title: "Province", type: "string", group: "business", validation: (r) => r.required() }),
    defineField({ name: "postalCode", type: "string", group: "business", validation: (r) => r.required() }),
    rating("google", "Google rating"),
    rating("booksy", "Booksy rating"),
    defineField({
      name: "hours",
      title: "Opening hours",
      description: "Bookings are only offered inside these hours.",
      type: "object",
      group: "hours",
      options: { collapsible: false },
      fields: DAYS.map(([name, title]) => defineField({ name, title, type: "dayHours" })),
    }),
    defineField({
      name: "ticker",
      title: "Scrolling strip",
      description: "Short phrases in the scrolling strip under the header.",
      type: "array",
      of: [{ type: "string", validation: (r) => r.max(40) }],
      group: "home",
    }),
    defineField({
      name: "heroStats",
      title: "Hero numbers",
      description: "Up to four big numbers under the hero headline.",
      type: "array",
      group: "home",
      validation: (r) => r.max(4),
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", type: "string", validation: (r) => r.required().max(8) }),
            defineField({ name: "label", type: "string", validation: (r) => r.required().max(20) }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Hero photo (large)",
      description: "Leave empty to use the built-in photo.",
      type: "image",
      options: { hotspot: true },
      group: "home",
      fields: [defineField({ name: "alt", title: "Describe the photo", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "heroImageSmall",
      title: "Hero photo (small)",
      description: "Leave empty to use the built-in photo.",
      type: "image",
      options: { hotspot: true },
      group: "home",
      fields: [defineField({ name: "alt", title: "Describe the photo", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "shaveBandImage",
      title: "Beard and shave banner photo",
      description: "Leave empty to use the built-in photo.",
      type: "image",
      options: { hotspot: true },
      group: "home",
    }),
    defineField({ name: "hstRate", title: "HST rate (%)", type: "number", initialValue: 13, group: "booking", validation: (r) => r.required().min(0).max(30) }),
    defineField({
      name: "slotIntervalMinutes",
      title: "Booking slot every (minutes)",
      type: "number",
      initialValue: 30,
      options: { list: [15, 20, 30, 45, 60] },
      group: "booking",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "leadTimeMinutes",
      title: "Earliest booking from now (minutes)",
      description: "Stops last-minute bookings the shop cannot see in time.",
      type: "number",
      initialValue: 60,
      group: "booking",
      validation: (r) => r.required().min(0).max(1440),
    }),
    defineField({
      name: "showBooksyLink",
      title: "Show “Book instantly on Booksy” link",
      type: "boolean",
      initialValue: true,
      group: "booking",
    }),
    defineField({ name: "cancellationPolicy", type: "text", rows: 3, group: "booking", description: "Shown in booking emails." }),
    defineField({ name: "etransferDeadline", title: "e-Transfer deadline wording", type: "string", group: "booking", description: "e.g. “within 2 hours of booking”." }),
    defineField({ name: "seoTitle", title: "Default page title", type: "string", group: "seo", validation: (r) => r.max(65) }),
    defineField({ name: "seoDescription", title: "Default page description", type: "text", rows: 3, group: "seo", validation: (r) => r.max(160) }),
    defineField({
      name: "ogImage",
      title: "Sharing image",
      description: "Shown when the site is shared. 1200 by 630 works best.",
      type: "image",
      group: "seo",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const siteSettingsTypes = [siteSettings, dayHours];
