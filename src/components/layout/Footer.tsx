import Link from "next/link";

import { Email, Instagram, Jam, Lokasi, TikTok, WhatsApp } from "@/components/ikon";
import { ambilJamOperasional, ambilNavigasi, ambilSitus } from "@/cms/konten";

/* Tahun ditulis statis: `new Date()` tidak stabil saat prerender. */
const TAHUN = 2026;

/**
 * Footer situs: identitas + deskripsi + sosmed, lalu kolom Perusahaan, Jam
 * Kantor (dari data kontak), dan Hubungi Kami, serta baris hak cipta.
 * Warna navy diseragamkan lewat globals.css.
 *
 * Sumber data: global `pengaturan-situs` (dengan fallback statis).
 */
export async function Footer() {
  const [situs, menuNavigasi, jamOperasional] = await Promise.all([
    ambilSitus(),
    ambilNavigasi(),
    ambilJamOperasional(),
  ]);

  const SOSMED = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/easytax.id/",
      Ikon: Instagram,
    },
    { label: "TikTok", href: "https://www.tiktok.com/@easytax.id", Ikon: TikTok },
    { label: "WhatsApp", href: "/api/konsultasi/whatsapp?sumber=footer-sosmed", Ikon: WhatsApp },
  ];

  return (
    <footer className="border-t border-white/8 bg-navy-900 text-teks-terang">
      <div className="mx-auto w-full max-w-maks px-6 pt-[clamp(44px,6vw,80px)] pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.95fr_1.1fr] lg:gap-12">
          {/* Identitas */}
          <div>
            {/* Brand — sama seperti v1, footer memakai wordmark teks saja
                (tanpa gambar logo) dengan judul putih. */}
            <Link
              href="/"
              aria-label={`${situs.nama} — beranda`}
              className="inline-flex flex-col justify-center no-underline"
            >
              <span className="font-heading text-[1.75rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-white">
                {situs.nama}
              </span>
              <span className="mt-0.5 text-[0.74rem] leading-[1.2] font-bold tracking-[0.02em] text-yellow-500">
                {situs.subjudul}
              </span>
            </Link>

            <p className="mt-5 text-[0.92rem] leading-[1.7]">
              Jasa konsultan pajak dan akuntansi perusahaan terpercaya di
              Indonesia. Membantu bisnis Anda tumbuh dengan kepatuhan pajak
              yang optimal.
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {SOSMED.map(({ label, href, Ikon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/6 text-teks-terang transition-[var(--transition-base)] hover:-translate-y-0.75 hover:bg-yellow-500 hover:text-navy-900"
                  >
                    <Ikon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <nav aria-labelledby="footer-perusahaan">
            <h4
              id="footer-perusahaan"
              className="relative pb-2.5 font-heading text-[1.15rem] font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-[30px] after:bg-yellow-500"
            >
              Perusahaan
            </h4>
            <ul className="mt-5 space-y-3">
              {menuNavigasi
                .filter((item) => item.href !== "/")
                .slice(0, 4)
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-block py-1 text-[0.92rem] text-teks-terang no-underline transition-[var(--transition-base)] hover:translate-x-1 hover:text-yellow-500"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Jam operasional */}
          <div>
            <h4 className="relative pb-2.5 font-heading text-[1.15rem] font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-[30px] after:bg-yellow-500">
              Jam Kantor
            </h4>
            <ul className="mt-5 space-y-3.5">
              {jamOperasional.map((item) => (
                <li key={item.hari} className="flex items-start gap-2.5 text-[0.92rem]">
                  <Jam className="mt-0.75 h-4 w-4 shrink-0 text-yellow-500" />
                  <span>
                    <span className="block font-bold text-white">{item.hari}</span>
                    <span className="text-teks-terang">{item.jam}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="relative pb-2.5 font-heading text-[1.15rem] font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-[30px] after:bg-yellow-500">
              Hubungi Kami
            </h4>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-[0.92rem]">
                <WhatsApp className="mt-0.75 h-4.5 w-4.5 shrink-0 text-yellow-500" />
                <a
                  href="/api/konsultasi/whatsapp?sumber=footer-kontak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-teks-terang no-underline transition-colors hover:text-yellow-500"
                >
                  {situs.kontak.telepon}
                </a>
              </li>
              <li className="flex items-start gap-3 text-[0.92rem]">
                <Email className="mt-0.75 h-4.5 w-4.5 shrink-0 text-yellow-500" />
                <a
                  href={`mailto:${situs.kontak.email}`}
                  className="inline-block py-1 text-teks-terang no-underline transition-colors hover:text-yellow-500"
                >
                  {situs.kontak.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-[0.92rem]">
                <Lokasi className="mt-0.75 h-4.5 w-4.5 shrink-0 text-yellow-500" />
                <span>{situs.kontak.alamat}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 text-[0.85rem]">
          <p className="text-white/55">
            &copy; {TAHUN} {situs.nama}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}