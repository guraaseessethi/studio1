import type { SiteSettings, Weekday } from "@/lib/types";

export type ImageData = {
  src: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
  /** CSS object-position from the hotspot, e.g. "50% 30%". */
  position?: string;
};

export type ServiceGroup = "haircuts" | "beard-shave" | "combos" | "kids-seniors" | "add-ons";

export type Service = {
  id: string;
  name: string;
  group: ServiceGroup;
  description: string;
  price: number;
  duration: number;
  price2?: number;
  duration2?: number;
  tier2Label?: string;
  addonId?: string;
};

export type Barber = {
  id: string;
  name: string;
  slug: string;
  title?: string;
  nickname?: string;
  bio?: string;
  specialties: string[];
  workingDays: Weekday[];
  /** Empty means the barber offers every service. */
  serviceIds: string[];
  photo?: ImageData;
};

export type GalleryItem = ImageData & { key: string; category?: string; caption?: string };

export type Review = {
  id: string;
  quote: string;
  author: string;
  source: "Google" | "Booksy";
  barberName?: string;
  link?: string;
};

export type Chip = { id: string; label: string; serviceId: string; addonText?: string };

export type ShopImages = { hero?: ImageData; heroSmall?: ImageData; band?: ImageData };

export type HomeContent = {
  settings: SiteSettings;
  images: ShopImages;
  services: Service[];
  barbers: Barber[];
  chips: Chip[];
  gallery: GalleryItem[];
  reviews: Review[];
};
