import { TimKonsultanView } from "@/components/sections/TimKonsultanView";
import { ambilTim } from "@/cms/konten";

/**
 * Section "Tim Konsultan" untuk halaman /tentang-kami.
 *
 * Mengambil data dari koleksi Tim lalu mendelegasikan render ke
 * `TimKonsultanView` (bagian presentasional yang juga dipakai Page Builder).
 */
export async function TimKonsultan() {
  const tim = await ambilTim();
  return <TimKonsultanView tim={tim} />;
}
