import { Bintang, Centang, Jam, Kunci, Medali, TrenNaik } from "@/components/ikon";
import type { PropsKeunggulan } from "@/puck/types";

const KEUNGGULAN = [
  {
    judul: "Praktis, fleksibel, cepat",
    deskripsi: "Tanpa harus datang ke kantor.",
    ikon: <TrenNaik className="h-4 w-4" />,
  },
  {
    judul: "Biaya transparan",
    deskripsi: "Rincian jelas sejak awal.",
    ikon: <Jam className="h-4 w-4" />,
  },
  {
    judul: "Keamanan data terjamin",
    deskripsi: "Enkripsi & akses terbatas.",
    ikon: <Kunci className="h-4 w-4" />,
  },
] as const;

/** Kolom kanan: tiga kartu "Why Choose Us" disusun 1 x 3 ke bawah. */
const ALASAN = [
  {
    judul: "Ahli Pajak Profesional",
    deskripsi:
      "Ditangani oleh tenaga ahli berlisensi yang memiliki pemahaman mendalam tentang peraturan perpajakan nasional dan internasional.",
    ikon: <Centang className="h-5 w-5" />,
    gelap: true,
    bukti: false,
  },
  {
    judul: "Rekam Jejak Terbukti",
    deskripsi:
      "Dipercaya ratusan klien, mulai dari individu, UMKM, hingga perusahaan besar, dengan hasil yang terukur.",
    ikon: <Medali className="h-5 w-5" />,
    gelap: false,
    bukti: true,
  },
  {
    judul: "Strategi Pajak yang Disesuaikan",
    deskripsi:
      "Kami menyesuaikan solusi dengan tujuan pribadi atau bisnis Anda, tanpa pendekatan satu ukuran untuk semua.",
    ikon: <TrenNaik className="h-5 w-5" />,
    gelap: false,
    bukti: false,
  },
] as const;

/**
 * Section "Keunggulan" setelah Hero: kolom kiri berisi headline + tiga
 * keunggulan ringkas, kolom kanan berisi tiga kartu alasan memilih
 * EasyTax (ahli pajak, rekam jejak, strategi yang disesuaikan).
 *
 * Teks statis (lencana, judul, deskripsi, perataan) dapat disunting lewat
 * Page Builder; daftar kartu tetap bagian dari desain final.
 */
export function Keunggulan({ desain }: { desain?: PropsKeunggulan }) {
  const lencana = desain?.lencana ?? "Solusi Pajak Terpercaya";
  const judul = desain?.judul ?? "Mengapa EasyTax?";
  const deskripsi =
    desain?.deskripsi ??
    "Solusi perpajakan terstruktur untuk mendampingi bisnis dan individu menghadapi kompleksitas pajak modern, mengelola kewajiban perpajakan, serta mengambil keputusan dengan lebih percaya diri.";
  const tengah = desain?.perataan === "tengah";

  return (
    <section
      aria-labelledby="keunggulan-judul"
      className="relative overflow-hidden bg-white text-teks-gelap"
    >
      <div className="mx-auto grid w-full max-w-maks grid-cols-1 gap-10 px-6 pt-[clamp(48px,5vw,68px)] pb-[clamp(48px,6.4vw,72px)] md:px-8 lg:grid-cols-[minmax(0,520px)_minmax(0,760px)] lg:items-stretch lg:justify-between lg:gap-10">
        <div
          className={
            tengah
              ? "relative flex flex-col items-center justify-start text-center"
              : "relative flex flex-col items-start justify-start"
          }
        >
          <div
            aria-hidden="true"
            className="absolute top-[138px] left-[155px] h-[330px] w-[330px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-navy)_5.5%,transparent)_1px,transparent_1.3px)] [background-size:8px_8px] max-lg:hidden"
          />

          <p className="relative mb-7 inline-flex w-max items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2.5 text-[0.85rem] leading-none font-bold tracking-[0.04em] text-navy-900 uppercase">
            <span className="grid h-3.5 w-3.5 place-items-center">
              <TrenNaik className="h-3.5 w-3.5" />
            </span>
            {lencana}
          </p>

          <h2
            id="keunggulan-judul"
            className="relative max-w-[520px] font-heading text-[clamp(1.9rem,2.6vw,2.5rem)] leading-[1.15] font-bold tracking-[-0.04em] text-teks-gelap"
          >
            {judul}
          </h2>

          <p className="relative mt-4 max-w-[440px] text-[0.98rem] leading-[1.7] text-teks-sekunder">
            {deskripsi}
          </p>

          <ul className="relative mt-10 grid w-full max-w-[520px] grid-cols-3 gap-3 lg:mt-auto lg:pt-10 max-sm:grid-cols-1">
            {KEUNGGULAN.map((item) => (
              <li
                key={item.judul}
                className="flex flex-col items-start gap-2.5 rounded-lg border border-garis bg-white px-4 py-4 shadow-sm"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-navy-900 text-yellow-500">
                  {item.ikon}
                </span>
                <span className="font-heading text-[0.9rem] leading-[1.2] font-bold tracking-[-0.025em] text-teks-gelap">
                  {item.judul}
                </span>
                <span className="font-body text-[0.76rem] leading-[1.45] font-medium text-teks-redup">
                  {item.deskripsi}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 lg:self-start lg:pt-16">
          {ALASAN.map((item) => (
            <article
              key={item.judul}
              className={
                item.gelap
                  ? "flex flex-col rounded-xl bg-navy-900 p-5 text-white"
                  : "flex flex-col rounded-xl bg-netral-lat p-5 text-teks-gelap"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    item.gelap
                      ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-yellow-500"
                      : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-yellow-500"
                  }
                >
                  {item.ikon}
                </span>
                <h3 className="font-heading text-[1.05rem] leading-tight font-bold tracking-[-0.03em]">
                  {item.judul}
                </h3>
              </div>

              <p
                className={
                  item.gelap
                    ? "mt-3 text-[0.85rem] leading-[1.55] font-medium text-teks-terang"
                    : "mt-3 text-[0.85rem] leading-[1.55] font-medium text-teks-sekunder"
                }
              >
                {item.deskripsi}
              </p>

              {item.bukti && (
                <div className="mt-3.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-white px-3.5 py-2.5">
                  <p className="text-[0.82rem] leading-[1.25] font-bold text-teks-gelap">
                    13.000
                    <br />
                    Bisnis Terlayani
                  </p>
                  <span className="h-9 w-px bg-garis" />
                  <div className="min-w-0">
                    <p className="text-[0.72rem] leading-[1.2] font-semibold text-teks-sekunder">
                      4.9/5 Kepuasan klien
                    </p>
                    <span className="mt-1 flex gap-0.5 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Bintang key={i} className="h-3 w-3" />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}