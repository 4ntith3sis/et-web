import { redirect } from "next/navigation";
import { PERAN_DIIZINKAN, punyaPeranStaf } from "./role";

export { PERAN_DIIZINKAN, punyaPeranStaf } from "./role";

/**
 * Penjaga akses untuk view kustom Page Builder.
 *
 * Payload memperlakukan view kustom sebagai rute admin "publik" di level
 * routing (lihat `isCustomAdminView` pada @payloadcms/next), sehingga view
 * bertanggung jawab memverifikasi sendiri bahwa pengguna sudah masuk dan
 * berperan admin/editor sebelum merender apa pun.
 */

export type StafTerautentikasi = { id: number | string; role: string };

/** Hentikan render dan alihkan ke login bila bukan staf berwenang. */
export function stafAtauRedirect(user: unknown, kembalike: string): StafTerautentikasi {
  const kandidat = user as { id?: number | string; role?: string } | undefined;
  if (!kandidat || kandidat.id === undefined) {
    redirect(`/admin/login?redirect=${encodeURIComponent(kembalike)}`);
  }
  if (!punyaPeranStaf(kandidat)) {
    redirect("/admin");
  }
  return { id: kandidat.id, role: kandidat.role };
}

/** Ambil kunci halaman dari segmen rute admin (`/admin/page-builder/:pageKey`). */
export function kunciHalamanDariSegmen(params: unknown): string {
  const segmen = (params as { segments?: unknown } | undefined)?.segments;
  if (Array.isArray(segmen) && typeof segmen[1] === "string") return segmen[1];
  return "";
}
