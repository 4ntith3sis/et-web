# Known Issues

Catatan masalah yang sudah diketahui, diverifikasi, dan tidak ditindaklanjuti
beserta alasannya.

---

## Payload `new Date()` pada route admin — `blocking-prerender-current-time`

**Status:** Known issue (diterima, tidak diperbaiki)
**Terakhir diverifikasi:** 19 Okt 2026 (Next.js 16.4.0, Payload 3.91.0, build `next start`)
**Tipe:** Peringatan server/console — bukan kerusakan fungsional

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
