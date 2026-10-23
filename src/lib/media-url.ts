/**
 * Normalisasi URL media Payload agar tidak terikat pada host/port saat build.
 *
 * Payload menyusun `media.url` dari `serverURL` (misalnya
 * `http://localhost:3004/api/media/file/foo.jpg`). URL absolut seperti itu
 * membuat produksi di port/domain lain meminta gambar ke server development.
 *
 * Untuk media yang memang disajikan oleh aplikasi ini, path relatif selalu
 * benar karena browser memakai origin halaman saat ini. URL eksternal
 * (misalnya Unsplash) dibiarkan apa adanya.
 */
export function mediaUrlRelatif(
  url: string | null | undefined,
): string | undefined {
  const nilai = url?.trim();
  if (!nilai) return undefined;

  try {
    const parsed = new URL(nilai, "http://media.invalid");
    if (parsed.pathname.startsWith("/api/media/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Bukan URL yang bisa diurai; teruskan nilai aslinya.
  }

  return nilai;
}
