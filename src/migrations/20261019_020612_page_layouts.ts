import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_layouts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__page_layouts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "page_layouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_key" varchar,
  	"judul" varchar,
  	"rute" varchar,
  	"layout" jsonb,
  	"revision" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone,
  	"published_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_page_layouts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_page_layouts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_page_key" varchar,
  	"version_judul" varchar,
  	"version_rute" varchar,
  	"version_layout" jsonb,
  	"version_revision" numeric DEFAULT 0,
  	"version_published_at" timestamp(3) with time zone,
  	"version_published_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__page_layouts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_layouts_id" integer;
  ALTER TABLE "page_layouts" ADD CONSTRAINT "page_layouts_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_layouts_v" ADD CONSTRAINT "_page_layouts_v_parent_id_page_layouts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_layouts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_page_layouts_v" ADD CONSTRAINT "_page_layouts_v_version_published_by_id_users_id_fk" FOREIGN KEY ("version_published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "page_layouts_page_key_idx" ON "page_layouts" USING btree ("page_key");
  CREATE INDEX "page_layouts_published_by_idx" ON "page_layouts" USING btree ("published_by_id");
  CREATE INDEX "page_layouts_updated_at_idx" ON "page_layouts" USING btree ("updated_at");
  CREATE INDEX "page_layouts_created_at_idx" ON "page_layouts" USING btree ("created_at");
  CREATE INDEX "page_layouts__status_idx" ON "page_layouts" USING btree ("_status");
  CREATE INDEX "_page_layouts_v_parent_idx" ON "_page_layouts_v" USING btree ("parent_id");
  CREATE INDEX "_page_layouts_v_version_version_page_key_idx" ON "_page_layouts_v" USING btree ("version_page_key");
  CREATE INDEX "_page_layouts_v_version_version_published_by_idx" ON "_page_layouts_v" USING btree ("version_published_by_id");
  CREATE INDEX "_page_layouts_v_version_version_updated_at_idx" ON "_page_layouts_v" USING btree ("version_updated_at");
  CREATE INDEX "_page_layouts_v_version_version_created_at_idx" ON "_page_layouts_v" USING btree ("version_created_at");
  CREATE INDEX "_page_layouts_v_version_version__status_idx" ON "_page_layouts_v" USING btree ("version__status");
  CREATE INDEX "_page_layouts_v_created_at_idx" ON "_page_layouts_v" USING btree ("created_at");
  CREATE INDEX "_page_layouts_v_updated_at_idx" ON "_page_layouts_v" USING btree ("updated_at");
  CREATE INDEX "_page_layouts_v_latest_idx" ON "_page_layouts_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_layouts_fk" FOREIGN KEY ("page_layouts_id") REFERENCES "public"."page_layouts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_page_layouts_id_idx" ON "payload_locked_documents_rels" USING btree ("page_layouts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_layouts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_layouts_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_layouts" CASCADE;
  DROP TABLE "_page_layouts_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_layouts_fk";
  
  DROP INDEX "payload_locked_documents_rels_page_layouts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_layouts_id";
  DROP TYPE "public"."enum_page_layouts_status";
  DROP TYPE "public"."enum__page_layouts_v_version_status";`)
}
