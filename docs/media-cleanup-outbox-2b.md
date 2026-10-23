# Draft: transactional media cleanup outbox (Stage 2B)

This document and the migration file are proposals only. Nothing is registered,
applied, or connected to Payload hooks. Cleanup remains disabled.

## Transaction and lock matrix

| Write path | Payload transaction in 3.91.0 | Hook timing | Lock/outbox status |
|---|---|---|---|
| Collection create/update/delete | `initTransaction(req)` unless disabled; `req.transactionID` maps to adapter Drizzle session | afterChange/afterDelete precedes `commitTransaction` | Can be integrated only if every relation writer takes media advisory locks and enqueues on that session; not wired |
| Draft/publish | Same collection operation transaction; versions are written by operation | hooks precede commit | Old references in version tables must remain scanner roots; not wired |
| Restore version | Dedicated operation begins and commits transaction | afterChange precedes commit | Must use same relation locks; not wired |
| Global update/restore | Global operation has transaction and hooks before commit | afterChange precedes commit | Global SEO media references not currently configured; needs future schema review |
| Bulk collection update/delete | Per-document/optional bulk transaction behavior differs by args and adapter | hooks run per operation | Unsupported until every batch mode proves lock/outbox session propagation |
| Page Builder actions | Server actions call Payload create/update | normal Payload operation | Layout JSON can contain `{media:{id,url,...}}`; JSON schema lacks DB FK, so scanner cannot prove no reference |
| Reusable Components | Payload CRUD; versions enabled without drafts | normal hooks | `data`/version `data` JSON is arbitrary enough to fail closed |
| Direct DB/SQL/custom writes | May bypass Payload hooks and lock protocol | none guaranteed | Unsupported; cleanup must remain disabled while these writers exist |
| Media upload/delete filesystem | Payload writes files alongside DB operations | not transactional with PostgreSQL | Separate reconciliation needed; this outbox is not an upload rollback mechanism |

## Proposed outbox

`src/migrations/20261023_media_cleanup_outbox.ts` is an unregistered draft. It
contains media ID, filename, managed path, unique idempotency key, status,
enqueue/availability/lock/completion timestamps, attempts, and safe error text.
Down migration drops the table and therefore discards queue state; rollback must
first stop the worker, inspect/export pending rows, and only then apply down.

`enqueueCandidateInTransaction` accepts a transaction-bound executor. The
caller must obtain it from `req.transactionID` via
`payloadTransactionExecutor`; a missing transaction throws closed. Before
activating, the code needs a migration registered and a test using Payload's
actual adapter session, not merely raw PostgreSQL transactions.

## Worker sequence (not implemented)

1. On primary DB, claim a pending row in a short transaction with
   `FOR UPDATE SKIP LOCKED`, mark processing, increment attempts.
2. Start a processing transaction and take transaction-scoped advisory lock
   `hashtextextended('media-reference:' || mediaID, 0)`.
3. All relation writers must take the identical advisory lock before changing
   a reference and hold it through commit. Re-scan on primary after lock.
4. If any reference exists or a source is unknown/unqueryable, mark retained.
   If complete and unreferenced, validate canonical path/root/symlinks, unlink,
   then mark done. Unlink failure schedules bounded backoff and safe error.
5. Never hold a DB transaction open around slow filesystem work unless the
   lock protocol proves the writer race cannot otherwise be closed. A robust
   design still needs a durable per-media lock/lease across scan and unlink.

## Scanner coverage / known fail-closed paths

Current registry covers direct FK columns from checked-in migrations,
Artikel/Layanan versions, Payload locked-document media relation, and has
JSONB source entries for Page Layouts and Reusable Components. Current SQL
scanner intentionally marks all JSON sources uncertain because the JSON
contracts do not provide a complete media-reference schema. Puck Image stores
`media: {id?, url, alt, ...}`; URLs may also be copied or transformed. Therefore
no candidate may be ELIGIBLE today. Polymorphic/custom writers and future
collections are also uncertain until schema introspection/registration verifies
all columns and operators.

## Test evidence and limits

The temporary PostgreSQL integration fixture invokes the transaction-bound
outbox and advisory-lock helper with an executor bound to a PG client. It proves
atomic visibility/rollback, unique idempotency, row claim with SKIP LOCKED,
advisory lock exclusion, and isolated filesystem retry behavior. It does not
invoke Payload operations or its actual Drizzle adapter session, apply the
migration, execute production scanner SQL, or run a filesystem deletion worker;
it is not proof of end-to-end cleanup.

Do not register/apply the migration or enable the worker before adding
Payload-adapter integration tests, lock participation in every content writer,
complete reference coverage, and path/symlink race tests.
