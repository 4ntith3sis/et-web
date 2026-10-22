import { ambilJamOperasional } from "@/cms/konten";
import { LokasiKantorView } from "@/components/sections/LokasiKantorView";

/**
 * Section "Kantor Kami" untuk halaman /kontak.
 *
 * Mengambil jam operasional dari CMS lalu mendelegasikan render ke
 * `LokasiKantorView` (bagian presentasional yang juga dipakai Page Builder).
 */
export async function LokasiKantor() {
  const jamOperasional = await ambilJamOperasional();
  return <LokasiKantorView jamOperasional={jamOperasional} />;
}
