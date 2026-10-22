import {
  Dokumen,
  Jam,
  Obrolan,
  PanahKanan,
  Perisai,
  TrenNaik,
} from "@/components/ikon";

const LANGKAH = [
  {
    judul: "Pilih Layanan",
    deskripsi:
      "Pilih layanan yang sesuai dengan kebutuhan pajak Anda.",
    ikon: <Dokumen className="h-5 w-5" />,
  },
  {
    judul: "Konsultasi",
    deskripsi:
      "Konsultasi gratis bersama konsultan untuk memetakanudukan pajak Anda.",
    ikon: <Obrolan className="h-5 w-5" />,
  },
  {
    judul: "Proses",
    deskripsi:
      "Dokumen Anda diperiksa dan dikerjakan oleh tenaga ahli berlisensi.",
    ikon: <Jam className="h-5 w-5" />,
  },
  {
    judul: "Hasil",
    deskripsi:
      "Laporan rapi dan berkas selesai tepat waktu, siap Anda pakai.",
    ikon: <Perisai className="h-5 w-5" />,
  },
] as const;

/**
 * Section "How It Works": panel navy melengkung berisi empat kartu langkah.
 * Nomor langkah 01-04 berada di dalam kartu (badge kiri-atas, ikon kanan-atas);
 * panah kuning di antara kartu menunjukkan alur: satu kolom → panah ke bawah,
 * dua kolom → panah antar kolom + penghubung antar baris, empat kolom → kanan.
 */
export function CaraKerja({
  desain,
}: {
  desain?: { lencana?: string; judul?: string };
} = {}) {
  const lencana = desain?.lencana ?? "Cara Kerja";
  const judul =
    desain?.judul ??
    "Empat langkah sederhana untuk menyelesaikan urusan pajak yang rumit.";

  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-judul"
      className="bg-white px-6 py-[clamp(44px,7vw,64px)] md:px-8"
    >
      <div className="relative mx-auto w-full max-w-maks overflow-hidden rounded-[28px] bg-navy-900 px-6 py-[clamp(40px,5vw,72px)] md:px-10">
        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[0.85rem] font-bold tracking-[0.04em] text-white uppercase">
            <TrenNaik className="h-3.5 w-3.5 text-yellow-500" />
            {lencana}
          </span>

          <h2
            id="cara-kerja-judul"
            className="mt-6 max-w-[720px] font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.2] font-bold tracking-[-0.03em] text-white"
          >
            {judul}
          </h2>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-x-2">
          {LANGKAH.map((langkah, i) => (
            <li key={langkah.judul} className="contents">
              <div className="flex min-h-[210px] flex-col rounded-lg bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 font-heading text-[0.9rem] font-bold text-white">
                    0{i + 1}
                  </span>
                  <span className="shrink-0 text-teks-gelap">{langkah.ikon}</span>
                </div>

                <h3 className="mt-4 font-heading text-[1.32rem] leading-[1.15] font-bold tracking-[-0.035em] text-teks-gelap">
                  {langkah.judul}
                </h3>

                <p className="mt-3 text-[0.92rem] leading-[1.6] font-medium text-teks-sekunder">
                  {langkah.deskripsi}
                </p>

                <span aria-hidden="true" className="sr-only">
                  Langkah {i + 1}
                </span>
              </div>

              {i < LANGKAH.length - 1 && (
                <span
                  aria-hidden="true"
                  className={
                    i === 1
                      ? "flex items-center justify-center text-yellow-500 rotate-90 sm:col-span-3 lg:col-span-1 lg:rotate-0"
                      : "flex items-center justify-center text-yellow-500 rotate-90 sm:rotate-0"
                  }
                >
                  <PanahKanan className="h-4 w-4" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}