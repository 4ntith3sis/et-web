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
Tujuh jenis halaman dimigrasikan ke Page Builder: **Beranda**, **Tentang Kami**,
**Kontak**, **Layanan (listing)**, **Artikel/Tulisan Pajak (listing)**,
**Template Detail Layanan** (`/layanan/[slug]`), dan
**Template Detail Artikel** (`/tulisan-pajak/[slug]`).

- **Daftar halaman**: `/admin/page-builder` (server view, di balik role admin/editor).
- **Editor**: `/admin/page-builder/<pageKey>` — kanvas Puck (drag/drop, tambah/hapus/urut komponen).
- **Aksi editor**: *Simpan Draft*, *Pratinjau* (`/pratinjau/<pageKey>`), *Lihat Halaman*, *Kembali*, plus tombol *Publish* bawaan Puck.
- **Pratinjau**: `/pratinjau/<pageKey>` menampilkan draft terbaru dalam chrome publik, `robots: noindex`, hanya untuk staf terautentikasi.
- **Publik**: tiap `(website)/**/page.tsx` merender layout terbit via `<PuckRender/>`; bila belum ada layout terbit, memakai tampilan asli sebagai fallback.
- **Template dinamis**: template detail layanan & artikel tidak menyimpan
  slug item di JSON layout. Slug disuplai per-request lewat `KonteksHalaman`
  (`PuckRender konteks=...`), sehingga satu template melayani semua slug.
  Halaman `/tulisan-pajak` (listing) sengaja tetap server-rendered karena
  bergantung pada `searchParams` (`page`/`kategori`/`q`) yang tak bisa hidup di
  template statis; template Puck tetap tersedia di editor & pratinjau.

Alur keamanan & penyimpanan:

- Server action (`src/components/admin/page-builder/actions.ts`) memverifikasi sesi + role sebelum menyimpan.
- Validasi layout di collection `beforeChange` (Payload melewati `validate` field saat simpan draft), menolak tipe komponen tak dikenal, konten kosong, id duplikat, kunci terlarang, dan `revision` basi (409).
- Setelah terbit, hook `afterChange` menginvalidasi cache tag `layout:<pageKey>` sehingga halaman publik langsung diperbarui.

## Integrasi WhatsApp Consultation Routing

EasyTax dilengkapi dengan sistem konsultasi WhatsApp multi-nomor yang terintegrasi langsung dengan Payload CMS. Pengunjung yang menekan tombol konsultasi diarahkan melalui endpoint server `/api/konsultasi/whatsapp` yang mendistribusikan percakapan secara cerdas tanpa mengekspos nomor internal atau mengizinkan open redirect.

### Arsitektur Routing WhatsApp

```text
Pengunjung Klik CTA Konsultasi
              │
              ▼
   GET /api/konsultasi/whatsapp?pesan=...&sumber=...
              │
              ├── Validasi parameter query (sanitasi XSS, batas 500 karakter)
              ├── Baca konfigurasi dari SiteSettings (pengaturan-situs)
              │     └─ Jika nonaktif: redirect 307 ke /kontak?notif=whatsapp-offline
              │
              ├── Ambil daftar nomor aktif dari koleksi Nomor WhatsApp (nomor-whatsapp)
              │     └─ Filter nomor valid (8-16 digit angka internasional)
              │
              ├── Terapkan Strategi Pemilihan Nomor:
              │     ├─ Round Robin : urutkan lastAssignedAt ASC NULLS FIRST, assignedCount ASC
              │     ├─ Random      : pilih acak dari seluruh nomor aktif
              │     ├─ Weighted    : distribusi acak proporsional bobot (weight)
              │     └─ Priority    : manualNumberId terpilih atau priority terendah (angka 1)
              │
              ├── Catat penugasan atomik di PostgreSQL (assignedCount + 1, lastAssignedAt = now())
              ├── Bentuk URL: https://wa.me/<nomor>?text=<pesan-ter-encode>
              │
              ▼
   HTTP 307 Redirect ke WhatsApp (Cache-Control: no-store, anti-cache)
```

### Mengelola Nomor WhatsApp di Payload CMS

