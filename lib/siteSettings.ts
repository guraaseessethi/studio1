import type { SiteSettings } from "./types";
import { DEFAULT_SETTINGS } from "./defaults";

export async function getSiteSettings(): Promise<SiteSettings> {
  return DEFAULT_SETTINGS;
}
