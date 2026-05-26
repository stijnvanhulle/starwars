# Verification: Whale Star Wars Team Builder

End-to-end walkthrough used at closeout to confirm the app meets the acceptance checklist in [spec.md](spec.md). Section A holds the feature-wide AC-N scenarios that need real product code (slices 004-006 land most of it). Section B and later sections are per-slice closeouts that check the slice's own "Done criteria" against the tree at the time the slice lands.

## Prerequisites

- Node 22, pnpm 11+
- Docker (for the Postgres container, needed from slice 002 onwards)
- Playwright browsers installed once via `turbo run playwright:install` (needed from slice 007 onwards)

Boot the app once before walking the feature-wide scenarios:

```bash
pnpm install
docker compose up -d postgres
turbo run db:migrate
turbo run gen
pnpm dev
```

The app is at `http://localhost:3000`.

---

## Section A. Feature-wide acceptance walkthrough

### Scenario A.1: list loads at `/`

Covers **AC-1**.

1. Open `http://localhost:3000/`.
2. The page shows a grid of Star Wars characters. Each card has a name and an image.
3. Network panel confirms one request to `/api/characters` and zero requests to `akabab.github.io` or any other `starwars-api` host. The character data is proxied server-side.

Pass when: the list is non-empty and every visible card has a name and an image.

### Scenario A.2: detail page shows name, image, height, mass, affiliations

Covers **AC-2** and **AC-3**.

1. From `/`, click any character (e.g. Luke Skywalker).
2. URL becomes `/characters/[id]`.
3. The page renders, in this order: name, image, height, mass, affiliations (as a list of chips or comma-separated text, the exact widget is up to slice 006).

Pass when: all five fields are visible and match the values returned by `GET /api/characters/{id}` for that character. The browser does not call `starwars-api`'s `/id/{id}.json` directly.

### Scenario A.3: prev and next navigate the list

Covers **AC-4**.

1. From `/`, open the third character in the list.
2. Click `Next`. URL changes to the fourth character, page rerenders without a full reload to `/`.
3. Click `Prev` twice. URL ends up on the second character.
4. `Prev` on the first character and `Next` on the last either wrap or are disabled. The choice is up to slice 006 as long as it stays consistent.

Pass when: prev/next walk the same order as the list on `/`, and the browser history holds one entry per character (back button works).

### Scenario A.4: add and remove from the detail page

Covers **AC-5**.

1. On a non-evil character's detail page (e.g. Luke), click `Add to team`.
2. A `POST /api/team` is sent. The button flips to `Remove from team`.
3. The sidebar (Scenario A.5) now contains Luke.
4. Click `Remove from team`. A `DELETE /api/team/{characterId}` is sent. The button flips back to `Add to team`.

Pass when: the team in the DB matches the UI after each click (verify with `psql` or via `GET /api/team`).

### Scenario A.5: sidebar reflects the team on every page, `/team` lists and removes

Covers **AC-6** and **AC-7**.

1. Add two characters via Scenario A.4.
2. Navigate to `/` and then to several detail pages. The sidebar shows the same two members on every page.
3. Open `/team`. Both members are listed with a remove control.
4. Remove one from `/team`. The sidebar updates immediately (RTK Query tag invalidation), and the detail page for that character shows `Add to team` again.

Pass when: sidebar and `/team` stay in sync after any add or remove, on any page.

### Scenario A.6: a sixth add is refused, Vader's add button is disabled with a tooltip

Covers **AC-8** and **AC-9**.

