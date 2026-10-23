import { Centang, Pengguna } from "@/components/ikon";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { tautanKonsultasiWhatsApp } from "@/features/whatsapp/config";

/**
 * Hero halaman /tentang-kami — memakai panel hero yang sama dengan
 * /layanan supaya kedua halaman terasa satu keluarga.
 */
export function TentangHero() {
  return (
    <HeroPanel
      remah={[
        { label: "Beranda", href: "/" },
        { label: "Tentang Kami" },
      ]}
      judul={
        <>
          Partner pajak <span className="text-yellow-500">yang tinggal di sisi bisnis</span>
        </>
      }
      deskripsi="EasyTax adalah jasa konsultan pajak dan akuntansi yang membantu UMKM dan perusahaan menata kewajiban pajaknya tanpa harus memahami semua detailnya."
      tombolUtama={{
        label: "Konsultasi Gratis",
        href: tautanKonsultasiWhatsApp(undefined, "tentang-hero"),
        eksternal: true,
      }}
      tombolSekunder={{ label: "Lihat Tim", href: "#tim" }}
      bukti={[
        "Konsultan Bersertifikat BKP",
        "Pembukuan Sesuai Standar Akuntansi",
      ]}
      gambar={{
        src: "/images/external/photo-1521737604893-d14cc237f11d.webp",
        alt: "Tim konsultan pajak EasyTax bersama klien",
      }}
      kartu={[
        {
          nilai: "20+",
          label: "Konsultan BKP",
          ikon: <Pengguna className="h-5 w-5" />,
          posisi: "kiri-atas",
        },
        {
          nilai: "99,2%",
          label: "Tepat Waktu",
          ikon: <Centang className="h-5 w-5" />,
          posisi: "kanan-bawah",
        },
      ]}
    />
  );
}
