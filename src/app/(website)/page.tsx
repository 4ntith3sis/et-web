import { Artikel } from "@/components/sections/Artikel";
import { CTA } from "@/components/sections/CTA";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { Hero } from "@/components/sections/Hero";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { Layanan } from "@/components/sections/Layanan";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Mitra } from "@/components/sections/Mitra";
import { Testimoni } from "@/components/sections/Testimoni";
import { PuckRender } from "@/components/puck/PuckRender";
import { ambilArtikel, ambilLayanan } from "@/cms/konten";
import { ambilLayoutTerbit } from "@/cms/layout";

/**
 * Landing page EasyTax.
 *
 * Bila layout Page Builder untuk beranda sudah diterbitkan dan valid, halaman
 * dirender dari layout tersebut. Jika belum ada (mis. CMS baru di-seed dan
 * belum dipublikasikan), halaman jatuh ke implementasi awal yang identik
 * sehingga URL publik tidak pernah kosong.
 */
export default async function HomePage() {
  const layout = await ambilLayoutTerbit("beranda");
  if (layout) {
    return <PuckRender layout={layout} />;
  }

  const [layanan, artikel] = await Promise.all([ambilLayanan(), ambilArtikel()]);

  return (
    <>
      <Hero />
      <Keunggulan />
      <Layanan layanan={layanan} />
      <CaraKerja />
      <Artikel artikel={artikel} />
      <Mitra />
      <MediaNasional />
      <Testimoni />
      <CTA />
    </>
  );
}
