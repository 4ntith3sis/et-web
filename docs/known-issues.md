# Known Issues

Catatan masalah yang sudah diketahui, diverifikasi, dan tidak ditindaklanjuti
beserta alasannya.

---

## Payload `new Date()` pada route admin — `blocking-prerender-current-time`

**Status:** SELESAI diperbaiki (Fase 6)
**Terakhir diverifikasi:** 20 Okt 2026 (Next.js 16.4.0, Payload 3.91.0, build `next start`)
**Tipe:** Peringatan server/console — bukan kerusakan fungsional

> **Perbaikan final:** set `partialPrefetching: false` di `next.config.ts`.
> Root cause ada di internal Payload (`payload/dist/auth/sessions.js` —
> `removeExpiredSessions`/`addSessionToUser`). Menonaktifkan *partial
> prefetching* mencegah Next membuat static shell untuk subtree yang memanggil
> `new Date()` saat render admin, sehingga peringatan hilang tanpa menyentuh
> kode Payload maupun strategi caching halaman publik. Terverifikasi: build
> produksi 39/39 static pages sukses, 0 kemunculan `new Date` di log server,
> dan seluruh fitur (login, editor Puck, publish, halaman publik) tetap
> berfungsi. Fix upstream terkait: PR Payload #18694 / #18702.

Bagian di bawah dipertahankan sebagai catatan audit historis (sebelum fix).

### Gejala

Saat mengakses route admin (`/admin/[[...segments]]`) berikut muncul di console:

```
Error: Route "/admin/[[...segments]]": Next.js encountered the unstable value
`new Date()` while prerendering.

Learn more: https://nextjs.org/docs/messages/blocking-prerender-current-time
    at async Object.ak [as authenticate] (... Payload chunks ...)
```

### Penyebab

Payload CMS memanggil `new Date()` di dalam operasi autentikasi
(`payload/dist/auth/{sessions,cookies,baseFields/sessions}.js`) saat merender
route admin. Karena aplikasi mengaktifkan `cacheComponents` + `partialPrefetching`,
Next mencoba menghasilkan static shell (prerender) untuk route tersebut dan
menyebut nilai timestamp sebagai *unstable value* (dokumen
`blocking-prerender-current-time`). Panggilan ini berada di dalam *render tree*
Payload sehingga tidak dapat diubah dari kode aplikasi.

### Dampak

- **Tidak memengaruhi fungsionalitas.** Build produksi lolos; seluruh fitur
  (login, dashboard, editor Puck, Simpan Draft, Pratinjau, Publish, Revert,
  dan halaman publik) terverifikasi berfungsi.
- **Bukan error Puck.** Baca lebih lanjut di bawah.
- Terlihat di **console browser hanya pada mode development**.
- Juga tercetak di **server console** (`next start`) pada setiap render route
  admin — namun **tidak** pernah mencapai console browser di produksi, dan tidak
  pernah mengembalikan error ke client.
- Karena itu: produksi **aman dipakai**; hanya berisiko "berisik" di log.

### Bukan error Puck

Peringatan ini muncul sejak **Fase 2** (sebelum Page Builder ada) dan bukan
diakibatkan oleh integrasi Puck. Integrasi Puck terverifikasi bebas error
(`pageError = 0`, `console.error` client di produksi `= 0`).

### Perbaikan yang sudah dicoba & tidak berhasil

| Percobaan | Hasil |
|---|---|
| `export const instant = false` (segmen admin) | Salah mekanisme — menyangkut validasi *instant-navigation*, bukan prerender-time ini. Tidak menyelesaikan. |
| `export const dynamic = "force-dynamic"` | Ditolak Next: `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`. |
| `await connection()` + `<Suspense>` di `page.tsx` | Tidak menutupi panggilan `new Date()` yang terjadi di subtree layout (stack menunjuk ke `layout.tsx`, bukan page). |

### Keputusan

Berdasarkan audit, perbaikan di atas bersifat **berisiko** (menyangkut caching
dan rendering admin) hanya untuk menghilangkan satu peringatan kosmetik. Karena
tidak ada dampak fungsional dan build produksi bersih, diputuskan untuk **tidak
mengubah kode** untuk masalah ini.

### Larikan (workaround) yang tidak dianjurkan

- Menonaktifkan `cacheComponents` — berdampak ke seluruh strategi caching situs
  publik; tidak sepadan.
- Menambal (patch) dependency Payload — di luar ruang lingkup.

### Rujukan

