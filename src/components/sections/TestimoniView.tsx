import { Bintang } from "@/components/ikon";
import type { Testimoni as ItemTestimoni } from "@/data/testimoni";

/**
 * Bagian presentasional section Testimoni: satu baris kartu kutipan yang
 * bergeser horizontal dari kiri ke kanan (`.animasi-marquee-terbalik`).
 *
 * Dipisah dari pengambilan data (`Testimoni`) agar bisa dirender ulang oleh
 * Page Builder, baik di server (renderer publik) maupun di klien (editor).
 */

function Kartu({ item }: { item: ItemTestimoni }) {
  return (
    <figure className="flex h-full w-full flex-col rounded-2xl border border-garis bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-1 text-yellow-500">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Bintang key={i} className="h-3.5 w-3.5" />
        ))}
      </div>

      <blockquote className="text-[0.92rem] leading-[1.65] font-medium text-teks-sekunder">
        &ldquo;{item.kutipan}&rdquo;
      </blockquote>

      <figcaption className="mt-5 flex items-center gap-3 border-t border-garis-halus pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 font-heading text-[0.75rem] font-bold text-yellow-500">
          {item.inisial}
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-[0.9rem] font-bold tracking-[-0.02em] text-navy-900">
            {item.nama}
          </span>
          <span className="block text-[0.75rem] text-teks-redup">
            {item.peran}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimoniView({
  items,
  desain,
}: {
  items: ItemTestimoni[];
  desain?: { lencana?: string; judul?: string; deskripsi?: string };
}) {
  const lencana = desain?.lencana ?? "Testimoni";
  const judul =
    desain?.judul ?? "Pengalaman dari mereka yang sudah kami layani";
  const deskripsi =
    desain?.deskripsi ??
    "Dari UMKM kuliner, retail, agency, hingga korporasi besar, semuanya mempercayakan urusan pajak dan pembukuan kepada EasyTax.";

  return (
    <section
      id="testimoni"
      aria-labelledby="testimoni-judul"
      className="relative overflow-hidden bg-netral-lat py-[clamp(44px,6vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            {lencana}
          </span>

          <h2
            id="testimoni-judul"
            className="mt-6 max-w-[720px] font-heading text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.25] font-bold tracking-[-0.03em] text-navy-900 text-balance"
          >
            {judul}
          </h2>

          <p className="mt-4 max-w-[640px] text-[1rem] leading-[1.7] text-teks-sekunder">
            {deskripsi}
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="animasi-marquee-terbalik flex w-max items-stretch">
            {[...items, ...items].map((item, i) => (
              <div
                key={`${item.nama}-${i}`}
                className="me-5 flex w-[min(340px,80vw)] shrink-0"
              >
                <Kartu item={item} />
              </div>
            ))}
          </div>

          {/* Fade di tepi kiri dan kanan supaya kartu yang masuk/keluar tidak terpotong. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-[linear-gradient(90deg,var(--color-netral-lat),transparent)] md:w-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-[linear-gradient(270deg,var(--color-netral-lat),transparent)] md:w-20"
          />
        </div>
      </div>
    </section>
  );
}
