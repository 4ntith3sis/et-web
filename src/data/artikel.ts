/**
 * Artikel untuk section "Jelajahi Artikel dan Wawasan Kami" di beranda.
 * Diport dari easytax-demo (v1); entry "[DEV]" dibuang karena data contoh.
 */

export interface ArtikelBeranda {
  slug: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  /** Slug kategori dari CMS; data statis memakai nama huruf kecil. */
  kategoriSlug?: string;
  tanggal: string;
  waktuBaca: string;
  gambar: string;
}

export const artikelBeranda: ArtikelBeranda[] = [
  {
    slug: "rekonsiliasi-fiskal-positif-negatif",
    judul:
      "Perbedaan Rekonsiliasi Fiskal Positif & Negatif pada Laporan Keuangan",
    ringkasan:
      "Mengenal koreksi biaya yang tidak dapat dikurangkan dan penghasilan bukan objek pajak dalam e-SPT PPh Badan.",
    kategori: "Akuntansi",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1591696331111-ef9586a5b17a.webp",
  },
  {
    slug: "batas-omzet-umkm-pajak-final",
    judul:
      "Batas Omzet UMKM Bebas Pajak & Cara Hitung PPh Final 0,5% PP 55/2022",
    ringkasan:
      "Penjelasan insentif batasan omzet Rp 500 juta bebas pajak untuk UMKM Orang Pribadi dan tata cara perhitungan PPh final bulanan.",
    kategori: "Bisnis",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1521791136064-7986c2920216.webp",
  },
  {
    slug: "kredit-faktur-pajak-masukan",
    judul:
      "Cara Mengkreditkan Faktur Pajak Masukan Tanpa Risiko Kurang Bayar PPN",
    ringkasan:
      "Tips mengelola transaksi PPN 11%, memastikan keabsahan nomor seri faktur pajak, dan pengkreditan faktur dalam tenggat 3 bulan.",
    kategori: "Perpajakan",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1579532537598-459ecdaf39cc.webp",
  },
  {
    slug: "neraca-laba-rugi-spt-badan",
    judul:
      "Mengapa Neraca & Laba Rugi Wajib Dilampirkan pada e-Filing SPT Badan?",
    ringkasan:
      "Penjelasan hubungan erat pembukuan akuntansi komersial dan kewajiban e-Filing SPT PPh 1771 untuk menghindari koreksi fiskal KPP.",
    kategori: "Akuntansi",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1560472355-536de3962603.webp",
  },
  {
    slug: "penerapan-ter-pph-21",
    judul:
      "Penerapan Tarif Efektif Rata-Rata (TER) PPh 21: Cara Hitung Potong Gaji",
    ringkasan:
      "Panduan praktis menghitung potong PPh 21 bulanan karyawan kategori A, B, dan C sesuai Peraturan Pemerintah No. 58 Tahun 2023.",
    kategori: "Perpajakan",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1611974789855-9c2a0a7236a3.webp",
  },
  {
    slug: "syarat-pengukuhan-pkp-terbaru",
    judul:
      "Syarat Pengukuhan PKP Terbaru: Cara Lolos Survei KPP & Aktivasi e-Faktur",
    ringkasan:
      "Simak alur pengajuan PKP perusahaan, dokumen kelayakan lokasi kantor, dan tips mempersiapkan verifikasi lapangan oleh petugas pemeriksa KPP.",
    kategori: "Perpajakan",
    tanggal: "7 Okt 2026",
    waktuBaca: "3 Min Baca",
    gambar:
      "/images/external/photo-1504868584819-f8e8b4b6d7e3.webp",
  },
  {
    slug: "tata-cara-pembukuan-umkm",
    judul: "Tata Cara Pembukuan UMKM yang Benar dan Mudah",
    ringkasan:
      "Panduan menyusun pembukuan kas, piutang, dan utang secara rutin agar laporan keuangan UMKM tetap rapi dan siap diperiksa.",
    kategori: "Akuntansi",
    tanggal: "6 Okt 2026",
    waktuBaca: "4 Min Baca",
    gambar:
      "/images/external/photo-1554224154-26032ffc0d07.webp",
  },
  {
    slug: "pendapatan-tunjangan-pajak",
    judul: "Pendapatan Tunjangan dan THR: Bagian yang Tidak Dipotong Pajak",
    ringkasan:
      "Penjelasan komponen tunjangan, THR, dan hadiah yang tidak menjadi objek pajak bagi wajib pajak orang pribadi.",
    kategori: "Perpajakan",
    tanggal: "6 Okt 2026",
    waktuBaca: "4 Min Baca",
    gambar:
      "/images/external/photo-1521791136064-7986c2920216.webp",
  },
  {
    slug: "e-faktur-4-0",
    judul: "e-Faktur 4.0: Perubahan yang Perlu Disiapkan Perusahaan",
    ringkasan:
      "Ringkasan perubahan e-Faktur 4.0 beserta langkah persiapan sistem penagihan dan pelaporan faktur pajak badan usaha.",
    kategori: "Perpajakan",
    tanggal: "5 Okt 2026",
    waktuBaca: "5 Min Baca",
    gambar:
      "/images/external/photo-1460925895917-afdab827c52f.webp",
  },
  {
    slug: "struktur-modal-dan-beban",
    judul: "Struktur Modal dan Beban: Tips Efisiensi Pajak Perusahaan",
    ringkasan:
      "Cara memetakan sumber pendanaan dan pos beban agar biaya yang terjadi dapat dikurangkan secara sah.",
    kategori: "Bisnis",
    tanggal: "5 Okt 2026",
    waktuBaca: "4 Min Baca",
    gambar:
      "/images/external/photo-1554224155-8d04cb21cd6c.webp",
  },
  {
    slug: "transfer-pricing-dokumentasi",
    judul: "Transfer Pricing Documentation: Persiapan Dokumen",
    ringkasan:
      "Langkah menyusun master file, local file, dan study benchmarking agar transaksi dengan pihak afiliasi tetap sesuai prinsip arms length.",
    kategori: "Perpajakan",
    tanggal: "4 Okt 2026",
    waktuBaca: "5 Min Baca",
    gambar:
      "/images/external/photo-1450101499163-c8848c66ca85.webp",
  },
  {
    slug: "menjawab-sp2dk",
    judul: "Menjawab SP2DK: Dokumen dan Strategi yang Perlu Disiapkan",
    ringkasan:
      "Checklist data yang perlu disiapkan saat KPP mengirim Surat Pemanggilan dan permintaan klarifikasi atas wajib pajak.",
    kategori: "Perpajakan",
    tanggal: "4 Okt 2026",
    waktuBaca: "4 Min Baca",
    gambar:
      "/images/external/photo-1589829545856-d10d557cf95f.webp",
  },
];
