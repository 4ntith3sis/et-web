import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

/** Add an optional profile-photo relationship for testimonials. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimoni" ADD COLUMN IF NOT EXISTS "foto_profil_id" integer;
   ALTER TABLE "testimoni" ADD COLUMN IF NOT EXISTS "deskripsi" varchar;
   ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_foto_profil_id_media_id_fk" FOREIGN KEY ("foto_profil_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "testimoni_foto_profil_idx" ON "testimoni" USING btree ("foto_profil_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimoni" DROP CONSTRAINT "testimoni_foto_profil_id_media_id_fk";
   DROP INDEX "testimoni_foto_profil_idx";
   ALTER TABLE "testimoni" DROP COLUMN "foto_profil_id";
   ALTER TABLE "testimoni" DROP COLUMN "deskripsi";`)
}
