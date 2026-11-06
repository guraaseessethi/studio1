import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { getSiteSettings } from "@/lib/content";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/defaults";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seoTitle || DEFAULT_TITLE;
  const description = s.seoDescription || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: s.businessName,
      locale: "en_CA",
      url: "/",
      title,
      description,
      ...(s.ogImageUrl ? { images: [{ url: s.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSiteSettings();
  return (
    <html lang="en" className={`${bebas.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div id="top" tabIndex={-1} />
        <TopBar
          hours={s.hours}
          phone={s.phone}
          phoneHref={s.phoneHref}
          address={`${s.street}, ${s.city}`}
        />
        <Header phoneHref={s.phoneHref} />
        <Ticker items={s.ticker} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer phone={s.phone} phoneHref={s.phoneHref} booksyUrl={s.booksy.url} />
        <MobileBar phone={s.phone} phoneHref={s.phoneHref} street={s.street} />
        <SmoothScroll />
      </body>
    </html>
  );
}
