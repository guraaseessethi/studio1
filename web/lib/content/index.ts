import { cacheLife, cacheTag } from "next/cache";
import { hasProject } from "@/lib/sanity/env";
import { SEED_BARBERS, SEED_CHIPS, SEED_GALLERY, SEED_SERVICES, TIER2_LABEL } from "@/content/seedData";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { WEEKDAYS, type DayHours, type SiteSettings, type Weekday, type WeekHours } from "@/lib/types";
import { GROUP_ORDER } from "@/lib/format";
import type {
  Barber,
  Chip,
  GalleryItem,
  HomeContent,
  ImageData,
  Review,
  Service,
  ShopImages,
} from "./types";

/* ---------- raw shapes returned by GROQ ---------- */

type RawImage = {
  alt?: string;
  ref?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  dim?: { width: number; height: number };
  lqip?: string;
};

const IMG = `{alt, hotspot, crop, "ref": asset._ref, "dim": asset->metadata.dimensions, "lqip": asset->metadata.lqip}`;

const SETTINGS_PROJECTION = `{
  businessName, phone, street, city, region, postalCode, hours,
  google, booksy, ticker, heroStats, hstRate, slotIntervalMinutes, leadTimeMinutes,
  showBooksyLink, cancellationPolicy, etransferDeadline,
  "seoTitle": seoTitle, "seoDescription": seoDescription, "ogRef": ogImage.asset._ref
}`;

const SETTINGS_QUERY = `*[_id == "siteSettings"][0]${SETTINGS_PROJECTION}`;

const HOME_QUERY = `{
  "settings": *[_id == "siteSettings"][0]${SETTINGS_PROJECTION},
  "images": *[_id == "siteSettings"][0]{
    "hero": heroImage${IMG}, "heroSmall": heroImageSmall${IMG}, "band": shaveBandImage${IMG}
  },
  "services": *[_type == "service" && active != false]{
    _id, name, group, description, price, duration, price2, duration2, tier2Label, "addonId": addon._ref, order
  },
  "barbers": *[_type == "barber" && active != false] | order(orderRank asc){
    _id, name, "slug": slug.current, title, nickname, bio, specialties, workingDays,
    "serviceIds": services[]._ref, "photo": photo${IMG}
  },
  "chips": *[_type == "pickerChip"] | order(order asc){ _id, label, "serviceId": service._ref, addonText },
  "gallery": *[_id == "gallery"][0].items[]{ _key, category, caption, ...${IMG} },
  "reviews": *[_type == "review" && show == true]{
    _id, quote, author, source, link, "barberName": barber->name
  }
}`;

/* ---------- mapping ---------- */

function mapImage(raw: RawImage | null | undefined, fallbackAlt = ""): ImageData | undefined {
  if (!raw?.ref) return undefined;
  const src = urlFor({ _type: "image", asset: { _type: "reference", _ref: raw.ref }, crop: raw.crop, hotspot: raw.hotspot }).url();
  return {
    src,
    alt: raw.alt ?? fallbackAlt,
    width: raw.dim?.width ?? 1600,
    height: raw.dim?.height ?? 1200,
    lqip: raw.lqip,
    position: raw.hotspot ? `${Math.round(raw.hotspot.x * 100)}% ${Math.round(raw.hotspot.y * 100)}%` : undefined,
  };
}

type RawSettings = Partial<Omit<SiteSettings, "hours" | "phoneHref" | "ogImageUrl">> & {
  ogRef?: string;
  hours?: Partial<Record<Weekday, { closed?: boolean; open?: string; close?: string } | null>>;
};

export function mapSettings(raw: RawSettings | null | undefined): SiteSettings {
  if (!raw) return DEFAULT_SETTINGS;
  const d = DEFAULT_SETTINGS;
  const hours = Object.fromEntries(
    WEEKDAYS.map((day) => {
      const h = raw.hours?.[day];
      const value: DayHours = !h
        ? d.hours[day]
        : h.closed
          ? null
          : h.open && h.close
            ? { open: h.open, close: h.close }
            : d.hours[day];
      return [day, value];
    }),
  ) as WeekHours;
  const phone = raw.phone || d.phone;
  return {
    businessName: raw.businessName || d.businessName,
    phone,
    phoneHref: `+1${phone.replace(/\D/g, "").slice(-10)}`,
    street: raw.street || d.street,
    city: raw.city || d.city,
    region: raw.region || d.region,
    postalCode: raw.postalCode || d.postalCode,
    hours,
    google: { ...d.google, ...stripNull(raw.google) },
    booksy: { ...d.booksy, ...stripNull(raw.booksy) },
    ticker: raw.ticker?.length ? raw.ticker : d.ticker,
    heroStats: raw.heroStats?.length ? raw.heroStats : d.heroStats,
    hstRate: raw.hstRate ?? d.hstRate,
    slotIntervalMinutes: raw.slotIntervalMinutes ?? d.slotIntervalMinutes,
    leadTimeMinutes: raw.leadTimeMinutes ?? d.leadTimeMinutes,
    showBooksyLink: raw.showBooksyLink ?? d.showBooksyLink,
    cancellationPolicy: raw.cancellationPolicy || d.cancellationPolicy,
    etransferDeadline: raw.etransferDeadline || d.etransferDeadline,
    seoTitle: raw.seoTitle || undefined,
    seoDescription: raw.seoDescription || undefined,
    ogImageUrl: raw.ogRef
      ? urlFor({ _type: "image", asset: { _type: "reference", _ref: raw.ogRef } }).width(1200).height(630).fit("crop").url()
      : undefined,
  };
}

