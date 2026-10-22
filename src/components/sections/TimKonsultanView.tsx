import Image from "next/image";

import { Perisai } from "@/components/ikon";
import type { AnggotaTim } from "@/data/tim";

/**
 * Bagian presentasional section "Tim Konsultan".
 *
 * Dipisah dari `TimKonsultan` (yang mengambil data dari CMS) supaya bisa
 * dipakai Page Builder di runtime klien tanpa ikut menarik kode server
 * (`@/cms/konten`). Props murni: daftar anggota tim.
 */
export function TimKonsultanView({ tim }: { tim: AnggotaTim[] }) {
  return (
    <section
      id="tim"
      aria-labelledby="tim-judul"
      className="relative overflow-hidden bg-navy-900 py-[clamp(48px,6.5vw,80px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[180px] -left-[120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-yellow)_12%,transparent)_0%,transparent_68%)]"
      />

      <div className="relative mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/45 bg-yellow-500/15 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-yellow-500 uppercase">
            Tim Konsultan
          </span>

          <h2
            id="tim-judul"
            className="mt-6 max-w-[720px] font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-white text-balance"
          >
            Tim konsultan berlisensi yang mendampingi Anda
          </h2>

          <p className="mt-4 max-w-[620px] text-[1rem] leading-[1.7] text-white/70">
            Tim kami mendampingi setiap klien dengan solusi yang disesuaikan
            dengan kebutuhan dan bidang usahanya, bukan sekadar mengelola berkas
            yang diunggah ke sistem.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tim.map((orang) => (
            <li
              key={orang.nama}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-[var(--transition-base)] hover:-translate-y-1.5 hover:border-yellow-500/40 hover:bg-white/10"
            >
              <div className="relative mx-auto w-fit">
                <span className="block h-28 w-28 overflow-hidden rounded-full border-2 border-white/20">
                  <Image
                    src={orang.foto || "/images/placeholder-avatar.svg"}
                    alt={orang.nama}
                    width={224}
                    height={224}
                    sizes="112px"
                    className="h-full w-full object-cover grayscale transition-[var(--transition-base)] hover:grayscale-0"
                  />
                </span>

                <span className="absolute -right-1 -bottom-1 grid h-9 w-9 place-items-center rounded-full border-2 border-navy-900 bg-yellow-500 text-navy-900">
                  <Perisai className="h-4 w-4" />
                  <span className="sr-only">Konsultan {orang.lisensi}</span>
                </span>
              </div>

              <div className="mt-5 text-center">
                <h3 className="font-heading text-[1.1rem] leading-tight font-bold tracking-[-0.02em] text-white">
                  {orang.nama}
                </h3>
                <p className="mt-1 text-[0.82rem] font-semibold text-yellow-500">
                  {orang.jabatan}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.04em] text-white/85 uppercase">
                  <Perisai className="h-3 w-3 text-yellow-500" />
                  Konsultan {orang.lisensi} Level {orang.level}
                </p>
              </div>

              <p className="mt-4 text-[0.88rem] leading-[1.65] text-white/70">
                {orang.bio}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
