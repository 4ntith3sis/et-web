import { ambilMitra } from "@/cms/konten";

import { MitraView } from "./MitraView";

/**
 * Section Mitra di beranda. Mengambil daftar logo dari CMS (fallback statis)
 * lalu menyerahkannya ke `MitraView` yang bebas dependensi server.
 */
export async function Mitra() {
  const daftar = await ambilMitra();
  return <MitraView items={daftar} />;
}
