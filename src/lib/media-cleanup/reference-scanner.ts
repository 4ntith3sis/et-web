/**
 * Conservative, read-only media reference scanner for Payload's PostgreSQL
 * schema. It intentionally does not infer references from filenames.
 *
 * This module is not wired to hooks or a worker. A caller must supply a
 * read-only SQL executor and a verified media root before using its report.
 * Any missing/unreadable source makes the result RETAIN.
 */
export type MediaReferenceSource = {
  name: string;
  table: string;
  /** SQL fragment selecting rows that reference the supplied media ID. */
  predicate: string;
};

export type ReferenceScanResult = {
  decision: "RETAIN" | "ELIGIBLE";
  candidateMediaID: number;
  references: Array<{ source: string; count: number }>;
  checkedSources: string[];
  uncertainSources: Array<{ source: string; reason: string }>;
  reason: string;
};

export type ReadOnlySQL = (query: string, params: readonly unknown[]) => Promise<unknown[]>;

// Derived from the checked-in Payload migrations. Every current upload FK is
// listed, including SEO fields and version rows. Tables with JSON content are
// scanned separately below. Additions to schema require updating this registry.
export const MEDIA_REFERENCE_SOURCES: readonly MediaReferenceSource[] = [
  { name: "artikel.sampul", table: "artikel", predicate: '"sampul_id" = $1' },
  { name: "artikel.seo.gambar", table: "artikel", predicate: '"seo_gambar_id" = $1' },
  { name: "artikel versions.sampul", table: "_artikel_v", predicate: '"version_sampul_id" = $1' },
  { name: "artikel versions.seo.gambar", table: "_artikel_v", predicate: '"version_seo_gambar_id" = $1' },
  { name: "layanan.gambar", table: "layanan", predicate: '"gambar_id" = $1' },
  { name: "layanan.seo.gambar", table: "layanan", predicate: '"seo_gambar_id" = $1' },
  { name: "layanan versions.gambar", table: "_layanan_v", predicate: '"version_gambar_id" = $1' },
  { name: "layanan versions.seo.gambar", table: "_layanan_v", predicate: '"version_seo_gambar_id" = $1' },
  { name: "tim.foto", table: "tim", predicate: '"foto_id" = $1' },
  { name: "mitra.logo", table: "mitra", predicate: '"logo_id" = $1' },
  { name: "testimoni.fotoProfil", table: "testimoni", predicate: '"foto_profil_id" = $1' },
  { name: "Payload locked-document media relation", table: "payload_locked_documents_rels", predicate: '"media_id" = $1' },
];

const JSON_SOURCES = [
  { name: "page-layouts.layout", table: "page_layouts", column: "layout" },
  { name: "page-layouts versions.layout", table: "_page_layouts_v", column: "version_layout" },
  { name: "reusable-components.data", table: "reusable_components", column: "data" },
  { name: "reusable-components versions.data", table: "_reusable_components_v", column: "version_data" },
] as const;

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

/**
 * Check all known FK and JSON paths. It is deliberately fail-closed: no empty
 * reference result is called eligible if even one configured source failed.
 */
export async function scanMediaReferences(
  mediaID: number,
  query: ReadOnlySQL,
  options: { knownPolymorphicSourcesComplete: boolean },
): Promise<ReferenceScanResult> {
  const references: ReferenceScanResult["references"] = [];
  const checkedSources: string[] = [];
  const uncertainSources: ReferenceScanResult["uncertainSources"] = [];

  if (!Number.isSafeInteger(mediaID) || mediaID <= 0) {
    return {
      decision: "RETAIN", candidateMediaID: mediaID, references, checkedSources,
      uncertainSources: [{ source: "candidate", reason: "Invalid media ID." }],
      reason: "Candidate identity is invalid.",
    };
  }

  for (const source of MEDIA_REFERENCE_SOURCES) {
    if (!IDENTIFIER.test(source.table)) {
      uncertainSources.push({ source: source.name, reason: "Unsafe table identifier in registry." });
      continue;
    }
    try {
      const rows = await query(`SELECT count(*)::int AS count FROM public."${source.table}" WHERE ${source.predicate}`, [mediaID]);
      checkedSources.push(source.name);
      const count = Number((rows[0] as { count?: unknown } | undefined)?.count ?? 0);
      if (!Number.isFinite(count) || count < 0) throw new Error("Invalid count result");
      if (count) references.push({ source: source.name, count });
    } catch (error) {
      uncertainSources.push({ source: source.name, reason: error instanceof Error ? error.message : "Query failed." });
    }
  }

  for (const source of JSON_SOURCES) {
    try {
      // JSON text search is intentionally conservative: matching a number or
      // URL anywhere may retain false positives, but cannot authorize a delete.
      // Search both numeric ID and conventional media URL/id representations.
      const rows = await query(
        `SELECT count(*)::int AS count FROM public."${source.table}" WHERE "${source.column}"::text LIKE ANY($1::text[])`,
        [[`%${mediaID}%`, `%"id"\\s*:\\s*${mediaID}%`, `%/api/media/file/%`]],
      );
      checkedSources.push(source.name);
      const count = Number((rows[0] as { count?: unknown } | undefined)?.count ?? 0);
      if (!Number.isFinite(count) || count < 0) throw new Error("Invalid count result");
      // URL patterns are not candidate-specific and therefore mark uncertain,
      // not a positive match. The conservative SQL pattern can retain extras.
      if (count) references.push({ source: source.name, count });
      // The application permits arbitrary JSON shape. A textual no-match is
      // not proof that an ID is not encoded/aliased there, so it cannot support
      // ELIGIBLE until the JSON schemas are made reference-aware.
      uncertainSources.push({ source: source.name, reason: "JSON values may encode media IDs/URLs in application-defined shapes; textual scan is not proof of absence." });
    } catch (error) {
      uncertainSources.push({ source: source.name, reason: error instanceof Error ? error.message : "Query failed." });
    }
  }

  if (!options.knownPolymorphicSourcesComplete) {
    uncertainSources.push({ source: "polymorphic/custom references", reason: "Not all custom or polymorphic reference paths are verified." });
  }

  const decision = references.length === 0 && uncertainSources.length === 0 ? "ELIGIBLE" : "RETAIN";
  return {
    decision,
    candidateMediaID: mediaID,
    references,
    checkedSources,
    uncertainSources,
    reason: decision === "ELIGIBLE"
      ? "No reference found in all registered sources; this is not authorization to unlink without locking and path verification."
      : references.length ? "At least one reference was found." : "Reference coverage/query is incomplete.",
  };
}
