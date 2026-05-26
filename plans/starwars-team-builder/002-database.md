# 002: Database

## Context

Stand up Postgres 17 via Docker Compose, wire Drizzle, create `teams` and `team_members` per [`data-model.md`](data-model.md), seed the default team, and add repositories that are the **only** place `drizzle-orm` is imported.
Service rules (cap, dark-side guard) land in Slice 004.

## Goal (demoable outcome)

`docker compose up -d postgres && turbo run db:migrate` brings up Postgres, creates the `teams` and `team_members` tables, and inserts the default team row (`slug = 'default'`).
`turbo run test` runs Vitest against the real container and covers `insert`, `findAll`, `findByCharacterId`, `softDeleteByCharacterId`. Removes are soft: the row stays in the table with `deletedAt` set, every read filters `deletedAt IS NULL`, and the dedupe index is a partial unique on active rows only.

## Prerequisites

Slice 001 is done. `data-model.md` is the source of truth for the table shape.

## Steps

1. **Add the Docker Compose file** at the repo root: `docker-compose.yml` with a single `postgres` service (`postgres:17-alpine`), env (`POSTGRES_USER=platform`, `POSTGRES_PASSWORD=platform`, `POSTGRES_DB=platform`), port `5432:5432`, a named volume `pgdata`, and a healthcheck (`pg_isready -U platform`). Use the project conventions for service naming.
2. **Install `drizzle-orm` `^0.45.2`, `drizzle-kit` `^0.31.10`, `pg` `^8.21.0`, and `@types/pg` `^8.20.0`** in `apps/platform`. (Versions live in `plan.md`'s Technical Context table; install is left to the slice author per the project rule.)
3. **Add env handling**. Create `apps/platform/src/env.ts` that reads `DATABASE_URL` and exports a typed object. Add `.env.example` with `DATABASE_URL=postgres://platform:platform@localhost:5432/platform`. Add `.env*` (except `.env.example`) to the root `.gitignore` if not already covered.
4. **Define the schema** at `apps/platform/src/db/schema.ts`. Two tables.
   - `teams`: `id uuid pk default gen_random_uuid()`, `slug text not null unique` (name the index `teams_slug_unique`), `name text not null`, `createdAt timestamptz not null default now()`.
   - `team_members`: `id uuid pk default gen_random_uuid()`, `teamId uuid not null references teams(id) on delete cascade`, `characterId integer not null`, `addedAt timestamptz not null default now()`, `deletedAt timestamptz` (nullable; `null` = active). Partial unique on `(teamId, characterId)` with predicate `WHERE deleted_at IS NULL`, named `team_members_team_id_character_id_active_unique`, so 409 mapping in Slice 004 can rely on it for active rows only. Also add a plain index on `teamId` named `team_members_team_id_idx`. Drizzle 0.45 expresses the partial predicate via `.where(sql\`${table.deletedAt} is null\`)` on the `uniqueIndex` builder. If the generated SQL drops the predicate, fall back to appending it by hand in the migration file and document why next to the index definition in `schema.ts`.
   Drizzle column mappings: TS camelCase, SQL snake_case. Export both tables plus `InferSelectModel`-derived `Team` and `TeamMember` types.
5. **Wire the Drizzle client** at `apps/platform/src/db/client.ts`. Export a singleton `db = drizzle(new Pool({ connectionString: env.DATABASE_URL }), { schema })`. This file imports `drizzle-orm/node-postgres`. Drizzle imports are restricted to `apps/platform/src/db/**` (this file and `schema.ts`) and `apps/platform/src/server/repositories/**` per the plan's layered-architecture rule.
6. **Configure `drizzle-kit`** at `apps/platform/drizzle.config.ts`: `schema: './src/db/schema.ts'`, `out: './src/db/migrations'`, `dialect: 'postgresql'`, `dbCredentials.url: env.DATABASE_URL`.
7. **Generate the initial migration** by running `drizzle-kit generate` (the slice author runs this once; the generated `src/db/migrations/0000_*.sql` file is checked in). Do not hand-write the SQL.
   Then add a hand-written **seed migration** at `src/db/migrations/0001_default_team.sql` that inserts the default team and is safe to re-run (running it twice still leaves one row):
   ```sql
   INSERT INTO teams (slug, name) VALUES ('default', 'Default team')
   ON CONFLICT (slug) DO NOTHING;
   ```
8. **Add the migration runner** at `apps/platform/src/db/migrate.ts`: a small Node script that opens a connection, calls `migrate(db, { migrationsFolder: './src/db/migrations' })`, and exits. Wire it as a script in `apps/platform/package.json`: `"db:migrate": "node --import tsx src/db/migrate.ts"`. Also add `"db:studio": "drizzle-kit studio"` and `"db:generate": "drizzle-kit generate"` for ergonomics.
9. **Write the repositories** at `apps/platform/src/server/repositories/`. Two files; both are the **only** places outside `db/` that import `drizzle-orm`.
   - `teamRepository.ts`: `findBySlug(slug): Promise<Team | undefined>`, `findDefault(): Promise<Team>` (throws if the seed row is missing).
   - `teamMemberRepository.ts`: methods are now all scoped by `teamId` **and filter out soft-deleted rows** (`deletedAt IS NULL`) on every read. `insert(teamId, characterId): Promise<TeamMember>`, `findAllByTeam(teamId): Promise<TeamMember[]>` (active only, ordered by `addedAt asc`), `findByTeamAndCharacterId(teamId, characterId): Promise<TeamMember | undefined>` (active only), `softDeleteByTeamAndCharacterId(teamId, characterId): Promise<boolean>` (UPDATE setting `deletedAt = now()` only when the row is currently active; returns `true` if a row was flipped, `false` otherwise; never issues a SQL `DELETE`), `countByTeam(teamId): Promise<number>` (active only). Export inferred `Team` and `TeamMember` types from `schema.ts`'s `InferSelectModel`.
10. **Extend the Vitest config** at `apps/platform/vitest.config.ts` (created in Slice 001 with the include glob and `passWithNoTests`). Add `test.setupFiles` pointing at a setup that soft-resets `team_members` between tests (`UPDATE team_members SET deleted_at = now() WHERE deleted_at IS NULL`) while leaving the seeded `teams` row alone, and `test.poolOptions.threads.singleThread = true` so concurrent tests do not race on the table. The repository's read methods filter `deletedAt IS NULL`, so each test starts with no active members; tombstones from prior tests are invisible and the partial unique index does not block re-inserts. We deliberately never `TRUNCATE` or hard-`DELETE` against `team_members`; the table is append-only with a soft-delete column. Drop `passWithNoTests` now that real tests exist. Every test lives next to its source as `foo.test.ts` (or `.tsx`); there is no unit/integration distinction by filename or directory. Tests that need Postgres assume `docker compose up -d postgres` has been run; tests that don't (pure units) simply skip the DB.
11. **Write the repository tests** next to the repositories under `apps/platform/src/server/repositories/`. Two files. Each test resolves the default team via `teamRepository.findDefault()` at the top and reuses its `id`.
    `teamRepository.test.ts` covers:
    - `findBySlug('default')` returns the seeded row.
    - `findDefault()` returns the seeded row and throws if the seed is missing (delete it in a setup hook, restore after).
    `teamMemberRepository.test.ts` covers:
    - `findAllByTeam(defaultId)` on an empty table returns `[]`.
    - `insert(defaultId, 42)` returns a `TeamMember` with `teamId: defaultId`, `characterId: 42`, a generated `id` and `addedAt`, and `deletedAt: null`.
    - `insert(defaultId, 42)` twice (without removing) rejects with a unique-violation error (`code === '23505'`) from the partial index.
    - `findByTeamAndCharacterId(defaultId, 42)` returns the row; `findByTeamAndCharacterId(defaultId, 999)` returns `undefined`.
    - `softDeleteByTeamAndCharacterId(defaultId, 42)` returns `true` once, then `false` on the second call. After the soft delete, the row is still present in raw SQL (`SELECT … FROM team_members WHERE character_id = 42` returns one row with `deleted_at IS NOT NULL`), but `findByTeamAndCharacterId(defaultId, 42)` returns `undefined` and `findAllByTeam(defaultId)` does not include it.
    - After `softDeleteByTeamAndCharacterId(defaultId, 42)`, a fresh `insert(defaultId, 42)` succeeds and produces a **new row** (different `id`, later `addedAt`) — the partial unique index does not block re-adding a removed character.
    - `findAllByTeam(defaultId)` orders by `addedAt asc` over active rows only (insert three rows with short waits, soft-delete the middle one, assert the remaining two are in order).
    - `countByTeam(defaultId)` reflects active rows only (insert two, soft-delete one, expect `1`).
12. **Extend the CI workflow** at `.github/workflows/ci.yml` (created in Slice 001) with the pieces Postgres-backed tests need:
    - Add a `services.postgres` block:
      ```yaml
      services:
        postgres:
          image: postgres:17-alpine
          env: { POSTGRES_USER: platform, POSTGRES_PASSWORD: platform, POSTGRES_DB: platform }
          ports: [5432:5432]
          options: --health-cmd "pg_isready -U platform" --health-interval 5s --health-retries 10
      ```
    - Add `DATABASE_URL=postgres://platform:platform@localhost:5432/platform` to the job env.
    - Insert a `turbo run db:migrate` step between `setup` and `typecheck`/`lint`/`test`. No guard is needed; the task now exists.

## Files touched

- `docker-compose.yml`: created
- `apps/platform/package.json`: modified (`db:migrate`, `db:generate`, `db:studio`, `test` scripts)
- `apps/platform/drizzle.config.ts`: created
- `apps/platform/.env.example`: created
- `apps/platform/src/env.ts`: created
- `apps/platform/src/db/schema.ts`: created
- `apps/platform/src/db/client.ts`: created
- `apps/platform/src/db/migrate.ts`: created
- `apps/platform/src/db/migrations/0000_*.sql`: created (generated)
- `apps/platform/src/db/migrations/0001_default_team.sql`: created (hand-written seed)
- `apps/platform/src/db/migrations/meta/_journal.json`: created (generated)
- `apps/platform/src/server/repositories/teamRepository.ts`: created
- `apps/platform/src/server/repositories/teamMemberRepository.ts`: created
- `apps/platform/vitest.config.ts`: modified (DB-reset setupFiles, singleThread, drop passWithNoTests)
- `apps/platform/src/test/setup.ts`: created (or wherever the setupFiles entry points)
- `apps/platform/src/server/repositories/teamRepository.test.ts`: created
- `apps/platform/src/server/repositories/teamMemberRepository.test.ts`: created
- `.gitignore`: modified (add `.env*` if not already covered; ignore `apps/platform/.env`)
- `.github/workflows/ci.yml`: modified (add the Postgres service container, `DATABASE_URL` job env, and a `turbo run db:migrate` step before tests)

## Verification

1. `docker compose up -d postgres`. `docker compose ps` shows the container healthy within 10 seconds.
2. `cp apps/platform/.env.example apps/platform/.env`. `turbo run db:migrate`. Output ends with "Migrations complete" (or Drizzle's equivalent). No errors.
3. `psql postgres://platform:platform@localhost:5432/platform -c "\d teams"` shows the four columns and the `teams_slug_unique` index. `\d team_members` shows the five columns (`id`, `team_id`, `character_id`, `added_at`, `deleted_at`), the FK to `teams.id` with `ON DELETE CASCADE`, the `team_members_team_id_character_id_active_unique` partial unique index with predicate `WHERE deleted_at IS NULL`, and the `team_members_team_id_idx` index. `SELECT slug, name FROM teams;` shows the single `default` row.
4. `turbo run test`. All tests in `teamMemberRepository.test.ts` pass.
5. Re-run `turbo run db:migrate`. It is a no-op on the second run (safe to repeat). Exit 0.
6. `pnpm typecheck && pnpm lint` are green across the workspace.
7. Stop the container (`docker compose down`), re-run the migration: it fails with a clear connection error and a non-zero exit. The failure path is loud, not silent.

## Done criteria

- [ ] `docker-compose.yml` brings up Postgres 17 with a healthcheck and a named volume
- [ ] `apps/platform/src/db/schema.ts` defines `teams` and `team_members` exactly as `data-model.md` specifies, including the nullable `deletedAt` column, the partial unique index on active rows, and the `teamId` FK with `ON DELETE CASCADE`
- [ ] `apps/platform/src/db/migrations/0000_*.sql` is generated and checked in
- [ ] `apps/platform/src/db/migrations/0001_default_team.sql` inserts the default team and is safe to re-run
- [ ] `turbo run db:migrate` is safe to re-run (running twice leaves exactly one `slug = 'default'` row) and reports success
- [ ] `TeamRepository` exposes `findBySlug`, `findDefault`
- [ ] `TeamMemberRepository` exposes `insert`, `findAllByTeam`, `findByTeamAndCharacterId`, `softDeleteByTeamAndCharacterId`, `countByTeam`, all scoped by `teamId` and filtering out soft-deleted rows on every read. No method issues a SQL `DELETE` against `team_members`.
- [ ] `drizzle-orm` is imported only from files under `apps/platform/src/db/**` and `apps/platform/src/server/repositories/**`
- [ ] Integration tests cover the cases in step 11 (both repositories) and pass against the real container
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` are green
- [ ] No service rules (cap of 5, dark-side guard) leak into this slice. Those land in Slice 004
