/**
 * Testimoni klien untuk carousel di beranda.
 * Diport dari easytax-demo (v1); entry "[DEV] Klien Contoh" dibuang karena
 * hanya data contoh.
 */

export interface Testimoni {
  nama: string;
  peran: string;
  kutipan: string;
  inisial: string;
  rating: number;
  fotoProfil?: string;
  deskripsi?: string;
}

export const testimoni: Testimoni[] = [
  {
    nama: "Eka Susanti",
    peran: "Owner Restoran",
    inisial: "ES",
    rating: 5,
    kutipan:
      "Restitusi PPN perusahaan kami sukses dicairkan tanpa kendala berarti. Konsultasi perpajakan yang sangat solutif dan dapat diandalkan.",
  },
  {
    nama: "Rian Saputra",
    peran: "Founder Startup",
    inisial: "RS",
    rating: 5,
    kutipan:
      "Respon super cepat via WhatsApp dan konsultannya paham betul regulasi perpajakan startup dan industri kreatif. Rekomendasi banget!",
  },
  {
    nama: "Maya Indah",
    peran: "Pemilik UMKM",
    inisial: "MI",
    rating: 5,
    kutipan:
      "Sebagai UMKM yang baru berkembang, EasyTax membimbing kami dari nol memahami kewajiban PPh Final 0,5% sampai pembukuan rapi tiap bulan.",
  },
  {
    nama: "Hendra Pratama",
    peran: "Finance Manager",
    inisial: "HP",
    rating: 5,
    kutipan:
      "Audit pajak internal dan penyusunan Transfer Pricing Documentation diselesaikan dengan ketelitian sangat tinggi oleh tim konsultan senior.",
  },
  {
    nama: "Dian Nugroho",
    peran: "Pelaku UMKM",
    inisial: "DN",
    rating: 5,
    kutipan:
      "Pendampingan tanggapan SP2DK dari EasyTax sangat taktis. Kertas kerja lengkap dan argumen fiskal sangat kredibel sehingga urusan tuntas cepat.",
  },
  {
    nama: "Budi Hartono",
    peran: "Pengusaha Retail",
    inisial: "BH",
    rating: 5,
    kutipan:
      "Laporan pembukuan bulanan dan rekonsiliasi PPh 21/23 selalu beres tanpa pusing. Biayanya transparan dan pembayarannya aman.",
  },
  {
    nama: "Siti Rahma",
    peran: "Admin Gudang",
    inisial: "SR",
    rating: 5,
    kutipan:
      "Sangat terbantu dengan layanan pengurusan PKP dan e-Faktur EasyTax. Timnya responsif dan mengarahkan dari awal hingga sertifikat digital aktif.",
  },
  {
    nama: "Ahmad Wijaya",
    peran: "Controller",
    inisial: "AW",
    rating: 5,
    kutipan:
      "Proses pelaporan SPT Tahunan 1771 perusahaan kami selesai tepat waktu, rapi, dan tim konsultan sangat teliti mengaudit bukti potong.",
  },
];
