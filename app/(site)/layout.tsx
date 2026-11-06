import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { getSiteSettings } from "@/lib/content";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Studio 1 Barbershop | Barber in Barrie on Yonge St",
  description:
    "Fades, cuts, beard work and hot towel shaves in Barrie. 4.9 on Google, open 7 days. Book online.",
};

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