1. Masuk ke Payload Admin di `/admin`.
2. Buka menu **Kontak** > **Nomor WhatsApp** (`/admin/collections/nomor-whatsapp`).
3. Tambahkan nomor konsultan dengan field:
   - **Label / Nama Konsultan**: Identitas nomor (contoh: *Konsultan Pajak A*, *Konsultasi Korporasi*).
   - **Nomor WhatsApp**: Format internasional tanpa tanda `+` (contoh: `6281119200080` atau `6281234567890`). Normalisasi server akan otomatis membuang spasi, tanda kurung, dan tanda hubung.
   - **Status Aktif**: Centang untuk mengikutsertakan nomor dalam distribusi konsultasi. Nomor nonaktif langsung diabaikan oleh router.
   - **Tingkat Prioritas**: Angka prioritas (angka `1` adalah prioritas tertinggi).
   - **Bobot Distribusi (Weight)**: Bobot untuk weighted random (contoh: bobot `3` mendapatkan peluang 3x lebih banyak dibandingkan bobot `1`).
   - **Catatan Internal**: Catatan operasional opsional (jam shift konsultan, dll.).
   - **Sidebar**: Menampilkan metrik *Total Konsultasi Diarahkan* (`assignedCount`) dan waktu *Terakhir Diarahkan* (`lastAssignedAt`).

### Pengaturan Strategi Routing di SiteSettings

Buka menu **Pengaturan Situs** di sidebar Payload (`/admin/globals/pengaturan-situs`), lalu pilih tab **WhatsApp & Routing**:
- **Aktifkan Konsultasi WhatsApp**: Sakelar utama untuk menyalakan atau mematikan fitur konsultasi WhatsApp.
- **Strategi Routing WhatsApp**:
  1. **Round Robin (Bergilir Merata)**: Mendistribusikan giliran secara merata ke seluruh konsultan aktif berdasarkan waktu terakhir ditugaskan (`lastAssignedAt`). Aman terhadap race-condition multi-container karena mengacu pada state database PostgreSQL.
  2. **Random (Acak)**: Memilih secara acak dari semua konsultan yang berstatus aktif.
  3. **Weighted Random (Berdasarkan Bobot)**: Peluang pemilihan proporsional terhadap nilai bobot masing-masing nomor.
  4. **Priority / Manual (Prioritas Tertinggi / Manual)**: Mengarahkan konsultasi ke nomor yang dipilih secara eksplisit pada field *Nomor Manual Terpilih*, atau fallback ke nomor aktif dengan nilai prioritas tertinggi (`priority` terkecil).
- **Pesan Pembuka WhatsApp Default**: Pesan pembuka bawaan bila CTA tidak mengirimkan pesan spesifik.
- **Nomor WhatsApp Cadangan (Fallback)**: Nomor darurat jika seluruh nomor pada koleksi nonaktif atau sedang kosong.
- **Label Tombol WhatsApp Default**: Teks bawaan untuk tombol konsultasi (contoh: "Konsultasi Gratis").
- **Nomor Manual Terpilih**: Relasi ke dokumen `nomor-whatsapp` untuk strategi Priority/Manual.

### Tombol Konsultasi Reusable (`ConsultationButton`)

Komponen terpusat tersedia di `src/features/whatsapp/components/ConsultationButton.tsx`:

```tsx
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";

<ConsultationButton
  varian="utama"
  ukuran="sedang"
  sumber="layanan-detail"
  pesan="Halo EasyTax, saya ingin konsultasi mengenai Restitusi Pajak."
>
  Konsultasi Sekarang
</ConsultationButton>
```

Seluruh tombol CTA utama (Navbar, Hero, Banner CTA, Paket Harga, Detail Layanan, Kontak, dan Footer) telah terintegrasi ke endpoint `/api/konsultasi/whatsapp`.

---

## Docker & Standardisasi Environment

Aplikasi menyediakan konfigurasi Docker multi-stage dan Docker Compose terstandarisasi untuk menjamin konsistensi environment lokal dan produksi tanpa keharusan menginstal PostgreSQL manual di mesin host.

### Berkas Docker

- `Dockerfile`: Multi-stage build (deps → builder → runner) berbasis `node:20-alpine`, non-root user (`nextjs:1001`), serta optimasi layer cache.
- `compose.yaml`: Orkestrasi service `app` (Next.js & Payload CMS) dan `postgres` (PostgreSQL 16 Alpine).
- `.dockerignore`: Menjamin file sensitif (`.env`), direktori build (`.next`), dan `node_modules` tidak bocor ke dalam build konteks image.
- `docker/entrypoint.sh`: Skrip inisialisasi kontainer untuk validasi variabel koneksi dan eksekusi migrasi otomatis.

### Menjalankan EasyTax dengan Docker Compose

