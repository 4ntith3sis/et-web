import type { Access, FieldAccess } from "payload";

/**
 * Access control terpusat untuk seluruh koleksi & global.
 *
 * Prinsip: publik hanya boleh membaca konten yang sudah terbit; semua operasi
 * tulis menuntut pengguna admin terautentikasi. Tidak ada kredensial atau
 * data mentah yang dibocorkan ke klien — keputusan akses selalu dievaluasi di
 * server oleh Payload.
 */

type Peran = "admin" | "editor" | undefined;

function peran(user: unknown): Peran {
  if (user && typeof user === "object" && "role" in user) {
    const role = (user as { role?: unknown }).role;
    if (role === "admin" || role === "editor") return role;
  }
  return undefined;
}

/** Siapa pun (termasuk anonim). */
export const siapaSaja: Access = () => true;

/** Hanya pengguna yang sudah login (staf). */
export const sudahLogin: Access = ({ req: { user } }) => Boolean(user);

/** Hanya admin. */
export const adminSaja: Access = ({ req: { user } }) => peran(user) === "admin";

/** Admin atau editor. */
export const stafPenulis: Access = ({ req: { user } }) => {
  const p = peran(user);
  return p === "admin" || p === "editor";
};

/**
 * Baca untuk koleksi ber-`drafts`: anonim hanya melihat yang `published`,
 * pengguna terautentikasi melihat semua (termasuk draft).
 */
export const bacaTerbitAtauStaf: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

/** Anonymous callers may inspect only published snapshots in version history. */
export const bacaVersiTerbitAtauStaf: Access = ({ req: { user } }) => {
  if (user) return true;
  return { "version._status": { equals: "published" } };
};


/** Field-level: hanya admin boleh mengubah field sensitif. */
export const fieldAdminSaja: FieldAccess = ({ req: { user } }) =>
  peran(user) === "admin";

/** Field-level: staf penulis (admin atau editor) boleh membaca/mengubah field sensitif. */
export const fieldStafPenulis: FieldAccess = ({ req: { user } }) => {
  const p = peran(user);
  return p === "admin" || p === "editor";
};
