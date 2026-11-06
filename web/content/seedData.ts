/**
 * Verified content from the Website Content doc. Feeds the seed script and the
 * local-preview fallback (used only while NEXT_PUBLIC_SANITY_PROJECT_ID is unset).
 * Unknown facts are visible "[Ask: ...]" text, never invented values.
 */

export type SeedService = {
  key: string;
  name: string;
  group: "haircuts" | "beard-shave" | "combos" | "kids-seniors" | "add-ons";
  description: string;
  price: number;
  duration: number;
  price2?: number;
  duration2?: number;
  addonKey?: string;
};

export const TIER2_LABEL = "Longer appointment";

export const SEED_SERVICES: SeedService[] = [
  { key: "haircut", name: "Haircut", group: "haircuts", description: "Consult, cut and finish, shaped to your hair and routine.", price: 37, duration: 30, price2: 57, duration2: 45, addonKey: "neck-detailing" },
  { key: "skin-fade", name: "Skin Fade", group: "haircuts", description: "Blended clean down to the skin, sharp lines.", price: 40, duration: 35, price2: 60, duration2: 45, addonKey: "neck-detailing" },
  { key: "buzz-cut", name: "Buzz Cut", group: "haircuts", description: "One guard all over with a clean neckline.", price: 25, duration: 15, price2: 40, duration2: 30, addonKey: "beard-shaping" },
  { key: "scissor-cut", name: "Scissor Cut", group: "haircuts", description: "Scissors only, soft texture for longer styles.", price: 60, duration: 40, price2: 80, duration2: 45, addonKey: "neck-detailing" },
  { key: "long-hair", name: "Long Hair", group: "haircuts", description: "Shape and length for longer hair.", price: 60, duration: 40, addonKey: "neck-detailing" },
  { key: "mullet", name: "Mullet", group: "haircuts", description: "Short sides, length at the back, done right.", price: 40, duration: 35, addonKey: "neck-detailing" },
  { key: "female-haircut", name: "Female Haircut", group: "haircuts", description: "Short and textured cuts for women.", price: 80, duration: 55 },
  { key: "beard-shaping", name: "Beard Shaping and Detailing", group: "beard-shave", description: "Line-up, shape and detail.", price: 26, duration: 30, addonKey: "neck-detailing" },
  { key: "facial-shave", name: "Traditional Facial Shave", group: "beard-shave", description: "Hot towel and straight razor.", price: 40, duration: 30, addonKey: "neck-detailing" },
  { key: "head-shave", name: "Hot Towel Head Shave", group: "beard-shave", description: "Smooth head shave with hot towels.", price: 40, duration: 40, price2: 70, duration2: 45, addonKey: "facial-shave" },
  { key: "neck-detailing", name: "Neck Detailing", group: "beard-shave", description: "Clean up between cuts.", price: 20, duration: 15 },
  { key: "haircut-beard", name: "Haircut with Beard Trim", group: "combos", description: "The full refresh, cut and beard together.", price: 70, duration: 45 },
  { key: "buzz-beard", name: "Buzz Cut and Beard", group: "combos", description: "Quick buzz plus a tidy beard.", price: 40, duration: 30 },
  { key: "kids-cut", name: "Under 14 Haircut", group: "kids-seniors", description: "Patient, quick and kid-friendly.", price: 31, duration: 30, addonKey: "kids-fade" },
  { key: "kids-fade", name: "Kids Fade", group: "kids-seniors", description: "A proper fade for the little ones.", price: 35, duration: 30 },
  { key: "seniors-haircut", name: "Seniors Haircut", group: "kids-seniors", description: "Classic cut, no rush.", price: 30, duration: 30, price2: 45, duration2: 45, addonKey: "ear-wax" },
  { key: "seniors-beard", name: "Seniors Cut and Beard Trim", group: "kids-seniors", description: "Cut and beard, taken at an easy pace.", price: 45, duration: 35 },
  { key: "ear-wax", name: "Nose / Ear Wax", group: "add-ons", description: "Quick and clean.", price: 5, duration: 10 },
];

export type SeedChip = { label: string; serviceKey: string; addonText: string };