function stripNull<T extends object | null | undefined>(o: T): Partial<NonNullable<T>> {
  return Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v != null)) as Partial<NonNullable<T>>;
}

type RawService = Omit<Service, "id" | "addonId"> & { _id: string; addonId?: string; order?: number };

function mapServices(raw: RawService[]): Service[] {
  return [...raw]
    .sort(
      (a, b) =>
        GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
        (a.order ?? 100) - (b.order ?? 100) ||
        a.name.localeCompare(b.name),
    )
    .map(({ _id, order: _order, price2, duration2, tier2Label, addonId, ...s }) => {
      void _order;
      const longer = price2 && duration2 ? { price2, duration2, tier2Label: tier2Label || TIER2_LABEL } : {};
      return { id: _id, ...s, ...longer, ...(addonId ? { addonId } : {}) };
    });
}

/* ---------- local-preview fallback ---------- */

function fallbackContent(): HomeContent {
  const services: Service[] = SEED_SERVICES.map((s) => ({
    id: `seed-${s.key}`,
    name: s.name,
    group: s.group,
    description: s.description,
    price: s.price,
    duration: s.duration,
    ...(s.price2 && s.duration2 ? { price2: s.price2, duration2: s.duration2, tier2Label: TIER2_LABEL } : {}),
    ...(s.addonKey ? { addonId: `seed-${s.addonKey}` } : {}),
  }));
  const img = (n: string, alt: string): ImageData => ({ src: `/dev/${n}.jpg`, alt, width: 1400, height: 933 });
  return {
    settings: DEFAULT_SETTINGS,
    images: {},
    services,
    chips: SEED_CHIPS.map((c) => ({ id: `chip-${c.serviceKey}`, label: c.label, serviceId: `seed-${c.serviceKey}`, addonText: c.addonText })),
    barbers: SEED_BARBERS.map((b, i) => ({
      id: `seed-${b.key}`,
      name: b.name,
      slug: b.key,
      title: "[Ask: title]",
      bio: "[Ask]",
      specialties: b.specialties,
      workingDays: [],
      serviceIds: [],
      photo: i < 2 ? img(`b${i + 1}`, `Placeholder photo for ${b.name}`) : undefined,
    })),
    gallery: SEED_GALLERY.map((g, i) => ({ ...img(`g${i + 1}`, g.alt), key: `g${i + 1}`, category: g.category, caption: g.caption })),
    reviews: [],
  };
}

/* ---------- cached getters ---------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("sanity", "siteSettings");
  if (!hasProject) return DEFAULT_SETTINGS;
  return mapSettings(await client.fetch<RawSettings | null>(SETTINGS_QUERY));
}

type RawHome = {
  settings: RawSettings | null;
  images: { hero?: RawImage; heroSmall?: RawImage; band?: RawImage } | null;
  services: RawService[] | null;
  barbers: (Omit<Barber, "id" | "photo" | "serviceIds" | "specialties" | "workingDays"> & {
    _id: string;
    specialties?: string[];
    workingDays?: Weekday[];
    serviceIds?: string[];
    photo?: RawImage;
  })[] | null;
  chips: { _id: string; label: string; serviceId?: string; addonText?: string }[] | null;
  gallery: (RawImage & { _key: string; category?: string; caption?: string })[] | null;
  reviews: (Omit<Review, "id"> & { _id: string })[] | null;
};

export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheLife("hours");
  cacheTag("sanity", "siteSettings", "service", "barber", "gallery", "review", "pickerChip");
  if (!hasProject) return fallbackContent();

  const raw = await client.fetch<RawHome>(HOME_QUERY);
  const services = mapServices(raw.services ?? []);
  const known = new Set(services.map((s) => s.id));

  const images: ShopImages = {
    hero: mapImage(raw.images?.hero),
    heroSmall: mapImage(raw.images?.heroSmall),
    band: mapImage(raw.images?.band),
  };
  const barbers: Barber[] = (raw.barbers ?? []).map((b) => ({
    id: b._id,
    name: b.name,
    slug: b.slug,
    title: b.title,
    nickname: b.nickname,
    bio: b.bio,
    specialties: b.specialties ?? [],
    workingDays: b.workingDays ?? [],
    serviceIds: (b.serviceIds ?? []).filter(Boolean),
    photo: mapImage(b.photo, `${b.name}`),
  }));
  const chips: Chip[] = (raw.chips ?? [])
    .filter((c) => c.serviceId && known.has(c.serviceId))
    .map((c) => ({ id: c._id, label: c.label, serviceId: c.serviceId as string, addonText: c.addonText }));
  const gallery: GalleryItem[] = (raw.gallery ?? []).flatMap((g) => {
    const image = mapImage(g);
    return image ? [{ ...image, key: g._key, category: g.category, caption: g.caption }] : [];
  });
  const reviews: Review[] = (raw.reviews ?? []).map((r) => ({
    id: r._id,
    quote: r.quote,
    author: r.author,
    source: r.source,
    barberName: r.barberName,
    link: r.link,
  }));

  return { settings: mapSettings(raw.settings), images, services, barbers, chips, gallery, reviews };
}
