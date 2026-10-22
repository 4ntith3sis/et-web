import { Pengguna } from "@/components/ikon";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { situs } from "@/data/situs";

/** Hero halaman /layanan — memakai panel hero bersama. */
export function LayananHero() {
  return (
    <HeroPanel
      remah={[
        { label: "Beranda", href: "/" },
        { label: "Layanan" },
      ]}
      judul={
        <>
          Solusi Lengkap Perpajakan &amp;{" "}
          <span className="text-yellow-500">Finansial untuk Bisnis Anda</span>
        </>
      }
      deskripsi="Mulai dari pelaporan SPT tahunan, pembukuan bulanan, hingga pendampingan audit dan pengurusan PKP. Dikelola langsung oleh konsultan pajak berizin resmi (BKP) dan berpengalaman menangani berbagai industri di Indonesia."
      tombolUtama={{
        label: "Konsultasi Gratis",
        href: "/api/konsultasi/whatsapp?sumber=layanan-hero",
        eksternal: true,
      }}
      tombolSekunder={{ label: "Eksplorasi Layanan", href: "#katalog-layanan" }}
      bukti={["Pembukuan Sesuai SAK", "Konsultan Berizin Resmi"]}
      gambar={{
        src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80",
        alt: "Layanan Konsultan Pajak EasyTax",
      }}
      kartu={[
        {
          nilai: "+22%",
          label: "Efisiensi Pajak Meningkat",
          ikon: <Pengguna className="h-5 w-5" />,
          posisi: "kiri-atas",
        },
        {
          nilai: "300+ Industri",
          label: "yang Dilayani",
          ikon: <Pengguna className="h-5 w-5" />,
          posisi: "kanan-bawah",
        },
      ]}
    />
  );
}