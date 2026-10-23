/* Data kontak untuk halaman /kontak. Kantor pusat diambil dari
   easytax-demo (v1); branch office Surabaya dan Bandung sengaja tidak
   dipakai karena belum ada kantor fisik di lokasi tersebut. */

export interface Kantor {
  nama: string;
  label: string;
  alamat: string;
  telepon: string;
  whatsapp: string;
  email: string;
  gambar: string;
  peta: string;
}

export const kantor: Kantor[] = [
  {
    nama: "Kantor Pusat Jakarta",
    label: "Kantor Pusat",
    alamat: "Jl. TB Simatupang No. 36, Cilandak, Jakarta Selatan 12430",
    telepon: "021-2940-0153",
    whatsapp: "+62 811-1920-0080",
    email: "info@easytax.id",
    gambar:
      "/images/external/photo-1486406146926-c627a92ad1ab.webp",
    peta: "https://maps.google.com/?q=Jl.+TB+Simatupang+No.36+Cilandak+Jakarta+Selatan",
  },
];

export const jamOperasional = [
  { hari: "Senin – Jumat", jam: "09:00 – 17:00" },
  { hari: "Sabtu", jam: "09:00 – 13:00" },
  { hari: "Minggu & Libur", jam: "Tutup" },
];

/** Opsi dropdown "Topik Konsultasi" pada form /kontak — dari easytax-demo. */
export const topikKonsultasi = [
  "Laporan Perpajakan & Keuangan Bulanan",
  "Laporan SPT Tahunan Badan (1771) / Orang Pribadi",
  "Pengurusan PKP & e-Faktur DJP",
  "Pengurusan EFIN & NPWP Badan",
  "KAP Audit & Tax Opinion",
  "Pendampingan Audit, Keberatan & Banding Pajak",
  "Lainnya",
];

export interface FaqKontak {
  pertanyaan: string;
  jawaban: string;
}

export const faqKontak: FaqKontak[] = [
  {
    pertanyaan: "Apakah konsultasi awal di EasyTax benar-benar gratis?",
    jawaban:
      "Ya. Konsultasi awal lewat WhatsApp atau telepon tidak dipungut biaya. Kami mendengarkan kebutuhan Anda, memberi estimasi biaya, lalu merumuskan langkah penanganan.",
  },
  {
    pertanyaan: "Apakah melayani klien di luar Jakarta?",
    jawaban:
      "Seluruh proses pembukuan, e-Filing SPT, dan pengukuhan PKP dikerjakan jarak jauh, sehingga klien di seluruh Indonesia—from Sabang sampai Merauke—dapat kami layani.",
  },
  {
    pertanyaan: "Bagaimana kerahasiaan data perusahaan dijaga?",
    jawaban:
      "Kami menjaga kerahasiaan dokumen keuangan dan perpajakan lewat Non-Disclosure Agreement serta penyimpanan berkas terenkripsi yang hanya diakses tim berwenang.",
  },
  {
    pertanyaan: "Berapa lama pengerjaan laporan SPT atau PKP?",
    jawaban:
      "e-Filing SPT Tahunan dan Masa umumnya 1–3 hari kerja setelah dokumen lengkap. Pengukuhan PKP membutuhkan 3–7 hari kerja sesuai ketentuan KPP setempat.",
  },
  {
    pertanyaan: "Apakah biayanya transparan?",
    jawaban:
      "Semua penawaran bersifat all-in dan tertulis di proposal sejak awal. Tidak ada biaya tambahan yang belum diinformasikan.",
  },
];