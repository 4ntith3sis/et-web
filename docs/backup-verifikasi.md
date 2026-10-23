# Verifikasi backup migrasi media

Backup dibuat sebagai pemeriksaan persiapan migrasi pada 2026-10-23. Perintah dump hanya membaca PostgreSQL; tidak ada migrasi atau query tulis ke database aktif.

## Artefak dan hasil pemeriksaan

Lokasi artefak: `/tmp/easytax-backup-20261023-0315/` (sementara, di luar repository).

| Artefak | Ukuran/isi | Verifikasi | SHA-256 |
|---|---:|---|---|
| `easytax.dump` | 221.295 byte | `pg_restore --list` berhasil; 514 entri TOC; tabel `artikel`, `layanan`, `tim`, `mitra`, `media`, `kategori`, dan `testimoni` tercantum | `0bc4ef6ae7a9581b504bb58dbf0629a6d2a21581798368e0e26a9f64fb6ba7a8` |
| `media.tar.gz` | Arsip `media/` | `gzip -t` dan `tar -tzf` berhasil; 264 file | `004de06b4f91e281779c574cc20d04f6fd9e8eb8719e61b7b5df5b9ebe8fff05` |
| `public-images.tar.gz` | Arsip `public/images/` | `gzip -t` dan `tar -tzf` berhasil; 72 file | `2fd0c66e9eeae5bb84f08f1dffaa9e7339a0294d08bf1dc8ae59a79445c0055a` |

File `SHA256SUMS.txt`, daftar isi arsip, dan output TOC juga ada di direktori tersebut. Backup ini sudah dibuat dan diperiksa; belum dilakukan uji restore ke database sementara.

> `/tmp` bersifat sementara. Sebelum migrasi sebenarnya, salin artefak yang diperlukan ke penyimpanan backup yang persisten dan ulangi pemeriksaan checksum.

## Batasan

- Tidak ada restore test agar tidak membuat atau mengubah database lain pada cluster aktif.
- Backup tidak mengizinkan migrasi berjalan otomatis. Migrasi database tetap menunggu persetujuan terpisah.
- Tidak ada file lama yang dihapus atau diubah.
