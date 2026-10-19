import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_layanan_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__layanan_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_artikel_blocks_judul_bagian_level" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_artikel_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__artikel_v_blocks_judul_bagian_level" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__artikel_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tim_level" AS ENUM('A', 'B', 'C');
  CREATE TYPE "public"."enum_pesan_kontak_status" AS ENUM('baru', 'dibaca', 'dibalas', 'arsip');
  CREATE TYPE "public"."enum_pengaturan_situs_sosial_platform" AS ENUM('whatsapp', 'instagram', 'tiktok', 'email', 'telepon');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_kartu_url" varchar,
  	"sizes_kartu_width" numeric,
  	"sizes_kartu_height" numeric,
  	"sizes_kartu_mime_type" varchar,
  	"sizes_kartu_filesize" numeric,
  	"sizes_kartu_filename" varchar,
  	"sizes_sampul_url" varchar,
  	"sizes_sampul_width" numeric,
  	"sizes_sampul_height" numeric,
  	"sizes_sampul_mime_type" varchar,
  	"sizes_sampul_filesize" numeric,
  	"sizes_sampul_filename" varchar,
  	"sizes_kecil_url" varchar,
  	"sizes_kecil_width" numeric,
  	"sizes_kecil_height" numeric,
  	"sizes_kecil_mime_type" varchar,
  	"sizes_kecil_filesize" numeric,
  	"sizes_kecil_filename" varchar
  );
  
  CREATE TABLE "layanan_paket_fitur" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar
  );
  
  CREATE TABLE "layanan_paket" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nama" varchar,
  	"deskripsi" varchar,
  	"harga" varchar,
  	"satuan" varchar
  );
  
  CREATE TABLE "layanan_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pertanyaan" varchar,
  	"jawaban" varchar
  );
  
  CREATE TABLE "layanan" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"judul" varchar,
  	"slug" varchar,
  	"subjudul" varchar,
  	"ringkasan" varchar,
  	"gambar_id" integer,
  	"urutan" numeric DEFAULT 0,
  	"seo_judul" varchar,
  	"seo_deskripsi" varchar,
  	"seo_gambar_id" integer,
  	"seo_jangan_indeks" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_layanan_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_layanan_v_version_paket_fitur" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_layanan_v_version_paket" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar,
  	"deskripsi" varchar,
  	"harga" varchar,
  	"satuan" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_layanan_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pertanyaan" varchar,
  	"jawaban" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_layanan_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_judul" varchar,
  	"version_slug" varchar,
  	"version_subjudul" varchar,
  	"version_ringkasan" varchar,
  	"version_gambar_id" integer,
  	"version_urutan" numeric DEFAULT 0,
  	"version_seo_judul" varchar,
  	"version_seo_deskripsi" varchar,
  	"version_seo_gambar_id" integer,
  	"version_seo_jangan_indeks" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__layanan_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "kategori" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artikel_tag" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar
  );
  
  CREATE TABLE "artikel_blocks_paragraf" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "artikel_blocks_judul_bagian" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"level" "enum_artikel_blocks_judul_bagian_level" DEFAULT '2',
  	"block_name" varchar
  );
  
  CREATE TABLE "artikel_blocks_daftar_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar
  );
  
  CREATE TABLE "artikel_blocks_daftar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"terurut" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "artikel" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"judul" varchar,
  	"slug" varchar,
  	"ringkasan" varchar,
  	"sampul_id" integer,
  	"kategori_id" integer,
  	"penulis_id" integer,
  	"tanggal_terbit" timestamp(3) with time zone,
  	"waktu_baca" varchar,
  	"seo_judul" varchar,
  	"seo_deskripsi" varchar,
  	"seo_gambar_id" integer,
  	"seo_jangan_indeks" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_artikel_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_artikel_v_version_tag" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_artikel_v_blocks_paragraf" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_artikel_v_blocks_judul_bagian" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"level" "enum__artikel_v_blocks_judul_bagian_level" DEFAULT '2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_artikel_v_blocks_daftar_item" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"teks" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_artikel_v_blocks_daftar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"terurut" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_artikel_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_judul" varchar,
  	"version_slug" varchar,
  	"version_ringkasan" varchar,
  	"version_sampul_id" integer,
  	"version_kategori_id" integer,
  	"version_penulis_id" integer,
  	"version_tanggal_terbit" timestamp(3) with time zone,
  	"version_waktu_baca" varchar,
  	"version_seo_judul" varchar,
  	"version_seo_deskripsi" varchar,
  	"version_seo_gambar_id" integer,
  	"version_seo_jangan_indeks" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__artikel_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tim" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"jabatan" varchar NOT NULL,
  	"lisensi" varchar,
  	"level" "enum_tim_level",
  	"foto_id" integer,
  	"bio" varchar,
  	"urutan" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimoni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"peran" varchar NOT NULL,
  	"kutipan" varchar NOT NULL,
  	"inisial" varchar,
  	"rating" numeric DEFAULT 5,
  	"urutan" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mitra" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"urutan" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pesan_kontak" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"bisnis" varchar,
  	"email" varchar NOT NULL,
  	"whatsapp" varchar NOT NULL,
  	"topik" varchar NOT NULL,
  	"pesan" varchar NOT NULL,
  	"status" "enum_pesan_kontak_status" DEFAULT 'baru',
  	"meta_ip" varchar,
  	"meta_user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"layanan_id" integer,
  	"kategori_id" integer,
  	"artikel_id" integer,
  	"tim_id" integer,
  	"testimoni_id" integer,
  	"mitra_id" integer,
  	"pesan_kontak_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pengaturan_situs_jam_operasional" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hari" varchar NOT NULL,
  	"jam" varchar NOT NULL
  );
  
  CREATE TABLE "pengaturan_situs_topik_konsultasi" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"teks" varchar NOT NULL
  );
  
  CREATE TABLE "pengaturan_situs_navigasi" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "pengaturan_situs_sosial" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_pengaturan_situs_sosial_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "pengaturan_situs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"subjudul" varchar,
  	"deskripsi" varchar,
  	"whatsapp_url" varchar,
  	"telepon" varchar,
  	"email" varchar,
  	"alamat" varchar,
  	"seo_judul" varchar,
  	"seo_deskripsi" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "layanan_paket_fitur" ADD CONSTRAINT "layanan_paket_fitur_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."layanan_paket"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "layanan_paket" ADD CONSTRAINT "layanan_paket_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "layanan_faq" ADD CONSTRAINT "layanan_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "layanan" ADD CONSTRAINT "layanan_gambar_id_media_id_fk" FOREIGN KEY ("gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "layanan" ADD CONSTRAINT "layanan_seo_gambar_id_media_id_fk" FOREIGN KEY ("seo_gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_layanan_v_version_paket_fitur" ADD CONSTRAINT "_layanan_v_version_paket_fitur_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_layanan_v_version_paket"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_layanan_v_version_paket" ADD CONSTRAINT "_layanan_v_version_paket_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_layanan_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_layanan_v_version_faq" ADD CONSTRAINT "_layanan_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_layanan_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_layanan_v" ADD CONSTRAINT "_layanan_v_parent_id_layanan_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."layanan"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_layanan_v" ADD CONSTRAINT "_layanan_v_version_gambar_id_media_id_fk" FOREIGN KEY ("version_gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_layanan_v" ADD CONSTRAINT "_layanan_v_version_seo_gambar_id_media_id_fk" FOREIGN KEY ("version_seo_gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artikel_tag" ADD CONSTRAINT "artikel_tag_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artikel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artikel_blocks_paragraf" ADD CONSTRAINT "artikel_blocks_paragraf_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artikel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artikel_blocks_judul_bagian" ADD CONSTRAINT "artikel_blocks_judul_bagian_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artikel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artikel_blocks_daftar_item" ADD CONSTRAINT "artikel_blocks_daftar_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artikel_blocks_daftar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artikel_blocks_daftar" ADD CONSTRAINT "artikel_blocks_daftar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artikel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artikel" ADD CONSTRAINT "artikel_sampul_id_media_id_fk" FOREIGN KEY ("sampul_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artikel" ADD CONSTRAINT "artikel_kategori_id_kategori_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artikel" ADD CONSTRAINT "artikel_penulis_id_users_id_fk" FOREIGN KEY ("penulis_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artikel" ADD CONSTRAINT "artikel_seo_gambar_id_media_id_fk" FOREIGN KEY ("seo_gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_artikel_v_version_tag" ADD CONSTRAINT "_artikel_v_version_tag_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_artikel_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_artikel_v_blocks_paragraf" ADD CONSTRAINT "_artikel_v_blocks_paragraf_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_artikel_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_artikel_v_blocks_judul_bagian" ADD CONSTRAINT "_artikel_v_blocks_judul_bagian_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_artikel_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_artikel_v_blocks_daftar_item" ADD CONSTRAINT "_artikel_v_blocks_daftar_item_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_artikel_v_blocks_daftar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_artikel_v_blocks_daftar" ADD CONSTRAINT "_artikel_v_blocks_daftar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_artikel_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_artikel_v" ADD CONSTRAINT "_artikel_v_parent_id_artikel_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artikel"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_artikel_v" ADD CONSTRAINT "_artikel_v_version_sampul_id_media_id_fk" FOREIGN KEY ("version_sampul_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_artikel_v" ADD CONSTRAINT "_artikel_v_version_kategori_id_kategori_id_fk" FOREIGN KEY ("version_kategori_id") REFERENCES "public"."kategori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_artikel_v" ADD CONSTRAINT "_artikel_v_version_penulis_id_users_id_fk" FOREIGN KEY ("version_penulis_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_artikel_v" ADD CONSTRAINT "_artikel_v_version_seo_gambar_id_media_id_fk" FOREIGN KEY ("version_seo_gambar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tim" ADD CONSTRAINT "tim_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mitra" ADD CONSTRAINT "mitra_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_layanan_fk" FOREIGN KEY ("layanan_id") REFERENCES "public"."layanan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kategori_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artikel_fk" FOREIGN KEY ("artikel_id") REFERENCES "public"."artikel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tim_fk" FOREIGN KEY ("tim_id") REFERENCES "public"."tim"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimoni_fk" FOREIGN KEY ("testimoni_id") REFERENCES "public"."testimoni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mitra_fk" FOREIGN KEY ("mitra_id") REFERENCES "public"."mitra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pesan_kontak_fk" FOREIGN KEY ("pesan_kontak_id") REFERENCES "public"."pesan_kontak"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pengaturan_situs_jam_operasional" ADD CONSTRAINT "pengaturan_situs_jam_operasional_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pengaturan_situs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pengaturan_situs_topik_konsultasi" ADD CONSTRAINT "pengaturan_situs_topik_konsultasi_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pengaturan_situs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pengaturan_situs_navigasi" ADD CONSTRAINT "pengaturan_situs_navigasi_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pengaturan_situs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pengaturan_situs_sosial" ADD CONSTRAINT "pengaturan_situs_sosial_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pengaturan_situs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_kartu_sizes_kartu_filename_idx" ON "media" USING btree ("sizes_kartu_filename");
  CREATE INDEX "media_sizes_sampul_sizes_sampul_filename_idx" ON "media" USING btree ("sizes_sampul_filename");
  CREATE INDEX "media_sizes_kecil_sizes_kecil_filename_idx" ON "media" USING btree ("sizes_kecil_filename");
  CREATE INDEX "layanan_paket_fitur_order_idx" ON "layanan_paket_fitur" USING btree ("_order");
  CREATE INDEX "layanan_paket_fitur_parent_id_idx" ON "layanan_paket_fitur" USING btree ("_parent_id");
  CREATE INDEX "layanan_paket_order_idx" ON "layanan_paket" USING btree ("_order");
  CREATE INDEX "layanan_paket_parent_id_idx" ON "layanan_paket" USING btree ("_parent_id");
  CREATE INDEX "layanan_faq_order_idx" ON "layanan_faq" USING btree ("_order");
  CREATE INDEX "layanan_faq_parent_id_idx" ON "layanan_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "layanan_slug_idx" ON "layanan" USING btree ("slug");
  CREATE INDEX "layanan_gambar_idx" ON "layanan" USING btree ("gambar_id");
  CREATE INDEX "layanan_seo_seo_gambar_idx" ON "layanan" USING btree ("seo_gambar_id");
  CREATE INDEX "layanan_updated_at_idx" ON "layanan" USING btree ("updated_at");
  CREATE INDEX "layanan_created_at_idx" ON "layanan" USING btree ("created_at");
  CREATE INDEX "layanan__status_idx" ON "layanan" USING btree ("_status");
  CREATE INDEX "_layanan_v_version_paket_fitur_order_idx" ON "_layanan_v_version_paket_fitur" USING btree ("_order");
  CREATE INDEX "_layanan_v_version_paket_fitur_parent_id_idx" ON "_layanan_v_version_paket_fitur" USING btree ("_parent_id");
  CREATE INDEX "_layanan_v_version_paket_order_idx" ON "_layanan_v_version_paket" USING btree ("_order");
  CREATE INDEX "_layanan_v_version_paket_parent_id_idx" ON "_layanan_v_version_paket" USING btree ("_parent_id");
  CREATE INDEX "_layanan_v_version_faq_order_idx" ON "_layanan_v_version_faq" USING btree ("_order");
  CREATE INDEX "_layanan_v_version_faq_parent_id_idx" ON "_layanan_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_layanan_v_parent_idx" ON "_layanan_v" USING btree ("parent_id");
  CREATE INDEX "_layanan_v_version_version_slug_idx" ON "_layanan_v" USING btree ("version_slug");
  CREATE INDEX "_layanan_v_version_version_gambar_idx" ON "_layanan_v" USING btree ("version_gambar_id");
  CREATE INDEX "_layanan_v_version_seo_version_seo_gambar_idx" ON "_layanan_v" USING btree ("version_seo_gambar_id");
  CREATE INDEX "_layanan_v_version_version_updated_at_idx" ON "_layanan_v" USING btree ("version_updated_at");
  CREATE INDEX "_layanan_v_version_version_created_at_idx" ON "_layanan_v" USING btree ("version_created_at");
  CREATE INDEX "_layanan_v_version_version__status_idx" ON "_layanan_v" USING btree ("version__status");
  CREATE INDEX "_layanan_v_created_at_idx" ON "_layanan_v" USING btree ("created_at");
  CREATE INDEX "_layanan_v_updated_at_idx" ON "_layanan_v" USING btree ("updated_at");
  CREATE INDEX "_layanan_v_latest_idx" ON "_layanan_v" USING btree ("latest");
  CREATE UNIQUE INDEX "kategori_slug_idx" ON "kategori" USING btree ("slug");
  CREATE INDEX "kategori_updated_at_idx" ON "kategori" USING btree ("updated_at");
  CREATE INDEX "kategori_created_at_idx" ON "kategori" USING btree ("created_at");
  CREATE INDEX "artikel_tag_order_idx" ON "artikel_tag" USING btree ("_order");
  CREATE INDEX "artikel_tag_parent_id_idx" ON "artikel_tag" USING btree ("_parent_id");
  CREATE INDEX "artikel_blocks_paragraf_order_idx" ON "artikel_blocks_paragraf" USING btree ("_order");
  CREATE INDEX "artikel_blocks_paragraf_parent_id_idx" ON "artikel_blocks_paragraf" USING btree ("_parent_id");
  CREATE INDEX "artikel_blocks_paragraf_path_idx" ON "artikel_blocks_paragraf" USING btree ("_path");
  CREATE INDEX "artikel_blocks_judul_bagian_order_idx" ON "artikel_blocks_judul_bagian" USING btree ("_order");
  CREATE INDEX "artikel_blocks_judul_bagian_parent_id_idx" ON "artikel_blocks_judul_bagian" USING btree ("_parent_id");
  CREATE INDEX "artikel_blocks_judul_bagian_path_idx" ON "artikel_blocks_judul_bagian" USING btree ("_path");
  CREATE INDEX "artikel_blocks_daftar_item_order_idx" ON "artikel_blocks_daftar_item" USING btree ("_order");
  CREATE INDEX "artikel_blocks_daftar_item_parent_id_idx" ON "artikel_blocks_daftar_item" USING btree ("_parent_id");
  CREATE INDEX "artikel_blocks_daftar_order_idx" ON "artikel_blocks_daftar" USING btree ("_order");
  CREATE INDEX "artikel_blocks_daftar_parent_id_idx" ON "artikel_blocks_daftar" USING btree ("_parent_id");
  CREATE INDEX "artikel_blocks_daftar_path_idx" ON "artikel_blocks_daftar" USING btree ("_path");
  CREATE UNIQUE INDEX "artikel_slug_idx" ON "artikel" USING btree ("slug");
  CREATE INDEX "artikel_sampul_idx" ON "artikel" USING btree ("sampul_id");
  CREATE INDEX "artikel_kategori_idx" ON "artikel" USING btree ("kategori_id");
  CREATE INDEX "artikel_penulis_idx" ON "artikel" USING btree ("penulis_id");
  CREATE INDEX "artikel_seo_seo_gambar_idx" ON "artikel" USING btree ("seo_gambar_id");
  CREATE INDEX "artikel_updated_at_idx" ON "artikel" USING btree ("updated_at");
  CREATE INDEX "artikel_created_at_idx" ON "artikel" USING btree ("created_at");
  CREATE INDEX "artikel__status_idx" ON "artikel" USING btree ("_status");
  CREATE INDEX "_artikel_v_version_tag_order_idx" ON "_artikel_v_version_tag" USING btree ("_order");
  CREATE INDEX "_artikel_v_version_tag_parent_id_idx" ON "_artikel_v_version_tag" USING btree ("_parent_id");
  CREATE INDEX "_artikel_v_blocks_paragraf_order_idx" ON "_artikel_v_blocks_paragraf" USING btree ("_order");
  CREATE INDEX "_artikel_v_blocks_paragraf_parent_id_idx" ON "_artikel_v_blocks_paragraf" USING btree ("_parent_id");
  CREATE INDEX "_artikel_v_blocks_paragraf_path_idx" ON "_artikel_v_blocks_paragraf" USING btree ("_path");
  CREATE INDEX "_artikel_v_blocks_judul_bagian_order_idx" ON "_artikel_v_blocks_judul_bagian" USING btree ("_order");
  CREATE INDEX "_artikel_v_blocks_judul_bagian_parent_id_idx" ON "_artikel_v_blocks_judul_bagian" USING btree ("_parent_id");
  CREATE INDEX "_artikel_v_blocks_judul_bagian_path_idx" ON "_artikel_v_blocks_judul_bagian" USING btree ("_path");
  CREATE INDEX "_artikel_v_blocks_daftar_item_order_idx" ON "_artikel_v_blocks_daftar_item" USING btree ("_order");
  CREATE INDEX "_artikel_v_blocks_daftar_item_parent_id_idx" ON "_artikel_v_blocks_daftar_item" USING btree ("_parent_id");
  CREATE INDEX "_artikel_v_blocks_daftar_order_idx" ON "_artikel_v_blocks_daftar" USING btree ("_order");
  CREATE INDEX "_artikel_v_blocks_daftar_parent_id_idx" ON "_artikel_v_blocks_daftar" USING btree ("_parent_id");
  CREATE INDEX "_artikel_v_blocks_daftar_path_idx" ON "_artikel_v_blocks_daftar" USING btree ("_path");
  CREATE INDEX "_artikel_v_parent_idx" ON "_artikel_v" USING btree ("parent_id");
  CREATE INDEX "_artikel_v_version_version_slug_idx" ON "_artikel_v" USING btree ("version_slug");
  CREATE INDEX "_artikel_v_version_version_sampul_idx" ON "_artikel_v" USING btree ("version_sampul_id");
  CREATE INDEX "_artikel_v_version_version_kategori_idx" ON "_artikel_v" USING btree ("version_kategori_id");
  CREATE INDEX "_artikel_v_version_version_penulis_idx" ON "_artikel_v" USING btree ("version_penulis_id");
  CREATE INDEX "_artikel_v_version_seo_version_seo_gambar_idx" ON "_artikel_v" USING btree ("version_seo_gambar_id");
  CREATE INDEX "_artikel_v_version_version_updated_at_idx" ON "_artikel_v" USING btree ("version_updated_at");
  CREATE INDEX "_artikel_v_version_version_created_at_idx" ON "_artikel_v" USING btree ("version_created_at");
  CREATE INDEX "_artikel_v_version_version__status_idx" ON "_artikel_v" USING btree ("version__status");
  CREATE INDEX "_artikel_v_created_at_idx" ON "_artikel_v" USING btree ("created_at");
  CREATE INDEX "_artikel_v_updated_at_idx" ON "_artikel_v" USING btree ("updated_at");
  CREATE INDEX "_artikel_v_latest_idx" ON "_artikel_v" USING btree ("latest");
  CREATE INDEX "tim_foto_idx" ON "tim" USING btree ("foto_id");
  CREATE INDEX "tim_updated_at_idx" ON "tim" USING btree ("updated_at");
  CREATE INDEX "tim_created_at_idx" ON "tim" USING btree ("created_at");
  CREATE INDEX "testimoni_updated_at_idx" ON "testimoni" USING btree ("updated_at");
  CREATE INDEX "testimoni_created_at_idx" ON "testimoni" USING btree ("created_at");
  CREATE INDEX "mitra_logo_idx" ON "mitra" USING btree ("logo_id");
  CREATE INDEX "mitra_updated_at_idx" ON "mitra" USING btree ("updated_at");
  CREATE INDEX "mitra_created_at_idx" ON "mitra" USING btree ("created_at");
  CREATE INDEX "pesan_kontak_updated_at_idx" ON "pesan_kontak" USING btree ("updated_at");
  CREATE INDEX "pesan_kontak_created_at_idx" ON "pesan_kontak" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_layanan_id_idx" ON "payload_locked_documents_rels" USING btree ("layanan_id");
  CREATE INDEX "payload_locked_documents_rels_kategori_id_idx" ON "payload_locked_documents_rels" USING btree ("kategori_id");
  CREATE INDEX "payload_locked_documents_rels_artikel_id_idx" ON "payload_locked_documents_rels" USING btree ("artikel_id");
  CREATE INDEX "payload_locked_documents_rels_tim_id_idx" ON "payload_locked_documents_rels" USING btree ("tim_id");
  CREATE INDEX "payload_locked_documents_rels_testimoni_id_idx" ON "payload_locked_documents_rels" USING btree ("testimoni_id");
  CREATE INDEX "payload_locked_documents_rels_mitra_id_idx" ON "payload_locked_documents_rels" USING btree ("mitra_id");
  CREATE INDEX "payload_locked_documents_rels_pesan_kontak_id_idx" ON "payload_locked_documents_rels" USING btree ("pesan_kontak_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "pengaturan_situs_jam_operasional_order_idx" ON "pengaturan_situs_jam_operasional" USING btree ("_order");
  CREATE INDEX "pengaturan_situs_jam_operasional_parent_id_idx" ON "pengaturan_situs_jam_operasional" USING btree ("_parent_id");
  CREATE INDEX "pengaturan_situs_topik_konsultasi_order_idx" ON "pengaturan_situs_topik_konsultasi" USING btree ("_order");
  CREATE INDEX "pengaturan_situs_topik_konsultasi_parent_id_idx" ON "pengaturan_situs_topik_konsultasi" USING btree ("_parent_id");
  CREATE INDEX "pengaturan_situs_navigasi_order_idx" ON "pengaturan_situs_navigasi" USING btree ("_order");
  CREATE INDEX "pengaturan_situs_navigasi_parent_id_idx" ON "pengaturan_situs_navigasi" USING btree ("_parent_id");
  CREATE INDEX "pengaturan_situs_sosial_order_idx" ON "pengaturan_situs_sosial" USING btree ("_order");
  CREATE INDEX "pengaturan_situs_sosial_parent_id_idx" ON "pengaturan_situs_sosial" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "layanan_paket_fitur" CASCADE;
  DROP TABLE "layanan_paket" CASCADE;
  DROP TABLE "layanan_faq" CASCADE;
  DROP TABLE "layanan" CASCADE;
  DROP TABLE "_layanan_v_version_paket_fitur" CASCADE;
  DROP TABLE "_layanan_v_version_paket" CASCADE;
  DROP TABLE "_layanan_v_version_faq" CASCADE;
  DROP TABLE "_layanan_v" CASCADE;
  DROP TABLE "kategori" CASCADE;
  DROP TABLE "artikel_tag" CASCADE;
  DROP TABLE "artikel_blocks_paragraf" CASCADE;
  DROP TABLE "artikel_blocks_judul_bagian" CASCADE;
  DROP TABLE "artikel_blocks_daftar_item" CASCADE;
  DROP TABLE "artikel_blocks_daftar" CASCADE;
  DROP TABLE "artikel" CASCADE;
  DROP TABLE "_artikel_v_version_tag" CASCADE;
  DROP TABLE "_artikel_v_blocks_paragraf" CASCADE;
  DROP TABLE "_artikel_v_blocks_judul_bagian" CASCADE;
  DROP TABLE "_artikel_v_blocks_daftar_item" CASCADE;
  DROP TABLE "_artikel_v_blocks_daftar" CASCADE;
  DROP TABLE "_artikel_v" CASCADE;
  DROP TABLE "tim" CASCADE;
  DROP TABLE "testimoni" CASCADE;
  DROP TABLE "mitra" CASCADE;
  DROP TABLE "pesan_kontak" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "pengaturan_situs_jam_operasional" CASCADE;
  DROP TABLE "pengaturan_situs_topik_konsultasi" CASCADE;
  DROP TABLE "pengaturan_situs_navigasi" CASCADE;
  DROP TABLE "pengaturan_situs_sosial" CASCADE;
  DROP TABLE "pengaturan_situs" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_layanan_status";
  DROP TYPE "public"."enum__layanan_v_version_status";
  DROP TYPE "public"."enum_artikel_blocks_judul_bagian_level";
  DROP TYPE "public"."enum_artikel_status";
  DROP TYPE "public"."enum__artikel_v_blocks_judul_bagian_level";
  DROP TYPE "public"."enum__artikel_v_version_status";
  DROP TYPE "public"."enum_tim_level";
  DROP TYPE "public"."enum_pesan_kontak_status";
  DROP TYPE "public"."enum_pengaturan_situs_sosial_platform";`)
}
