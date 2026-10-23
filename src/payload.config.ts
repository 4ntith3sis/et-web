import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Articles } from "./collections/Articles";
import { Kategori } from "./collections/Kategori";
import { Services } from "./collections/Services";
import { Media } from "./collections/Media";
import { ClientLogos } from "./collections/ClientLogos";
import { Pages } from "./collections/Pages";
import { Leads } from "./collections/Leads";
import { ReusableComponents } from "./collections/ReusableComponents";
import { Testimonials } from "./collections/Testimonials";
import { TeamMembers } from "./collections/TeamMembers";
import { Users } from "./collections/Users";
import { WhatsAppNumbers } from "./collections/WhatsAppNumbers";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error("PAYLOAD_SECRET wajib tersedia dan minimal 32 karakter.");
}

// A host-side build needs the PostgreSQL port published to loopback, while
// the running Compose app must keep using the internal `postgres` service.
// DATABASE_URI still takes precedence so runtime behavior is unchanged.
const databaseUri =
  process.env.NODE_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build"
    ? process.env.EASYTAX_BUILD_DATABASE_URI || process.env.DATABASE_URI || process.env.DATABASE_URL || ""
    : process.env.NODE_ENV === "development"
      ? process.env.EASYTAX_DEV_DATABASE_URI || process.env.DATABASE_URI || process.env.DATABASE_URL || ""
      : process.env.DATABASE_URI || process.env.DATABASE_URL || "";

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
    Services,
    Kategori,
    Articles,
    TeamMembers,
    Testimonials,
    ClientLogos,
    Pages,
    Leads,
    ReusableComponents,
    WhatsAppNumbers,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3004",
  upload: {
    // Allow one sentinel byte through Busboy so the application hook can
    // accept exactly 20 MiB and reject anything larger with its ValidationError.
    limits: { fileSize: 20 * 1024 * 1024 + 1 },
    abortOnLimit: true,
    responseOnLimit: "Ukuran gambar maksimal 20 MB.",
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    push: false,
  }),
  sharp,
});
