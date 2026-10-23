# Dry-run migrasi media CMS EasyTax

Dihasilkan: 2026-10-23T03:19:21.229Z
Sumber data: GET http://localhost:3004/api (read-only)

## Ringkasan

| Ukuran | Sebelum | Target | Baru dibuat |
|---|---:|---:|---:|
| Artikel | 12 | 12 | 0 |
| Layanan | 4 | 4 | 0 |
| Tim | 4 | 4 | 0 |
| Mitra | 1 | 21 | 20 |
| Media | 1 | 44 | 43 |
| Relasi gambar | 1 | 41 | 40 |

## Perbedaan jumlah yang perlu dipahami

- 44 media = 23 foto unik + 21 logo. Dari jumlah itu 1 media sudah ada (akiha.webp), sehingga media baru = 43, bukan 44.
- 41 relasi = 20 relasi foto CMS (12 artikel + 4 layanan + 4 tim) + 21 relasi logo mitra. Satu relasi logo sudah terisi (akiha), sehingga relasi baru = 40.
- 20 record mitra baru = target 21 mitra - 1 record akiha yang sudah ada.
- 12 relasi artikel memakai 11 foto unik karena photo-1521791136064-7986c2920216 dipakai dua artikel.
- Dari 23 foto, 4 hanya dipakai komponen statis (Hero beranda, LayananHero, TentangHero, Kontak) dan tidak punya relasi CMS.
- Jika migrasi dibatasi hanya pada aset yang punya relasi CMS, target media menjadi 40 (19 foto unik + 21 logo), bukan 44.
- Logo: 1 sudah berupa akiha.webp; 20 logo baru tetap JPG. Upload JPG saat ini akan dikonversi hook ke WebP, jadi apply memerlukan bypass eksplisit agar kebijakan JPG logo tidak berubah.
- Record mitra akiha memiliki urutan 1. Record baru direncanakan urutan 2-21 agar tidak menimpa urutan akiha; akibatnya akiha tampil lebih awal sampai urutan diperbarui (perubahan urutan tidak termasuk 20 record baru).

## Rencana media

