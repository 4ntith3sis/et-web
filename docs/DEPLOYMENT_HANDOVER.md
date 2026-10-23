# EasyTax — Demo Lokal dan Handover Deployment

Dokumen ini menjelaskan setup lokal dan pemeriksaan sebelum tim deployment mengambil source dari Git. Tidak ada perintah di sini yang menghapus volume.

## Arsitektur

- Compose project: `easytax`
- Service dan hostname internal DB: `postgres`
- Service aplikasi: `app`
- Container target: `easytax-postgres` dan `easytax-app`
- Image DB: `pgvector/pgvector:pg16`
- Database demo: volume `easytax_postgres_data_demo` (harus dipetakan secara eksplisit di `compose.yaml`)
- Media Payload: bind mount `./media:/app/media`; jangan menghapus atau menimpanya.
- Payload menggunakan PostgreSQL adapter dengan `push: false`; migrasi dijalankan secara eksplisit.

Volume lama `easytax_postgres_data` berisi data yang dipertahankan. Jangan arahkan Compose demo ke volume ini dan jangan menghapusnya. Sebelum menjalankan Compose, pastikan output konfigurasi menunjuk ke `easytax_postgres_data_demo`.

## Prasyarat dan environment

- Docker Desktop dengan Docker Compose v2.
- Node.js sesuai Dockerfile dan npm untuk pemeriksaan/test lokal.
- Salin `.env.example` ke `.env`, lalu isi `POSTGRES_PASSWORD` dan `PAYLOAD_SECRET` dengan nilai acak yang dikelola secara lokal. Jangan memasukkan `.env` ke Git atau membagikan nilainya.
- Kredensial yang dibuat untuk demo lokal bersifat sementara; ganti semua secret dan password sebelum memakai environment bersama atau produksi.
- `PAYLOAD_SECRET` minimal 32 karakter. Untuk koneksi Compose, aplikasi memakai hostname `postgres` pada port internal 5432.
- Jika variabel Compose wajib tidak tersedia, jangan jalankan `up`; selesaikan environment lokal terlebih dahulu.

## Jalankan database dan aplikasi

Validasi konfigurasi tanpa mencetak environment:

```sh
docker compose -p easytax config -q
```

Periksa secara selektif konfigurasi hasil render untuk memastikan image `pgvector/pgvector:pg16`, container target, service `postgres`, dan mount volume bernama `easytax_postgres_data_demo`. Jangan tampilkan seluruh konfigurasi karena dapat memuat environment.

Setelah target volume terbukti benar:

```sh
docker compose -p easytax up -d postgres
docker compose -p easytax ps postgres
docker compose -p easytax logs --tail=100 postgres
```

Lanjutkan hanya jika healthcheck database berstatus `healthy`. Kemudian jalankan migrasi satu kali sebelum aplikasi:

```sh
docker compose -p easytax run --rm app npm run cms:migrate
docker compose -p easytax up -d app
docker compose -p easytax ps
docker compose -p easytax logs --tail=100 app
```

`depends_on` dengan health condition membantu urutan startup, tetapi bukan pengganti pemeriksaan koneksi dan migrasi. `RUN_MIGRATIONS` harus tetap `false`; jangan menjalankan migrasi dari beberapa proses sekaligus.

## Database, pgvector, dan migrasi

Migrasi resmi terdaftar pada `src/migrations/index.ts` dan dijalankan berurutan oleh Payload. Image pgvector PostgreSQL 16 menyediakan ekstensi `vector`; migrasi artikel membuat ekstensi dan tabelnya. Migrasi lokal terakhir mengasumsikan schema sebelumnya berisi `vector(1536)`, mengosongkan tabel embedding turunan, lalu mengubah kolom dan index ke `vector(1024)`.

Kontrak semantic search lokal pada source saat ini adalah model `Horizon-Labs/multilingual-embedding-small` dengan output 1024 dimensi. Provider embedding dokumen dan query sama-sama memvalidasi dimensi 1024; retrieval memakai cosine distance pgvector. Migrasi terakhir mengubah data embedding turunan, jadi hanya jalankan pada database demo baru yang benar-benar terisolasi. Jangan jalankan ulang tanpa memeriksa ledger Payload dan schema.

## Membuat akun admin

Jangan gunakan `cms:seed` hanya untuk membuat admin: seed tersebut juga memasukkan konten dan dapat mengunduh/mengunggah media. Koleksi `users` adalah auth collection Payload. Setelah migrasi, jalankan `npm run admin:create` dari terminal interaktif host; script memakai `.env`, meminta email dan password dua kali, menyembunyikan input password, menolak duplikasi email, dan tidak mencetak kredensial. Saat menjalankan dari host, set `DATABASE_URI` sementara di environment ke endpoint loopback database demo (port `POSTGRES_PORT`) sebelum perintah, tanpa memasukkan URI ke history, atau gunakan CLI interaktif di dalam service dengan TTY dan env yang diwarisi Compose. Gunakan password admin unik yang kuat. Jangan memakai fallback seed atau menaruh kredensial dalam command history/Git.

