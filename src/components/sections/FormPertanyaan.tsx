"use client";

import { useState } from "react";

import { Centang, Jam, Lokasi, PanahKanan } from "@/components/ikon";

type Status = "idle" | "mengirim" | "sukses" | "gagal";

/* Struktur form & side-info diadaptasi dari easytax-demo (v1):
   field yang sama (nama, bisnis, email, WA, topik, pesan) tetapi dengan
   gaya visual v2 — input isi (filled), kartu putih membulat, chip ikon.

   Topik konsultasi dan jam operasional dikirim server dari global CMS. */
export function FormPertanyaan({
  topikKonsultasi,
  jamOperasional,
}: {
  topikKonsultasi: string[];
  jamOperasional: { hari: string; jam: string }[];
}) {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("mengirim");
    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) throw new Error("gagal");
      form.reset();
      setStatus("sukses");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("gagal");
    }
  };

  return (
    <section
      id="form-kontak"
      aria-labelledby="form-kontak-judul"
      className="bg-netral-lat py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Kartu form */}
          <div className="rounded-2xl border border-garis bg-white p-6 shadow-sm sm:p-8">
            <h2
              id="form-kontak-judul"
              className="font-heading text-[clamp(1.4rem,2.4vw,1.8rem)] leading-[1.25] font-bold tracking-[-0.02em] text-navy-900"
            >
              Kirim pertanyaan Anda
            </h2>
            <p className="mt-2 text-[0.95rem] leading-[1.65] text-teks-sekunder">
              Isi form berikut dan tim kami akan menghubungi Anda kembali dalam
              1×24 jam kerja.
            </p>

            <hr className="my-6 border-garis-halus" />

            {status === "sukses" && (
              <div
                role="status"
                className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[0.9rem] font-semibold text-emerald-800"
              >
                <Centang className="h-5 w-5 shrink-0" />
                Terima kasih! Tim kami akan menghubungi Anda dalam 1×24 jam.
              </div>
            )}

            {status === "gagal" && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] font-semibold text-red-700"
              >
                Maaf, pesan gagal terkirim. Silakan coba lagi atau hubungi kami
                via WhatsApp.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate={false}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  name="nama"
                  label="Nama Lengkap*"
                  placeholder="Mis. Budi Santoso"
                  required
                />
                <Field
                  name="bisnis"
                  label="Nama Bisnis / Perusahaan"
                  placeholder="Mis. PT Maju Bersama"
                />
                <Field
                  name="email"
                  label="Email*"
                  type="email"
                  placeholder="nama@email.com"
                  required
                />
                <Field
                  name="whatsapp"
                  label="No. WhatsApp*"
                  type="tel"
                  placeholder="0812-3456-7890"
                  required
                />
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[0.85rem] font-semibold text-navy-900">
                  Topik Konsultasi*
                </span>
                <select
                  name="topik"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-garis bg-netral-lat px-4 py-3 text-[0.95rem] text-teks-utama transition-[var(--transition-base)] focus:border-navy-900 focus:bg-white"
                >
                  <option value="" disabled>
                    Pilih Topik Konsultasi
                  </option>
                  {topikKonsultasi.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block text-[0.85rem] font-semibold text-navy-900">
                  Pesan / Pertanyaan*
                </span>
                <textarea
                  name="pesan"
                  rows={4}
                  required
                  placeholder="Ceritakan kebutuhan perpajakan bisnis Anda — kami akan bantu rekomendasikan solusi yang sesuai."
                  className="w-full resize-none rounded-lg border border-garis bg-netral-lat px-4 py-3 text-[0.95rem] text-teks-utama placeholder:text-teks-redup transition-[var(--transition-base)] focus:border-navy-900 focus:bg-white"
                />
              </label>

              <p className="mt-4 text-[0.82rem] leading-[1.6] text-teks-redup">
                Saya setuju data yang saya kirim akan diproses sesuai{" "}
                <a
                  href="#"
                  className="font-semibold text-navy-900 underline underline-offset-2"
                >
                  Kebijakan Privasi
                </a>{" "}
                EasyTax.id.
              </p>

              <button
                type="submit"
                disabled={status === "mengirim"}
                className="group/submit mt-6 flex items-center justify-center gap-2.5 rounded-md bg-yellow-500 px-8 py-[13px] text-[0.95rem] font-extrabold whitespace-nowrap text-navy-900 shadow-kuning transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--color-brand-yellow)_50%,transparent)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-55"
              >
                {status === "mengirim" ? "Mengirim…" : "Kirim Pertanyaan"}
                <PanahKanan className="h-4 w-4 transition-transform group-hover/submit:translate-x-1" />
              </button>
            </form>
          </div>

          {/* Side info */}
          <aside className="flex flex-col gap-4" aria-label="Informasi kontak">
            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-yellow-500 text-navy-900">
                <Centang className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-[1.05rem] font-bold text-white">
                Respons Cepat
              </h3>
              <p className="mt-1.5 text-[0.9rem] leading-[1.6] text-teks-terang">
                Rata-rata kurang dari 5 menit via WhatsApp.
              </p>
            </div>

            <div className="rounded-2xl border border-garis bg-white p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-netral-lat text-navy-900">
                  <Jam className="h-4.5 w-4.5" />
                </span>
                <h3 className="font-heading text-[1rem] font-bold text-navy-900">
                  Jam Operasional
                </h3>
              </div>

              <dl className="mt-4 divide-y divide-garis-halus">
                {jamOperasional.map((j) => (
                  <div
                    key={j.hari}
                    className="flex items-center justify-between gap-3 py-2.5 text-[0.88rem]"
                  >
                    <dt className="text-teks-sekunder">{j.hari}</dt>
                    <dd
                      className={
                        j.jam === "Tutup"
                          ? "font-semibold whitespace-nowrap text-red-accent"
                          : "font-semibold whitespace-nowrap text-navy-900"
                      }
                    >
                      {j.jam}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-garis bg-white p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-netral-lat text-navy-900">
                  <Lokasi className="h-4.5 w-4.5" />
                </span>
                <h3 className="font-heading text-[1rem] font-bold text-navy-900">
                  Kantor Pusat &amp; Layanan Online
                </h3>
              </div>

              <p className="mt-3 text-[0.9rem] leading-[1.65] text-teks-sekunder">
                Jakarta, Indonesia — Melayani pengusaha &amp; perusahaan di
                seluruh Indonesia 100% online secara cepat &amp; terproteksi.
              </p>

              <a
                href="/tentang-kami"
                className="group/profil mt-4 flex w-fit items-center gap-2 py-1 text-[0.9rem] font-bold text-navy-900 no-underline"
              >
                Lihat profil kantor kami
                <PanahKanan className="h-4 w-4 text-navy-900 transition-transform group-hover/profil:translate-x-1" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.85rem] font-semibold text-navy-900">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-garis bg-netral-lat px-4 py-3 text-[0.95rem] text-teks-utama placeholder:text-teks-redup transition-[var(--transition-base)] focus:border-navy-900 focus:bg-white"
      />
    </label>
  );
}
