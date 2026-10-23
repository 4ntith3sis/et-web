import { getClient } from "@/lib/payload";

export type JenisKontenPublik = "artikel" | "layanan";

/**
 * Cek keberadaan slug yang benar-benar terbit.
 *
 * Mengembalikan `null` saat CMS tidak dapat dibaca supaya proxy tidak
 * menghasilkan 404 palsu ketika database sedang bermasalah. Halaman sendiri
 * tetap punya fallback statis untuk kondisi tersebut.
 */
export async function slugPublikAda(
  jenis: JenisKontenPublik,
  slug: string,
): Promise<boolean | null> {
  const cleanSlug = slug.toLowerCase();

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: jenis,
      where: { slug: { equals: cleanSlug } },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: false,
      select: { slug: true },
    });
    if (res.docs.length > 0) return true;

    // Samakan perilaku dengan halaman detail yang mencocokkan slug tanpa
    // membedakan huruf besar/kecil jika slug di CMS tidak seluruhnya lowercase.
    const semua = await payload.find({
      collection: jenis,
      limit: 500,
      depth: 0,
      draft: false,
      overrideAccess: false,
      select: { slug: true },
    });
    return semua.docs.some(
      (doc) => doc.slug.toLowerCase() === cleanSlug,
    );
  } catch (error) {
    console.error("[proxy] gagal memeriksa slug", {
      jenis,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return null;
  }
}