Buka `http://localhost:3004/admin`, buat/login dengan kredensial lokal, dan uji baca/tulis hanya pada data demo yang disetujui.

## Uji CMS, Puck, dan semantic search

- CMS: login admin, buka koleksi yang diperlukan, lalu buat dan baca kembali record uji yang aman.
- Puck: buka `/admin/page-builder`, ubah draft halaman uji, simpan, muat ulang, publish sesuai alur, lalu verifikasi tampilan publik.
- Semantic search hanya untuk pencarian artikel; tidak ada chatbot atau pembuatan jawaban LLM. Fitur memerlukan `RAG_ARTIKEL_ENABLED=true` dan cache model ONNX lengkap di `RAG_EMBEDDING_CACHE_DIR` (di Compose `/app/model-cache`). Unduhan runtime dinonaktifkan secara default.
- Artikel yang dipublikasikan/diubah diindeks melalui hook Payload. Verifikasi dimensi 1024, embedding tersimpan, query menghasilkan embedding, dan vector similarity mengembalikan artikel relevan sebelum menyatakan end-to-end lulus.
- Jika cache model belum tersedia, semantic search tidak terverifikasi; aplikasi tetap dapat dijalankan dengan fitur tersebut nonaktif.
- Reindex awal dijalankan melalui `POST /api/artikel/reindex` oleh admin setelah cache model dan schema siap. Endpoint memproses semua halaman artikel published; default-nya melewati konten yang hash-nya tidak berubah. `?force=true` membuat ulang embedding dan hanya digunakan setelah perubahan model yang direncanakan.

## Status dan troubleshooting

```sh
docker compose -p easytax ps
docker compose -p easytax logs --tail=100 postgres
docker compose -p easytax logs --tail=100 app
curl -fsS http://localhost:3004/api/health
```

Healthcheck PostgreSQL memakai `pg_isready`. Healthcheck aplikasi memanggil `/api/health`; pastikan route memeriksa kesiapan layanan yang diperlukan, bukan sekadar keberadaan proses. Jika DB belum sehat, jangan migrasi. Jika koneksi gagal, periksa hostname `postgres`, kredensial lokal, dan jaringan Compose tanpa mencetak secret.

## Backup dan restore

- Backup PostgreSQL dengan `pg_dump` pada database yang sehat ke lokasi terpisah yang kapasitasnya sudah diperiksa. Jangan backup saat file data sedang ditulis dengan menyalin volume secara langsung.
- Backup media `./media` secara terpisah. Pastikan backup tidak menimpa sumber; pertahankan metadata dan uji restore pada target baru.
- Restore hanya ke database/volume target baru yang disepakati. Jangan gunakan `down -v`, prune volume, atau reset Docker untuk troubleshooting.
- Untuk demo aktif, catat nama volume aktual sebelum backup/restore; sumber lama `easytax_postgres_data` tetap dipertahankan.

## Git handover

Sebelum review, periksa `git status`, diff dan file tidak terlacak. Pastikan `.env`, kredensial, dump sensitif, cache model dan artefak lokal tidak dilacak. `.env.example` hanya boleh berisi nama variabel dan placeholder. Jangan menghapus media yang sudah dilacak/diperlukan. Commit/push dilakukan oleh pemilik repository setelah review; tidak dilakukan sebagai bagian dari setup ini.

## Checklist demo dan penerimaan

