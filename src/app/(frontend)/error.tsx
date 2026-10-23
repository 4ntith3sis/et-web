"use client";

import { useEffect } from "react";

/**
 * Batas error untuk halaman publik. Tanpa file ini, kegagalan render jatuh ke
 * UI error generik Next yang tidak memakai branding EasyTax.
 */
export default function ErrorHalaman({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[frontend] render error", {
      name: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 py-24 text-center">
      <div className="mx-auto max-w-md">
        <span className="inline-block rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold tracking-wider text-red-700 uppercase">
          Terjadi Kesalahan
        </span>
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
          Halaman Gagal Dimuat
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          Maaf, terjadi gangguan saat memuat halaman. Silakan coba lagi. Jika
          masalah berlanjut, hubungi tim EasyTax.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-500 px-6 font-semibold text-navy-900 transition hover:bg-yellow-400"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-navy-900/20 px-6 font-semibold text-navy-900 transition hover:bg-navy-900/5"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </main>
  );
}
