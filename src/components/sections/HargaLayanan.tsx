import { Centang } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";
import type { PaketLayanan } from "@/data/layanan-detail";
import { situs } from "@/data/situs";
import { formatHargaRupiah, formatSatuan } from "@/lib/format-harga";
import type { PropsHargaLayanan } from "@/puck/types";

export { formatHargaRupiah, formatSatuan };

/** Kartu paket — meniru `.service-package` easytax-demo. */
function KartuPaket({
  paket,
  labelKeunggulan,
  labelTombol,
  tombolHref,
}: {
  paket: PaketLayanan;
  labelKeunggulan: string;
  labelTombol: string;
  tombolHref: string;
}) {
  const hargaTampil = formatHargaRupiah(paket.harga);
  const unitTampil = formatSatuan(paket.satuan);

  return (
    <article className="flex min-h-full flex-col rounded-[20px] border border-garis bg-white p-6 shadow-sm">
      <h3 className="font-heading text-[1.3rem] font-black text-navy-900">
        {paket.nama}
      </h3>

      {paket.deskripsi && (
        <p className="mt-2 min-h-[45px] text-[0.9rem] leading-[1.6] text-teks-redup">
          {paket.deskripsi}
        </p>
      )}

      <strong className="my-[18px] block font-heading text-[1.5rem] font-black text-navy-900">
        {hargaTampil}
        {unitTampil ? (
          <span className="ml-1.5 text-[0.85rem] font-bold text-teks-redup">
            / {unitTampil}
          </span>
        ) : null}
      </strong>

      {paket.fitur.length > 0 && (
        <>
          <h4 className="mb-2.5 font-heading text-[0.95rem] font-extrabold text-navy-900">
            {labelKeunggulan}
          </h4>
          <ul className="mb-6 flex flex-1 flex-col gap-2.5">
            {paket.fitur.map((fitur) => (
              <li
                key={fitur}
                className="flex items-start gap-2 text-[0.88rem] text-navy-900"
              >
                <Centang className="mt-0.75 h-4 w-4 shrink-0 text-emerald-accent" />
                {fitur}
              </li>
            ))}
          </ul>
        </>
      )}

      <ConsultationButton
        sumber="paket-layanan"
        pesan={`Halo EasyTax, saya ingin konsultasi mengenai Paket ${paket.nama}.`}
        ukuran="sedang"
        className="mt-auto w-fit rounded-md py-[13px] px-7 text-[0.95rem]"
      >
        {labelTombol}
      </ConsultationButton>
    </article>
  );
}

/**
 * "Harga Transparan / Paket Layanan" — diport dari `PricingPackages`
 * easytax-demo: judul terpusat lalu deretan kartu paket fleksibel.
 *
 * Properti desain section + label kartu (labelKeunggulan, labelTombol)
 * datang dari Page Builder. Nama paket, deskripsi, harga, satuan, dan
 * daftar keunggulan aktual berasal dari record CMS slug yang dibuka; kartu
 * yang sama diulang untuk SETIAP paket, berapa pun jumlahnya.
 */
export function HargaLayanan({
  paket,
  desain,
}: {
  paket: PaketLayanan[];
  desain?: PropsHargaLayanan;
}) {
  if (paket.length === 0) return null;

  const lencana = desain?.lencana ?? "Harga Transparan";
  const judul = desain?.judul ?? "Paket Layanan";
  const deskripsi = desain?.deskripsi ?? "Pilih paket yang sesuai kebutuhan bisnis Anda.";
  const labelKeunggulan = desain?.labelKeunggulan ?? "Keunggulan";
  const labelTombol = desain?.labelTombol ?? "Konsultasi";
  const tombolHrefAwal = desain?.tombolHref || situs.whatsappUrl;
  const tombolHref =
    !tombolHrefAwal || tombolHrefAwal.includes("mauorder")
      ? "/api/konsultasi/whatsapp?sumber=paket-layanan"
      : tombolHrefAwal;
  const tengah = (desain?.perataan ?? "tengah") === "tengah";

  return (
    <section
      id="harga"
      aria-labelledby="harga-judul"
      className="bg-white py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div
          className={
            tengah
              ? "mx-auto mb-10 max-w-[680px] text-center"
              : "mb-10 max-w-[680px]"
          }
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            {lencana}
          </span>

          <h2
            id="harga-judul"
            className="mb-3.5 font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.25] font-bold text-navy-900"
          >
            {judul}
          </h2>

          <p className="text-[1.05rem] text-teks-sekunder">{deskripsi}</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-6">
          {paket.map((p) => (
            <li
              key={p.nama}
              className="w-full max-w-[400px] flex-[1_1_300px]"
            >
              <KartuPaket
                paket={p}
                labelKeunggulan={labelKeunggulan}
                labelTombol={labelTombol}
                tombolHref={tombolHref}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}