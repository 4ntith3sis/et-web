# EasyTax

Website jasa konsultan pajak dan akuntansi perusahaan. Next.js App Router
dengan Payload CMS v3 + PostgreSQL; konten dapat dikelola lewat admin
`/admin`, sementara tampilan publik tetap tidak berubah.

## Stack

- Next.js `16.4.0` (App Router, Turbopack, `cacheComponents`, `partialPrefetching`)
- React `19.3.0`
- Tailwind CSS v4 (`@tailwindcss/turbopack` + `@tailwindcss/postcss`)
- TypeScript (strict)
- Payload CMS `3.91.0` (`@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`) + `sharp`
- Puck `@puckeditor/core` `0.23.0` — Page Builder visual di `/admin/page-builder`

> RAG/pgvector dan pipeline embedding belum ada di repository ini. Fase
> selanjutnya menambahkannya tanpa mengubah desain.

## Setup

```bash
cp .env.example .env      # isi DATABASE_URI, PAYLOAD_SECRET, dll.
npm install
npm run cms:migrate       # jalankan migrasi skema ke PostgreSQL
npm run cms:seed          # isi konten awal + akun admin
npm run dev               # http://localhost:3004, admin di /admin
```

Akun admin dari seed default: `admin@easytax.id` / `EasyTax#2026`
(dapat diubah lewat `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

## Perintah

```bash
npm run dev        # dev server di http://localhost:3004
npm run build      # build produksi
npm run start      # jalankan hasil build di port 3004
npm run typecheck  # tsc --noEmit

# CMS (Payload CLI) — memakai loader Node sendiri, bukan tsx
npm run cms:seed           # seed konten dari src/data/*
npm run cms:types          # regenerate src/payload-types.ts
npm run cms:importmap      # regenerate import map admin
npm run cms:migrate        # jalankan migrasi
npm run cms:migrate:create # buat migrasi dari perubahan skema
```

Lint belum dikonfigurasi. Tidak ada test otomatis; verifikasi UI memakai
script Playwright di `scripts/` (dijalankan dari root, output ke `/tmp`):

```bash
node scripts/audit-responsive.mjs before   # audit overflow/tap-target 9 vp x 8 route
node scripts/measure-desktop.mjs before    # ukur container & heading desktop
node scripts/measure-spacing.mjs           # ukur spacing section
node scripts/shot-desktop.mjs before       # screenshot full-page matrix
node scripts/shot-spacing2.mjs before      # screenshot desktop + mobile
node scripts/audit-warna-verify.mjs        # verifikasi warna brand & kontras
```

(`baseline-pixels.mjs` membutuhkan `sharp` yang belum terpasang.)

## Struktur

```
src/
├── app/
│   ├── (website)/            route publik (URL tidak berubah)
│   │   ├── layout.tsx        Navbar + main + Footer + metadata situs
│   │   ├── page.tsx          /
│   │   ├── api/kontak/       POST form kontak → koleksi pesan-kontak
│   │   ├── layanan/          /layanan, /layanan/[slug]
│   │   ├── tulisan-pajak/    /tulisan-pajak, /tulisan-pajak/[slug]
│   │   ├── tentang-kami/     /tentang-kami
│   │   ├── kontak/           /kontak
│   │   └── kalkulator-pajak/ /kalkulator-pajak
│   ├── (payload)/            root layout + admin + API Payload (tanpa chrome publik)
│   └── globals.css           design token (navy #152269, kuning #f4c922)
├── cms/                      lapisan baca data CMS + fallback statis + revalidate
├── collections/              koleksi Payload (konten + admin)
├── globals/                  global Payload (pengaturan situs)
├── migrations/               migrasi skema Payload
├── payload.config.ts         konfigurasi Payload
├── payload-types.ts          tipe hasil generate Payload
├── puck/                     registry komponen, validator, default layout, config Puck
├── components/
│   ├── layout/               Navbar, Footer
│   ├── sections/             section halaman (page-specific)
│   ├── admin/page-builder/   view daftar/editor, editor Puck klien, server action
│   ├── puck/PuckRender.tsx   render RSC layout terbit
│   ├── kalkulator/           form & workspace kalkulator
│   ├── ui/                   primitif bersama (Tombol, Kartu, Wadah, ...)
│   └── ikon/                 registry ikon SVG
├── data/                     konten fallback statis + konfigurasi situs
├── seed/                     skrip seed dari src/data/*
├── lib/                      util murni (kalkulator, cn, toc, payload client)
└── types/                    tipe lintas komponen
scripts/                      tooling QA visual (Playwright) + loader CLI
public/images/                aset lokal (logo, logo klien)
```

**Konvensi:** route group `(website)` memisahkan situs publik dari
`(payload)` (admin + API). Halaman membaca konten lewat `src/cms/*`
(`use cache` + `cacheLife`/`cacheTag`) dengan fallback ke `src/data/*` bila
database kosong, sehingga migrasi konten ke CMS bisa bertahap. Perubahan
di admin menginvalidasi cache lewat hook `revalidateTag` (`src/cms/revalidate.ts`).

### Menjalankan Payload CLI di Node 26

Node 26 sudah mengeksekusi TypeScript secara native, jadi CLI Payload
dijalankan tanpa `tsx` (tsx memicu bug interop undici di Node 26). Perintah
`cms*` memakai `scripts/register-payload-loader.mjs` + `scripts/ts-ext-loader.mjs`
untuk menyelesaikan import relatif tanpa ekstensi.

## Page Builder (Puck)

Layout tiap halaman publik disimpan sebagai dokumen di collection
`page-layouts` (draft + terbit, dengan `revision` untuk cegah konflik).
Halaman pertama yang dimigrasikan: **Beranda**.

- **Daftar halaman**: `/admin/page-builder` (server view, di balik role admin/editor).
- **Editor**: `/admin/page-builder/beranda` — kanvas Puck (drag/drop, tambah/hapus/urut komponen).
- **Aksi editor**: *Simpan Draft*, *Pratinjau* (`/pratinjau/<pageKey>`), *Lihat Halaman*, *Kembali*, plus tombol *Publish* bawaan Puck.
- **Pratinjau**: `/pratinjau/<pageKey>` menampilkan draft terbaru dalam chrome publik, `robots: noindex`, hanya untuk staf terautentikasi.
- **Publik**: `(website)/page.tsx` merender layout terbit via `<PuckRender/>`; bila belum ada layout terbit, memakai tampilan asli sebagai fallback.

Alur keamanan & penyimpanan:

- Server action (`src/components/admin/page-builder/actions.ts`) memverifikasi sesi + role sebelum menyimpan.
- Validasi layout di collection `beforeChange` (Payload melewati `validate` field saat simpan draft), menolak tipe komponen tak dikenal, konten kosong, id duplikat, kunci terlarang, dan `revision` basi (409).
- Setelah terbit, hook `afterChange` menginvalidasi cache tag `layout:<pageKey>` sehingga halaman publik langsung diperbarui.

## Known issues

- **Payload `new Date()` pada route admin** (`blocking-prerender-current-time`) —
  peringatan dari internal Payload di bawah `cacheComponents`. Tidak berdampak
  pada fungsionalitas; build produksi dan seluruh fitur lolos. Tidak diperbaiki
  secara sengaja (workaround yang sudah diuji & keputusannya terdokumentasi) — lihat
  [`docs/known-issues.md`](docs/known-issues.md).

## Batas fase berikutnya

- **RAG/pgvector** → embedding artikel, search semantik, sinkronisasi indeks.
