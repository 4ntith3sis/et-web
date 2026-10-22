import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reusable_components_kategori" AS ENUM('Layout', 'Konten', 'Kartu', 'Interaktif', 'Section Website', 'Lain-lain');
  CREATE TYPE "public"."enum__reusable_components_v_version_kategori" AS ENUM('Layout', 'Konten', 'Kartu', 'Interaktif', 'Section Website', 'Lain-lain');
  CREATE TYPE "public"."enum_pengaturan_situs_whatsapp_routing_strategy" AS ENUM('round-robin', 'random', 'weighted', 'priority');
  CREATE TABLE "reusable_components" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"deskripsi" varchar,
  	"kategori" "enum_reusable_components_kategori" DEFAULT 'Lain-lain',
  	"data" jsonb NOT NULL,
  	"versi" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_reusable_components_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nama" varchar NOT NULL,
  	"version_deskripsi" varchar,
  	"version_kategori" "enum__reusable_components_v_version_kategori" DEFAULT 'Lain-lain',
  	"version_data" jsonb NOT NULL,
  	"version_versi" numeric DEFAULT 1,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "nomor_whatsapp" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"phone_number" varchar NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"priority" numeric DEFAULT 1,
  	"weight" numeric DEFAULT 1,
  	"notes" varchar,
  	"assigned_count" numeric DEFAULT 0,
  	"last_assigned_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reusable_components_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nomor_whatsapp_id" integer;
  ALTER TABLE "pengaturan_situs" ADD COLUMN "whatsapp_enabled" boolean DEFAULT true;
  ALTER TABLE "pengaturan_situs" ADD COLUMN "whatsapp_routing_strategy" "enum_pengaturan_situs_whatsapp_routing_strategy" DEFAULT 'round-robin';
  ALTER TABLE "pengaturan_situs" ADD COLUMN "default_whats_app_message" varchar DEFAULT 'Halo EasyTax, saya ingin berkonsultasi mengenai perpajakan perusahaan saya.';
  ALTER TABLE "pengaturan_situs" ADD COLUMN "fallback_whats_app_number" varchar;
  ALTER TABLE "pengaturan_situs" ADD COLUMN "whatsapp_button_label" varchar DEFAULT 'Konsultasi Gratis';
  ALTER TABLE "pengaturan_situs" ADD COLUMN "manual_whats_app_number_id" integer;
  ALTER TABLE "_reusable_components_v" ADD CONSTRAINT "_reusable_components_v_parent_id_reusable_components_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reusable_components"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reusable_components_updated_at_idx" ON "reusable_components" USING btree ("updated_at");
  CREATE INDEX "reusable_components_created_at_idx" ON "reusable_components" USING btree ("created_at");
  CREATE INDEX "_reusable_components_v_parent_idx" ON "_reusable_components_v" USING btree ("parent_id");
  CREATE INDEX "_reusable_components_v_version_version_updated_at_idx" ON "_reusable_components_v" USING btree ("version_updated_at");
  CREATE INDEX "_reusable_components_v_version_version_created_at_idx" ON "_reusable_components_v" USING btree ("version_created_at");
  CREATE INDEX "_reusable_components_v_created_at_idx" ON "_reusable_components_v" USING btree ("created_at");
  CREATE INDEX "_reusable_components_v_updated_at_idx" ON "_reusable_components_v" USING btree ("updated_at");
  CREATE INDEX "nomor_whatsapp_updated_at_idx" ON "nomor_whatsapp" USING btree ("updated_at");
  CREATE INDEX "nomor_whatsapp_created_at_idx" ON "nomor_whatsapp" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reusable_components_fk" FOREIGN KEY ("reusable_components_id") REFERENCES "public"."reusable_components"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nomor_whatsapp_fk" FOREIGN KEY ("nomor_whatsapp_id") REFERENCES "public"."nomor_whatsapp"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pengaturan_situs" ADD CONSTRAINT "pengaturan_situs_manual_whats_app_number_id_nomor_whatsapp_id_fk" FOREIGN KEY ("manual_whats_app_number_id") REFERENCES "public"."nomor_whatsapp"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reusable_components_id_idx" ON "payload_locked_documents_rels" USING btree ("reusable_components_id");
  CREATE INDEX "payload_locked_documents_rels_nomor_whatsapp_id_idx" ON "payload_locked_documents_rels" USING btree ("nomor_whatsapp_id");
  CREATE INDEX "pengaturan_situs_manual_whats_app_number_idx" ON "pengaturan_situs" USING btree ("manual_whats_app_number_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reusable_components" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_reusable_components_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nomor_whatsapp" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reusable_components" CASCADE;
  DROP TABLE "_reusable_components_v" CASCADE;
  DROP TABLE "nomor_whatsapp" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reusable_components_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nomor_whatsapp_fk";
  
  ALTER TABLE "pengaturan_situs" DROP CONSTRAINT "pengaturan_situs_manual_whats_app_number_id_nomor_whatsapp_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_reusable_components_id_idx";
  DROP INDEX "payload_locked_documents_rels_nomor_whatsapp_id_idx";
  DROP INDEX "pengaturan_situs_manual_whats_app_number_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reusable_components_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "nomor_whatsapp_id";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "whatsapp_enabled";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "whatsapp_routing_strategy";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "default_whats_app_message";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "fallback_whats_app_number";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "whatsapp_button_label";
  ALTER TABLE "pengaturan_situs" DROP COLUMN "manual_whats_app_number_id";
  DROP TYPE "public"."enum_reusable_components_kategori";
  DROP TYPE "public"."enum__reusable_components_v_version_kategori";
  DROP TYPE "public"."enum_pengaturan_situs_whatsapp_routing_strategy";`)
}
