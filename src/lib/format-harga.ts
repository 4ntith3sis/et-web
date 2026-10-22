/**
 * Utilitas pemformatan harga dan satuan paket layanan.
 */

/**
 * Format string atau number harga menjadi format Rupiah otomatis.
 * Contoh:
 *  - 750000 -> "Rp 750.000"
 *  - "750000" -> "Rp 750.000"
 *  - "Rp 750.000" -> "Rp 750.000"
 *  - "Rp750.000" -> "Rp 750.000"
 *  - "Rp. 750.000" -> "Rp 750.000"
 *  - "750.000" -> "Rp 750.000"
 *  - "Gratis" -> "Gratis"
 */
export function formatHargaRupiah(harga: string | number | undefined | null): string {
  if (harga === undefined || harga === null) return "";
  const str = String(harga).trim();
  if (!str) return "";

  // Ekstrak digit angka
  const digits = str.replace(/[^0-9]/g, "");
  if (!digits) {
    return str;
  }

  const num = Number(digits);
  if (!Number.isFinite(num)) {
    return str;
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(num);

  return `Rp ${formatted}`;
}

/**
 * Normalisasi unit/satuan: menghapus tanda garis miring (/) di awal.
 * Contoh:
 *  - "paket" -> "paket"
 *  - "/paket" -> "paket"
 *  - "/ paket" -> "paket"
 *  - "/bulan" -> "bulan"
 */
export function formatSatuan(satuan: string | undefined | null): string {
  if (!satuan) return "";
  return satuan.replace(/^[\s/]+/, "").trim();
}
