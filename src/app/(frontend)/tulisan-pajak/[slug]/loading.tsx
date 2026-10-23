/**
 * Boundary navigasi untuk detail artikel.
 *
 * Route dinamis tidak bisa diprefetch penuh sebelum parameternya diketahui.
 * Dengan `loading.tsx`, klik dari daftar artikel langsung menampilkan kerangka
 * hero navy (sama seperti fallback Suspense halaman) sementara RSC detail
 * dimuat, bukan menahan halaman lama tanpa umpan balik.
 */
export default function LoadingDetailArtikel() {
  return (
    <div className="min-h-[70vh] bg-navy-900" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat artikel…</span>
    </div>
  );
}
