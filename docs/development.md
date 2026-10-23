# EasyTax development with Docker Compose

This configuration is development-only and deliberately separate from
`compose.yaml`. It uses a Next.js/Payload application container and a separate
PostgreSQL 16 + pgvector container. It does not connect to legacy EasyTax
containers, databases, or volumes. It does not run migrations automatically.

## Prerequisites

- Docker Engine/Desktop with enough available memory to build and run Next.js.
- Host port 3041 available (check before starting). The service binds only to
  `127.0.0.1`; PostgreSQL is not published to a host port.
- Local secret files outside the repository. Generate a long URL-safe DB
  password and a random Payload secret of at least 32 characters. Restrict file
  permissions (for example, `chmod 600`). Do not put secret values in shell
  history, Compose files, or source control.

Set paths and a development-only Payload secret in the invoking shell:

```sh
export EASYTAX_DEV_DB_PASSWORD_FILE="$HOME/.config/easytax/dev-db-password"
export EASYTAX_DEV_PAYLOAD_SECRET_FILE="$HOME/.config/easytax/payload-secret"
```

Compose mounts the database password in both services and the Payload secret
in the app. The entrypoint reads the DB password to construct its connection
URL and reads the Payload secret into the required environment variable at
runtime; neither secret is baked into the image. Use URL-safe characters in the
DB password because the URI is assembled without a separate URL-encoding
dependency.

## Storage and isolation

- `easytax_dev_postgres_data` -> PostgreSQL `/var/lib/postgresql/data`
- `easytax_dev_media` -> application `/app/media`

These are new named volumes, not the legacy `easytax_*` database/media volumes.
Before first run, confirm that these exact volume names do not already exist;
if either exists unexpectedly, stop and identify its owner. Recreating the
application container retains both volumes. Never use `down -v` for routine
development. Do not connect this environment to an unidentified/canonical DB.

## Start and inspect

The project name must be explicit so operations stay scoped to this isolated
environment. Confirm port 3041 and the volume names first.

```sh
docker compose -p easytax-dev -f compose.dev.yaml config --quiet
docker compose -p easytax-dev -f compose.dev.yaml up -d --build
docker compose -p easytax-dev -f compose.dev.yaml ps
docker compose -p easytax-dev -f compose.dev.yaml logs -f
```

`depends_on: condition: service_healthy` delays application start until
PostgreSQL responds to `pg_isready`. Compose health checks expose DB readiness
and the app `/api/health` result. Docker's `init` forwards signals/reaps child
processes, and the existing entrypoint uses `exec` for the Next.js process.

```sh
docker compose -p easytax-dev -f compose.dev.yaml stop
docker compose -p easytax-dev -f compose.dev.yaml start
docker compose -p easytax-dev -f compose.dev.yaml restart app
```

Stopping the project does not remove volumes. Avoid `down -v`; remove resources
only after verifying the project identity and confirming disposable data.

## Schema and initial CMS setup

`RUN_MIGRATIONS=false` is intentional. After starting a new, isolated DB,
review and explicitly run the repository's Payload migrations against this
development project, then create/seed test content as separately approved.
The database image provides pgvector for migrations that use `vector`; verify
the extension in the test DB before applying those migrations. Never point
migration commands at an old or canonical database.

## Backup and restore (development only)

For a consistent paired backup, stop app writes first. Then dump PostgreSQL and
archive media separately to a protected location outside the repository and
Docker volumes. Treat the database dump and uploads as potentially sensitive.

Example DB dump:

```sh
docker compose -p easytax-dev -f compose.dev.yaml exec -T postgres \
  sh -lc 'PGPASSWORD="$(cat /run/secrets/db_password)" pg_dump -U easytax_dev -d easytax_dev -Fc' \
  > "$HOME/easytax-dev.dump"
```

Example media archive after stopping app writes:

```sh
docker compose -p easytax-dev -f compose.dev.yaml stop app
docker compose -p easytax-dev -f compose.dev.yaml run --rm --no-deps app \
  tar -C /app -czf - media > "$HOME/easytax-dev-media.tar.gz"
```

Restore only into a new, isolated project with verified empty volumes. Restore
the database dump with `pg_restore` into the matching empty development DB and
extract the media archive into `/app/media`. Verify DB tables, representative
media files/checksums, health, admin login, Puck, and public media URLs. A
backup is not considered verified until this restore drill succeeds.

## Current limitations

- This configuration has not been built or run yet. The Docker VM last reported
  about 3.82 GiB, and prior Next.js Docker builds failed with `cannot allocate
  memory`; check memory before requesting approval to build.
- The initial DB is empty. Admin creation, seed, and migrations are explicit
  follow-up operations; no old database or media is imported.
- Development app code is copied into the image; rebuild to include code edits.
- The app endpoint health check and runtime availability remain to be verified.
- This is not a production deployment configuration.
