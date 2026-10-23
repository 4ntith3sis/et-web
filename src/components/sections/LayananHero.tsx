import { Pengguna } from "@/components/ikon";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { tautanKonsultasiWhatsApp } from "@/features/whatsapp/config";

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
        href: tautanKonsultasiWhatsApp(undefined, "layanan-hero"),
        eksternal: true,
      }}
      tombolSekunder={{ label: "Eksplorasi Layanan", href: "#katalog-layanan" }}
      bukti={["Pembukuan Sesuai SAK", "Konsultan Berizin Resmi"]}
      gambar={{
        src: "/images/external/photo-1553877522-43269d4ea984.webp",
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
