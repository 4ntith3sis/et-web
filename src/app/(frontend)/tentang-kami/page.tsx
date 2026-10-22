import { CTA } from "@/components/sections/CTA";
import { CeritaKami } from "@/components/sections/CeritaKami";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Testimoni } from "@/components/sections/Testimoni";
import { TentangHero } from "@/components/sections/TentangHero";
import { TimKonsultan } from "@/components/sections/TimKonsultan";

/**
 * Halaman /tentang-kami.
 * Dirender langsung menggunakan komponen native dan data CMS.
 */
export default function TentangKamiPage() {
  return (
    <>
      <TentangHero />
      <CeritaKami />
      <TimKonsultan />
      <MediaNasional />
      <Testimoni />
      <CTA />
    </>
  );
}
