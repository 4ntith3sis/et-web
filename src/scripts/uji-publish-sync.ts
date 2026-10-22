import { getPayload } from "payload";

import config from "../payload.config";

/**
 * Uji mekanisme Publish pada dokumen sementara — tanpa menyentuh 7 halaman
 * nyata. Tujuannya: membuktikan bahwa tombol Publish (jalur server action
 * `terbitkanLayout`) menulis baris utama menjadi published dengan revisi
 * yang sama dengan versi terbaru — pola yang gagal pada
 * `template-layanan-detail` (#23) dan `template-artikel-detail` (#24).
 *
 * Dokumen dibuat lalu dihapus kembali; tidak ada data halaman nyata yang
 * berubah.
 */
const payload = await getPayload({ config });

const KUNCI = "__uji-phase2a";
const SUMBER = "template-layanan-detail";

/** Buang sisa dokumen uji sebelumnya (dari percobaan yang gagal). */
async function bersihkan() {
  const sisa = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: KUNCI } },
    limit: 100,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  for (const d of sisa.docs) {
    const id = (d as { id?: number | null }).id;
    if (id == null) continue;
    await payload.delete({ collection: "page-layouts", id, overrideAccess: true });
    console.log("  dihapus sisa dokumen uji id", id);
  }
}

const status = async (id: number) => {
  const main = await payload.find({
    collection: "page-layouts",
    where: { id: { equals: id } },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: true,
  });
  const baris = main.docs[0] as { _status?: string; revision?: number } | undefined;
  const editor = await payload.find({
    collection: "page-layouts",
    where: { id: { equals: id } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const dok = editor.docs[0] as
    | { revision?: number; version?: { status?: string; revision?: number } }
    | undefined;
  return {
    mainStatus: baris?._status ?? "-",
    mainRev: baris?.revision ?? -1,
    editorRev: dok?.revision ?? -1,
    versiStatus: dok?.version?.status ?? "-",
    versiRev: dok?.version?.revision ?? -1,
  };
};

await bersihkan();

const sumber = await payload.find({
  collection: "page-layouts",
  where: { pageKey: { equals: SUMBER } },
  limit: 1,
  depth: 0,
  draft: true,
  overrideAccess: true,
});
const docSumber = sumber.docs[0] as { layout?: unknown };
if (!docSumber?.layout) throw new Error("layout sumber tidak ditemukan");

console.log("\n=== 1. buat dokumen sementara (meniru layout template layanan) ===");
const dibuat = await payload.create({
  collection: "page-layouts",
  data: {
    pageKey: KUNCI,
    judul: "UJI PHASE 2A",
    rute: "/__uji-phase2a",
    layout: docSumber.layout,
  } as never,
  draft: true,
  overrideAccess: true,
});
const id = dibuat.id as number;
console.log("id:", id, JSON.stringify(await status(id)));

console.log("\n=== 2. simpan draft (meniru action `simpanDraft`) ===");
const sebelumDraft = await status(id);
const draft = await payload.update({
  collection: "page-layouts",
  id,
  data: {
    layout: docSumber.layout,
    revision: sebelumDraft.editorRev,
  } as never,
  draft: true,
  overrideAccess: true,
});
console.log(
  "revisi dikirim:",
  sebelumDraft.editorRev,
  "| rev hasil:",
  (draft as { revision?: number }).revision,
  JSON.stringify(await status(id)),
);

console.log("\n=== 3. terbitkan (meniru action `terbitkanLayout`) ===");
const sebelum = await status(id);
const terbit = await payload.update({
  collection: "page-layouts",
  id,
  data: {
    layout: docSumber.layout,
    revision: sebelum.editorRev,
    _status: "published",
    publishedAt: new Date().toISOString(),
  } as never,
  draft: false,
  overrideAccess: true,
});
const sesudah = await status(id);
console.log("revisi dikirim:", sebelum.editorRev, "| rev hasil:", (terbit as { revision?: number }).revision);
console.log("sebelum:", JSON.stringify(sebelum));
console.log("sesudah:", JSON.stringify(sesudah));
console.log(
  sesudah.mainStatus === "published" && sesudah.mainRev === sesudah.editorRev
    ? "=> SINKRON: baris utama published & revisi sama dengan versi terbaru"
    : "=> TIDAK SINKRON",
);

console.log("\n=== 4. hapus dokumen sementara ===");
await payload.delete({ collection: "page-layouts", id, overrideAccess: true });
const sisa = await payload.db.countVersions({
  collection: "page-layouts",
  where: { parent: { equals: id } },
});
console.log("sisa version row untuk parent", id, ":", sisa.totalDocs);

await bersihkan();
process.exit(0);
