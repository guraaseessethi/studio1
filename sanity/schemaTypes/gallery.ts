import { defineArrayMember, defineField, defineType } from "sanity";

export const GALLERY_CATEGORIES = [
  { title: "Fades", value: "fades" },
  { title: "Scissor cuts", value: "scissor" },
  { title: "Beards and shaves", value: "beard" },
  { title: "Kids", value: "kids" },
  { title: "The shop", value: "shop" },
];

export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Photos",
      description: "Drag several photos in at once. Drag a photo up or down to change the order.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Describe the photo", type: "string", validation: (r) => r.required() }),
            defineField({ name: "category", type: "string", options: { list: GALLERY_CATEGORIES } }),
            defineField({ name: "caption", type: "string", validation: (r) => r.max(80) }),
          ],
          preview: { select: { title: "alt", subtitle: "caption", media: "asset" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Gallery" }) },
});
