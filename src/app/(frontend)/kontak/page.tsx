import { Suspense } from "react";

import { FaqKontak } from "@/components/sections/FaqKontak";
import { FormPertanyaan } from "@/components/sections/FormPertanyaan";
import { KontakHero } from "@/components/sections/KontakHero";
import { LokasiKantor } from "@/components/sections/LokasiKantor";
import { ambilJamOperasional, ambilTopikKonsultasi } from "@/cms/konten";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function NotifikasiOffline({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  if (sp.notif !== "whatsapp-offline") return null;

  return (
    <section
      aria-label="Informasi Layanan Konsultasi"
      className="bg-amber-50/90 border-y border-amber-200/80 px-6 py-4"
    >
      <div className="mx-auto flex max-w-maks items-center gap-3.5 text-amber-900">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold">
          ℹ
        </span>
        <p className="text-[0.94rem] leading-relaxed">
          <strong>Layanan WhatsApp Sedang Tidak Tersedia:</strong> Saat ini tim konsultan kami belum dapat menerima obrolan langsung via WhatsApp. Silakan tinggalkan pesan melalui formulir kontak di bawah ini dan kami akan segera menghubungi Anda kembali.
        </p>
      </div>
    </section>
  );
}

/**
 * Halaman /kontak.
 * Dirender langsung menggunakan komponen native dan data CMS.
 */
export default async function KontakPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const [topikKonsultasi, jamOperasional] = await Promise.all([
    ambilTopikKonsultasi(),
    ambilJamOperasional(),
  ]);

  return (
    <>
      <KontakHero />
      <Suspense fallback={null}>
        <NotifikasiOffline searchParams={searchParams} />
      </Suspense>
      <FormPertanyaan
        topikKonsultasi={topikKonsultasi}
        jamOperasional={jamOperasional}
      />
      <LokasiKantor />
      <FaqKontak />
    </>
  );
}
