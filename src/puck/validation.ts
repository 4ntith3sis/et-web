import { NAMA_KOMPONEN_PUCK, type LayoutPuck } from "./types";

/**
 * Validasi layout Puck di sisi server (tanpa React/DOM).
 *
 * Dipakai dua kali: sebagai hook `beforeChange` pada koleksi `page-layouts`
 * dan di dalam server action sebelum menulis. Tujuannya menjaga agar hanya
 * struktur JSON yang dikenal (komponen dari registry, id unik, ukuran wajar)
 * yang bisa masuk database — sekaligus menutup risiko prototype pollution
 * lewat payload JSON dari klien.
 *
 * Komponen bersarang (slot `konten` pada Section/Grid/Row/…) ikut divalidasi
 * secara rekursif, jadi komponen tak dikenal tidak bisa diselundupkan lewat
 * slot.
 */

const BATAS_UKURAN = 512 * 1024; // 512 KB
const BATAS_KOMPONEN = 600;
const BATAS_KEDALAMAN = 24;
const KUNCI_TERLARANG = new Set(["__proto__", "constructor", "prototype"]);

export type HasilValidasi =
  | { ok: true; data: LayoutPuck }
  | { ok: false; error: string };

class ValidasiGagal extends Error {}

function tolak(pesan: string): never {
  throw new ValidasiGagal(pesan);
}

function adaKunciTerlarang(nilai: unknown, kedalaman = 0): boolean {
  if (kedalaman > BATAS_KEDALAMAN) return true;
  if (Array.isArray(nilai)) {
    return nilai.some((n) => adaKunciTerlarang(n, kedalaman + 1));
  }
  if (nilai && typeof nilai === "object") {
    for (const kunci of Object.keys(nilai as Record<string, unknown>)) {
      if (KUNCI_TERLARANG.has(kunci)) return true;
      if (adaKunciTerlarang((nilai as Record<string, unknown>)[kunci], kedalaman + 1)) {
        return true;
      }
    }
  }
  return false;
}

/** Objek yang berbentuk entri komponen Puck (`{ type, props }`). */
function miripKomponen(nilai: unknown): nilai is Record<string, unknown> {
  if (!nilai || typeof nilai !== "object" || Array.isArray(nilai)) return false;
  const obj = nilai as Record<string, unknown>;
  return typeof obj.type === "string" && Boolean(obj.props) && typeof obj.props === "object" && !Array.isArray(obj.props);
}

type Konteks = { id: Set<string>; jumlah: number };

function validasiKomponen(mentah: unknown, ctx: Konteks, kedalaman: number): Record<string, unknown> {
  if (kedalaman > BATAS_KEDALAMAN) tolak("Struktur komponen terlalu dalam.");
  if (!mentah || typeof mentah !== "object" || Array.isArray(mentah)) {
    tolak("Setiap komponen harus berupa objek.");
  }
  const komponen = mentah as Record<string, unknown>;
  const tipe = komponen.type;
  if (typeof tipe !== "string" || !NAMA_KOMPONEN_PUCK.includes(tipe as never)) {
    tolak(`Tipe komponen tidak dikenal: ${String(tipe)}.`);
  }
  const props = komponen.props;
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    tolak(`Komponen ${tipe} tidak memiliki props.`);
  }
  const id = (props as Record<string, unknown>).id;
  if (typeof id !== "string" || id.length === 0) {
    tolak(`Komponen ${tipe} tidak memiliki id.`);
  }
  if (ctx.id.has(id)) tolak(`Id komponen duplikat: ${id}.`);
  ctx.id.add(id);

  ctx.jumlah += 1;
  if (ctx.jumlah > BATAS_KOMPONEN) tolak("Terlalu banyak komponen dalam satu layout.");

  return {
    type: tipe,
    props: bersihkanNilai(props as Record<string, unknown>, ctx, kedalaman + 1) as Record<string, unknown>,
  };
}

