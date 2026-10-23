"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { Payload } from "payload";

import { getClient } from "@/lib/payload";
import { perbaruiKonten } from "@/cms/revalidate";
import { verifikasiIzinEditor } from "./puck/permissions";
import { validasiHomepageLayout } from "./schema";
import type { LayoutPuck } from "./puck/types";
import { layoutDefault } from "@/puck/default-layouts";

export type HasilAksiHomepage =
  | { ok: true; revision: number; updatedAt: string; terbit?: boolean }
  | { ok: false; error: string };

async function dapatkanPayloadDanUser(): Promise<{ payload: Payload; userId: number | string }> {
  const payload = await getClient();
  const { user } = await payload.auth({
    headers: (await headers()) as unknown as Headers,
  });
  if (!user) {
    throw new Error("Anda harus masuk untuk menyunting layout.");
  }
  verifikasiIzinEditor(user);
  return { payload, userId: user.id };
}

async function dapatkanDokumenHomepage(payload: Payload) {
  const pageKey = "beranda";
  const ada = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: pageKey } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  const adaId = ada.docs[0] && (ada.docs[0] as { id?: unknown }).id != null;
  if (adaId) return ada.docs[0];

  const awal = layoutDefault(pageKey) ?? { root: {}, content: [] };
  return payload.create({
    collection: "page-layouts",
    data: {
      pageKey,
      judul: "Beranda",
      rute: "/",
      layout: awal,
      revision: 0,
    } as never,
    draft: true,
    overrideAccess: true,
  });
}

/**
 * Simpan draft layout homepage tanpa memublikasikannya ke publik.
 */
export async function simpanHomepageDraft(
  layout: LayoutPuck,
  currentRevision: number,
): Promise<HasilAksiHomepage> {
  try {
    const validasi = validasiHomepageLayout(layout);
    if (!validasi.ok) return { ok: false, error: validasi.error };

    const { payload } = await dapatkanPayloadDanUser();
    const dok = await dapatkanDokumenHomepage(payload);

    const update = (await payload.update({
      collection: "page-layouts",
      id: dok.id,
      data: {
        layout: validasi.data,
        revision: currentRevision,
      } as never,
      draft: true,
      overrideAccess: true,
      context: { pageBuilderDraft: true },
    })) as { revision?: number; updatedAt?: string };

    // Draft tidak mengubah halaman publik; preview membaca DB langsung.
    revalidatePath("/pratinjau/beranda");

    return {
      ok: true,
      revision: typeof update.revision === "number" ? update.revision : currentRevision + 1,
      updatedAt: update.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan draft.",
    };
  }
}

/**
 * Terbitkan layout homepage ke halaman publik.
 */
export async function terbitkanHomepage(
  layout: LayoutPuck,
  currentRevision: number,
): Promise<HasilAksiHomepage> {
  try {
    const validasi = validasiHomepageLayout(layout);
    if (!validasi.ok) return { ok: false, error: validasi.error };
    if (validasi.data.content.length === 0) {
      return {
        ok: false,
        error: "Layout kosong tidak dapat diterbitkan. Tambahkan minimal satu komponen.",
      };
    }

    const { payload, userId } = await dapatkanPayloadDanUser();
    const dok = await dapatkanDokumenHomepage(payload);

    const update = (await payload.update({
      collection: "page-layouts",
      id: dok.id,
      data: {
        layout: validasi.data,
        revision: currentRevision,
        _status: "published",
        publishedAt: new Date().toISOString(),
        publishedBy: userId,
      } as never,
      draft: false,
      overrideAccess: true,
    })) as { revision?: number; updatedAt?: string };

    try {
      await perbaruiKonten("layout:beranda");
      revalidatePath("/");
      revalidatePath("/pratinjau/beranda");
    } catch (error) {
      console.error("[HomepageEditor] Publish tersimpan tetapi invalidasi cache gagal", {
        errorType: error instanceof Error ? error.name : "unknown",
      });
    }

    return {
      ok: true,
      terbit: true,
      revision: typeof update.revision === "number" ? update.revision : currentRevision + 1,
      updatedAt: update.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal menerbitkan layout.",
    };
  }
}
