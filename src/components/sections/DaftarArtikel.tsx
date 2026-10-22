import Image from "next/image";
import Link from "next/link";

import { Cari, Jam, PanahKanan } from "@/components/ikon";
import type { ArtikelBeranda } from "@/data/artikel";

/**
 * Daftar artikel untuk halaman /tulisan-pajak (gaya editorial).
 *
 * Form pencarian + filter kategori tepat setelah pengantar, lalu grid
 * "Artikel Terbaru" (1/2/3 kolom per breakpoint) dan paginasi. Semua
 * state disimpan di URL (`q`, `kategori`, `page`) supaya halaman tetap
 * bisa di-bookmark dan di-share, dan supaya server yang menyaring data.
 */

export type Kategori = { slug: string; nama: string };

export function ambilKategori(artikel: ArtikelBeranda[]): Kategori[] {
  const peta = new Map<string, string>();
  for (const a of artikel) peta.set(a.kategori, a.kategori.toLowerCase());
  return [...peta].map(([nama, slug]) => ({ nama, slug }));
}

function tautanHalaman(page: number, kategori?: string, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (kategori) params.set("kategori", kategori);
  if (q) params.set("q", q);
  const query = params.toString();
  return `/tulisan-pajak${query ? `?${query}` : ""}`;
}

