import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { ambilArtikel, ambilLayanan } from "@/cms/konten";
import { buatSitemap } from "@/lib/sitemap";

/** Hanya URL kanonis publik; /artikel dialihkan permanen ke /tulisan-pajak. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemap is a special Route Handler and is prerendered by default. Wait for
  // an HTTP request before touching CMS so database reads never happen at build.
  await connection();
  return buatSitemap({ ambilArtikel, ambilLayanan });
}
