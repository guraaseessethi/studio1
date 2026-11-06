import { Barbers } from "@/components/Barbers";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Picker } from "@/components/Picker";
import { Reviews } from "@/components/Reviews";
import { ServiceBoard } from "@/components/ServiceBoard";
import { ShaveBand } from "@/components/ShaveBand";
import { Visit } from "@/components/Visit";
import { getHomeContent } from "@/lib/content";

export default async function Home() {
  const { settings, images, services, barbers, chips, gallery, reviews } = await getHomeContent();

  return (
    <>
      <Hero settings={settings} images={images} />
      <Picker chips={chips} services={services} />
      <ServiceBoard services={services} hstRate={settings.hstRate} />
      <Barbers barbers={barbers} />
      <ShaveBand services={services} image={images.band} />
      <Gallery items={gallery} />
      <Reviews reviews={reviews} settings={settings} />
      <section id="book" tabIndex={-1} style={{ minHeight: "40vh", background: "var(--black)" }} />
      <Visit settings={settings} />
    </>
  );
}
