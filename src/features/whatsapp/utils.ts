/**
 * Normalisasi nomor WhatsApp:
 * Menghilangkan tanda '+', spasi, tanda kurung, dan tanda hubung.
 * Tidak mengubah digit kode negara secara sembarang.
 */
export function normalisasiNomorWA(nomor?: string | null): string {
  if (!nomor) return "";
  return nomor.replace(/[\s+().-]/g, "").trim();
}

/**
 * Validasi nomor WhatsApp internasional:
 * Harus terdiri dari 8 hingga 16 digit numerik internasional murni.
 */
export function validasiNomorWA(nomor?: string | null): boolean {
  if (!nomor) return false;
  const bersih = normalisasiNomorWA(nomor);
  return /^[0-9]{8,16}$/.test(bersih);
}

/**
 * Sanitasi pesan konsultasi:
 * Menghilangkan tag HTML, membatasi panjang teks (maksimal 500 karakter),
 * dan mencegah karakter kontrol yang tidak aman.
 */
export function sanitasiPesanWA(pesan?: string | null, maksKarakter = 500): string {
  if (!pesan) return "";
  const tanpaTag = pesan.replace(/<[^>]*>/g, "").trim();
  if (tanpaTag.length > maksKarakter) {
    return tanpaTag.slice(0, maksKarakter);
  }
  return tanpaTag;
}

/**
 * Membentuk tautan resmi WhatsApp (https://wa.me/<nomor>?text=<encoded_text>).
 * Memastikan URL yang dihasilkan selalu valid dan mengarah ke domain resmi wa.me.
 */
export function buatTautanWA(nomor: string, pesan?: string | null): string {
  const nomorBersih = normalisasiNomorWA(nomor);
  if (!validasiNomorWA(nomorBersih)) {
    throw new Error(`Nomor WhatsApp tidak valid: ${nomor}`);
  }

  const pesanBersih = sanitasiPesanWA(pesan);
  if (pesanBersih) {
    const encoded = encodeURIComponent(pesanBersih);
    return `https://wa.me/${nomorBersih}?text=${encoded}`;
  }

  return `https://wa.me/${nomorBersih}`;
}
