import type { MetadataRoute } from "next";

import type { ArtikelBeranda } from "@/data/artikel";
import type { LayananBeranda } from "@/data/layanan";

type SumberSitemap = {
  ambilArtikel: () => Promise<ArtikelBeranda[]>;
  ambilLayanan: () => Promise<LayananBeranda[]>;
};

const STATIS = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/layanan", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tulisan-pajak", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/tentang-kami", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/tim", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/kontak", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/kalkulator-pajak", priority: 0.7, changeFrequency: "monthly" as const },
];

/** Build canonical URLs from current published CMS entries plus fixed public pages. */
export async function buatSitemap(
  sumber: SumberSitemap,
  siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://easytax.id").replace(/\/+$/, ""),
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl.replace(/\/+$/, "");
  const [layanan, artikel] = await Promise.all([
    sumber.ambilLayanan(),
    sumber.ambilArtikel(),
  ]);

  return [
    ...STATIS.map((item) => ({
      url: item.path === "/" ? `${baseUrl}/` : `${baseUrl}${item.path}`,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...layanan.map((item) => ({
      url: `${baseUrl}/layanan/${encodeURIComponent(item.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...artikel.map((item) => ({
      url: `${baseUrl}/tulisan-pajak/${encodeURIComponent(item.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
