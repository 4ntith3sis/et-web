import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Artikel } from "./collections/Artikel";
import { Kategori } from "./collections/Kategori";
import { Layanan } from "./collections/Layanan";
import { Media } from "./collections/Media";
import { Mitra } from "./collections/Mitra";
import { PageLayouts } from "./collections/PageLayouts";
import { PesanKontak } from "./collections/PesanKontak";
import { Testimoni } from "./collections/Testimoni";
import { Tim } from "./collections/Tim";
import { Users } from "./collections/Users";
import { PengaturanSitus } from "./globals/PengaturanSitus";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Konfigurasi Payload CMS v3 untuk EasyTax.
 *
 * - Database: PostgreSQL via @payloadcms/db-postgres (kredensial dari env).
 * - Editor: Lexical.
 * - Admin: route group terpisah `src/app/(payload)` (tidak menabrak rute publik).
 * - Gambar: upload ke koleksi `media`, dioptimasi oleh sharp.
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — EasyTax CMS",
    },
    importMap: {
      baseDir: dirname,
    },
    components: {
      afterNavLinks: ["/components/admin/page-builder/TautanNav#TautanNav"],
      views: {
        pageBuilder: {
          path: "/page-builder",
          exact: true,
          Component: "/components/admin/page-builder/ViewDaftar#ViewDaftar",
        },
        pageBuilderEditor: {
          path: "/page-builder/:pageKey",
          exact: true,
          Component: "/components/admin/page-builder/ViewEditor#ViewEditor",
        },
      },
    },
  },
  collections: [
    Users,
    Media,
    Layanan,
    Kategori,
    Artikel,
    Tim,
    Testimoni,
    Mitra,
    PageLayouts,
    PesanKontak,
  ],
  globals: [PengaturanSitus],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3004",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
});