/** Bersihkan nilai secara rekursif; slot (array komponen) divalidasi. */
function bersihkanNilai(nilai: unknown, ctx: Konteks, kedalaman: number): unknown {
  if (kedalaman > BATAS_KEDALAMAN) tolak("Struktur layout terlalu dalam.");

  if (Array.isArray(nilai)) {
    return nilai.map((item) =>
      miripKomponen(item) ? validasiKomponen(item, ctx, kedalaman + 1) : bersihkanNilai(item, ctx, kedalaman + 1),
    );
  }

  if (nilai && typeof nilai === "object") {
    if (miripKomponen(nilai)) return validasiKomponen(nilai, ctx, kedalaman + 1);
    const keluar: Record<string, unknown> = {};
    for (const [kunci, isi] of Object.entries(nilai as Record<string, unknown>)) {
      if (KUNCI_TERLARANG.has(kunci)) continue;
      keluar[kunci] = bersihkanNilai(isi, ctx, kedalaman + 1);
    }
    return keluar;
  }

  return nilai;
}

/**
 * Memvalidasi dan menormalkan layout.
 *
 * Menerima `unknown` karena sumbernya bisa berupa kolom JSON database,
 * argumen server action, atau body request. Selalu mengembalikan salinan
 * bebas-prototipe yang aman disimpan/dirender.
 */
export function validasiLayoutPuck(input: unknown): HasilValidasi {
  try {
    return validasiDalam(input);
  } catch (err) {
    if (err instanceof ValidasiGagal) return { ok: false, error: err.message };
    return { ok: false, error: "Layout tidak valid." };
  }
}

function validasiDalam(input: unknown): HasilValidasi {
  if (typeof input === "string") {
    if (input.length > BATAS_UKURAN) return { ok: false, error: "Layout terlalu besar." };
    try {
      return validasiDalam(JSON.parse(input));
    } catch {
      return { ok: false, error: "Layout bukan JSON yang valid." };
    }
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Layout harus berupa objek." };
  }

  let ukuranJson: number;
  try {
    ukuranJson = JSON.stringify(input).length;
  } catch {
    return { ok: false, error: "Layout tidak dapat diserialisasi." };
  }
  if (ukuranJson > BATAS_UKURAN) {
    return { ok: false, error: "Layout melebihi batas ukuran 512 KB." };
  }
  if (adaKunciTerlarang(input)) {
    return { ok: false, error: "Layout memuat kunci yang tidak diizinkan." };
  }

  const objek = input as Record<string, unknown>;
  const konten = objek.content;
  if (!Array.isArray(konten)) {
    return { ok: false, error: "Layout wajib memiliki array `content`." };
  }
  if (konten.length > BATAS_KOMPONEN) {
    return { ok: false, error: "Terlalu banyak komponen dalam satu layout." };
  }

  const ctx: Konteks = { id: new Set<string>(), jumlah: 0 };
  const kontenNormal: unknown[] = [];

  for (const item of konten) {
    if (!miripKomponen(item)) {
      return { ok: false, error: "Setiap komponen harus berupa objek." };
    }
    kontenNormal.push(validasiKomponen(item, ctx, 0));
  }

  const rootMentah = objek.root;
  const root =
    rootMentah && typeof rootMentah === "object" && !Array.isArray(rootMentah)
      ? (salinBersih(rootMentah as Record<string, unknown>) as LayoutPuck["root"])
      : ({} as LayoutPuck["root"]);

  const hasil: LayoutPuck = {
    root,
    content: kontenNormal,
  } as LayoutPuck;

  if (objek.zones && typeof objek.zones === "object" && !Array.isArray(objek.zones)) {
    hasil.zones = salinBersih(objek.zones as Record<string, unknown>) as unknown as LayoutPuck["zones"];
  }

  return { ok: true, data: hasil };
}

/** Salinan rekursif dengan prototipe bersih (tanpa `__proto__`/fungsi). */
function salinBersih<T>(nilai: T): T {
  if (Array.isArray(nilai)) {
    return nilai.map((n) => salinBersih(n)) as unknown as T;
  }
  if (nilai && typeof nilai === "object") {
    const keluar: Record<string, unknown> = {};
    for (const [kunci, isi] of Object.entries(nilai as Record<string, unknown>)) {
      if (KUNCI_TERLARANG.has(kunci)) continue;
      keluar[kunci] = salinBersih(isi);
    }
    return keluar as T;
  }
  return nilai;
}
