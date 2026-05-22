# 002: Database

## Context

Stand up Postgres 17 via Docker Compose, wire Drizzle, create `teams` and `team_members` per [`data-model.md`](data-model.md), seed the default team, and add repositories that are the **only** place `drizzle-orm` is imported. Service rules (cap, dark-side guard) land in Slice 004.

## Goal (demoable outcome)

`docker compose up -d postgres && pnpm --filter platform db:migrate` brings up Postgres, creates the `teams` and `team_members` tables, and inserts the default team row (`slug = 'default'`). `pnpm --filter platform test:integration` runs Vitest against the real container and covers `insert`, `findAll`, `findByCharacterId`, `deleteByCharacterId`, the unique-violation path, the empty-table case, and the default-team lookup.

## Prerequisites

Slice 001 is done. `data-model.md` is the source of truth for the table shape.

## Steps

1. **Add the Docker Compose file** at the repo root: `docker-compose.yml` with a single `postgres` service (`postgres:17-alpine`), env (`POSTGRES_USER=platform`, `POSTGRES_PASSWORD=platform`, `POSTGRES_DB=platform`), port `5432:5432`, a named volume `pgdata`, and a healthcheck (`pg_isready -U platform`). Use the project conventions for service naming.
2. **Install `drizzle-orm` `^0.45.2`, `drizzle-kit` `^0.31.10`, `pg` `^8.21.0`, and `@types/pg` `^8.20.0`** in `apps/platform`. (Versions live in `plan.md`'s Technical Context table; install is left to the slice author per the project rule.)
3. **Add env handling**. Create `apps/platform/src/env.ts` that reads `DATABASE_URL` and exports a typed object. Add `.env.example` with `DATABASE_URL=postgres://platform:platform@localhost:5432/platform`. Add `.env*` (except `.env.example`) to the root `.gitignore` if not already covered.
4. **Define the schema** at `apps/platform/src/db/schema.ts`. Two tables.
   - `teams`: `id uuid pk default gen_random_uuid()`, `slug text not null unique` (name the index `teams_slug_unique`), `name text not null`, `createdAt timestamptz not null default now()`.
   - `team_members`: `id uuid pk default gen_random_uuid()`, `teamId uuid not null references teams(id) on delete cascade`, `characterId integer not null`, `addedAt timestamptz not null default now()`. Composite unique on `(teamId, characterId)` named `team_members_team_id_character_id_unique` so 409 mapping in Slice 004 can rely on it. Also add a plain index on `teamId` named `team_members_team_id_idx`.
   Drizzle column mappings: TS camelCase, SQL snake_case. Export both tables plus `InferSelectModel`-derived `Team` and `TeamMember` types.
5. **Wire the Drizzle client** at `apps/platform/src/db/client.ts`. Export a singleton `db = drizzle(new Pool({ connectionString: env.DATABASE_URL }), { schema })`. This file imports `drizzle-orm/node-postgres` and is the second of two files allowed to import Drizzle (the first being `schema.ts`).
6. **Configure `drizzle-kit`** at `apps/platform/drizzle.config.ts`: `schema: './src/db/schema.ts'`, `out: './src/db/migrations'`, `dialect: 'postgresql'`, `dbCredentials.url: env.DATABASE_URL`.
7. **Generate the initial migration** by running `drizzle-kit generate` (the slice author runs this once; the generated `src/db/migrations/0000_*.sql` file is checked in). Do not hand-write the SQL.
   Then add a hand-written **seed migration** at `src/db/migrations/0001_default_team.sql` that inserts the default team idempotently:
   ```sql
   INSERT INTO teams (slug, name) VALUES ('default', 'Default team')
   ON CONFLICT (slug) DO NOTHING;
   ```
   Drizzle's migrator picks files up in lexical order; numbering `0001_*` keeps it after the schema migration.
8. **Add the migration runner** at `apps/platform/src/db/migrate.ts`: a small Node script that opens a connection, calls `migrate(db, { migrationsFolder: './src/db/migrations' })`, and exits. Wire it as a script in `apps/platform/package.json`: `"db:migrate": "node --import tsx src/db/migrate.ts"`. Also add `"db:studio": "drizzle-kit studio"` and `"db:generate": "drizzle-kit generate"` for ergonomics.
9. **Write the repositories** at `apps/platform/src/server/repositories/`. Two files; both are the **only** places outside `db/` that import `drizzle-orm`.
   - `teamRepository.ts`: `findBySlug(slug): Promise<Team | undefined>`, `findDefault(): Promise<Team>` (throws if the seed row is missing).
   - `teamMemberRepository.ts`: methods are now all scoped by `teamId`. `insert(teamId, characterId): Promise<TeamMember>`, `findAllByTeam(teamId): Promise<TeamMember[]>` (ordered by `addedAt asc`), `findByTeamAndCharacterId(teamId, characterId): Promise<TeamMember | undefined>`, `deleteByTeamAndCharacterId(teamId, characterId): Promise<boolean>` (returns whether a row was removed), `countByTeam(teamId): Promise<number>`. Export inferred `Team` and `TeamMember` types from `schema.ts`'s `InferSelectModel`.
10. **Add the Vitest integration config** at `apps/platform/vitest.integration.config.ts` distinct from any future unit config. Set `test.include` to `tests/integration/**/*.test.ts`, `test.setupFiles` to a setup that resets `team_members` between tests (`TRUNCATE team_members RESTART IDENTITY CASCADE`) while leaving the seeded `teams` row alone, and `test.poolOptions.threads.singleThread = true` so concurrent tests do not race on the table. Add the script `"test:integration": "vitest run --config ./vitest.integration.config.ts"` to `apps/platform/package.json`.
11. **Write the integration tests** at `apps/platform/tests/integration/`. Two files. Each test resolves the default team via `teamRepository.findDefault()` at the top and reuses its `id`.
    `teamRepository.test.ts` covers:
    - `findBySlug('default')` returns the seeded row.
    - `findBySlug('nope')` returns `undefined`.
    - `findDefault()` returns the seeded row and throws if the seed is missing (delete it in a setup hook, restore after).
    `teamMemberRepository.test.ts` covers:
    - `findAllByTeam(defaultId)` on an empty table returns `[]`.
    - `insert(defaultId, 42)` returns a `TeamMember` with `teamId: defaultId`, `characterId: 42`, and a generated `id` and `addedAt`.
    - `insert(defaultId, 42)` twice rejects with a unique-violation error (`code === '23505'`).
    - `findByTeamAndCharacterId(defaultId, 42)` returns the row; `findByTeamAndCharacterId(defaultId, 999)` returns `undefined`.
    - `deleteByTeamAndCharacterId(defaultId, 42)` returns `true` once, then `false` on the second call.
    - `findAllByTeam(defaultId)` orders by `addedAt asc` (insert three rows with short waits, assert order).
    - `countByTeam(defaultId)` reflects the current row count.
12. **Wire CI prerequisites in this repo's existing GitHub Actions** so the integration tests can run against a Postgres service container. Add a `services.postgres` block to the workflow that runs `pnpm test`, exporting `DATABASE_URL` for the step. The CI changes are minimal and check-only here; full e2e CI lands in Slice 007.

## Files touched

- `docker-compose.yml`: created
- `apps/platform/package.json`: modified (`db:migrate`, `db:generate`, `db:studio`, `test:integration` scripts)
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
- `apps/platform/vitest.integration.config.ts`: created
- `apps/platform/tests/integration/teamRepository.test.ts`: created
- `apps/platform/tests/integration/teamMemberRepository.test.ts`: created
- `.gitignore`: modified (add `.env*` if not already covered; ignore `apps/platform/.env`)
- `.github/workflows/ci.yml`: modified (add `postgres` service to the test job)

## Verification

1. `docker compose up -d postgres`. `docker compose ps` shows the container healthy within 10 seconds.
2. `cp apps/platform/.env.example apps/platform/.env`. `pnpm --filter platform db:migrate`. Output ends with "Migrations complete" (or Drizzle's equivalent). No errors.
3. `psql postgres://platform:platform@localhost:5432/platform -c "\d teams"` shows the four columns and the `teams_slug_unique` index. `\d team_members` shows the four columns (including `team_id`), the FK to `teams.id` with `ON DELETE CASCADE`, the composite `team_members_team_id_character_id_unique` index, and the `team_members_team_id_idx` index. `SELECT slug, name FROM teams;` shows the single `default` row.
4. `pnpm --filter platform test:integration`. All tests in `teamMemberRepository.test.ts` pass.
5. Re-run `pnpm --filter platform db:migrate`. It is a no-op (idempotent). Exit 0.
6. `pnpm typecheck && pnpm lint` are green across the workspace.
7. Stop the container (`docker compose down`), re-run the migration: it fails with a clear connection error and a non-zero exit. The failure path is loud, not silent.

## Done criteria

- [ ] `docker-compose.yml` brings up Postgres 17 with a healthcheck and a named volume
- [ ] `apps/platform/src/db/schema.ts` defines `teams` and `team_members` exactly as `data-model.md` specifies, including the named indexes and the `teamId` FK with `ON DELETE CASCADE`
- [ ] `apps/platform/src/db/migrations/0000_*.sql` is generated and checked in
- [ ] `apps/platform/src/db/migrations/0001_default_team.sql` inserts the default team idempotently
- [ ] `pnpm --filter platform db:migrate` is idempotent (running twice leaves exactly one `slug = 'default'` row) and reports success
- [ ] `TeamRepository` exposes `findBySlug`, `findDefault`
- [ ] `TeamMemberRepository` exposes `insert`, `findAllByTeam`, `findByTeamAndCharacterId`, `deleteByTeamAndCharacterId`, `countByTeam` — all scoped by `teamId`
- [ ] `drizzle-orm` is imported only from files under `apps/platform/src/db/**` and `apps/platform/src/server/repositories/**`
- [ ] Integration tests cover the cases in step 11 (both repositories) and pass against the real container
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:integration` are green
- [ ] No service rules (cap of 5, dark-side guard) leak into this slice; those land in Slice 004
