/**
 * Boundary navigasi untuk detail layanan.
 *
 * Sama seperti detail artikel: tampilkan fallback hero navy segera saat
 * navigasi, lalu ganti dengan konten setelah RSC selesai dimuat.
 */
export default function LoadingDetailLayanan() {
  return (
    <div className="min-h-[70vh] bg-navy-900" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat layanan…</span>
    </div>
  );
}
