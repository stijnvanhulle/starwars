# 002 — Database

## Context

Persist the only thing our app owns: the team. The character catalog lives at `akabab` and is never copied into our database. This slice stands up a local Postgres 17 via Docker Compose, wires `drizzle-orm` + `drizzle-kit`, defines the `team_members` table exactly as `data-model.md` describes, and adds a `TeamMemberRepository` that is the **only** place `drizzle-orm` is imported. Integration tests against a real Postgres prove the repository's CRUD path and the unique-on-`characterId` index.

No service rules (cap of 5, dark-side guard) land here. Those belong in Slice 004 because they need the API contract and the `isDarkSide` predicate.

## Goal (demoable outcome)

`docker compose up -d postgres && pnpm --filter platform db:migrate` brings up Postgres and creates the `team_members` table. `pnpm --filter platform test:integration` runs Vitest against the real container and covers `insert`, `findAll`, `findByCharacterId`, `deleteByCharacterId`, the unique-violation path, and the empty-table case.

## Prerequisites

Slice 001 is done. `data-model.md` is the source of truth for the table shape.

## Steps

1. **Add the Docker Compose file** at the repo root: `docker-compose.yml` with a single `postgres` service (`postgres:17-alpine`), env (`POSTGRES_USER=platform`, `POSTGRES_PASSWORD=platform`, `POSTGRES_DB=platform`), port `5432:5432`, a named volume `pgdata`, and a healthcheck (`pg_isready -U platform`). Use the project conventions for service naming.
2. **Install `drizzle-orm` `^0.45.2`, `drizzle-kit` `^0.31.10`, `pg` `^8.21.0`, and `@types/pg` `^8.20.0`** in `apps/platform`. (Versions live in `plan.md`'s Technical Context table; install is left to the slice author per the project rule.)
3. **Add env handling**. Create `apps/platform/src/env.ts` that reads `DATABASE_URL` and exports a typed object. Add `.env.example` with `DATABASE_URL=postgres://platform:platform@localhost:5432/platform`. Add `.env*` (except `.env.example`) to the root `.gitignore` if not already covered.
4. **Define the schema** at `apps/platform/src/db/schema.ts`. One table `team_members` with `id uuid pk default gen_random_uuid()`, `characterId integer not null unique`, `addedAt timestamptz not null default now()`. Drizzle column mappings: TS camelCase, SQL snake_case. Name the unique index `team_members_character_id_unique` explicitly so 409 mapping in Slice 004 can rely on it.
5. **Wire the Drizzle client** at `apps/platform/src/db/client.ts`. Export a singleton `db = drizzle(new Pool({ connectionString: env.DATABASE_URL }), { schema })`. This file imports `drizzle-orm/node-postgres` and is the second of two files allowed to import Drizzle (the first being `schema.ts`).
6. **Configure `drizzle-kit`** at `apps/platform/drizzle.config.ts`: `schema: './src/db/schema.ts'`, `out: './src/db/migrations'`, `dialect: 'postgresql'`, `dbCredentials.url: env.DATABASE_URL`.
7. **Generate the initial migration** by running `drizzle-kit generate` (the slice author runs this once; the generated `src/db/migrations/0000_*.sql` file is checked in). Do not hand-write the SQL.
8. **Add the migration runner** at `apps/platform/src/db/migrate.ts`: a small Node script that opens a connection, calls `migrate(db, { migrationsFolder: './src/db/migrations' })`, and exits. Wire it as a script in `apps/platform/package.json`: `"db:migrate": "node --import tsx src/db/migrate.ts"`. Also add `"db:studio": "drizzle-kit studio"` and `"db:generate": "drizzle-kit generate"` for ergonomics.
9. **Write the repository** at `apps/platform/src/server/repositories/teamMemberRepository.ts`. Methods: `insert(characterId): Promise<TeamMember>`, `findAll(): Promise<TeamMember[]>` (ordered by `addedAt asc`), `findByCharacterId(characterId): Promise<TeamMember | undefined>`, `deleteByCharacterId(characterId): Promise<boolean>` (returns whether a row was removed), `count(): Promise<number>`. Export an inferred `TeamMember` type from `schema.ts`'s `InferSelectModel`. This file is the **only** place outside `db/` that imports `drizzle-orm`.
10. **Add the Vitest integration config** at `apps/platform/vitest.integration.config.ts` distinct from any future unit config. Set `test.include` to `tests/integration/**/*.test.ts`, `test.setupFiles` to a setup that resets the table between tests (`TRUNCATE team_members RESTART IDENTITY`), and `test.poolOptions.threads.singleThread = true` so concurrent tests do not race on the table. Add the script `"test:integration": "vitest run --config ./vitest.integration.config.ts"` to `apps/platform/package.json`.
11. **Write the integration tests** at `apps/platform/tests/integration/teamMemberRepository.test.ts`. Cover:
    - `findAll()` on an empty table returns `[]`.
    - `insert(42)` returns a `TeamMember` with `characterId: 42` and a generated `id` and `addedAt`.
    - `insert(42)` twice rejects with a unique-violation error (`code === '23505'`).
    - `findByCharacterId(42)` returns the row; `findByCharacterId(999)` returns `undefined`.
    - `deleteByCharacterId(42)` returns `true` once, then `false` on the second call.
    - `findAll()` orders by `addedAt asc` (insert three rows with short waits, assert order).
    - `count()` reflects the current row count.
12. **Wire CI prerequisites in this repo's existing GitHub Actions** so the integration tests can run against a Postgres service container. Add a `services.postgres` block to the workflow that runs `pnpm test`, exporting `DATABASE_URL` for the step. The CI changes are minimal and check-only here; full e2e CI lands in Slice 007.

## Files touched

- `docker-compose.yml` — created
- `apps/platform/package.json` — modified (`db:migrate`, `db:generate`, `db:studio`, `test:integration` scripts)
- `apps/platform/drizzle.config.ts` — created
- `apps/platform/.env.example` — created
- `apps/platform/src/env.ts` — created
- `apps/platform/src/db/schema.ts` — created
- `apps/platform/src/db/client.ts` — created
- `apps/platform/src/db/migrate.ts` — created
- `apps/platform/src/db/migrations/0000_*.sql` — created (generated)
- `apps/platform/src/db/migrations/meta/_journal.json` — created (generated)
- `apps/platform/src/server/repositories/teamMemberRepository.ts` — created
- `apps/platform/vitest.integration.config.ts` — created
- `apps/platform/tests/integration/teamMemberRepository.test.ts` — created
- `.gitignore` — modified (add `.env*` if not already covered; ignore `apps/platform/.env`)
- `.github/workflows/ci.yml` — modified (add `postgres` service to the test job)

## Verification

1. `docker compose up -d postgres`. `docker compose ps` shows the container healthy within 10 seconds.
2. `cp apps/platform/.env.example apps/platform/.env`. `pnpm --filter platform db:migrate`. Output ends with "Migrations complete" (or Drizzle's equivalent). No errors.
3. `psql postgres://platform:platform@localhost:5432/platform -c "\d team_members"` shows the three columns with the expected types and the `team_members_character_id_unique` index.
4. `pnpm --filter platform test:integration`. All tests in `teamMemberRepository.test.ts` pass.
5. Re-run `pnpm --filter platform db:migrate`. It is a no-op (idempotent). Exit 0.
6. `pnpm typecheck && pnpm lint` are green across the workspace.
7. `git grep -nE "from 'drizzle-orm'" apps/platform/src` returns hits only in `src/db/*` and `src/server/repositories/*`. No leakage into the route handler or service layers (which don't exist yet, but the rule still holds going forward).
8. Stop the container (`docker compose down`), re-run the migration: it fails with a clear connection error and a non-zero exit. The failure path is loud, not silent.

## Done criteria

- [ ] `docker-compose.yml` brings up Postgres 17 with a healthcheck and a named volume
- [ ] `apps/platform/src/db/schema.ts` defines `team_members` exactly as `data-model.md` specifies, including the named unique index
- [ ] `apps/platform/src/db/migrations/0000_*.sql` is generated and checked in
- [ ] `pnpm --filter platform db:migrate` is idempotent and reports success
- [ ] `TeamMemberRepository` exposes `insert`, `findAll`, `findByCharacterId`, `deleteByCharacterId`, `count`
- [ ] `drizzle-orm` is imported only from files under `apps/platform/src/db/**` and `apps/platform/src/server/repositories/**`
- [ ] Integration tests cover the seven cases in step 11 and pass against the real container
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:integration` are green
- [ ] No service rules (cap of 5, dark-side guard) leak into this slice; those land in Slice 004
