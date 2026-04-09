# Work Plan: Migrate to prisma.config.ts and Prisma-managed migrations
Date: 2026-04-09

## Goal
Migrate from traditional `prisma/schema.prisma`-only setup to `prisma.config.ts`, and switch from `wrangler d1 migrations apply` to Prisma-managed migration workflow.

## Tasks

### Backend
- [x] Create `prisma.config.ts` at project root using `defineConfig` from `prisma/config`
  - Configure `schema`, `migrations.path`, and `datasource.url` (using `listLocalDatabases` from `@prisma/adapter-d1`)
- [x] Move existing migration from `migrations/0001_init.sql` to `prisma/migrations/0001_init/migration.sql` (Prisma standard path)
- [x] Update `package.json` scripts:
  - `db:migrate` → `bunx prisma migrate dev` (for local dev)
  - Add `db:push` → `bunx prisma db push` (quick schema sync)
  - Add `db:generate` → `bunx prisma generate`
- [x] Verify `prisma generate` and `prisma validate` work with the new config
- [x] Remove old `migrations/` directory

### QA
- [x] Run type check (`bunx tsc -b --noEmit`) — pass
- [x] Run lint/format (`bunx biome check`) — pass
- [x] Commit changes: `chore(prisma): migrate to prisma.config.ts and Prisma-managed migrations` (11804c1)

## Execution Order
1. Backend: Create prisma.config.ts, update schema, move migrations, update scripts
2. QA: Type check, lint, commit

## Deliverables
- `prisma.config.ts`: New Prisma configuration file
- `prisma/migrations/`: Prisma-managed migration directory
- `package.json`: Updated scripts for Prisma migration workflow
- Removed: `migrations/` (old wrangler-managed directory)

## Risks / Notes
- D1 does not fully support `prisma migrate deploy` — for production, `wrangler d1 migrations apply` or `prisma db push` may still be needed
- `listLocalDatabases()` requires `.wrangler/state/` to exist (created on first `bun run dev`)
- Shadow database support for D1 is limited — `prisma migrate dev` may fall back to diff-based approach
