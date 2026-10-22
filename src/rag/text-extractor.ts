/**
 * Ekstraksi teks dari artikel Payload CMS.
 *
 * Mengubah structured blocks (paragraf, judul-bagian, daftar)
 * menjadi plain text yang siap untuk chunking dan embedding.
 */

type BlokArtikel =
  | { blockType: "paragraf"; teks: string }
  | { blockType: "judul-bagian"; teks: string; level: string }
  | { blockType: "daftar"; terurut?: boolean; item?: { teks: string }[] };

export interface ArtikelUntukEkstraksi {
  id: number;
  judul: string;
  slug: string;
  ringkasan?: string;
  blok?: BlokArtikel[];
}

export interface HasilEkstraksi {
  artikelId: number;
  slug: string;
  judul: string;
  teksLengkap: string;
  contentHash: string;
}

function ekstrakTeksDariBlok(blok: BlokArtikel[]): string {
  const bagian: string[] = [];

  for (const b of blok) {
    switch (b.blockType) {
      case "paragraf":
        if (b.teks?.trim()) bagian.push(b.teks.trim());
        break;
      case "judul-bagian":
        if (b.teks?.trim()) bagian.push(b.teks.trim());
        break;
      case "daftar":
        if (b.item?.length) {
          for (const item of b.item) {
            if (item.teks?.trim()) bagian.push(`• ${item.teks.trim()}`);
          }
        }
        break;
    }
  }

  return bagian.join("\n\n");
}

/**
 * Normalisasi teks: hapus whitespace berlebihan, trim.
 */
function normalisasiTeks(teks: string): string {
  return teks
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Buat hash sederhana dari konten untuk mendeteksi perubahan.
 * Menggunakan Web Crypto API yang tersedia di Node.js 20+.
 */
export async function buatContentHash(teks: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(teks, "utf8").digest("hex").slice(0, 16);
}

/**
 * Ekstrak teks lengkap dari artikel untuk indexing.
 */
export async function ekstrakTeksArtikel(
  artikel: ArtikelUntukEkstraksi,
): Promise<HasilEkstraksi | null> {
  const bagian: string[] = [];

  if (artikel.judul?.trim()) {
    bagian.push(artikel.judul.trim());
  }

  if (artikel.ringkasan?.trim()) {
    bagian.push(artikel.ringkasan.trim());
  }

  if (artikel.blok?.length) {
    const teksBlok = ekstrakTeksDariBlok(artikel.blok);
    if (teksBlok) bagian.push(teksBlok);
  }

  const teksLengkap = normalisasiTeks(bagian.join("\n\n"));

  if (!teksLengkap || teksLengkap.length < 20) {
    return null;
  }

  // Slug included so a rename of otherwise unchanged content triggers reindex.
  // Output is 16 hex chars, matching the varchar(16) content_hash column.
  const contentHash = await buatContentHash(`${teksLengkap}\0${artikel.slug}`);

  return {
    artikelId: artikel.id,
    slug: artikel.slug,
    judul: artikel.judul,
    teksLengkap,
    contentHash,
  };
}
