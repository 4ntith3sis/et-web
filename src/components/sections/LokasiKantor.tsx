import Image from "next/image";

import { Jam, Lokasi, Telepon } from "@/components/ikon";
import { ambilJamOperasional } from "@/cms/konten";
import { kantor } from "@/data/kontak";

/**
 * Section "Kantor Kami" untuk halaman /kontak.
 *
 * Hanya ada satu kantor fisik (Kantor Pusat Jakarta), jadi section ini
 * sengaja-designed sebagai satu panel besar: foto gedung di kiri, detail
 * alamat dan jam operasional di kanan, tanpa grid kantor yang kosong.
 */
export async function LokasiKantor() {
  const [kantorPusat] = kantor;
  const jamOperasional = await ambilJamOperasional();

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-judul"
      className="bg-white py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        {/* Judul + deskripsi dalam satu blok sejajar kiri, supaya paragraf
            tidak mengambang terpisah di pojok kanan. */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            Lokasi Kantor
          </span>

          <h2
            id="lokasi-judul"
            className="mt-6 max-w-[560px] font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.2] font-bold tracking-[-0.03em] text-navy-900 text-balance"
          >
            Kunjungi kantor kami di Cilandak, Jakarta Selatan
          </h2>

          <p className="mt-4 max-w-[560px] text-[0.95rem] leading-[1.7] text-teks-sekunder">
            Konsultasi awal bisa dilakukan langsung di kantor pada jam kerja,
            atau lewat WhatsApp bila Anda sedang di luar kota.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Foto gedung */}
          <div className="relative h-[320px] overflow-hidden rounded-2xl bg-netral-lat shadow-sm sm:h-[380px]">
            <Image
              src={kantorPusat.gambar}
              alt={`Gedung ${kantorPusat.nama}`}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <span className="absolute top-4 left-4 rounded-full bg-yellow-500 px-3.5 py-1.5 text-[0.72rem] font-extrabold tracking-[0.05em] text-navy-900 uppercase shadow-sm">
              {kantorPusat.label}
            </span>
          </div>

          {/* Detail */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-garis bg-netral-lat p-6">
              <h3 className="font-heading text-[1.1rem] font-bold tracking-[-0.02em] text-navy-900">
                {kantorPusat.nama}
              </h3>

              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-[0.9rem] leading-[1.6] text-teks-sekunder">
                  <Lokasi className="mt-0.5 h-4.5 w-4.5 shrink-0 text-navy-900" />
                  {kantorPusat.alamat}
                </li>
                <li className="flex items-center gap-3 text-[0.9rem] text-teks-sekunder">
                  <Telepon className="h-4.5 w-4.5 shrink-0 text-navy-900" />
                  {kantorPusat.telepon}
                </li>
              </ul>

              <a
                href={kantorPusat.peta}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-11 items-center rounded-md bg-navy-900 px-6 text-[0.9rem] font-bold text-white no-underline transition-[var(--transition-base)] hover:-translate-y-0.5"
              >
                Lihat di Google Maps
              </a>
            </div>

            <div className="rounded-2xl border border-garis bg-white p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-yellow-500">
                  <Jam className="h-4 w-4" />
                </span>
                <h3 className="font-heading text-[1.02rem] font-bold tracking-[-0.02em] text-navy-900">
                  Jam Operasional
                </h3>
              </div>

              <dl className="mt-4 divide-y divide-garis-halus">
                {jamOperasional.map((j) => (
                  <div
                    key={j.hari}
                    className="flex items-center justify-between gap-4 py-2.5 text-[0.9rem]"
                  >
                    <dt className="text-teks-sekunder">{j.hari}</dt>
                    <dd className="font-semibold whitespace-nowrap text-navy-900">
                      {j.jam}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}