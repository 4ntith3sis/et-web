/**
 * Invalidasi cache konten saat data CMS berubah.
 *
 * `next/cache` diimpor secara dinamis supaya file ini tetap bisa dimuat di
 * luar runtime Next.js (mis. saat Payload CLI/migrasi menjalankan
 * `payload.config.ts` yang mengimpor koleksi-koleksi ini).
 */
export async function revalidateKonten(tag: string | string[]): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");
    for (const t of Array.isArray(tag) ? tag : [tag]) {
      revalidateTag(t, "max");
    }
  } catch {
    // Di luar runtime Next.js (CLI/migrasi) — tidak ada cache untuk dihapus.
  }
}

/** Hook `afterChange`/`afterDelete` Payload untuk satu/lebih tag cache. */
export function hookRevalidate(
  tags: string | string[],
): (args: { doc?: unknown }) => Promise<void> {
  return async () => {
    await revalidateKonten(tags);
  };
}