- [ ] `docker compose -p easytax config -q` berhasil dan target volume demo terverifikasi.
- [ ] DB target sehat, memakai pgvector, dan volume lama tetap ada/tidak digunakan.
- [ ] Migrasi resmi selesai dan schema `artikel_embeddings.embedding` adalah `vector(1024)`.
- [ ] Akun admin dibuat tanpa seed konten/media; login Payload berhasil.
- [ ] CMS read/write dan Puck edit-save-reload-publish-render diuji.
- [x] **Semantic search acceptance pada environment disposable lulus** — model uji `/private/tmp/easytax-rag-model`; inference ONNX nyata menghasilkan 1024-d. Migration selesai pada Node 24.19.0 via Payload `--disable-transpile` dengan environment terisolasi: tujuh migration tercatat di `easytax_rag_migration`, termasuk `20261023_artikel_embeddings_local`; kolom terverifikasi `vector(1024)`. Target: container `easytax-rag-acceptance-db`, `127.0.0.1:55439`, volume `easytax-rag-acceptance-data`.

  Satu rangkaian HTTP pada production build Next.js 16.4.2, Node 24.19.0, port 3049, server PID **64421** (listener diverifikasi sebelum/sesudah), dengan environment khusus proses uji. Proses hidup sejak startup sampai skenario terakhir; durasi tercatat sekitar 27 detik sebelum dihentikan. Request dari proses terpisah, timeout 15–20 detik: `GET /` → 200/415.7 ms; pencarian UMKM/SPT → 200/2629.8 ms, fixture published `9001/fixture-pajak-umkm`, similarity 0.7594; query bertema draft → 200/74.6 ms tanpa artikel draft; query tanpa kecocokan → 200/48.0 ms dengan `artikel: []`; ketika hanya container disposable dihentikan, query → 503/133.3 ms dengan pesan aman; setelah container disposable dinyalakan dan `pg_isready` sukses, pencarian relevan pulih → 200/37.5 ms dengan fixture 9001. Seluruh skenario lulus dalam server PID yang sama. Fixture 9002 tetap `_status=draft` dan tidak memiliki embedding; row fixture 9001 mempunyai vector 1024-d.

  Bukti jalur: HTTP memakai `POST /api/artikel/search` default route → service `cariArtikelSemantik` → Payload client/DB → ONNX local provider → query pgvector; tidak memakai test mock. Environment pengujian mengarah ke DB disposable; container aktif EasyTax tidak disentuh. Server acceptance PID 64421 dihentikan setelah bukti tercatat; server dev port 3004 dibiarkan berjalan. Catatan risiko: saat DB sengaja dihentikan, log server mengeluarkan error PostgreSQL yang juga memuat parameter query dengan nilai embedding. Respons HTTP aman, tetapi logging internal perlu ditinjau agar parameter embedding tidak tercetak. Build/typecheck, inference, integration dan unit PASS sebelumnya tetap berlaku. Tidak melakukan migrasi ulang, deploy, commit, atau push.
- [ ] Aplikasi sehat, halaman publik dan `/admin` dapat dibuka; build/typecheck/test dicatat.
- [ ] Media, `.env`, working tree, file sensitif, dan status Git diperiksa sebelum handover.
- [ ] Tidak ada deployment produksi, commit, push, atau penghapusan volume tanpa instruksi pemilik.

## Routing tombol konsultasi (uji sementara)

- CTA konsultasi selalu diarahkan ke endpoint `/api/konsultasi/whatsapp`, yang memilih nomor aktif melalui router Payload/PostgreSQL. Strategi untuk pembagian setara adalah round-robin atomik dengan advisory lock dan counter assignment. Jika nomor aktif tidak tersedia, fallback dummy terpilih dan endpoint redirect ke WhatsApp; tidak mengalihkan konsultasi ke `/kontak`.
- Nomor tujuan utama dibaca dari Payload > Kontak > Nomor WhatsApp. Jika tidak tersedia/gagal, environment uji memakai tiga nomor dummy berotasi di server melalui `src/features/whatsapp/config.ts`; dummy bukan nomor EasyTax dan wajib dihapus/diganti sebelum production. Fallback dummy bukan pengganti konfigurasi nomor CMS untuk pembagian nyata.
- Pesan umum, layanan, dan paket dikirim di query `pesan` beserta enum `konteks` tervalidasi (`umum|layanan|paket`); nama layanan/paket berasal dari record yang ditampilkan, harga paket dari data paket yang ditampilkan. Unit tests memeriksa encoding/context umum; link navigasi, email, telepon, kalkulator, pencarian, dan form kontak tidak dialihkan. URL/redirect belum membuktikan nomor dummy aktif atau dapat menerima pesan WhatsApp.
- `ConsultationButton` memakai link internal Next.js menuju endpoint, bukan `window.open`; endpoint merespons redirect HTTP 307 ke `https://wa.me/...`. Exception tak terduga di endpoint sekarang menghasilkan JSON 503 tanpa mengarahkan pengguna ke `/kontak`. Pesan untuk konteks layanan/paket dibentuk dari nama yang ditampilkan dan fallback ke pesan umum bila nama kosong. Verifikasi runtime tetap diperlukan untuk membuktikan endpoint terhubung ke Payload dan membuka WhatsApp pada environment deploy.
- Per 2026-10-23, browser test membuktikan Next `Link` memperlakukan `/api/konsultasi/whatsapp` sebagai navigasi RSC dan fetch redirect 307 lintas-origin, menghasilkan CORS `TypeError: Failed to fetch` sebelum browser fallback navigasi. `ConsultationButton` kini menandai link untuk navigasi dokumen biasa melalui anchor; uji klik navbar dan CTA layanan menghasilkan GET tanpa `_rsc`, HTTP 307 ke `wa.me`, tanpa `Failed to fetch`/CORS. Automation memblokir target eksternal sehingga keberhasilan membuka/mengirim chat tidak diuji.
- Nomor WhatsApp utama kartu Kontak dikonfigurasi melalui Site Settings → Kontak → `whatsappUrl` (label admin “Nomor WhatsApp Utama”). Masukkan nomor format internasional; kosongkan untuk menonaktifkan tautan. Ini terpisah dari koleksi `nomor-whatsapp` yang dipakai endpoint konsultasi dan Round Robin. Global `pengaturan-situs` menginvalidasi cache bertag `pengaturan-situs` pada perubahan.
