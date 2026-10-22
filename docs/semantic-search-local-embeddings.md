# Semantic search artikel dengan embedding lokal

## Status

Semantic search artikel EasyTax memakai pipeline kustom Payload open-source
yang sudah ada di repository ini. Fitur ini **tidak** memakai Payload
Enterprise, OpenAI, atau API embedding eksternal.

Status verifikasi per 22 Oktober 2026:

- Model ONNX lokal berjalan dan menghasilkan vektor 1024 dimensi.
- PostgreSQL lokal + pgvector sudah berisi 12 artikel published dan 54 chunk.
- Endpoint `POST /api/artikel/search` sudah diuji lewat HTTP.
- UI `/tulisan-pajak` sudah diuji di browser: saran live dan tombol
  **Cari Artikel** menampilkan kartu hasil.
- Fitur masih diaktifkan lewat environment proses. `.env` tidak diubah dan
  produksi tidak disentuh.

## Komponen

| Berkas | Fungsi |
| --- | --- |
| `src/rag/config.ts` | Feature flag, dimensi 1024, chunking, limit, threshold. |
| `src/rag/embedding-provider.ts` | Transformers.js/ONNX lokal dan pengecekan artifact. |
| `src/rag/text-extractor.ts` | Mengubah blok artikel Payload menjadi teks. |
| `src/rag/chunker.ts` | Memecah teks menjadi chunk dengan overlap. |
| `src/rag/article-indexing.ts` | Index, hapus index, dan reindex semua artikel. |
| `src/rag/hooks.ts` | Hook `afterChange`/`afterDelete` untuk sinkronisasi. |
| `src/rag/vector-store.ts` | Query pgvector dan penyimpanan embedding. |
| `src/rag/article-retrieval.ts` | Embedding query lalu retrieval chunk relevan. |
| `src/app/api/artikel/search/route.ts` | Kontrak HTTP pencarian artikel. |
| `src/app/api/artikel/reindex/route.ts` | Reindex manual, hanya admin. |
| `src/components/sections/ArtikelSearchControl.tsx` | Input, debounce, saran live. |
| `src/components/sections/DaftarArtikel.tsx` | State hasil dan kartu hasil. |

Hanya collection `artikel` yang di-index. Artikel unpublished dan artikel yang
dihapus tidak boleh masuk hasil retrieval.

## Prasyarat runtime

- Node.js glibc (bukan Alpine/musl) karena `onnxruntime-node`.
- PostgreSQL dengan ekstensi `vector` (pgvector). Di mesin pengembangan ini
  dipakai PostgreSQL 16 dan pgvector 0.8.7.
- Cache model lokal yang lengkap untuk
  `Horizon-Labs/multilingual-embedding-small`.

Berkas minimum di
`<cache>/Horizon-Labs/multilingual-embedding-small/`:

- `config.json`
- `tokenizer_config.json`
- `tokenizer.json` (atau `vocab.txt`)
- `onnx/model_quantized.onnx`

Ukuran model sekitar 269 MB. Pemuatan pertama lebih lambat (di pengembangan
sekitar 3,4 detik untuk inisialisasi ONNX); setelah itu proses yang sama
memakai singleton.

## Aktivasi

Fitur nonaktif secara default. Set environment berikut pada proses server:

```sh
RAG_ARTIKEL_ENABLED=true
RAG_EMBEDDING_MODEL=Horizon-Labs/multilingual-embedding-small
RAG_EMBEDDING_CACHE_DIR=/path/ke/transformers-cache
RAG_EMBEDDING_ALLOW_DOWNLOAD=false
```

Nilai default yang sudah dikalibrasi:

- `RAG_CHUNK_SIZE=800`
- `RAG_CHUNK_OVERLAP=150`
- `RAG_RETRIEVAL_LIMIT=6`
- `RAG_SIMILARITY_THRESHOLD=0.48`
- `RAG_MAX_QUERY_LENGTH=500`

Threshold 0,48 dipilih dari pengukuran model lokal. Query relevan yang diuji
berada di kisaran 0,49–0,70, sedangkan query di luar topik berada di bawah
0,48. Threshold lama 0,72 terlalu tinggi dan membuat hasil relevan terbuang.

`.env` sengaja tidak diubah dalam sesi ini. Jika fitur harus tetap aktif
setelah server di-restart, tambahkan variabel di atas ke environment
deployment atau `.env` yang dikelola terpisah.

## Database

Migration yang terdaftar:

- `20261022_artikel_embeddings`: membuat extension, tabel embedding, foreign
  key, dan index awal.
- `20261023_artikel_embeddings_local`: mengubah dimensi menjadi 1024 dan
  membuat ulang index cosine.

Pada database pengembangan lokal, kedua migration sudah diterapkan dan tercatat
di `payload-migrations`. Kondisi aktual:

```text
artikel_embeddings
  embedding       vector(1024)
  fk_artikel      artikel(id) ON DELETE CASCADE
  index           idx_artikel_embeddings_vector (ivfflat, vector_cosine_ops)
  lookup index    artikel_id, (artikel_id, content_hash)
```