function jendelaHalaman(sekarang: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, sekarang - 1, sekarang, sekarang + 1]);
  return [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

type Prop = {
  artikel: ArtikelBeranda[];
  kategori: Kategori[];
  kategoriAktif?: string;
  page: number;
  totalPages: number;
  totalDocs: number;
  kueri?: string;
};

export function DaftarArtikel({
  artikel,
  kategori,
  kategoriAktif,
  page,
  totalPages,
  totalDocs,
  kueri = "",
}: Prop) {
  return (
    <>
      {/* Pencarian + filter kategori */}
      <section id="cari-artikel" className="bg-white">
        <div className="mx-auto w-full max-w-maks px-6 md:px-8">
          <form
            action="/tulisan-pajak"
            method="get"
            role="search"
            className="flex flex-wrap items-center gap-3"
          >
            {kategoriAktif && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <div className="relative min-w-0 flex-1">
              <Cari
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-[18px] h-4 w-4 -translate-y-1/2 text-teks-redup"
              />
              <input
                type="search"
                name="q"
                defaultValue={kueri}
                placeholder="Cari artikel perpajakan, akuntansi, atau keuangan bisnis..."
                className="h-[52px] w-full rounded-full border-[1.5px] border-garis bg-white pr-5 pl-11 text-[0.95rem] text-navy-900 outline-none transition-[var(--transition-base)] placeholder:text-teks-redup focus:border-navy-900"
              />
            </div>
            <button
              type="submit"
              className="h-[52px] shrink-0 cursor-pointer rounded-full bg-yellow-500 px-5 text-[0.95rem] font-bold text-navy-900 shadow-kuning transition-[var(--transition-base)] hover:-translate-y-0.5 sm:px-7"
            >
              Cari Artikel
            </button>
          </form>

          <nav
            aria-label="Filter kategori"
            className="mt-5 flex flex-wrap justify-center gap-2.5"
          >
            <Link
              href={tautanHalaman(1, undefined, kueri)}
              className={
                kategoriAktif
                  ? "rounded-full border border-teks-terang bg-white px-5 py-2 text-[0.95rem] font-bold text-navy-900 no-underline transition-[var(--transition-base)] hover:border-navy-900"
                  : "rounded-full border border-navy-900 bg-navy-900 px-5 py-2 text-[0.95rem] font-bold text-white no-underline transition-[var(--transition-base)]"
              }
              aria-current={kategoriAktif ? undefined : "page"}
            >
              Semua Artikel
            </Link>

            {kategori.map((k) => (
              <Link
                key={k.slug}
                href={tautanHalaman(1, k.slug, kueri)}
                className={
                  kategoriAktif === k.slug
                    ? "rounded-full border border-navy-900 bg-navy-900 px-5 py-2 text-[0.95rem] font-bold text-white no-underline transition-[var(--transition-base)]"
                    : "rounded-full border border-teks-terang bg-white px-5 py-2 text-[0.95rem] font-bold text-navy-900 no-underline transition-[var(--transition-base)] hover:border-navy-900"
                }
                aria-current={kategoriAktif === k.slug ? "page" : undefined}
              >
                {k.nama}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Grid artikel */}
      <section
        id="daftar-artikel"
        aria-labelledby="daftar-artikel-judul"
        className="bg-white pt-9 pb-11 md:pb-14"
      >
        <div className="mx-auto w-full max-w-maks px-6 md:px-8">
          <h2
            id="daftar-artikel-judul"
            className="mb-8 font-heading text-[clamp(1.5rem,2.4vw,1.9rem)] leading-[1.2] font-bold tracking-[-0.02em] text-navy-900"
          >
            Artikel Terbaru
          </h2>

          {artikel.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-garis bg-netral-lat px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-teks-redup shadow-sm">
                <Cari className="h-6 w-6" />
              </span>
              <p className="font-heading text-[1.15rem] font-bold text-navy-900">
                Belum ada artikel yang cocok
              </p>
              <p className="max-w-[420px] text-[0.92rem] leading-[1.6] text-teks-sekunder">
                {kueri
                  ? `Tidak ditemukan artikel untuk "${kueri}". Coba kata kunci lain atau tampilkan semua artikel.`
                  : "Belum ada artikel pada kategori ini."}
              </p>
              <Link
                href="/tulisan-pajak"
                className="inline-flex h-11 items-center rounded-md bg-navy-900 px-6 text-[0.9rem] font-bold text-white no-underline transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-lg"
              >
                Tampilkan semua artikel
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {artikel.map((a) => (
                  <li key={a.slug}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-garis bg-white shadow-sm transition-[var(--transition-base)] hover:-translate-y-2 hover:shadow-xl">
                      <div className="relative aspect-video shrink-0 overflow-hidden bg-navy-900">
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

              <p className="mt-6 text-center text-[0.85rem] text-teks-redup">
                Halaman {page} dari {totalPages} — {totalDocs} artikel
              </p>
            </>
          )}

          {/* Paginasi */}
          {totalPages > 1 && (
            <nav
              aria-label="Paginasi artikel"
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              {page > 1 ? (
                <Link href={tautanHalaman(page - 1, kategoriAktif, kueri)} aria-label="Halaman sebelumnya">
                  <span className="grid min-w-10 place-items-center rounded-lg border border-teks-terang bg-white px-4 py-2.5 text-[0.95rem] font-bold text-navy-900 transition-[var(--transition-base)] hover:border-navy-900 hover:bg-navy-900 hover:text-white">
                    <span aria-hidden="true">‹</span>
                  </span>
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="grid min-w-10 place-items-center rounded-lg border border-teks-terang bg-white px-4 py-2.5 text-[0.95rem] font-bold text-teks-terang opacity-45"
                >
                  ‹
                </span>
              )}

              {jendelaHalaman(page, totalPages).map((p) =>
                p === page ? (
                  <span
                    key={p}
                    aria-current="page"
                    className="grid min-w-10 place-items-center rounded-lg border border-yellow-500 bg-yellow-500 px-4 py-2.5 text-[0.95rem] font-bold text-navy-900"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={tautanHalaman(p, kategoriAktif, kueri)}
                    className="grid min-w-10 place-items-center rounded-lg border border-teks-terang bg-white px-4 py-2.5 text-[0.95rem] font-bold text-navy-900 no-underline transition-[var(--transition-base)] hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                  >
                    {p}
                  </Link>
                ),
              )}

              {page < totalPages ? (
                <Link href={tautanHalaman(page + 1, kategoriAktif, kueri)} aria-label="Halaman berikutnya">
                  <span className="grid min-w-10 place-items-center rounded-lg border border-teks-terang bg-white px-4 py-2.5 text-[0.95rem] font-bold text-navy-900 transition-[var(--transition-base)] hover:border-navy-900 hover:bg-navy-900 hover:text-white">
                    <span aria-hidden="true">›</span>
                  </span>
                </Link>
              ) : (
                <span
                  aria-hidden="true"
                  className="grid min-w-10 place-items-center rounded-lg border border-teks-terang bg-white px-4 py-2.5 text-[0.95rem] font-bold text-teks-terang opacity-45"
                >
                  ›
                </span>
              )}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}