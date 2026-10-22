import { getPayload } from "payload";

import config from "../payload.config";
import { DAFTAR_HALAMAN } from "../puck/types";
import { validasiLayoutPuck } from "../puck/validation";

/**
 * Audit status layout Page Builder.
 *
 * Menampilkan kondisi tiap tipe halaman: versi draft terbaru, versi yang
 * sudah terbit, apakah terbaca halaman publik, serta kelayakan layoutnya.
 * Berguna untuk memeriksafondasi setelah seeding atau migrasi.
 *
 * Jalankan: `npm run cms:audit`
 */

const payload = await getPayload({ config });

type Baris = {
  key: string;
  dokumen: string;
  draft: string;
  terbit: string;
  publik: string;
  komponen: number;
  valid: string;
};

const baris: Baris[] = [];

for (const halaman of DAFTAR_HALAMAN) {
  const [draftRes, publikRes] = await Promise.all([
    payload.find({
      collection: "page-layouts",
      where: { pageKey: { equals: halaman.key } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    }),
    payload.find({
      collection: "page-layouts",
      where: {
        pageKey: { equals: halaman.key },
        _status: { equals: "published" },
      },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: false,
    }),
  ]);

  const draft = draftRes.docs[0] as
    | { id?: unknown; _status?: string; revision?: number; layout?: unknown }
    | undefined;
  const publik = publikRes.docs[0] as
    | { _status?: string; revision?: number }
    | undefined;

  const hasil = validasiLayoutPuck(draft?.layout);
  const jumlah = hasil.ok ? hasil.data.content.length : 0;

  baris.push({
    key: halaman.key,
    dokumen: draft?.id != null ? `#${draft.id}` : "tidak ada",
    draft: draft ? `${draft._status} r${draft.revision ?? 0}` : "-",
    terbit: publik ? `${publik._status} r${publik.revision ?? 0}` : "belum terbit",
    publik: publik ? "terbaca" : "fallback statis",
    komponen: jumlah,
    valid: hasil.ok ? "valid" : `INVALID: ${hasil.error}`,
  });
}

const lebar = (teks: string[], judul: string) =>
  Math.max(judul.length, ...teks.map((t) => t.length));

const kolom = [
  ["key", "key"],
  ["dokumen", "dokumen"],
  ["draft", "draft"],
  ["terbit", "terbit"],
  ["publik", "publik"],
  ["komponen", "komponen"],
  ["valid", "valid"],
] as const;

const lebarKolom = kolom.map(([kunci]) =>
  lebar(
    baris.map((b) => String(b[kunci])),
    kunci,
  ),
);

console.log(
  kolom
    .map(([kunci], i) => kunci.padEnd(lebarKolom[i]!))
    .join("  ")
    .trimEnd(),
);
console.log(lebarKolom.map((n) => "-".repeat(n)).join("  "));

for (const b of baris) {
  console.log(
    kolom
      .map(([kunci], i) => String(b[kunci]).padEnd(lebarKolom[i]!))
      .join("  ")
      .trimEnd(),
  );
}

process.exit(0);
