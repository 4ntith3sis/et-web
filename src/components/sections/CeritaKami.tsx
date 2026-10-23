import Image from "next/image";

import { Dokumen, Jam, Perisai, TrenNaik } from "@/components/ikon";

const FAKTA = [
  {
    nilai: "2019",
    label: "Berdiri dan melayani klien sejak",
    ikon: <Jam className="h-5 w-5" />,
  },
  {
    nilai: "20+",
    label: "Konsultan dengan sertifikasi BKP",
    ikon: <Perisai className="h-5 w-5" />,
  },
  {
    nilai: "300+",
    label: "Industri yang pernah kami wakili",
    ikon: <Dokumen className="h-5 w-5" />,
  },
  {
    nilai: "99,2%",
    label: "Dokumen klien dikirim tepat waktu",
    ikon: <TrenNaik className="h-5 w-5" />,
  },
];

const NILAI = [
  {
    judul: "Transparan sejak awal",
    isi: "Rincian lingkup pekerjaan dan biaya ditulis di proposal sebelum mulai. Tidak ada biaya tersembunyi yang muncul di tengah jalan.",
  },
  {
    judul: "Tenaga berlisensi",
    isi: "Setiap pekerjaan ditangani konsultan bersertifikat BKP dengan pengalaman di bidangnya, bukan sekadar berkas yang diunggah ke sistem.",
  },
  {
    judul: "Kerja sama jangka panjang",
    isi: "Kami tumbuh bersama klien: dari pembukuan harian, pelaporan tahunan, hingga pendampingan saat terdapat pemeriksaan.",
  },
];

/**
 * Section "Cerita Kami" untuk halaman /tentang-kami.
 *
 * Susunan editorial dua kolom: narasi + tiga nilai kerja di kiri, foto
 * dengan panel fakta 2x2 di kanan. Angka di sini sengaja berbeda dari
 * section lain supaya tidak ada pengulangan statistik.
 */
export function CeritaKami() {
  return (
    <section
      id="cerita"
      aria-labelledby="cerita-judul"
      className="bg-white py-[clamp(48px,6.4vw,72px)]"
    >
      <div className="mx-auto grid w-full max-w-maks grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 md:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            Tentang Kami
          </span>

          <h2
            id="cerita-judul"
            className="mt-6 max-w-[560px] font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.2] font-bold tracking-[-0.03em] text-navy-900 text-balance"
          >
            Bos lebih fokus pada bisnis, pajak kami yang urus
          </h2>

          <p className="mt-5 max-w-[540px] text-[1rem] leading-[1.75] text-teks-sekunder">
            EasyTax berangkat dari satu keluhan yang sering terdengar: laporan
            pajak dan pembukuan selalu ditunda karena tidak ada yang mengurusi.
            Waktu dan energi Anda habis untuk pekerjaan rutin yang seharusnya
            bisa ditangani orang lain yang fokus.
          </p>
        </div>

        <div className="relative">
          <div className="relative h-[380px] overflow-hidden rounded-[28px] bg-netral-lat shadow-lg">
            <Image
              src="/images/external/photo-1551836022-d5d88e9218df.webp"
              alt="Tim konsultan pajak EasyTax berdiskusi"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3">
            {FAKTA.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-xl border border-garis bg-white px-4 py-3.5 shadow-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-yellow-500">
                  {f.ikon}
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-[1.05rem] leading-none font-bold tracking-[-0.03em] text-navy-900">
                    {f.nilai}
                  </span>
                  <span className="mt-1 block text-[0.74rem] leading-[1.35] text-teks-redup">
                    {f.label}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Nilai kerja */}
      <div className="mx-auto mt-14 w-full max-w-maks px-6 md:px-8">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {NILAI.map((n, i) => (
            <li
              key={n.judul}
              className="group relative overflow-hidden rounded-2xl border border-garis bg-netral-lat p-7 transition-[var(--transition-base)] hover:-translate-y-1 hover:border-yellow-500/60 hover:bg-white hover:shadow-md"
            >
              <span className="absolute -top-2 right-4 font-heading text-[4rem] leading-none font-black text-navy-900/6 transition-[var(--transition-base)] group-hover:text-yellow-500/25">
                0{i + 1}
              </span>
              <h3 className="relative font-heading text-[1.1rem] font-bold tracking-[-0.02em] text-navy-900">
                {n.judul}
              </h3>
              <p className="relative mt-2.5 text-[0.92rem] leading-[1.65] text-teks-sekunder">
                {n.isi}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}