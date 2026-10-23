#!/bin/sh
set -eu

echo "[EasyTax dev] Starting application..."

if [ -z "${PAYLOAD_SECRET:-}" ] && [ -n "${PAYLOAD_SECRET_FILE:-}" ] && [ -r "$PAYLOAD_SECRET_FILE" ]; then
  PAYLOAD_SECRET=$(cat "$PAYLOAD_SECRET_FILE")
  export PAYLOAD_SECRET
fi
if [ -z "${PAYLOAD_SECRET:-}" ] || [ "${#PAYLOAD_SECRET}" -lt 32 ]; then
  echo "[EasyTax dev] PAYLOAD_SECRET must be supplied and at least 32 characters." >&2
  exit 1
fi

if [ -z "${DATABASE_URI:-}" ]; then
  if [ -z "${DATABASE_PASSWORD_FILE:-}" ] || [ ! -r "$DATABASE_PASSWORD_FILE" ]; then
    echo "[EasyTax dev] Set DATABASE_URI or a readable DATABASE_PASSWORD_FILE." >&2
    exit 1
  fi
  db_password=$(cat "$DATABASE_PASSWORD_FILE")
  if [ -z "$db_password" ]; then
    echo "[EasyTax dev] Database password file is empty." >&2
    exit 1
  fi
  # Compose secrets use URL-safe generated passwords, avoiding URI delimiters.
  DATABASE_URI="postgresql://${POSTGRES_USER:?POSTGRES_USER required}:${db_password}@${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432}/${POSTGRES_DB:?POSTGRES_DB required}"
  export DATABASE_URI
  unset db_password
fi

export DATABASE_URL="${DATABASE_URL:-$DATABASE_URI}"
exec "$@"
