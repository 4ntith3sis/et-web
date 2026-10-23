# Hasil migrasi logo mitra

Tanggal: 2026-10-23

## Hasil

- Sebelum: 1 record mitra, 1 media.
- Sesudah: **21 record mitra, 21 media**.
- 20 logo yang belum ada di CMS diunggah dari JPG sumber melalui koleksi `media`; hook upload mengonversinya menjadi WebP.
- Record `akiha` dan relasinya dipertahankan, tidak dibuat ulang atau ditimpa.
- Seluruh 21 relasi logo terisi dan MIME/ekstensi media adalah WebP.
- File JPG sumber di `public/images/clients/` tidak diubah.

Pemeriksaan pascamigrasi membaca API Payload dan PostgreSQL: `mitra=21`, `media=21`. Semua relasi menunjuk ke media WebP. Pemeriksaan file lokal memastikan 20 file baru memiliki signature RIFF/WEBP.

Urutan `akiha` tetap 1; 20 record baru mendapat urutan 2–21.

## Perubahan dan batasan

Migrasi hanya membuat record pada `media` dan `mitra`. Tidak ada koleksi konten lain yang diubah. Tidak ada file lama yang dihapus. Container tidak di-rebuild atau direstart. Frontend yang sedang berjalan di port 3005 masih memakai build lama; jika logo belum tampak di halaman itu, perubahan frontend/cache deployment perlu ditangani terpisah setelah persetujuan.

Skrip apply terbatas tersedia di `scripts/migrate-mitra-logos.mjs`; ia memerlukan flag `--apply` dan menolak mengubah mitra yang sudah ada.
