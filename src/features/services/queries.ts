import { ambilLayanan, ambilDetailLayanan } from "@/cms/konten";

/**
 * Mengambil ringkasan semua layanan dari Payload CMS.
 */
export async function ambilSemuaLayanan() {
  return ambilLayanan();
}

/**
 * Mengambil detail lengkap layanan beserta paket harga dan FAQ berdasarkan slug.
 */
export async function ambilDetailLayananDenganPaket(slug: string) {
  const [daftar, detail] = await Promise.all([
    ambilLayanan(),
    ambilDetailLayanan(slug),
  ]);

  const cleanSlug = slug.toLowerCase();
  const layanan = daftar.find((l) => l.slug.toLowerCase() === cleanSlug);

  return {
    layanan: layanan || null,
    detail: detail || null,
    paket: detail?.paket || [],
    faq: detail?.faq || [],
  };
}
