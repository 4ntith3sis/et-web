/**
 * Normalisasi string menjadi slug URL yang bersih (kebab-case lowercase).
 */
export function formatSlug(teks?: string | null): string {
  if (!teks) return "";
  return teks
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const buatSlug = formatSlug;