1. Reset the team by calling `DELETE /api/team/{characterId}` for every current member (the API is the only supported reset path, the table is append-only with a soft-delete column, so removed rows stay as tombstones with `deleted_at` set and the cap-counting query ignores them).
2. Add five non-evil characters.
3. Open a sixth non-evil character's detail page. Click `Add to team`. The request returns `422 TEAM_FULL`. The UI shows a clear error message (toast, inline, whatever slice 006 picks) and the team stays at five.
4. Open Darth Vader's detail page. The `Add to team` button is disabled. Hovering it shows a tooltip explaining the character is evil.
5. Force the request anyway via devtools (`POST /api/team` with Vader's id). The server returns `422 EVIL_FORBIDDEN`.

Pass when: both the cap and the evil ban are enforced server-side (errors visible in the network panel) and reflected in the UI (disabled button + tooltip for Vader, error message for the sixth add).

---

## Section B. Slice 001-setup closeout

Slice 001 lands scaffolding only (Next.js 16 + MUI v9 platform app, `packages/components`, root tooling). No AC-N row is testable yet, so this section walks the slice's own "Done criteria" from [001-setup.md](001-setup.md).

Prerequisites for this section:

```bash
pnpm install
```

`pnpm dev` is needed for scenario B.3.

### Scenario B.1: workspace globs include `apps/*`

Covers slice 001 done-criterion **DC-1**.

1. Inspect [pnpm-workspace.yaml](../../pnpm-workspace.yaml) and the root [package.json](../../package.json).

Pass when: both list `apps/*` alongside `packages/*` and `internals/*`.

### Scenario B.2: legacy packages are gone

Covers **DC-2**.

1. Run `ls packages/`.
2. Run `git grep -nE 'template-(core|demo)' -- ':!plans' ':!*.md'`.

Pass when: `packages/` shows only `components/`, and the grep returns no hits in source or config.

### Scenario B.3: `pnpm dev` serves the MUI-themed home page

Covers **DC-3**, **DC-4**.

1. Run `pnpm dev` in a fresh terminal.
2. Wait for `Ready in ...`.
3. `curl -sS http://localhost:3000/ -o /tmp/home.html -w "%{http_code}\n"`.
4. `grep -oE 'Whale Star Wars Team Builder|MuiButton-contained' /tmp/home.html`.

Pass when: HTTP 200, both strings appear, dev server boot log shows no deprecation warnings or peer-dep complaints.

### Scenario B.4: `next.config.ts` allows `starwars-api` image URLs

Covers **DC-5**.

1. Inspect [apps/platform/next.config.ts](../../apps/platform/next.config.ts).

Pass when: `images.remotePatterns` includes `{ protocol: 'https', hostname: 'akabab.github.io', pathname: '/starwars-api/api/**' }`.

### Scenario B.5: `@stijnvanhulle/components` is wired

Covers **DC-6**.

1. Run `cat packages/components/src/index.ts`.
2. Run `readlink apps/platform/node_modules/@stijnvanhulle/components` to confirm the workspace symlink resolves.

Pass when: `src/index.ts` exports `PLACEHOLDER`, and the symlink points at `packages/components`.

### Scenario B.6: Vitest and Playwright configs parse

Covers **DC-7**.

1. Run `pnpm test`.
2. Run `pnpm --filter @stijnvanhulle/platform exec playwright test --list` and accept its "no tests found" exit until slice 007 ships specs.

Pass when: `pnpm test` exits 0 with `--passWithNoTests`. The Playwright config parses without a schema error.

### Scenario B.7: typecheck, lint, test, build all green

Covers **DC-8**.

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`

Pass when: every command exits 0 with no deprecation warnings, no peer-dep complaints, no unresolved imports.

### Scenario B.8: no forbidden imports

Covers **DC-9**.

1. Run `git grep -nE "from ['\"](drizzle-orm|@reduxjs/toolkit|@kubb)" -- apps packages internals`.

Pass when: the grep returns no hits. Drizzle, Redux, and Kubb all land in later slices.

### Scenario B.9: workflows in place

Covers **DC-10**, **DC-11**.

1. Inspect [.github/workflows/pr.yml](../../.github/workflows/pr.yml) and [.github/workflows/release.yml](../../.github/workflows/release.yml).

Pass when: `pr.yml` runs `build`, `typecheck`, `test`, `lint`, and spellcheck on PR (jobs cover `apps/platform` and `packages/components` since the root scripts no longer use `--filter`). `release.yml` uses `changesets/action@v1` on push to `main`, and its `paths` filter covers `apps/**` and `packages/**`.

---

## Section C. Slice 002-database closeout

Slice 002 lands Postgres, Drizzle schema, repositories, and DB-backed Vitest. The team-cap and dark-side rules still belong to slice 004. Walks the "Done criteria" from [002-database.md](002-database.md).

Prerequisites for this section:

```bash
docker compose up -d postgres
cp apps/platform/.env.example apps/platform/.env
pnpm --filter @stijnvanhulle/platform run db:migrate
```

### Scenario C.1: Docker Compose brings up Postgres 17 healthy

Covers slice 002 done-criterion **DC-1**.

1. `docker compose up -d postgres`.
2. `docker compose ps postgres`.

Pass when: status is `Up ... (healthy)` within 10 seconds. The named volume `pgdata` exists.

### Scenario C.2: schema matches the data model

Covers **DC-2**.

1. `docker exec starwars-postgres psql -U platform -d platform -c "\d teams" -c "\d team_members"`.

Pass when: `teams` has `id, slug, name, created_at` with `teams_slug_unique`. `team_members` has `id, team_id, character_id, added_at, deleted_at`, the FK to `teams.id` with `ON DELETE CASCADE`, the partial unique index `team_members_team_id_character_id_active_unique` predicated on `WHERE deleted_at IS NULL`, and the `team_members_team_id_idx` index.

### Scenario C.3: initial migration is checked in

Covers **DC-3**.

1. `ls apps/platform/src/db/migrations/`.

Pass when: `0000_*.sql`, `0001_default_team.sql`, and `meta/_journal.json` are present. `meta/_journal.json` lists both entries.

### Scenario C.4: seed migration inserts the default team and is re-runnable

Covers **DC-4**, **DC-5**.

1. `pnpm --filter @stijnvanhulle/platform run db:migrate` (twice).
2. `docker exec starwars-postgres psql -U platform -d platform -tA -c "SELECT count(*) FROM teams WHERE slug='default';"`.

Pass when: both runs exit 0 and the count is exactly `1`.

### Scenario C.5: TeamRepository exposes findBySlug, findDefault

Covers **DC-6**.

1. Inspect [apps/platform/src/server/repositories/teamRepository.ts](../../apps/platform/src/server/repositories/teamRepository.ts).

Pass when: it exports `teamRepository` with `findBySlug(slug)` and `findDefault()`.

### Scenario C.6: TeamMemberRepository is teamId-scoped and soft-delete aware

Covers **DC-7**.

1. Inspect [apps/platform/src/server/repositories/teamMemberRepository.ts](../../apps/platform/src/server/repositories/teamMemberRepository.ts).

Pass when: it exports `insert`, `findAllByTeam`, `findByTeamAndCharacterId`, `softDeleteByTeamAndCharacterId`, `countByTeam`, every read filters `deletedAt IS NULL`, and no method issues a SQL `DELETE` against `team_members`.

### Scenario C.7: drizzle-orm imports are scoped

Covers **DC-8**.

1. `grep -rnE "from ['\"]drizzle-orm" apps/platform/src | grep -vE '/(db|server/repositories)/'`.

Pass when: the grep returns no hits. `drizzle-orm` only appears under `apps/platform/src/db/**` and `apps/platform/src/server/repositories/**`.

### Scenario C.8: repository tests cover the contract from step 11

Covers **DC-9**.

1. `docker compose up -d postgres` (if not already).
2. `pnpm test`.

Pass when: 13 tests pass across `teamRepository.test.ts` (4 tests) and `teamMemberRepository.test.ts` (9 tests), covering insert, dedupe-via-23505, soft delete, re-add after soft delete, ordering, and `countByTeam`.

### Scenario C.9: typecheck, lint, test, build still green

Covers **DC-10**.

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`

Pass when: every command exits 0.

### Scenario C.10: no service rules leak into this slice

Covers **DC-11**.

1. `grep -rnE "(TEAM_FULL|EVIL_FORBIDDEN|isDarkSide|TeamService)" apps/platform/src`.

Pass when: the grep returns no hits. The cap and the dark-side guard land in slice 004.

### Scenario C.11: loud failure when Postgres is down

Covers slice 002 verification §7.

1. `docker compose down`.
2. `pnpm --filter @stijnvanhulle/platform run db:migrate`.

Pass when: the script exits non-zero with a clear `ECONNREFUSED` error. Bring the container back with `docker compose up -d postgres` before continuing.
