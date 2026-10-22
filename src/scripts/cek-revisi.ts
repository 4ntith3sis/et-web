import { getPayload } from "payload";

import config from "../payload.config";
import { HALAMAN_PUCK } from "../puck/types";

/**
 * Meniru query yang dipakai editor (`ViewEditor`) dan membandingkannya dengan
 * baris utama dokumen — untuk mendeteksi risiko konflik revisi (409) saat
 * tombol Publish ditekan.
 */
const payload = await getPayload({ config });

console.log(
  "page key | editor memuat rev | baris utama rev | status main | status versi | risiko 409",
);

for (const h of Object.values(HALAMAN_PUCK)) {
  const key = h.key;

  // query editor (draft: true) -> dokumen utama + data versi terbaru
  const editor = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: key } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const dok = editor.docs[0] as
    | { id?: number; revision?: number; _status?: string; version?: { status?: string; revision?: number } }
    | undefined;

  // baris utama apa adanya (tanpa merge versi)
  const main = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: key } },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: true,
  });
  const baris = main.docs[0] as { revision?: number; _status?: string } | undefined;

  const revEditor = dok?.revision ?? -1;
  const revMain = baris?.revision ?? -1;
  const risiko = revEditor !== revMain ? "YA (editor !== main)" : "tidak";

  console.log(
    [
      key,
      `${revEditor} (versi ${dok?.version?.status ?? "-"}@${dok?.version?.revision ?? "-"})`,
      String(revMain),
      String(baris?._status ?? "-"),
      String(dok?._status ?? "-"),
      risiko,
    ].join(" | "),
  );
}

process.exit(0);