- Next.js: `docs/messages/blocking-prerender-current-time`
- Next.js: App Router → Caching → "Random values and timestamps"
- Lokasi kode terkait: `src/app/(payload)/admin/[[...segments]]/page.tsx`,
  `src/app/(payload)/layout.tsx`

---

## Metadata admin — `blocking-prerender-metadata-runtime`

**Status:** SELESAI diperbaiki (Fase 7)
**Terakhir diverifikasi:** 21 Okt 2026 (Next.js 16.4.0, Payload 3.91.0, `next dev`)
**Tipe:** Error server/console (dev) — bukan kerusakan fungsional
**Rute:** `/admin/[[...segments]]` (route admin Payload)

### Gejala

Saat membuka route admin (mis. `/admin`, `/admin/login`,
`/admin/collections/*`, `/admin/page-builder/*`) muncul di console browser:

```
Error: Route "/admin/[[...segments]]": Next.js encountered runtime data in `generateMetadata()`.

This route's metadata is blocked, but the rest of its content can be prerendered.
`cookies()`, `headers()`, `params`, or `searchParams` accessed in `generateMetadata()`
cause it to run dynamically.

Learn more: https://nextjs.org/docs/messages/blocking-prerender-metadata-runtime
```

### Diagnosa (bukti)

- **Sumbernya BUKAN** `/layanan/[slug]` maupun `/tulisan-pajak/[slug]`.
  Kedua route itu hanya mengeluarkan info dev *"rendering with server caches
  disabled"* (konsekuensi wajar `cacheComponents` di dev) dan **nol** pesan
  `Blocking/runtime data`. Metadata per-slug keduanya sudah benar dan berbasis
  cache (`ambilLayanan`/`ambilDetailLayanan` memakai `use cache`).
- Pesan menunjuk stack ke `MetadataWrapper [Prerender]` pada route
  `/admin/[[...segments]]`, yaitu route admin Payload.
- Root cause: `generatePageMetadata` dari `@payloadcms/next/views` (`page.tsx`
  admin) `await paramsPromise` (segmen route) **dan** memanggil
  `getNextRequestI18n` yang membaca header request. Dengan `cacheComponents`,
  akses `params`/header di `generateMetadata()` diklasifikasikan sebagai runtime
  data → metadata "blocked".

### Perbaikan

`export const instant = false` pada
`src/app/(payload)/admin/[[...segments]]/page.tsx`.

Route admin memang **selalu** dinamis (auth + sesi + i18n per-request), jadi
opt-out dari validasi *instant-navigation* adalah pilihan yang tepat dan
minimal: metadata SEO admin tetap utuh, halaman publik tidak tersentuh, dan
`cacheComponents` tetap aktif.

### Catatan penting (jangan tertukar dengan isu `new Date()` di atas)

Isu `new Date()` (komentar di atas) **bedaa** dari isu ini:

- `new Date()` → diperbaiki dengan `partialPrefetching: false`; `instant = false`
  tidak menyelesaikannya (memang bukan mekanismenya).
- Metadata runtime → diperbaiki dengan `instant = false`; terverifikasi
  menghilangkan error di `/admin`, `/admin/login`, `/admin/collections/*`,
  `/admin/page-builder/*` (0 kemunculan), tanpa memunculkan `InvariantError`.

**Alternatif yang dicoba & ditolak:** menambahkan `await connection()` di dalam
`<Suspense>` pada `page.tsx` admin. Percobaan ini **gagal**: `/admin/login`
tetap memunculkan error, dan sebaliknya memicu
`InvariantError: failed to render during instant validation` (bug internal
Next.js untuk kasus ini). Karena itu dipakai `instant = false`.

### Rujukan

