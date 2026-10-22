import { SetStepNav } from "@payloadcms/ui";
import { notFound } from "next/navigation";
import type { AdminViewServerProps } from "payload";

import { ambilMetadataPuck, konteksRepresentatif } from "@/cms/layout";
import { layoutDefault } from "@/puck/default-layouts";
import { lengkapiLayoutDefaultProps } from "@/puck/default-props";
import { halamanDariKey, terapkanRoot, type LayoutPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";

import { EditorPageBuilder } from "./EditorPageBuilder";
import { kunciHalamanDariSegmen, stafAtauRedirect } from "./penjaga";
import { TemplatAdmin } from "./TemplatAdmin";

/**
 * View kustom `/admin/page-builder/:pageKey`.
 *
 * Memuat layout draft (atau membuatnya dari default bila belum ada), lalu
 * menyerahkan kerja visual ke editor Puck di klien. Metadata konten CMS
 * diserialisasi sebagai props supaya komponen dapat menampilkan isi nyata
 * saat disunting.
 */
export async function ViewEditor(props: AdminViewServerProps) {
  const pageKey = kunciHalamanDariSegmen(props.params);
  stafAtauRedirect(props.user, `/admin/page-builder/${pageKey}`);

  const halaman = halamanDariKey(pageKey);
  if (!halaman) notFound();

  const payload = props.payload;
  const res = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: pageKey } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  /* `draft: true` bisa memunculkan entri "hantu" dengan `id` null bila versi
     draft-nya ada tetapi dokumen induknya sudah tidak ada. Entri seperti itu
     tidak bisa disimpan kembali, jadi diperlakukan sebagai "belum ada" agar
     editor memakai layout default halaman ini dan Simpan Draft berfungsi. */
  const tersimpan = res.docs[0] as { id?: unknown } | undefined;
  let dok =
    tersimpan && tersimpan.id != null
      ? (tersimpan as { layout?: unknown; revision?: number })
      : undefined;
  if (!dok) {
    const awal = layoutDefault(pageKey) ?? { root: {}, content: [] };
    try {
      dok = (await payload.create({
        collection: "page-layouts",
        data: {
          pageKey,
          judul: halaman.judul,
          rute: halaman.rute,
          layout: awal,
          revision: 0,
        } as never,
        draft: true,
        overrideAccess: true,
      })) as { layout?: unknown; revision?: number };
    } catch {
      /* Bisa gagal bila dokumen utama sebenarnya ada (mis. entri "hantu"
         dengan `id` null karena versi draft tanpa `latest` yang konsisten).
         Ambil langsung dokumen utama agar editor tetap terbuka. */
      const ulang = await payload.find({
        collection: "page-layouts",
        where: { pageKey: { equals: pageKey } },
        limit: 1,
        depth: 0,
        draft: false,
        overrideAccess: true,
      });
      dok = ulang.docs[0] as { layout?: unknown; revision?: number } | undefined;
    }
  }
  if (!dok) {
    const awal = layoutDefault(pageKey) ?? { root: {}, content: [] };
    dok = { layout: awal, revision: 0 };
  }

  const tervalidasi = validasiLayoutPuck(dok.layout);
  const layoutTerpilih: LayoutPuck = tervalidasi.ok
    ? tervalidasi.data
    : (layoutDefault(pageKey) as LayoutPuck);

  /* Selalu lengkapi default props tiap komponen agar sidebar Puck editor menampilkan
     teks default dan tidak berstatus kosong jika dokumen lama belum memuat properti baru. */
  const layoutLengkap = lengkapiLayoutDefaultProps(layoutTerpilih, pageKey);

  /* Root props selalu disinkronkan dengan registry: layout lama (root `{}`)
     ikut diperbaiki tanpa perlu migrasi data. */
  const layoutSiap = terapkanRoot(layoutLengkap, halaman);

  const metadata = await ambilMetadataPuck((await konteksRepresentatif(pageKey)) ?? {});
  const revision = typeof dok.revision === "number" ? dok.revision : 0;

  return (
    <TemplatAdmin props={props} viewType="pageBuilderEditor">
      {/* View kustom tidak mengisi StepNav Payload; tanpanya breadcrumb header
          masih menampilkan label halaman admin sebelumnya. */}
      <SetStepNav
        nav={[
          { label: "Page Builder", url: "/admin/page-builder" },
          { label: halaman.judul },
        ]}
      />
      <div style={{ height: "calc(100dvh - 60px)" }}>
        <EditorPageBuilder
          pageKey={pageKey}
          judul={halaman.judul}
          rute={halaman.rute}
          initialLayout={layoutSiap}
          initialRevision={revision}
          metadata={metadata}
        />
      </div>
    </TemplatAdmin>
  );
}

export default ViewEditor;
