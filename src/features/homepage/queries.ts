import { ambilLayoutTerbit, ambilMetadataPuck } from "@/cms/layout";
import { ambilArtikel, ambilLayanan } from "@/cms/konten";
import type { LayoutPuck, MetadataPuck } from "./puck/types";

/**
 * Mengambil layout beranda yang sudah terbit dari Payload.
 */
export async function ambilHomepageLayout(): Promise<{
  layout: LayoutPuck | null;
  source: "published" | "fallback";
  revision?: number;
}> {
  return ambilLayoutTerbit("beranda");
}

/**
 * Mengambil metadata yang disuplai ke komponen Puck pada Beranda.
 */
export async function ambilHomepageMetadata(): Promise<MetadataPuck> {
  return ambilMetadataPuck();
}

/**
 * Mengambil data fallback beranda (layanan dan artikel) bila layout Puck belum diterbitkan.
 */
export async function ambilHomepageFallbackData() {
  const [layanan, artikel] = await Promise.all([ambilLayanan(), ambilArtikel()]);
  return { layanan, artikel };
}
