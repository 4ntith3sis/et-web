import Image from "next/image";
import Link from "next/link";

import { PanahKanan, Rumah } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";
import { situs } from "@/data/situs";
import type { LayananBeranda } from "@/data/layanan";
import type { PropsLayananDetailHero } from "@/puck/types";

/**
 * Hero detail layanan — diport dari `ServiceHero` easytax-demo:
 * breadcrumb tiga level, tag pill, judul dengan subjudul kuning,
 * deskripsi, satu tombol, dan foto di kolom kanan.
 *
 * Isi dinamis (judul, subjudul, ringkasan, gambar) datang dari record CMS
 * slug yang dibuka. Properti desain (lencana, label/tautan tombol, perataan)
 * dapat disesuaikan lewat Page Builder dan dikirim sebagai `desain`.
 */
export function LayananDetailHero({
  layanan,
  desain,
}: {
  layanan: LayananBeranda;
  desain?: PropsLayananDetailHero;
}) {
  // Data record CMS Payload (layanan) adalah sumber data utama untuk nama layanan, judul, subjudul, dan deskripsi/ringkasan.
  // Properti desain template hanya berfungsi sebagai fallback/placeholder ketika konteks CMS tidak tersedia.
  const judul = layanan?.judul || desain?.judul || "Layanan";
  const subjudul = layanan ? (layanan.subjudul ?? "") : (desain?.subjudul ?? "");
  const ringkasan = layanan?.ringkasan || desain?.ringkasan || "";

  const lencana = desain?.lencana ?? "Tax & Accounting Service";
  const ctaLabel = desain?.ctaLabel ?? "Konsultasi Gratis";
  const ctaHrefAwal = desain?.ctaHref || situs.whatsappUrl;
  const ctaHref =
    !ctaHrefAwal || ctaHrefAwal.includes("mauorder")
      ? `/api/konsultasi/whatsapp?pesan=${encodeURIComponent(`Halo EasyTax, saya ingin konsultasi mengenai layanan ${judul}.`)}&sumber=layanan-detail`
      : ctaHrefAwal;
  const tengah = desain?.perataan === "tengah";
  const breadcrumbBeranda = desain?.breadcrumbBeranda || "Beranda";
  const breadcrumbLayanan = desain?.breadcrumbLayanan || "Layanan";
  const teksGambar = desain?.teksGambar || "Gambar";

  return (
    <section className="border-b border-white/10 bg-navy-900 px-6 pt-[clamp(48px,6vw,60px)] pb-[clamp(48px,6.4vw,70px)] text-white md:px-8">
      <div className="mx-auto grid w-full max-w-maks grid-cols-1 items-center gap-[50px] lg:grid-cols-2">
        <div className={tengah ? "text-center lg:text-left" : undefined}>
          <nav
            aria-label="Breadcrumb"
            className={
              tengah
                ? "mb-8 flex flex-wrap items-center justify-center gap-2 text-[0.88rem] text-teks-terang lg:justify-start"
                : "mb-8 flex flex-wrap items-center gap-2 text-[0.88rem] text-teks-terang"
            }
          >
            <Link href="/" className="flex items-center gap-2 no-underline">
              <Rumah className="h-3.5 w-3.5" />
              {breadcrumbBeranda}
            </Link>
            <span aria-hidden="true">&gt;</span>
            <Link href="/layanan" className="no-underline">
              {breadcrumbLayanan}
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span className="font-bold text-yellow-500">{judul}</span>
          </nav>

          <p className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/16 bg-white/6 px-4 py-2.5 text-[0.78rem] font-extrabold tracking-[0.13em] text-yellow-500 uppercase">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-yellow-500" />
            {lencana}
          </p>

          <h1 className="my-[18px] font-heading text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.2] font-black tracking-[-0.02em] text-white 2xl:text-[3.1rem]">
            {judul}
            {subjudul ? (
              <>
                <br />
                <span className="text-yellow-500">{subjudul}</span>
              </>
            ) : null}
          </h1>

          <p
            className={
              tengah
                ? "mx-auto max-w-[600px] text-[1.05rem] leading-[1.7] text-teks-terang lg:mx-0"
                : "max-w-[600px] text-[1.05rem] leading-[1.7] text-teks-terang"
            }
          >
            {ringkasan}
          </p>

          <div className={tengah ? "mx-auto mt-7 w-fit lg:mx-0" : "mt-7 w-fit"}>
            <ConsultationButton
              sumber="layanan-detail"
              pesan={`Halo EasyTax, saya ingin konsultasi mengenai layanan ${judul}.`}
              ukuran="sedang"
              ikonKanan={<PanahKanan className="h-4 w-4" />}
              className="w-fit rounded-md py-[13px] px-7 text-[0.95rem]"
            >
              {ctaLabel}
            </ConsultationButton>
          </div>
        </div>

        <div className="relative h-[390px] overflow-hidden rounded-[28px] bg-yellow-500">
          {layanan.gambar && layanan.gambar !== "/images/placeholder-layanan.svg" ? (
            <Image
              src={layanan.gambar}
              alt={judul}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-yellow-500">
              <span className="font-heading text-[2.25rem] font-extrabold tracking-wide text-navy-900">
                {teksGambar}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}