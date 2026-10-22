import Image from "next/image";
import Link from "next/link";

import { Jam, PanahKanan } from "@/components/ikon";
import type { ArtikelBeranda } from "@/data/artikel";

/**
 * Section "Artikel Pajak Terkait" di kaki halaman detail.
 * Judul & deskripsi diadaptasi dari easytax-demo (v1), gaya heading +
 * kartu mengikuti design system v2 (badge terpusat, kartu listing).
 */
export function ArtikelTerkait({ artikel }: { artikel: ArtikelBeranda[] }) {
  if (artikel.length === 0) return null;

  return (
    <section
      aria-labelledby="artikel-terkait-judul"
      className="bg-netral-lat py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            Rekomendasi Bacaan
          </span>

          <h2
            id="artikel-terkait-judul"
            className="font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.25] font-bold text-navy-900"
          >
            Artikel Pajak Terkait
          </h2>

          <p className="mx-auto mt-3 max-w-[560px] text-[0.95rem] leading-[1.7] text-teks-sekunder">
            Pelajari topik perpajakan dan akuntansi lainnya yang relevan
            dengan kebutuhan bisnis Anda.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artikel.map((a) => (
            <li key={a.slug}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-garis bg-white shadow-sm transition-[var(--transition-base)] hover:-translate-y-2 hover:shadow-xl">
                <div className="relative h-[150px] shrink-0 overflow-hidden bg-navy-900">
                  <Image
                    src={a.gambar || "/images/placeholder-artikel.svg"}
                    alt={a.judul}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 z-2 rounded-full bg-yellow-500 px-3 py-1 text-[0.75rem] font-bold tracking-[0.03em] text-navy-900 uppercase shadow-sm">
                    {a.kategori}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-[18px]">
                  <div className="mb-2 flex items-center gap-4 text-[0.82rem] text-teks-redup">
                    <span>{a.tanggal}</span>
                    <span className="flex items-center gap-1.5">
                      <Jam className="h-3.5 w-3.5" />
                      {a.waktuBaca}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 font-heading text-[1.22rem] leading-[1.4] font-bold text-navy-900">
                    <Link
                      href={`/tulisan-pajak/${a.slug}`}
                      className="no-underline transition-colors hover:underline"
                    >
                      {a.judul}
                    </Link>
                  </h3>

                  <p className="mb-4 line-clamp-2 flex-1 text-[0.9rem] leading-[1.6] text-teks-sekunder">
                    {a.ringkasan}
                  </p>

                  <Link
                    href={`/tulisan-pajak/${a.slug}`}
                    className="inline-flex w-fit items-center gap-2 py-1 text-[0.88rem] font-bold text-navy-900 no-underline transition-[var(--transition-base)] hover:gap-3"
                  >
                    Baca Selengkapnya
                    <PanahKanan className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
