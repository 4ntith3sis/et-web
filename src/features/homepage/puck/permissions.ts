import { punyaPeranStaf } from "@/lib/auth";

export const PERAN_EDITOR_HOMEPAGE = new Set(["admin", "editor"]);

export function dapatMengeditHomepage(user: unknown): boolean {
  return punyaPeranStaf(user);
}

export function verifikasiIzinEditor(user: unknown): void {
  if (!dapatMengeditHomepage(user)) {
    throw new Error("Akses ditolak: Anda tidak memiliki wewenang untuk menyunting layout beranda.");
  }
}
