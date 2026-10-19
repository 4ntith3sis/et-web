import Image from "next/image";

/**
 * Bagian presentasional carousel logo mitra.
 *
 * Berbeda dari easytax-demo (v1) yang menaruh logo di kartu besar dengan
 * fade mask: di sini daftar logo jalan di dalam panel besar berlatar
 * netral, sementara identitas dan angka pendukung berdiri sendiri di
 * bagian atas. Dipisah dari pengambilan data agar bisa dirender ulang oleh
 * Page Builder.
 */

/** Liputan daftar minimum supaya marquee tidak terlihat bolong di layar lebar. */
function ulangi(items: { nama: string; src: string }[]) {
  if (items.length === 0) return [];
  const satuRonde = [...items];
  while (satuRonde.length < 12) satuRonde.push(...items);
  return [...satuRonde, ...satuRonde];
}

const FAKTA = [
  { nilai: "97%", label: "Kepuasan Klien" },
  { nilai: "< 1 jam", label: "respons konsultan" },
  { nilai: "BKP & IAPI", label: "sertifikasi konsultan" },
];

export function MitraView({ items }: { items: { nama: string; src: string }[] }) {
  const DAFTAR = ulangi(items);

  return (
    <section
      id="mitra"
      aria-labelledby="mitra-judul"
      className="bg-white py-[clamp(44px,6vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[560px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
              Mitra yang sudah percaya
            </span>

            <h2
              id="mitra-judul"
              className="mt-6 font-heading text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.25] font-bold tracking-[-0.03em] text-navy-900 text-balance"
            >
              Ribuan UMKM dan perusahaan mempercayakan pajaknya kepada
              EasyTax
            </h2>

            <p className="mt-4 text-[1rem] leading-[1.7] text-teks-sekunder">
              Pembukuan, perizinan PKP, sampai pelaporan SPT, semuanya
              ditangani tenaga ahli berlisensi dengan proses yang aman dan
              terlacak.
            </p>
          </div>

          <ul className="flex shrink-0 flex-wrap gap-3 lg:gap-4">
            {FAKTA.map((fakta) => (
              <li
                key={fakta.label}
                className="min-w-[112px] flex-1 rounded-xl border border-garis bg-netral-lat px-4 py-3.5 text-center"
              >
                <span className="block font-heading text-[1.15rem] leading-none font-bold tracking-[-0.035em] text-navy-900">
                  {fakta.nilai}
                </span>
                <span className="mt-2 block text-[0.7rem] leading-tight font-semibold tracking-[0.02em] text-teks-redup uppercase break-words">
                  {fakta.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-3xl bg-netral-alt px-6 py-8 md:px-10">
          <div className="animasi-marquee flex w-max items-center gap-5">
            {DAFTAR.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-garis bg-white px-4 shadow-sm"
              >
                <span className="relative block h-14 w-[104px]">
                  <Image
                    src={item.src}
                    alt={item.nama}
                    fill
                    loading="lazy"
                    sizes="104px"
                    className="object-contain object-center"
                  />
                </span>
              </div>
            ))}
          </div>

          {/* Fade di kedua tepi supaya logo yang keluar tidak terpotong keras. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(90deg,var(--color-netral-alt),transparent)] lg:w-36"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-[linear-gradient(270deg,var(--color-netral-alt),transparent)] lg:w-36"
          />
        </div>
      </div>
    </section>
  );
}
