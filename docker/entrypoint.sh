#!/bin/sh
set -e

echo "[EasyTax Docker] Memulai container EasyTax..."

# Verifikasi variabel database utama
if [ -z "$DATABASE_URI" ] && [ -n "$DATABASE_URL" ]; then
  export DATABASE_URI="$DATABASE_URL"
fi

if [ -z "$PAYLOAD_SECRET" ] || [ "${#PAYLOAD_SECRET}" -lt 32 ]; then
  echo "[EasyTax Docker] PAYLOAD_SECRET wajib tersedia dan minimal 32 karakter."
  exit 1
fi

# Tolak migrasi otomatis agar migrasi dijalankan sebagai langkah operasional terkoordinasi.
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[EasyTax Docker] Migrasi otomatis dilarang oleh entrypoint; jalankan migrasi terkoordinasi sebagai langkah operasional terpisah."
  exit 1
fi

# Jalankan perintah utama kontainer
exec "$@"