| Target file | Jenis | Format | Dimensi | Ukuran | Status | Sumber | File saat upload | Terhubung ke | Catatan |
|---|---|---|---:|---:|---|---|---|---|---|
| `migrasi-photo-1434626881859-194d67b2b86f.webp` | foto | webp | 1000×664 | 82.1 KB | create | `public/images/external/photo-1434626881859-194d67b2b86f.jpg` | `public/images/external/photo-1434626881859-194d67b2b86f.webp` | layanan:laporan-spt (gambar) |  |
| `migrasi-photo-1450101499163-c8848c66ca85.webp` | foto | webp | 600×400 | 15.1 KB | create | `public/images/external/photo-1450101499163-c8848c66ca85.jpg` | `public/images/external/photo-1450101499163-c8848c66ca85.webp` | artikel:transfer-pricing-dokumentasi (sampul) |  |
| `migrasi-photo-1454165804606-c3d57bc86b40.webp` | foto | webp | 1000×667 | 60.5 KB | create | `public/images/external/photo-1454165804606-c3d57bc86b40.jpg` | `public/images/external/photo-1454165804606-c3d57bc86b40.webp` | layanan:laporan-perpajakan-keuangan (gambar) |  |
| `migrasi-photo-1460925895917-afdab827c52f.webp` | foto | webp | 600×427 | 27.8 KB | create | `public/images/external/photo-1460925895917-afdab827c52f.jpg` | `public/images/external/photo-1460925895917-afdab827c52f.webp` | artikel:e-faktur-4-0 (sampul) |  |
| `migrasi-photo-1472099645785-5658abf4ff4e.webp` | foto | webp | 600×400 | 9.6 KB | create | `public/images/external/photo-1472099645785-5658abf4ff4e.jpg` | `public/images/external/photo-1472099645785-5658abf4ff4e.webp` | tim:Akmal Abdul Arik (foto) |  |
| `migrasi-photo-1486406146926-c627a92ad1ab.webp` | foto | webp | 1000×667 | 137.0 KB | create | `public/images/external/photo-1486406146926-c627a92ad1ab.jpg` | `public/images/external/photo-1486406146926-c627a92ad1ab.webp` |  | Tidak terhubung ke koleksi CMS; hanya dipakai komponen statis (Opsional jika migrasi dibatasi ke aset CMS). |
| `migrasi-photo-1494790108377-be9c29b29330.webp` | foto | webp | 600×900 | 26.7 KB | create | `public/images/external/photo-1494790108377-be9c29b29330.jpg` | `public/images/external/photo-1494790108377-be9c29b29330.webp` | tim:Risa Rizki Sharon (foto) |  |
| `migrasi-photo-1504868584819-f8e8b4b6d7e3.webp` | foto | webp | 600×397 | 18.5 KB | create | `public/images/external/photo-1504868584819-f8e8b4b6d7e3.jpg` | `public/images/external/photo-1504868584819-f8e8b4b6d7e3.webp` | artikel:syarat-pengukuhan-pkp-terbaru (sampul) |  |
| `migrasi-photo-1519085360753-af0119f7cbe7.webp` | foto | webp | 600×900 | 18.4 KB | create | `public/images/external/photo-1519085360753-af0119f7cbe7.jpg` | `public/images/external/photo-1519085360753-af0119f7cbe7.webp` | tim:Bima Prasetyo (foto) |  |
| `migrasi-photo-1521737604893-d14cc237f11d.webp` | foto | webp | 1000×656 | 66.2 KB | create | `public/images/external/photo-1521737604893-d14cc237f11d.jpg` | `public/images/external/photo-1521737604893-d14cc237f11d.webp` |  | Tidak terhubung ke koleksi CMS; hanya dipakai komponen statis (Opsional jika migrasi dibatasi ke aset CMS). |
| `migrasi-photo-1521791136064-7986c2920216.webp` | foto | webp | 600×401 | 22.2 KB | create | `public/images/external/photo-1521791136064-7986c2920216.jpg` | `public/images/external/photo-1521791136064-7986c2920216.webp` | artikel:batas-omzet-umkm-pajak-final (sampul)<br>artikel:pendapatan-tunjangan-pajak (sampul) |  |
| `migrasi-photo-1531482615713-2afd69097998.webp` | foto | webp | 1600×1067 | 149.0 KB | create | `public/images/external/photo-1531482615713-2afd69097998.jpg` | `public/images/external/photo-1531482615713-2afd69097998.webp` |  | Tidak terhubung ke koleksi CMS; hanya dipakai komponen statis (Opsional jika migrasi dibatasi ke aset CMS). |
| `migrasi-photo-1551836022-d5d88e9218df.webp` | foto | webp | 1000×667 | 68.0 KB | create | `public/images/external/photo-1551836022-d5d88e9218df.jpg` | `public/images/external/photo-1551836022-d5d88e9218df.webp` | layanan:restitusi-pajak (gambar) |  |
| `migrasi-photo-1553877522-43269d4ea984.webp` | foto | webp | 1000×667 | 58.4 KB | create | `public/images/external/photo-1553877522-43269d4ea984.jpg` | `public/images/external/photo-1553877522-43269d4ea984.webp` |  | Tidak terhubung ke koleksi CMS; hanya dipakai komponen statis (Opsional jika migrasi dibatasi ke aset CMS). |
| `migrasi-photo-1554224154-26032ffc0d07.webp` | foto | webp | 600×422 | 21.2 KB | create | `public/images/external/photo-1554224154-26032ffc0d07.jpg` | `public/images/external/photo-1554224154-26032ffc0d07.webp` | artikel:tata-cara-pembukuan-umkm (sampul) |  |
| `migrasi-photo-1554224155-8d04cb21cd6c.webp` | foto | webp | 600×400 | 19.2 KB | create | `public/images/external/photo-1554224155-8d04cb21cd6c.jpg` | `public/images/external/photo-1554224155-8d04cb21cd6c.webp` | artikel:struktur-modal-dan-beban (sampul) |  |
| `migrasi-photo-1560472355-536de3962603.webp` | foto | webp | 600×400 | 22.1 KB | create | `public/images/external/photo-1560472355-536de3962603.jpg` | `public/images/external/photo-1560472355-536de3962603.webp` | artikel:neraca-laba-rugi-spt-badan (sampul) |  |
| `migrasi-photo-1573497019940-1c28c88b4f3e.webp` | foto | webp | 600×900 | 102.6 KB | create | `public/images/external/photo-1573497019940-1c28c88b4f3e.jpg` | `public/images/external/photo-1573497019940-1c28c88b4f3e.webp` | tim:Maya Puspita (foto) |  |
| `migrasi-photo-1579532537598-459ecdaf39cc.webp` | foto | webp | 600×900 | 49.3 KB | create | `public/images/external/photo-1579532537598-459ecdaf39cc.jpg` | `public/images/external/photo-1579532537598-459ecdaf39cc.webp` | artikel:kredit-faktur-pajak-masukan (sampul) |  |
| `migrasi-photo-1589829545856-d10d557cf95f.webp` | foto | webp | 600×400 | 27.8 KB | create | `public/images/external/photo-1589829545856-d10d557cf95f.jpg` | `public/images/external/photo-1589829545856-d10d557cf95f.webp` | artikel:menjawab-sp2dk (sampul) |  |
| `migrasi-photo-1591696331111-ef9586a5b17a.webp` | foto | webp | 600×400 | 25.9 KB | create | `public/images/external/photo-1591696331111-ef9586a5b17a.jpg` | `public/images/external/photo-1591696331111-ef9586a5b17a.webp` | artikel:rekonsiliasi-fiskal-positif-negatif (sampul) |  |
| `migrasi-photo-1611974789855-9c2a0a7236a3.webp` | foto | webp | 600×400 | 18.3 KB | create | `public/images/external/photo-1611974789855-9c2a0a7236a3.jpg` | `public/images/external/photo-1611974789855-9c2a0a7236a3.webp` | artikel:penerapan-ter-pph-21 (sampul) |  |
| `migrasi-photo-1664575602554-2087b04935a5.webp` | foto | webp | 1000×1500 | 91.2 KB | create | `public/images/external/photo-1664575602554-2087b04935a5.jpg` | `public/images/external/photo-1664575602554-2087b04935a5.webp` | layanan:pengurusan-pkp (gambar) |  |
| `migrasi-mitra-vidichi.jpg` | logo | jpeg | 149×150 | 1.9 KB | create | `public/images/clients/vidichi.jpg` | `public/images/clients/vidichi.jpg` | mitra:Vidichi (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-tantri.jpg` | logo | jpeg | 150×150 | 3.0 KB | create | `public/images/clients/tantri.jpg` | `public/images/clients/tantri.jpg` | mitra:Tantri (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-sumber-aneka-wangi.jpg` | logo | jpeg | 150×150 | 3.2 KB | create | `public/images/clients/sumber-aneka-wangi.jpg` | `public/images/clients/sumber-aneka-wangi.jpg` | mitra:Sumber Aneka Wangi (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-satoshi.jpg` | logo | jpeg | 150×150 | 3.0 KB | create | `public/images/clients/satoshi.jpg` | `public/images/clients/satoshi.jpg` | mitra:Satoshi (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-power-computerindo.jpg` | logo | jpeg | 149×150 | 4.0 KB | create | `public/images/clients/power-computerindo.jpg` | `public/images/clients/power-computerindo.jpg` | mitra:Power Computerindo (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-pabriek-kuweh.jpg` | logo | jpeg | 150×150 | 3.5 KB | create | `public/images/clients/pabriek-kuweh.jpg` | `public/images/clients/pabriek-kuweh.jpg` | mitra:Pabriek Kuweh (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-oseal.jpg` | logo | jpeg | 149×150 | 3.0 KB | create | `public/images/clients/oseal.jpg` | `public/images/clients/oseal.jpg` | mitra:Oseal (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-moonbow.jpg` | logo | jpeg | 149×150 | 3.0 KB | create | `public/images/clients/moonbow.jpg` | `public/images/clients/moonbow.jpg` | mitra:Moonbow (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-kms.jpg` | logo | jpeg | 149×150 | 4.8 KB | create | `public/images/clients/kms.jpg` | `public/images/clients/kms.jpg` | mitra:KMS (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-kafeel-netz.jpg` | logo | jpeg | 150×150 | 5.1 KB | create | `public/images/clients/kafeel-netz.jpg` | `public/images/clients/kafeel-netz.jpg` | mitra:Kafeel Netz (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-javarudraksha.jpg` | logo | jpeg | 150×150 | 2.6 KB | create | `public/images/clients/javarudraksha.jpg` | `public/images/clients/javarudraksha.jpg` | mitra:Javarudraksha (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-happyeats.jpg` | logo | jpeg | 149×150 | 2.9 KB | create | `public/images/clients/happyeats.jpg` | `public/images/clients/happyeats.jpg` | mitra:HappyEats (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-guri-senbei.jpg` | logo | jpeg | 150×150 | 8.3 KB | create | `public/images/clients/guri-senbei.jpg` | `public/images/clients/guri-senbei.jpg` | mitra:Guri Senbei (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-gmk-door.jpg` | logo | jpeg | 149×150 | 5.9 KB | create | `public/images/clients/gmk-door.jpg` | `public/images/clients/gmk-door.jpg` | mitra:GMK Door (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-dewa-rackindo.jpg` | logo | jpeg | 150×150 | 4.9 KB | create | `public/images/clients/dewa-rackindo.jpg` | `public/images/clients/dewa-rackindo.jpg` | mitra:Dewa Rackindo (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-daingsuper.jpg` | logo | jpeg | 150×150 | 2.7 KB | create | `public/images/clients/daingsuper.jpg` | `public/images/clients/daingsuper.jpg` | mitra:Daing Super (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-callme.jpg` | logo | jpeg | 150×150 | 4.8 KB | create | `public/images/clients/callme.jpg` | `public/images/clients/callme.jpg` | mitra:Callme (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-beeskin.jpg` | logo | jpeg | 150×150 | 4.2 KB | create | `public/images/clients/beeskin.jpg` | `public/images/clients/beeskin.jpg` | mitra:Beeskin (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-artave.jpg` | logo | jpeg | 149×150 | 2.5 KB | create | `public/images/clients/artave.jpg` | `public/images/clients/artave.jpg` | mitra:Artave (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `migrasi-mitra-arava-tour.jpg` | logo | jpeg | 150×150 | 3.3 KB | create | `public/images/clients/arava-tour.jpg` | `public/images/clients/arava-tour.jpg` | mitra:Arava Tour (logo) | JPG dipertahankan sesuai kebijakan logo. Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan. |
| `akiha.webp` | logo | webp | 150×150 | 2.9 KB | existing | `public/images/clients/akiha.jpg` | `media/akiha.webp` | mitra:akiha (logo) | Record media sudah ada dan relasi mitra sudah terisi; tidak dibuat ulang. |

## Rencana relasi per koleksi

| Koleksi | ID | Kunci | Field | Sekarang | Target | Aksi |
|---|---:|---|---|---|---|---|
| artikel | 12 | `menjawab-sp2dk` | sampul | kosong | `migrasi-photo-1589829545856-d10d557cf95f.webp` | isi |
| artikel | 11 | `transfer-pricing-dokumentasi` | sampul | kosong | `migrasi-photo-1450101499163-c8848c66ca85.webp` | isi |
| artikel | 10 | `struktur-modal-dan-beban` | sampul | kosong | `migrasi-photo-1554224155-8d04cb21cd6c.webp` | isi |
| artikel | 9 | `e-faktur-4-0` | sampul | kosong | `migrasi-photo-1460925895917-afdab827c52f.webp` | isi |
| artikel | 8 | `pendapatan-tunjangan-pajak` | sampul | kosong | `migrasi-photo-1521791136064-7986c2920216.webp` | isi |
| artikel | 7 | `tata-cara-pembukuan-umkm` | sampul | kosong | `migrasi-photo-1554224154-26032ffc0d07.webp` | isi |
| artikel | 6 | `syarat-pengukuhan-pkp-terbaru` | sampul | kosong | `migrasi-photo-1504868584819-f8e8b4b6d7e3.webp` | isi |
| artikel | 5 | `penerapan-ter-pph-21` | sampul | kosong | `migrasi-photo-1611974789855-9c2a0a7236a3.webp` | isi |
| artikel | 4 | `neraca-laba-rugi-spt-badan` | sampul | kosong | `migrasi-photo-1560472355-536de3962603.webp` | isi |
| artikel | 3 | `kredit-faktur-pajak-masukan` | sampul | kosong | `migrasi-photo-1579532537598-459ecdaf39cc.webp` | isi |
| artikel | 2 | `batas-omzet-umkm-pajak-final` | sampul | kosong | `migrasi-photo-1521791136064-7986c2920216.webp` | isi |
| artikel | 1 | `rekonsiliasi-fiskal-positif-negatif` | sampul | kosong | `migrasi-photo-1591696331111-ef9586a5b17a.webp` | isi |
| layanan | 4 | `laporan-perpajakan-keuangan` | gambar | kosong | `migrasi-photo-1454165804606-c3d57bc86b40.webp` | isi |
| layanan | 3 | `pengurusan-pkp` | gambar | kosong | `migrasi-photo-1664575602554-2087b04935a5.webp` | isi |
| layanan | 2 | `laporan-spt` | gambar | kosong | `migrasi-photo-1434626881859-194d67b2b86f.webp` | isi |
| layanan | 1 | `restitusi-pajak` | gambar | kosong | `migrasi-photo-1551836022-d5d88e9218df.webp` | isi |
| tim | 4 | `Bima Prasetyo` | foto | kosong | `migrasi-photo-1519085360753-af0119f7cbe7.webp` | isi |
| tim | 3 | `Maya Puspita` | foto | kosong | `migrasi-photo-1573497019940-1c28c88b4f3e.webp` | isi |
| tim | 2 | `Risa Rizki Sharon` | foto | kosong | `migrasi-photo-1494790108377-be9c29b29330.webp` | isi |
| tim | 1 | `Akmal Abdul Arik` | foto | kosong | `migrasi-photo-1472099645785-5658abf4ff4e.webp` | isi |
| mitra | baru | `Vidichi` | logo | kosong | `migrasi-mitra-vidichi.jpg` | isi — Record mitra baru. |
| mitra | baru | `Tantri` | logo | kosong | `migrasi-mitra-tantri.jpg` | isi — Record mitra baru. |
| mitra | baru | `Sumber Aneka Wangi` | logo | kosong | `migrasi-mitra-sumber-aneka-wangi.jpg` | isi — Record mitra baru. |
| mitra | baru | `Satoshi` | logo | kosong | `migrasi-mitra-satoshi.jpg` | isi — Record mitra baru. |
| mitra | baru | `Power Computerindo` | logo | kosong | `migrasi-mitra-power-computerindo.jpg` | isi — Record mitra baru. |
| mitra | baru | `Pabriek Kuweh` | logo | kosong | `migrasi-mitra-pabriek-kuweh.jpg` | isi — Record mitra baru. |
| mitra | baru | `Oseal` | logo | kosong | `migrasi-mitra-oseal.jpg` | isi — Record mitra baru. |
| mitra | baru | `Moonbow` | logo | kosong | `migrasi-mitra-moonbow.jpg` | isi — Record mitra baru. |
| mitra | baru | `KMS` | logo | kosong | `migrasi-mitra-kms.jpg` | isi — Record mitra baru. |
| mitra | baru | `Kafeel Netz` | logo | kosong | `migrasi-mitra-kafeel-netz.jpg` | isi — Record mitra baru. |
| mitra | baru | `Javarudraksha` | logo | kosong | `migrasi-mitra-javarudraksha.jpg` | isi — Record mitra baru. |
| mitra | baru | `HappyEats` | logo | kosong | `migrasi-mitra-happyeats.jpg` | isi — Record mitra baru. |
| mitra | baru | `Guri Senbei` | logo | kosong | `migrasi-mitra-guri-senbei.jpg` | isi — Record mitra baru. |
| mitra | baru | `GMK Door` | logo | kosong | `migrasi-mitra-gmk-door.jpg` | isi — Record mitra baru. |
| mitra | baru | `Dewa Rackindo` | logo | kosong | `migrasi-mitra-dewa-rackindo.jpg` | isi — Record mitra baru. |
| mitra | baru | `Daing Super` | logo | kosong | `migrasi-mitra-daingsuper.jpg` | isi — Record mitra baru. |
| mitra | baru | `Callme` | logo | kosong | `migrasi-mitra-callme.jpg` | isi — Record mitra baru. |
| mitra | baru | `Beeskin` | logo | kosong | `migrasi-mitra-beeskin.jpg` | isi — Record mitra baru. |
| mitra | baru | `Artave` | logo | kosong | `migrasi-mitra-artave.jpg` | isi — Record mitra baru. |
| mitra | baru | `Arava Tour` | logo | kosong | `migrasi-mitra-arava-tour.jpg` | isi — Record mitra baru. |
| mitra | 1 | `akiha` | logo | `akiha.webp` | `akiha.webp` | pertahankan — Relasi logo sudah terisi; tidak ditimpa. |

## Rencana record mitra

| Nama | Status | ID | Urutan sekarang | Urutan rencana | Media | Aksi | Catatan |
|---|---|---:|---:|---:|---|---|---|
| Vidichi | create | baru | — | 2 | `migrasi-mitra-vidichi.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Tantri | create | baru | — | 3 | `migrasi-mitra-tantri.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Sumber Aneka Wangi | create | baru | — | 4 | `migrasi-mitra-sumber-aneka-wangi.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Satoshi | create | baru | — | 5 | `migrasi-mitra-satoshi.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Power Computerindo | create | baru | — | 6 | `migrasi-mitra-power-computerindo.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Pabriek Kuweh | create | baru | — | 7 | `migrasi-mitra-pabriek-kuweh.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Oseal | create | baru | — | 8 | `migrasi-mitra-oseal.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Moonbow | create | baru | — | 9 | `migrasi-mitra-moonbow.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| KMS | create | baru | — | 10 | `migrasi-mitra-kms.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Kafeel Netz | create | baru | — | 11 | `migrasi-mitra-kafeel-netz.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Javarudraksha | create | baru | — | 12 | `migrasi-mitra-javarudraksha.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| HappyEats | create | baru | — | 13 | `migrasi-mitra-happyeats.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Guri Senbei | create | baru | — | 14 | `migrasi-mitra-guri-senbei.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| GMK Door | create | baru | — | 15 | `migrasi-mitra-gmk-door.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Dewa Rackindo | create | baru | — | 16 | `migrasi-mitra-dewa-rackindo.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Daing Super | create | baru | — | 17 | `migrasi-mitra-daingsuper.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Callme | create | baru | — | 18 | `migrasi-mitra-callme.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Beeskin | create | baru | — | 19 | `migrasi-mitra-beeskin.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Artave | create | baru | — | 20 | `migrasi-mitra-artave.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| Arava Tour | create | baru | — | 21 | `migrasi-mitra-arava-tour.jpg` | buat record mitra + isi logo | Record mitra belum ada; akan dibuat, bukan menimpa record lama. |
| akiha | existing | 1 | 1 | — | `akiha.webp` | pertahankan | Record mitra dan relasi logo sudah ada; tidak dibuat ulang. |

## Catatan keamanan dan blocker

- Script ini hanya GET API dan membaca file; tidak menulis database atau `media/`.
- Belum ada migrasi, seed, admin baru, atau rebuild/restart container.
- Upload 20 logo JPG memerlukan bypass konversi WebP yang eksplisit dan trusted. Tanpa itu, hook Media akan mengubahnya menjadi WebP lossy.
- Tiga file `.jpg` di `media/` sebenarnya PNG, tetapi tidak dipakai dalam rencana ini.
- 263 file media lama tidak dihapus dan tidak dianggap sebagai record migrasi.
- Laporan duplikat/orphan terpisah: `docs/audit-media-lama.md`.

## Verifikasi backup

Backup PostgreSQL, `media/`, dan `public/images/` sudah dibuat dan diverifikasi di `/tmp/easytax-backup-20261023-0315/`. Rincian ukuran, checksum, dan verifikasi arsip ada di [`docs/backup-verifikasi.md`](./backup-verifikasi.md). Lokasi `/tmp` bersifat sementara; salin ke penyimpanan persisten sebelum migrasi aktual.

## Perubahan foto profil testimoni

Perubahan konfigurasi koleksi testimoni menambah field upload opsional `fotoProfil` yang berelasi ke `media`. `src/payload-types.ts` sudah digenerasi ulang, build dan typecheck berhasil. **Kolom relasi baru belum ada di database aktif**; jangan gunakan field di CMS sebelum menjalankan migrasi skema yang ditinjau dan disetujui. Kode yang sudah berjalan dan memakai field opsional tetap menampilkan inisial untuk record lama.