```bash
# 1. Salin template konfigurasi environment
cp .env.example .env

# 2. Bangun image dan jalankan seluruh container di background
docker compose up --build -d

# 3. Periksa status dan healthcheck container
docker compose ps

# 4. Lihat log container aplikasi
docker compose logs -f app

# 5. Lihat log container database PostgreSQL
docker compose logs -f postgres

# 6. Menghentikan container tanpa menghapus data
docker compose down
```

> **Perhatian:** Jangan gunakan flag `-v` saat menjalankan `docker compose down` agar volume database PostgreSQL (`easytax_postgres_data`) tidak terhapus.

### Backup dan Retensi Data PostgreSQL

Data PostgreSQL disimpan secara persisten di Docker named volume `easytax_postgres_data`. Untuk mencadangkan (backup) atau memulihkan (restore) data:

```bash
# Backup database dari container PostgreSQL ke file lokal
docker compose exec -T postgres pg_dump -U easytax easytax > backup_easytax_$(date +%Y%m%d).sql

# Restore file backup ke dalam container PostgreSQL
docker compose exec -T postgres psql -U easytax -d easytax < backup_easytax_20261022.sql
```

### Perbedaan Environment Development dan Production

| Aspek | Development (Lokal) | Production (Docker / Cloud) |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| Server Runner | `next dev -p 3004` (Turbopack) | `next start -p 3004` / Node container |
| User Process | User lokal | Non-root `nextjs` (UID 1001) |
| Host Database | `localhost:5432` | `postgres:5432` (Docker Network) |
| Migrasi Database | Manual (`npm run cms:migrate`) | Otomatis via `RUN_MIGRATIONS=true` atau CI/CD |
| Cache Header Endpoint WA | `no-store, no-cache` | `no-store, no-cache` (identik di semua env) |

---

## Variabel Lingkungan (Environment Variables)

Daftar variabel yang didukung pada `.env`:

| Variabel | Deskripsi | Default / Contoh | Wajib? |
|---|---|---|---|
| `DATABASE_URI` | Connection string PostgreSQL utama Payload | `postgresql://easytax:easytax_dev_password@localhost:5432/easytax` | Ya |
| `DATABASE_URL` | Alias connection string untuk kompatibilitas | `postgresql://easytax:easytax_dev_password@localhost:5432/easytax` | Opsional |
| `PAYLOAD_SECRET` | Secret key enkripsi cookie/auth Payload (min. 32 char) | String acak hexa/base64 | Ya |
| `PAYLOAD_PUBLIC_SERVER_URL` | Base URL publik server aplikasi | `http://localhost:3004` | Ya |
| `PAYLOAD_CACHE_COMPONENTS_ENABLED` | Menyesuaikan cache component Next.js 16 | `true` | Opsional |
| `POSTGRES_DB` | Nama database untuk PostgreSQL container | `easytax` | Docker |
| `POSTGRES_USER` | Username user PostgreSQL container | `easytax` | Docker |
| `POSTGRES_PASSWORD` | Password user PostgreSQL container | `easytax_dev_password` | Docker |
| `POSTGRES_PORT` | Port binding host PostgreSQL | `5432` | Docker |
| `RUN_MIGRATIONS` | Jalankan migrasi skema saat startup container | `false` | Docker |
| `SEED_ADMIN_EMAIL` | Email akun awal saat seed | `admin@easytax.id` | Opsional |
| `SEED_ADMIN_PASSWORD` | Password akun awal saat seed | `EasyTax#2026` | Opsional |

---

## Migrasi Database & Pengujian

### Menjalankan Migrasi Skema
```bash
npm run cms:migrate          # Menerapkan migrasi tertunda ke database aktif
npm run cms:migrate:create   # Menghasilkan berkas migrasi baru dari perubahan schema TS
```

### Menjalankan Pengujian (Testing)
```bash
npm run typecheck            # Pemeriksaan TypeScript (strict mode)
npm run test                 # Menjalankan seluruh 74 unit test & integration test
npm run build                # Uji kompilasi build produksi Next.js & Payload
```

---

## Known issues

- **Payload `new Date()` pada route admin** (`blocking-prerender-current-time`) —
  **sudah diperbaiki** lewat `partialPrefetching: false` di `next.config.ts`,
  tanpa menyentuh kode Payload. Build produksi bersih (0 kemunculan `new Date`)
  dan seluruh fitur tetap berfungsi. Detail root cause & riwayat audit di
  [`docs/known-issues.md`](docs/known-issues.md).

## Batas fase berikutnya

- **RAG/pgvector** → embedding artikel, search semantik, sinkronisasi indeks.
