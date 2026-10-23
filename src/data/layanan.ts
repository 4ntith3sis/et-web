/**
 * Data layanan untuk section "Layanan Pajak & Keuangan" di beranda.
 * Diport dari easytax-demo (v1) — field `heroImage` dipertahankan supaya
 * kartu layanan bisa merender foto sampul seperti di desain asal.
 */

export interface LayananBeranda {
  slug: string;
  judul: string;
  subjudul: string;
  ringkasan: string;
  gambar: string;
}

export const layananBeranda: LayananBeranda[] = [
  {
    slug: "restitusi-pajak",
    judul: "Restitusi Pajak",
    subjudul: "Proses Cepat & Sesuai Ketentuan",
    ringkasan:
      "Pendampingan proses restitusi pajak untuk membantu menyiapkan dokumen, memeriksa kelengkapan data, dan mendampingi proses pengajuan pengembalian kelebihan pembayaran pajak sesuai kebutuhan Anda.",
    gambar:
      "/images/external/photo-1551836022-d5d88e9218df.webp",
  },
  {
    slug: "laporan-spt",
    judul: "Laporan SPT",
    subjudul: "Bebas Denda & Akurat",
    ringkasan:
      "EasyTax membantu perhitungan, penyusunan, dan e-Filing SPT Tahunan PPh Badan serta SPT Orang Pribadi dengan bukti lapor resmi DJP.",
    gambar:
      "/images/external/photo-1434626881859-194d67b2b86f.webp",
  },
  {
    slug: "pengurusan-pkp",
    judul: "Layanan Pengurusan PKP",
    subjudul: "Cepat & 100% Lolos Survei KPP",
    ringkasan:
      "Bantu proses pengukuhan PKP, aktivasi akun e-Faktur, sertifikat elektronik DJP, dan pembekalan teknis faktur pajak.",
    gambar:
      "/images/external/photo-1664575602554-2087b04935a5.webp",
  },
  {
    slug: "laporan-perpajakan-keuangan",
    judul: "Laporan Perpajakan & Keuangan",
    subjudul: "Lebih Rapi, Akurat & Aman",
    ringkasan:
      "EasyTax membantu memahami, mengelola, dan menyusun laporan keuangan serta pelaporan pajak secara tepat waktu.",
    gambar:
      "/images/external/photo-1454165804606-c3d57bc86b40.webp",
  },
];