export const SEED_CHIPS: SeedChip[] = [
  { label: "Skin fade", serviceKey: "skin-fade", addonText: "Neck Detailing ($20)" },
  { label: "Classic haircut", serviceKey: "haircut", addonText: "Beard Shaping ($26)" },
  { label: "Haircut + beard", serviceKey: "haircut-beard", addonText: "Hot towel finish, ask your barber" },
  { label: "Buzz cut", serviceKey: "buzz-cut", addonText: "Beard Shaping ($26)" },
  { label: "Scissor cut", serviceKey: "scissor-cut", addonText: "Neck Detailing ($20)" },
  { label: "Long hair", serviceKey: "long-hair", addonText: "Neck Detailing ($20)" },
  { label: "Kids cut", serviceKey: "kids-cut", addonText: "Kids Fade upgrade ($35)" },
  { label: "Senior cut", serviceKey: "seniors-haircut", addonText: "Nose / Ear Wax ($5)" },
  { label: "Hot towel shave", serviceKey: "facial-shave", addonText: "Neck Detailing ($20)" },
  { label: "Beard shaping", serviceKey: "beard-shaping", addonText: "Neck Detailing ($20)" },
  { label: "Head shave", serviceKey: "head-shave", addonText: "Traditional Facial Shave" },
  { label: "Nose / ear wax", serviceKey: "ear-wax", addonText: "Add it to any cut" },
];

export type SeedBarber = { key: string; name: string; specialties: string[] };

export const SEED_BARBERS: SeedBarber[] = [
  { key: "sultan", name: "Sultan", specialties: ["Haircuts", "Skin fades"] },
  { key: "tushar", name: "Tushar", specialties: ["Skin fades", "Haircuts"] },
  { key: "vitaliy", name: "Vitaliy", specialties: [] },
  { key: "saijan", name: "Saijan", specialties: [] },
];

export const BARBER_TITLE_PLACEHOLDER = "[Ask: title]";
export const BARBER_BIO_PLACEHOLDER = "[Ask]";

export type SeedGalleryItem = { file: string; alt: string; category: "fades" | "scissor" | "beard" | "kids" | "shop"; caption?: string };

/** Stock placeholders, mapped by filename prefix. Replace with real work from Instagram. */
export const SEED_GALLERY: SeedGalleryItem[] = [
  { file: "gallery-skin-fade_unsplash-john-arano.jpg", alt: "Skin fade haircut in progress", category: "fades", caption: "Skin fade" },
  { file: "gallery-razor-fade-detail_unsplash-agustin-fernandez.jpg", alt: "Close-up of a razor fade and beard", category: "fades", caption: "Razor fade detail" },
  { file: "gallery-scissor-cut_unsplash-gulom-nazarov.jpg", alt: "Scissor and comb cut in progress", category: "scissor", caption: "Scissor cut" },
  { file: "gallery-kids-cut_unsplash-ibrahim-guetar.jpg", alt: "Young boy in the barber chair after a haircut", category: "kids", caption: "Kids cut" },
  { file: "gallery-kids-cut-bw_unsplash-tommy-van-kessel.jpg", alt: "Boy getting a haircut, black and white", category: "kids", caption: "Kids cut" },
  { file: "hero-shop-interior_unsplash-barney-goodman.jpg", alt: "Barbershop interior with chairs and lit shelves", category: "shop", caption: "The shop" },
  { file: "shop-chair-brick_unsplash-nathon-oski.jpg", alt: "Barber chairs in front of a brick wall", category: "shop", caption: "The chairs" },
  { file: "scissors-bw_unsplash-nathon-oski.jpg", alt: "Barber cutting beard hair with scissors, black and white", category: "beard", caption: "Beard work" },
  { file: "tools-clippers-scissors_unsplash-andrea-donato.jpg", alt: "Clippers, scissors and comb on a barber station mat", category: "shop", caption: "The tools" },
];

export const SEED_BARBER_PHOTOS = [
  "barber-placeholder-1_unsplash-michael-demoya.jpg",
  "barber-placeholder-2_unsplash-nate-johnston.jpg",
];

export type SeedReview = { author: string; source: "Google" | "Booksy"; quote: string; link?: string };

/** Hidden placeholders. Replace the quotes with the real reviews the owner approves. */
export const SEED_REVIEWS: SeedReview[] = [
  { author: "[First name, initial]", source: "Google", quote: "[Ask: real Google review about kids cuts, copied word for word]" },
  { author: "[First name, initial]", source: "Google", quote: "[Ask: real Google review about regulars and family, copied word for word]" },
  { author: "[First name, initial]", source: "Booksy", quote: "[Ask: real Booksy review about a specific barber, copied word for word]" },
];
