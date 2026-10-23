import { sql } from "@payloadcms/db-postgres";
import type { CollectionConfig, PayloadRequest } from "payload";
import { APIError } from "payload";

import {
  adminSaja,
  bacaTerbitAtauStaf,
  bacaVersiTerbitAtauStaf,
  stafPenulis,
} from "../access";
import { revalidateKonten } from "../cms/revalidate";
import { validasiLayoutPuck } from "../puck/validation";

type SesiTransaksi = {
  db: { execute: (query: unknown) => Promise<unknown> };
};

/**
 * Kunci revisi per halaman memakai advisory lock PostgreSQL yang berlaku
 * sampai transaksi Payload selesai. Ini membuat baca revisi terbaru,
 * pemeriksaan konflik, dan penulisan revisi baru menjadi satu operasi atomik
 * bahkan jika dua request publish masuk bersamaan.
 */
async function kunciRevisiLayout(
  req: PayloadRequest,
  kunci: string,
): Promise<void> {
  const transactionID = await req.transactionID;
  const db = req.payload.db as unknown as {
    sessions?: Record<string, SesiTransaksi>;
  };
  const sesi = transactionID == null ? undefined : db.sessions?.[String(transactionID)];

  if (!sesi) {
    // Tanpa transaksi yang sama dengan operasi update, lock akan dilepas
    // sebelum baris ditulis sehingga jaminan atomiknya hilang. Gagal tertutup
    // lebih aman daripada membiarkan dua publish menimpa satu sama lain.
    throw new APIError(
      "Penyimpanan layout memerlukan transaksi database aktif. Coba lagi.",
      503,
    );
  }

  await sesi.db.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${`page-layouts:${kunci}`}, 0))`,
  );
}

/**
 * Pages (PageLayouts) — Layout halaman yang disusun lewat Page Builder (Puck).
 * Menggunakan slug database `page-layouts` agar kompatibel penuh dengan PostgreSQL.
 */
export const Pages: CollectionConfig = {
  slug: "page-layouts",
  labels: { singular: "Layout Halaman", plural: "Layout Halaman" },
  admin: {
    useAsTitle: "judul",
    group: false,
    defaultColumns: ["pageKey", "judul", "_status", "updatedAt"],
    description:
      "Layout halaman yang disusun lewat Page Builder. Gunakan menu Page Builder.",
  },
  versions: { drafts: true },
  access: {
    read: bacaTerbitAtauStaf,
    readVersions: bacaVersiTerbitAtauStaf,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, context, req }) => {
        if (!data) return data;

        if (data.layout !== undefined) {
          const hasil = validasiLayoutPuck(data.layout);
          if (!hasil.ok) throw new APIError(hasil.error, 400);
          data.layout = hasil.data;
          if (data._status === "published" && hasil.data.content.length === 0) {
            throw new APIError(
              "Layout kosong tidak dapat diterbitkan. Tambahkan minimal satu komponen.",
              400,
            );
          }
        }

        const revisiDikirim = data.revision;
        if (
          revisiDikirim !== undefined &&
          (typeof revisiDikirim !== "number" ||
            !Number.isInteger(revisiDikirim) ||
            revisiDikirim < 0)
        ) {
          throw new APIError("Revisi layout tidak valid.", 400);
        }

        const revisiMain =
          typeof originalDoc?.revision === "number" ? originalDoc.revision : 0;
        const berpindahVersi = context?.isRestoringVersion === true;

        let acuan = revisiMain;
        const idDokumen = (originalDoc as { id?: unknown } | undefined)?.id;

        // `originalDoc` juga diberikan saat create dengan id kosong; kunci dan
        // query versi hanya relevan untuk update dokumen yang sudah ada.
        if (idDokumen != null) {
          const pageKey =
            (data as { pageKey?: string }).pageKey ??
            (originalDoc as { pageKey?: string }).pageKey;
          await kunciRevisiLayout(req, pageKey ?? String(idDokumen));

          /*
           * Payload memberi `originalDoc` dari baris utama, sedangkan editor
           * memegang revisi versi draft terbaru. Setelah advisory lock didapat,
           * baca ulang versi terbaru di dalam transaksi yang sama agar dua
           * request bersamaan tidak sama-sama lolos pemeriksaan revisi.
           */
          const versi = await req.payload.findVersions({
            collection: "page-layouts",
            where: { parent: { equals: idDokumen as number | string } },
            sort: "-version.revision",
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          });
          const revisiVersi = versi.docs[0]?.version?.revision;
          if (typeof revisiVersi === "number") {
            acuan = Math.max(acuan, revisiVersi);
          }
        }

        if (
          !berpindahVersi &&
          typeof revisiDikirim === "number" &&
          revisiDikirim !== acuan
        ) {
          throw new APIError(
            "Layout ini sudah diubah oleh pengguna lain. Muat ulang editor lalu ulangi.",
            409,
          );
        }

        data.revision = acuan + 1;
        return data;
      },
    ],
    afterChange: [
      async ({ doc, context }) => {
        // Draft dari Page Builder tidak mengubah publik; jangan buang cache
        // hangat hanya karena editor menekan Pratinjau.
        if (context?.pageBuilderDraft) return;
        const pageKey = (doc as { pageKey?: string }).pageKey;
        if (pageKey) await revalidateKonten(`layout:${pageKey}`);
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const pageKey = (doc as { pageKey?: string }).pageKey;
        if (pageKey) await revalidateKonten(`layout:${pageKey}`);
      },
    ],
  },
  fields: [
    {
      name: "pageKey",
      label: "Kunci Halaman",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Contoh: beranda. Dibuat otomatis oleh Page Builder.",
      },
    },
    {
      name: "judul",
      label: "Judul Halaman",
      type: "text",
      required: true,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "rute",
      label: "Rute Publik",
      type: "text",
      required: true,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "layout",
      label: "Layout (JSON)",
      type: "json",
      required: true,
      validate: (value: unknown) => {
        const hasil = validasiLayoutPuck(value);
        return hasil.ok ? true : hasil.error;
      },
    },
    {
      name: "revision",
      label: "Revisi",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Otomatis. Dipakai untuk deteksi konflik penyuntingan.",
      },
    },
    {
      name: "publishedAt",
      label: "Diterbitkan Pada",
      type: "date",
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "publishedBy",
      label: "Diterbitkan Oleh",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};

export const PageLayouts = Pages;
export default Pages;
