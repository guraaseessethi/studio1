import type { SchemaTypeDefinition } from "sanity";
import { barber } from "./barber";
import { booking } from "./booking";
import { contacts } from "./contacts";
import { gallery } from "./gallery";
import { pickerChip } from "./pickerChip";
import { review } from "./review";
import { service } from "./service";
import { siteSettingsTypes } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  ...siteSettingsTypes,
  service,
  barber,
  gallery,
  review,
  pickerChip,
  booking,
  contacts,
];

/** One-document types: hidden from "create new" and protected from delete. */
export const SINGLETON_TYPES = ["siteSettings", "gallery", "contacts"];
export const SINGLETON_IDS: Record<string, string> = {
  siteSettings: "siteSettings",
  gallery: "gallery",
  contacts: "private.contacts",
};
