import { Barbers } from "@/components/Barbers";
import { BookingConsole } from "@/components/booking/Console";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Picker } from "@/components/Picker";
import { Reviews } from "@/components/Reviews";
import { ServiceBoard } from "@/components/ServiceBoard";
import { ShaveBand } from "@/components/ShaveBand";
import { Visit } from "@/components/Visit";
import { getHomeContent } from "@/lib/content";
import { getPaymentOptions } from "@/lib/payments/options";

export default async function Home() {
  const { settings, images, services, barbers, chips, gallery, reviews } = await getHomeContent();
  const paymentOptions = await getPaymentOptions();

  return (
    <>
      <Hero settings={settings} images={images} />
      <Picker chips={chips} services={services} />
      <ServiceBoard services={services} hstRate={settings.hstRate} />
      <Barbers barbers={barbers} />
      <ShaveBand services={services} image={images.band} />
      <Gallery items={gallery} />
      <Reviews reviews={reviews} settings={settings} />
      <BookingConsole
        services={services}
        barbers={barbers}
        paymentOptions={paymentOptions}
        settings={{
          hstRate: settings.hstRate,
          slotIntervalMinutes: settings.slotIntervalMinutes,
          leadTimeMinutes: settings.leadTimeMinutes,
          hours: settings.hours,
          showBooksyLink: settings.showBooksyLink,
          booksyUrl: settings.booksy.url,
          phone: settings.phone,
        }}
      />
      <Visit settings={settings} />
    </>
  );
}
