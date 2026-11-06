/**
 * Seeds Sanity from the verified content doc and the photos folder.
 *
 *   npm run seed          writes to the dataset in .env.local (needs SANITY_API_WRITE_TOKEN)
 *   npm run seed:dry      builds everything and prints a summary, no network, no token
 *
 * Safe to re-run: every document uses createIfNotExists, so owner edits are never overwritten.
 * The token is read from .env.local and is never printed or logged.
 */
import { createClient, type SanityClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { LexoRank } from "lexorank";
import {
  BARBER_BIO_PLACEHOLDER,
  BARBER_TITLE_PLACEHOLDER,
  SEED_BARBERS,
  SEED_BARBER_PHOTOS,
  SEED_CHIPS,
  SEED_GALLERY,
  SEED_REVIEWS,
  SEED_SERVICES,
  TIER2_LABEL,
} from "../content/seedData";
import { DEFAULT_DESCRIPTION, DEFAULT_SETTINGS, DEFAULT_TITLE } from "../lib/defaults";
import { WEEKDAYS } from "../lib/types";

const dryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const photosDir = resolve(process.env.SEED_PHOTOS_DIR || "../photos/stock");

function die(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!dryRun) {
  if (!projectId) die("NEXT_PUBLIC_SANITY_PROJECT_ID is missing from .env.local.");
  if (!token) die("SANITY_API_WRITE_TOKEN is missing from .env.local. Add it yourself, then run `npm run seed` again.");
}

const client: SanityClient | null = dryRun
  ? null
  : createClient({ projectId, dataset, apiVersion: "2025-02-19", token, useCdn: false });

type Doc = { _id: string; _type: string; [key: string]: unknown };

const ref = (id: string, weak = false) => ({ _type: "reference", _ref: id, ...(weak ? { _weak: true } : {}) });
const key = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40);

async function prepare(file: string): Promise<Buffer> {
  const original = readFileSync(file);
  try {
    // Photos are 4 to 9 MB; 2400px is plenty for the site and keeps uploads quick.
    const { default: sharp } = await import("sharp");
    return await sharp(original).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return original;
  }
}

const uploaded = new Map<string, string>();
async function uploadImage(file: string): Promise<string> {
  const cached = uploaded.get(file);
  if (cached) return cached;
  let id = `image-dry-run-${basename(file)}`;
  if (client) {
    const asset = await client.assets.upload("image", await prepare(file), { filename: basename(file) });
    id = asset._id;
  }
  uploaded.set(file, id);
  return id;
}

const image = (assetId: string, extra: Record<string, unknown> = {}) => ({
  _type: "image",
  asset: ref(assetId),
  ...extra,
});

