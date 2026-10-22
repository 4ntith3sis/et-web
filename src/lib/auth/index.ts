export const PERAN_DIIZINKAN = new Set(["admin", "editor"]);

export type PeranUser = "admin" | "editor" | undefined;

export function punyaPeranStaf(user: unknown): user is { id: number | string; role: string } {
  const kandidat = user as { id?: number | string; role?: string } | undefined;
  return kandidat?.id !== undefined && !!kandidat.role && PERAN_DIIZINKAN.has(kandidat.role);
}

export function isAdmin(user: unknown): user is { id: number | string; role: "admin" } {
  const kandidat = user as { id?: number | string; role?: string } | undefined;
  return kandidat?.id !== undefined && kandidat.role === "admin";
}

export * from "@/access/index";
