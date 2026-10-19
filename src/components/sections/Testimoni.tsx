import { ambilTestimoni } from "@/cms/konten";

import { TestimoniView } from "./TestimoniView";

/**
 * Section Testimoni di beranda. Data diambil dari CMS (dengan fallback
 * statis), lalu dirender oleh `TestimoniView` yang bebas dependensi server
 * agar bisa dipakai ulang oleh Page Builder.
 */
export async function Testimoni() {
  const testimoni = await ambilTestimoni();
  return <TestimoniView items={testimoni} />;
}
