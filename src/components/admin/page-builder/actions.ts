"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Payload } from "payload";

import { getClient } from "@/lib/payload";
import { layoutDefault } from "@/puck/default-layouts";
import { halamanDariKey, type LayoutPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";

/**
 * Server actions Page Builder.
 *
 * Semua operasi tulis dilakukan di sini (bukan di klien) agar:
 *  - keanggotaan & peran diverifikasi ulang dari cookie Payload;
 *  - layout divalidasi dengan validator server yang sama seperti hook koleksi;
 *  - invalidasi cache konten & rute publik terpusat.
 *
 * Local API sengaja dipanggil dengan `overrideAccess: true` SETELAH
 * pemeriksaan peran manual, supaya hooks koleksi (deteksi konflik revisi &
 * revalidasi) tetap berjalan.
 */

const PERAN_DIIZINKAN = new Set(["admin", "editor"]);

export type HasilSimpan =
  | { ok: true; revision: number; updatedAt: string; terbit?: boolean }
  | { ok: false; error: string };

async function penggunaStaf(): Promise<{ payload: Payload; userId: number | string }> {
  const payload = await getClient();
  const { user } = await payload.auth({
    headers: (await headers()) as unknown as Headers,
  });
  if (!user) {
    throw new Error("Anda harus masuk untuk menyunting layout.");
  }
  const peran = (user as { role?: string }).role;
  if (!peran || !PERAN_DIIZINKAN.has(peran)) {
    throw new Error("Akun ini tidak berwenang menyunting layout.");
  }
  return { payload, userId: user.id };
}

async function dokumenAtauBuat(payload: Payload, pageKey: string) {
  const halaman = halamanDariKey(pageKey);
  if (!halaman) throw new Error(`Halaman "${pageKey}" tidak dikenal.`);

  const ada = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: pageKey } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  if (ada.docs[0]) return ada.docs[0];

  const awal = layoutDefault(pageKey) ?? { root: {}, content: [] };
  return payload.create({
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
  });
}

function pesanError(err: unknown): string {
  const status = (err as { status?: number }).status;
  if (status === 409) {
    return "Layout ini sudah diubah di tempat lain. Muat ulang halaman lalu ulangi.";
  }
  const pesan = err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
  return pesan;
}

/** Simpan perubahan sebagai versi draft (belum tampil di publik). */
export async function simpanDraft(
  pageKey: string,
  layout: LayoutPuck,
  revision: number,
): Promise<HasilSimpan> {
  try {
    const { payload } = await penggunaStaf();
    const valid = validasiLayoutPuck(layout);
    if (!valid.ok) return { ok: false, error: valid.error };

    const doc = await dokumenAtauBuat(payload, pageKey);
    const updated = await payload.update({
      collection: "page-layouts",
      id: doc.id,
      data: { layout: valid.data, revision } as never,
      draft: true,
      overrideAccess: true,
    });

    return {
      ok: true,
      revision: (updated as { revision?: number }).revision ?? 0,
      updatedAt: (updated as { updatedAt?: string }).updatedAt ?? "",
    };
  } catch (err) {
    return { ok: false, error: pesanError(err) };
  }
}

/** Terbitkan layout sehingga tampil di halaman publik. */
export async function terbitkanLayout(
  pageKey: string,
  layout: LayoutPuck,
  revision: number,
): Promise<HasilSimpan> {
  try {
    const { payload, userId } = await penggunaStaf();
    const valid = validasiLayoutPuck(layout);
    if (!valid.ok) return { ok: false, error: valid.error };

    const halaman = halamanDariKey(pageKey);
    if (!halaman) return { ok: false, error: `Halaman "${pageKey}" tidak dikenal.` };

    const doc = await dokumenAtauBuat(payload, pageKey);
    const updated = await payload.update({
      collection: "page-layouts",
      id: doc.id,
      data: {
        layout: valid.data,
        revision,
        _status: "published",
        publishedAt: new Date().toISOString(),
        publishedBy: userId,
      } as never,
      draft: false,
      overrideAccess: true,
    });

    revalidatePath(halaman.rute);
    revalidatePath(`/pratinjau/${pageKey}`);

    return {
      ok: true,
      revision: (updated as { revision?: number }).revision ?? 0,
      updatedAt: (updated as { updatedAt?: string }).updatedAt ?? "",
      terbit: true,
    };
  } catch (err) {
    return { ok: false, error: pesanError(err) };
  }
}
