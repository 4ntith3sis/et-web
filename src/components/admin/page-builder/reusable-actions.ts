"use server";

import { headers } from "next/headers";
import type { Payload } from "payload";

import { getClient } from "@/lib/payload";
import { validasiLayoutPuck } from "@/puck/validation";

const PERAN_DIIZINKAN = new Set(["admin", "editor"]);

async function staf(): Promise<Payload> {
  const payload = await getClient();
  const { user } = await payload.auth({ headers: (await headers()) as unknown as Headers });
  const peran = (user as { role?: string } | null)?.role;
  if (!user || !peran || !PERAN_DIIZINKAN.has(peran)) {
    throw new Error("Tidak berwenang.");
  }
  return payload;
}

export type KomponenUlang = {
  id: string | number;
  nama: string;
  kategori: string;
  deskripsi?: string;
  data: unknown;
};

export async function daftarReusable(): Promise<KomponenUlang[]> {
  const payload = await staf();
  const res = await payload.find({
    collection: "reusable-components",
    limit: 100,
    depth: 0,
    sort: "-updatedAt",
    overrideAccess: true,
  } as any);
  return res.docs.map((d: any) => ({
    id: d.id,
    nama: d.nama ?? "Tanpa nama",
    kategori: d.kategori ?? "Lain-lain",
    deskripsi: d.deskripsi,
    data: d.data,
  }));
}

export async function simpanReusable(input: { nama: string; kategori: string; deskripsi?: string; data: unknown }): Promise<KomponenUlang> {
  const payload = await staf();
  const hasil = validasiLayoutPuck(input.data);
  if (!hasil.ok) throw new Error(hasil.error);
  const doc = await payload.create({
    collection: "reusable-components",
    data: {
      nama: input.nama || "Komponen tanpa nama",
      kategori: input.kategori as any || "Lain-lain",
      deskripsi: input.deskripsi,
      data: hasil.data,
    } as any,
    overrideAccess: true,
  });
  return {
    id: (doc as any).id,
    nama: (doc as any).nama,
    kategori: (doc as any).kategori,
    deskripsi: (doc as any).deskripsi,
    data: (doc as any).data,
  };
}

export async function hapusReusable(id: string | number): Promise<void> {
  const payload = await staf();
  await payload.delete({
    collection: "reusable-components",
    id,
    overrideAccess: true,
  } as any);
}