Jangan mencampur vektor 1536 dan 1024. Jangan menjalankan migration atau
reindex ke produksi tanpa backup dan persetujuan terpisah.

### Catatan runner di Node 26

`npm run cms:migrate` saat ini gagal di Node 24/26 karena error undici
`CacheStorage`/`Illegal constructor` sebelum runner selesai. Migration lokal
diterapkan lewat runner Payload programatik (`payload.db.migrate()`) setelah
memeriksa ledger dan schema. Cara ini hanya untuk lingkungan pengembangan yang
sudah diverifikasi; jangan jadikan alasan untuk mengedit ledger secara manual.

## Indexing dan reindex

Indexing otomatis berjalan lewat hook Payload:

- Artikel published dibuat/diubah: chunk dan embedding diperbarui.
- Artikel unpublished/dihapus: index dihapus.
- Konten yang tidak berubah dilewati berdasarkan `content_hash`.

Reindex semua artikel published dapat dilakukan oleh admin:

```sh
curl -X POST \
  -H "Authorization: Bearer <PAYLOAD_ADMIN_TOKEN>" \
  "http://localhost:3004/api/artikel/reindex?force=true"
```

Tanpa `force=true`, artikel dengan hash yang sama akan dilewati sehingga tidak
terjadi double indexing.

Hasil reindex lokal terakhir: 12 artikel, 54 chunk, 0 error. Semua vektor
memiliki 1024 dimensi dan norm sekitar 1,0.

## API dan UI

Kontrak endpoint tetap:

```http
POST /api/artikel/search
Content-Type: application/json

{ "query": "batas omzet UMKM" }
```

Respons sukses:

```json
{
  "query": "batas omzet UMKM",
  "artikel": [
    {
      "id": 2,
      "judul": "...",
      "slug": "batas-omzet-umkm-pajak-final",
      "ringkasan": "...",
      "kategori": "Bisnis",
      "url": "/tulisan-pajak/batas-omzet-umkm-pajak-final",
      "relevansi": 0.6963
    }
  ]
}
```

Respons yang sudah diuji:

- `200` untuk query relevan.
- `200` dengan `artikel: []` untuk query di luar topik.
- `400` untuk query kosong atau lebih dari 500 karakter.
- `503` bila feature flag nonaktif atau retrieval gagal sementara.
- `504` bila retrieval melewati batas waktu.

Di UI, mengetik memicu saran setelah debounce 300 ms. Tombol **Cari Artikel**
memanggil endpoint yang sama dan menampilkan hasil di bagian
`Hasil Pencarian Artikel`. Desain dan input pencarian tidak diubah.

## Verifikasi yang sudah dijalankan

### Nyata (bukan mock)

- ONNX inference query dan batch: vektor 1024 dimensi, semua finite, norm
  sekitar 1,0.
- Reindex 12 artikel published ke PostgreSQL/pgvector: 54 chunk, 0 error.
- Retrieval langsung dari tabel `artikel_embeddings`.
- HTTP endpoint untuk `batas omzet UMKM`, `SP2DK`, `faktur pajak masukan`,
  `tarif PPh 21`, query di luar topik, dan validasi input.
- Browser Playwright di `http://localhost:3004/tulisan-pajak` dan
  `http://127.0.0.1:3004/tulisan-pajak`: input menerima teks, saran muncul,
  tombol Cari Artikel menampilkan tiga kartu hasil untuk `batas omzet UMKM`.
- `npm test`: 152 pass, 0 fail, 1 skip (tes inference ONNX hanya berjalan bila
  `RAG_EMBEDDING_TEST_CACHE_DIR` diset).
- `npm run typecheck`: lulus.

### Mock/unit

Tes unit memakai dependency injection untuk route, retrieval, chunking,
ekstraksi teks, konfigurasi, dan vector store. Tes tersebut tidak membuktikan
model atau database nyata; bukti nyata ada pada daftar di atas.

## Batasan

- Cache model di mesin pengembangan berada di direktori sementara managed
  tool. Untuk deployment, sediakan cache persisten/read-only yang stabil.
- Image Docker tidak membundel cache model. Mount cache read-only ke
  `/app/model-cache` (atau `RAG_EMBEDDING_CACHE_DIR`) sebelum mengaktifkan RAG.
  Image tetap bisa dibangun tanpa model, tetapi pencarian akan gagal bila
  flag aktif dan cache tidak tersedia.
- Model belum dipin ke revisi immutable dan belum memiliki manifest SHA-256.
  Ini perlu disiapkan sebelum deploy produksi.
- `allowedDevOrigins: ["127.0.0.1"]` ditambahkan hanya agar HMR dan hidrasi UI
  berjalan saat diuji lewat loopback. Opsi ini tidak memengaruhi produksi.
- Semantic search mencakup semua kategori. Filter kategori pada halaman tetap
  berlaku untuk daftar artikel awal, bukan untuk hasil semantic.
