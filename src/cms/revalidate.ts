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
      /* Profil `{ expire: 0 }` = konten basi tidak pernah disajikan; permintaan
         berikutnya menunggu data baru. Ini yang dikehendaki untuk CMS: begitu
         editor menyimpan atau menerbitkan, halaman publik langsung memakai
         data terbaru (bukan versi lama yang masih di-cache). */
      revalidateTag(t, { expire: 0 });
    }
  } catch {
    // Di luar runtime Next.js (CLI/migrasi) — tidak ada cache untuk dihapus.
  }
}

/**
 * Invalidasi cache **langsung** (read-your-own-writes).
 *
 * `revalidateTag` memakai semantik stale-while-revalidate: permintaan
 * sesaat setelah Publish masih bisa menyajikan versi lama. Untuk aksi yang
 * dipicu pengguna (server action), `updateTag` membuat cache kedaluwarsa
 * seketika sehingga permintaan berikutnya menunggu data baru.
 *
 * `updateTag` hanya boleh dipanggil dari Server Function; pemanggilannya
 * dibungkus try/catch karena jalur yang sama bisa dieksekusi dari hook
 * Payload (route handler) yang tidak memenuhi syarat tersebut.
 */
export async function perbaruiKonten(tag: string | string[]): Promise<void> {
  try {
    const { updateTag } = await import("next/cache");
    for (const t of Array.isArray(tag) ? tag : [tag]) {
      updateTag(t);
    }
  } catch {
    // Di luar Server Function (mis. hook Payload) — andalkan revalidateTag.
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
