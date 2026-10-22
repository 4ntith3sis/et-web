/** Stable page key that is allowed to be edited with Puck. */
export const KUNCI_PUCK_BERANDA = "beranda";

export function bolehEditDenganPuck(pageKey: string): boolean {
  return pageKey === KUNCI_PUCK_BERANDA;
}