async function build(existing: Set<string>) {
  const docs: Doc[] = [];
  const s = DEFAULT_SETTINGS;

  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    businessName: s.businessName,
    phone: s.phone,
    street: s.street,
    city: s.city,
    region: s.region,
    postalCode: s.postalCode,
    google: s.google,
    booksy: s.booksy,
    hours: Object.fromEntries(
      WEEKDAYS.map((d) => {
        const h = s.hours[d];
        return [d, h ? { _type: "dayHours", closed: false, open: h.open, close: h.close } : { _type: "dayHours", closed: true }];
      }),
    ),
    ticker: s.ticker,
    heroStats: s.heroStats.map((x) => ({ _type: "stat", _key: key(x.label), ...x })),
    hstRate: s.hstRate,
    slotIntervalMinutes: s.slotIntervalMinutes,
    leadTimeMinutes: s.leadTimeMinutes,
    showBooksyLink: s.showBooksyLink,
    cancellationPolicy: s.cancellationPolicy,
    etransferDeadline: s.etransferDeadline,
    seoTitle: DEFAULT_TITLE,
    seoDescription: DEFAULT_DESCRIPTION,
  });

  const perGroup = new Map<string, number>();
  for (const sv of SEED_SERVICES) {
    const n = (perGroup.get(sv.group) ?? 0) + 1;
    perGroup.set(sv.group, n);
    docs.push({
      _id: `service-${sv.key}`,
      _type: "service",
      name: sv.name,
      group: sv.group,
      description: sv.description,
      price: sv.price,
      duration: sv.duration,
      ...(sv.price2 && sv.duration2 ? { price2: sv.price2, duration2: sv.duration2, tier2Label: TIER2_LABEL } : {}),
      ...(sv.addonKey ? { addon: ref(`service-${sv.addonKey}`, true) } : {}),
      active: true,
      order: n * 10,
    });
  }

  SEED_CHIPS.forEach((c, i) =>
    docs.push({
      _id: `chip-${c.serviceKey}`,
      _type: "pickerChip",
      label: c.label,
      service: ref(`service-${c.serviceKey}`),
      addonText: c.addonText,
      order: (i + 1) * 10,
    }),
  );

  let rank = LexoRank.min();
  for (let i = 0; i < SEED_BARBERS.length; i++) {
    const b = SEED_BARBERS[i];
    rank = rank.genNext().genNext();
    const id = `barber-${b.key}`;
    const photoFile = resolve(photosDir, SEED_BARBER_PHOTOS[i % SEED_BARBER_PHOTOS.length]);
    const photo = existing.has(id)
      ? undefined
      : image(await uploadImage(photoFile), { alt: `Placeholder photo, replace with ${b.name}'s portrait` });
    docs.push({
      _id: id,
      _type: "barber",
      orderRank: rank.toString(),
      name: b.name,
      slug: { _type: "slug", current: b.key },
      title: BARBER_TITLE_PLACEHOLDER,
      bio: BARBER_BIO_PLACEHOLDER,
      specialties: b.specialties,
      workingDays: [],
      services: [],
      active: true,
      ...(photo ? { photo } : {}),
    });
  }

  if (!existing.has("gallery")) {
    const items = [];
    for (const g of SEED_GALLERY) {
      items.push({
        _key: key(g.file.split("_")[0]),
        ...image(await uploadImage(resolve(photosDir, g.file)), { alt: g.alt, category: g.category, caption: g.caption }),
      });
    }
    docs.push({ _id: "gallery", _type: "gallery", items });
  }

  SEED_REVIEWS.forEach((r, i) =>
    docs.push({
      _id: `review-${i + 1}`,
      _type: "review",
      quote: r.quote,
      author: r.author,
      source: r.source,
      show: false,
    }),
  );

  // Private (dotted ID): never served by the public API.
  docs.push({ _id: "private.contacts", _type: "contacts", barberEmails: [] });

  return docs;
}

async function main() {
  console.log(dryRun ? "Dry run: nothing will be written." : `Seeding project ${projectId}, dataset "${dataset}".`);

  const wanted = [
    "siteSettings",
    "gallery",
    "private.contacts",
    ...SEED_SERVICES.map((x) => `service-${x.key}`),
    ...SEED_CHIPS.map((x) => `chip-${x.serviceKey}`),
    ...SEED_BARBERS.map((x) => `barber-${x.key}`),
    ...SEED_REVIEWS.map((_, i) => `review-${i + 1}`),
  ];
  const existing = new Set<string>(client ? await client.fetch<string[]>(`*[_id in $ids]._id`, { ids: wanted }) : []);

  const docs = await build(existing);
  const fresh = docs.filter((d) => !existing.has(d._id));

  if (client && fresh.length > 0) {
    // Services first so the picker chips' references resolve.
    const order = ["service", "pickerChip", "barber", "gallery", "review", "siteSettings", "contacts"];
    const sorted = [...fresh].sort((a, b) => order.indexOf(a._type) - order.indexOf(b._type));
    const tx = client.transaction();
    for (const d of sorted) tx.createIfNotExists(d);
    await tx.commit();
  }

  const count = (type: string) => docs.filter((d) => d._type === type).length;
  console.log(
    [
      `Services: ${count("service")}`,
      `Picker chips: ${count("pickerChip")}`,
      `Barbers: ${count("barber")}`,
      `Gallery photos: ${(docs.find((d) => d._type === "gallery")?.items as unknown[] | undefined)?.length ?? "kept as is"}`,
      `Reviews (hidden placeholders): ${count("review")}`,
    ].join(" · "),
  );
  console.log(`${dryRun ? "Would create" : "Created"} ${fresh.length} documents, kept ${docs.length - fresh.length} that already existed.`);
  if (!dryRun) console.log("Done. Open /studio to check the content.");
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : "unknown error");
  process.exit(1);
});
