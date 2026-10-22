import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 py-24 text-center">
      <div className="mx-auto max-w-md">
        <span className="inline-block rounded-full bg-navy-900/5 px-4 py-1.5 text-xs font-bold tracking-wider text-navy-900 uppercase">
          Error 404
        </span>
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-4 text-base leading-relaxed text-neutral-600">
          Maaf, halaman yang Anda tuju tidak ditemukan atau alamat URL yang Anda masukkan salah.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-500 px-6 font-semibold text-navy-900 transition hover:bg-yellow-400"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/layanan"
            className="inline-flex h-12 items-center justify-center rounded-full border border-navy-900/20 px-6 font-semibold text-navy-900 transition hover:bg-navy-900/5"
          >
            Lihat Layanan
          </Link>
        </div>
      </div>
    </main>
  );
}
