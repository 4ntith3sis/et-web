import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import {
  adminSaja,
  bacaTerbitAtauStaf,
  bacaVersiTerbitAtauStaf,
  stafPenulis,
} from "../access";
import { revalidateKonten } from "../cms/revalidate";
import { validasiLayoutPuck } from "../puck/validation";

/**
 * Pages (PageLayouts) — Layout halaman yang disusun lewat Page Builder (Puck).
 * Menggunakan slug database `page-layouts` agar kompatibel penuh dengan PostgreSQL.
 */
export const Pages: CollectionConfig = {
  slug: "page-layouts",
  labels: { singular: "Layout Halaman", plural: "Layout Halaman" },
  admin: {
    useAsTitle: "judul",
    group: "Tampilan",
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
      ({ data, originalDoc }) => {
        if (!data) return data;

        if (data.layout !== undefined) {
          const hasil = validasiLayoutPuck(data.layout);
          if (!hasil.ok) throw new APIError(hasil.error, 400);
          data.layout = hasil.data;
        }

        if (
          typeof data.revision === "number" &&
          typeof originalDoc?.revision === "number" &&
          data.revision !== originalDoc.revision
        ) {
          throw new APIError(
            "Layout ini sudah diubah oleh pengguna lain. Muat ulang editor lalu ulangi.",
            409,
          );
        }

        const lama =
          typeof originalDoc?.revision === "number" ? originalDoc.revision : 0;
        data.revision = lama + 1;
        return data;
      },
    ],
    afterChange: [
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
