export type AksiLifecycleArtikel = "index" | "skip" | "remove";

/** Pure lifecycle decision shared by Payload hooks and indexing service. */
export function tentukanAksiLifecycleArtikel(input: {
  published: boolean;
  hasIndexableContent: boolean;
  previousContentHash?: string | null;
  nextContentHash?: string | null;
  forceReindex?: boolean;
}): AksiLifecycleArtikel {
  if (!input.published || !input.hasIndexableContent) return "remove";
  if (
    !input.forceReindex &&
    input.previousContentHash &&
    input.nextContentHash &&
    input.previousContentHash === input.nextContentHash
  ) {
    return "skip";
  }
  return "index";
}
