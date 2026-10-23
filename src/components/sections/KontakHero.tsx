import Link from "next/link";

import {
  Email,
  PanahKanan,
  Rumah,
  Telepon,
  WhatsApp,
} from "@/components/ikon";
import { situs } from "@/data/situs";
import { buatTautanWA, normalisasiNomorWA, validasiNomorWA } from "@/features/whatsapp/utils";

/* Teks kartu diambil dari easytax-demo (v1); desain kartu berbeda:
   tampil di atas latar navy, kartu WhatsApp ditonjolkan warna kuning brand. */
const kartuKontak = [
  {
    ikon: WhatsApp,
    eyebrow: "WhatsApp · Tercepat",
    nilai: "WhatsApp utama",
    teks: "Respons rata-rata kurang dari 5 menit. Tersedia Senin–Jumat, 09:00–17:00 WIB.",
    aksi: "Mulai chat WhatsApp",
    href: "",
    eksternal: true,
    sorot: true,
  },
  {
    ikon: Email,
    eyebrow: "Email · Formal",
    nilai: "info@easytax.id",
    teks: "Untuk pertanyaan detail, berkas pembukuan, atau dokumen legal. Pesan ditindaklanjuti tim ahli.",
    aksi: "Kirim email",
    href: `mailto:${situs.kontak.email}`,
    eksternal: false,
    sorot: false,
  },
  {
    ikon: Telepon,
    eyebrow: "Telepon · Kantor",
    nilai: "",
    teks: "Hubungi kantor pusat kami. Tim operasional konsultan siap melayani pada jam kerja operasional.",
    aksi: "Telepon kami",
    href: "",
    eksternal: false,
    sorot: false,
  },
];

export function KontakHero({ nomorWhatsAppUtama, teleponKantor }: { nomorWhatsAppUtama?: string | null; teleponKantor?: string | null }) {
  const nomorBersih = normalisasiNomorWA(nomorWhatsAppUtama);
  const nomorValid = validasiNomorWA(nomorBersih);
  const nomorTampilan = nomorWhatsAppUtama?.trim() || "";
  const telepon = teleponKantor?.trim() || "";
  const teleponHref = telepon.replace(/[^0-9+]/g, "");
  const kartu = kartuKontak.map((item, index) => {
    if (index === 0) return { ...item, nilai: nomorValid ? nomorTampilan : "Belum tersedia", href: nomorValid ? buatTautanWA(nomorBersih) : "" };
    if (index === 2) return { ...item, nilai: telepon || "Belum tersedia", href: teleponHref ? `tel:${teleponHref}` : "" };
    return item;
  });
  return (
    <section className="bg-navy-900 px-6 pt-[clamp(48px,6vw,60px)] pb-[clamp(48px,6.4vw,72px)] text-white md:px-8">
      <div className="mx-auto w-full max-w-maks">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-[0.9rem] text-teks-terang"
        >
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Rumah className="h-3.5 w-3.5" />
            Beranda
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-bold text-yellow-500">Kontak</span>
        </nav>

        <div className="max-w-[760px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-yellow-500 uppercase">
            Hubungi Tim EasyTax
          </span>

          <h1 className="my-[18px] font-heading text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.15] font-black tracking-[-0.03em] text-white text-balance 2xl:text-[3.1rem]">
            Mari Bicarakan Kebutuhan{" "}
            <span className="text-yellow-500">
              Perpajakan &amp; Keuangan
            </span>{" "}
            Bisnis Anda.
          </h1>

          <p className="max-w-[620px] text-[1.05rem] leading-[1.7] text-teks-terang">
            Tim kami akan menjelaskan semua yang Anda butuhkan. Pilih cara
            komunikasi yang paling nyaman untuk Anda.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {kartu.map((k) => (
            <article
              key={k.eyebrow}
              className={
                k.sorot
                  ? "flex flex-col rounded-2xl bg-yellow-500 p-6 text-navy-900 shadow-kuning"
                  : "flex flex-col rounded-2xl bg-white p-6 text-navy-900 shadow-lg"
              }
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-yellow-500">
                  <k.ikon className="h-5.5 w-5.5" />
                </span>
                <span className="text-[0.7rem] font-extrabold tracking-[0.08em] text-navy-900/70 uppercase">
                  {k.eyebrow}
                </span>
              </div>

              <h2 className="mt-4 font-heading text-[1.35rem] leading-none font-black tracking-[-0.02em] text-navy-900">
                {k.nilai}
              </h2>

              <p className="mt-3 text-[0.9rem] leading-[1.65] text-navy-900/75">
                {k.teks}
              </p>

              {k.href ? (
                <a href={k.href} {...(k.eksternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group/action mt-auto flex items-center justify-between gap-3 border-t border-navy-900/15 pt-4 font-bold text-navy-900 no-underline">
                  <span className="text-[0.92rem]">{k.aksi}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-yellow-500 transition-[var(--transition-base)] group-hover/action:translate-x-1"><PanahKanan className="h-4 w-4" /></span>
                </a>
              ) : (
                <span aria-disabled="true" className="mt-auto flex items-center gap-3 border-t border-navy-900/15 pt-4 font-semibold text-navy-900/60">WhatsApp belum dikonfigurasi</span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
