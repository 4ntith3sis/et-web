import {
  NAMA_KOMPONEN_PUCK,
  type LayoutPuck,
} from "./types";

/**
 * Validasi layout Puck di sisi server (tanpa React/DOM).
 *
 * Dipakai dua kali: sebagai `beforeValidate` hook pada koleksi `page-layouts`
 * dan di dalam server action sebelum menulis. Tujuannya menjaga agar hanya
 * struktur JSON yang dikenal (komponen dari registry, id unik, ukuran wajar)
 * yang bisa masuk database — sekaligus menutup risiko prototype pollution
 * lewat payload JSON dari klien.
 */

const BATAS_UKURAN = 512 * 1024; // 512 KB
const BATAS_KOMPONEN = 200;
const KUNCI_TERLARANG = new Set(["__proto__", "constructor", "prototype"]);

export type HasilValidasi =
  | { ok: true; data: LayoutPuck }
  | { ok: false; error: string };

function adaKunciTerlarang(nilai: unknown, kedalaman = 0): boolean {
  if (kedalaman > 12) return true;
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

/**
 * Memvalidasi dan menormalkan layout.
 *
 * Menerima `unknown` karena sumbernya bisa berupa kolom JSON database,
 * argumen server action, atau body request. Selalu mengembalikan salinan
 * bebas-prototipe yang aman disimpan/dirender.
 */
export function validasiLayoutPuck(input: unknown): HasilValidasi {
  if (typeof input === "string") {
    if (input.length > BATAS_UKURAN) return { ok: false, error: "Layout terlalu besar." };
    try {
      return validasiLayoutPuck(JSON.parse(input));
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

  const idTerpakai = new Set<string>();
  const kontenNormal: unknown[] = [];

  for (const item of konten) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ok: false, error: "Setiap komponen harus berupa objek." };
    }
    const komponen = item as Record<string, unknown>;
    const tipe = komponen.type;
    if (typeof tipe !== "string" || !NAMA_KOMPONEN_PUCK.includes(tipe as never)) {
      return { ok: false, error: `Tipe komponen tidak dikenal: ${String(tipe)}.` };
    }
    const props = komponen.props;
    if (!props || typeof props !== "object" || Array.isArray(props)) {
      return { ok: false, error: `Komponen ${tipe} tidak memiliki props.` };
    }
    const id = (props as Record<string, unknown>).id;
    if (typeof id !== "string" || id.length === 0) {
      return { ok: false, error: `Komponen ${tipe} tidak memiliki id.` };
    }
    if (idTerpakai.has(id)) {
      return { ok: false, error: `Id komponen duplikat: ${id}.` };
    }
    idTerpakai.add(id);

    kontenNormal.push({
      type: tipe,
      props: salinBersih(props as Record<string, unknown>),
    });
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
    hasil.zones = salinBersih(
      objek.zones as Record<string, unknown>,
    ) as unknown as LayoutPuck["zones"];
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
