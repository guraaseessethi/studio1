import { GEO, GOOGLE_NAME } from "@/lib/defaults";
import { WEEKDAYS, type SiteSettings } from "@/lib/types";

const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/** HairSalon structured data (also a BarberShop) using the same facts Google shows. */
export function JsonLd({ settings: s, siteUrl }: { settings: SiteSettings; siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    additionalType: "https://schema.org/BarberShop",
    "@id": `${siteUrl}/#business`,
    name: GOOGLE_NAME,
    alternateName: s.businessName,
    url: siteUrl,
    telephone: `+1-${s.phoneHref.slice(2, 5)}-${s.phoneHref.slice(5, 8)}-${s.phoneHref.slice(8)}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      addressLocality: s.city,
      addressRegion: s.region,
      postalCode: s.postalCode,
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: GEO.latitude, longitude: GEO.longitude },
    openingHoursSpecification: WEEKDAYS.flatMap((d) => {
      const h = s.hours[d];
      return h
        ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${DAY_NAMES[d]}`, opens: h.open, closes: h.close }]
        : [];
    }),
    hasMap: s.google.url,
    sameAs: [s.google.url, s.booksy.url],
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: s.booksy.url, actionPlatform: "https://schema.org/DesktopWebPlatform" },
      result: { "@type": "Reservation", name: "Book an appointment" },
    },
    // Same numbers as the Google listing (edit them in Site settings when Google's change).
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: s.google.rating,
      reviewCount: s.google.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
