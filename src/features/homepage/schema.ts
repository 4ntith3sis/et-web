import { validasiLayoutPuck, type HasilValidasi } from "@/puck/validation";
import type { LayoutPuck } from "./puck/types";

export type HasilValidasiHomepage = HasilValidasi;

/**
 * Validasi skema layout homepage Puck sebelum disimpan atau dirender.
 */
export function validasiHomepageLayout(input: unknown): HasilValidasi {
  return validasiLayoutPuck(input);
}

export function pastikanLayoutValid(layout: unknown): layout is LayoutPuck {
  const hasil = validasiHomepageLayout(layout);
  return hasil.ok;
}