- Next.js: `docs/messages/blocking-prerender-metadata-runtime`
- Next.js: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` ("With Cache Components")
- Lokasi kode: `src/app/(payload)/admin/[[...segments]]/page.tsx`

---

## Status publish `template-layanan-detail` & `template-artikel-detail` belum sinkron

**Status:** TERBUKA — menunggu keputusan editorial (tidak diperbaiki sepihak)
**Terakhir diverifikasi:** 21 Okt 2026 (Payload 3.91.0, PostgreSQL lokal)
**Tipe:** Ketidaksesuaian status (bukan kerusakan fungsional)

### Gejala

Pada dua page key templat, **versi terbaru di riwayat berstatus `published`**,
tetapi **baris utama dokumen masih `_status = 'draft'`**:

| page key           | id  | baris utama | versi terbaru | yang dipakai halaman publik |
| ------------------ | --- | ----------- | ------------- | --------------------------- |
| `template-layanan-detail` | #23 | draft (rev 4) | published r14 | fallback statis |
| `template-artikel-detail` | #24 | draft (rev 2) | published r12 | fallback statis |

Akibatnya hasil edit di editor **tidak langsung tampil** di halaman publik
`/layanan/[slug]` dan `/tulisan-pajak/[slug]` — keduanya masih dirender dari
fallback hardcoded sampai layout yang tersimpan benar-benar dipublish ulang.

### Penyebab

Pembaruan status terjadi melalui jalur di luar tombol **Publish** Page Builder
(mis. lewat Payload Admin collection view atau skrip), sehingga baris utama
dokumen tidak ikut berubah status menjadi `published`. Payload menyimpan status
publikasi pada baris utama dan pada version row secara terpisah.

### Larutan (1 klik)

Buka `Admin → Page Builder → <page key>` lalu klik **Publish**. Tombol ini
memakai `payload.update({ draft: false })` yang menulis baris utama sekaligus
version row `published` (terverifikasi pada `tentang-kami`).

### Catatan editorial

Layout `template-layanan-detail` memakai heading default **“Keunggulan
Layanan”**, sedangkan fallback hardcoded memakai **“Mengapa EasyTax?”**.
Memublish layout tersebut **akan mengubah teks yang tampil di publik**, jadi
publish sengaja tidak dilakukan otomatis pada fase ini.

---

## Tombol Publish Puck dirender sebagai `<span>`

**Status:** TERBUKA — perilaku internal Puck `0.23.0` (di luar ruang lingkup aplikasi)
**Terakhir diverifikasi:** 21 Okt 2026 (Puck 0.23.0)
**Tipe:** Aksesibilitas

### Gejala

Kontrol **Publish** di header Puck dirender sebagai elemen `<span>`, bukan
`<button type="submit">`. Tomcat internal Puck (`Button`) memilih tag secara
implisit: `href ? "a" : type ? "button" : "span"`.

### Dampak

- **Fungsional:** tidak merugikan — tombol tetap dapat diklik dengan mouse dan
  server action tetap berjalan (terverifikasi: “Layout diterbitkan. Halaman
  publik diperbarui.”).
- **Aksesibilitas:** tidak dapat diaktifkan lewat keyboard (`Tab` + `Enter`)
  dan tidak terbaca sebagai tombol oleh screen reader.

### Rencana

Perbaikan yang aman adalah menyuntikkan `headerActions` sendiri pada
`src/components/admin/page-builder/EditorPuck.tsx` (menyalin aksi Publish milik
Puck namun memakai elemen `<button type="submit">`), sehingga perilaku Puck
yang sudah ada tidak diubah. Ditunda ke fase berikutnya agar tidak menyentuh
komponen inti sebelum fondasi lain stabil.

---

## Publish di luar runtime Next.js tidak langsung membatalkan cache

**Status:** TERBUKA — keterbatasan bawaan Next.js `use cache`
**Terakhir diverifikasi:** 21 Okt 2026 (Next.js 16.4.0)
**Tipe:** Stale content ≤ 1 menit pada jalur publish non-UI

### Gejala

Publish yang dilakukan **di luar** runtime Next.js (Payload CLI, skrip seed,
migrasi) tidak dapat memanggil `revalidateTag`/`updateTag`, sehingga entri
`use cache` pada `ambilLayoutTerbit()` masih berlaku sampai umurnya habis
(≈1 menit). Terverifikasi: layout `tentang-kami` dipublish lewat skrip, halaman
publik baru menampilkan isi baru setelah cache kadaluwarsa.

### Dampak

- **Tidak memengaruhi alur normal.** Publish lewat tombol **Publish** di Page
  Builder memakai `updateTag` (Server Function) → cache kedaluwarsa seketika,
  permintaan publik berikutnya langsung memakai layout baru (terverifikasi).
- Publish lewat Payload Admin (route handler) memakai `revalidateTag` dengan
  profil `{ expire: 0 }` → konten basi tidak pernah disajikan.
- Hanya jalur CLI/skrip yang terlambat ≤1 menit.

### Catatan

Next.js tidak menyediakan invalidasi lintas-proses untuk `use cache`, sehingga
perilaku ini inherent. Untuk situs marketing hal ini tetap aman: konten basi
paling lama 1 menit.

