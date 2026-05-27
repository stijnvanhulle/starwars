# Verification: Whale Star Wars Team Builder

End-to-end walkthrough used at closeout to confirm the app meets the acceptance checklist in [spec.md](spec.md). Section A holds the feature-wide AC-N scenarios that need real product code (slices 004-006 land most of it). Section B and later sections are per-slice closeouts that check the slice's own "Done criteria" against the tree at the time the slice lands.

## Prerequisites

- Node 22, pnpm 11+
- Docker (only for the dev/prod database path; `pnpm test` runs on pglite in-process and needs no Docker)
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

Slice 002 lands the Drizzle schema, repositories, dual db drivers (real Postgres via Docker for dev/prod, pglite in-memory for tests), and the migration runner. The team-cap and dark-side rules still belong to slice 004. Walks the "Done criteria" from [002-database.md](002-database.md).

Prerequisites for this section:

```bash
pnpm install           # tests run on pglite, no Docker needed
# only for the optional Docker scenarios (C.1, C.2, C.4, C.11):
docker compose up -d postgres
cp apps/platform/.env.example apps/platform/.env
pnpm --filter @stijnvanhulle/platform run db:migrate
```

### Scenario C.1: Docker Compose brings up Postgres 17 healthy (optional, dev/prod path)

Covers slice 002 done-criterion **DC-1**.

1. `docker compose up -d postgres`.
2. `docker compose ps postgres`.

Pass when: status is `Up ... (healthy)` within 10 seconds. The named volume `pgdata` exists. (Skip this scenario if you only need to verify the test path.)

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

1. `pnpm --filter @stijnvanhulle/platform run db:migrate` (twice, against the docker container).
2. `docker exec starwars-postgres psql -U platform -d platform -tA -c "SELECT count(*) FROM teams WHERE slug='default';"`.

Pass when: both runs exit 0 and the count is exactly `1`. Tests run the same migrations against pglite in `beforeAll`, so the same idempotency is exercised on every test boot.

### Scenario C.5: TeamRepository exposes findBySlug, findDefault

Covers **DC-6**.

1. Inspect [apps/platform/src/server/repositories/teamRepository.ts](../../apps/platform/src/server/repositories/teamRepository.ts).

Pass when: it exports `teamRepository` with `findBySlug(slug)` and `findDefault()`.

### Scenario C.6: TeamMemberRepository is teamId-scoped and soft-delete aware

Covers **DC-7**.

1. Inspect [apps/platform/src/server/repositories/teamMemberRepository.ts](../../apps/platform/src/server/repositories/teamMemberRepository.ts).

Pass when: it exports `insert`, `findAllByTeam`, `findByTeamAndCharacterId`, `deleteByTeamAndCharacterId`, `countByTeam`, every read filters `deletedAt IS NULL`, and no method issues a SQL `DELETE` against `team_members`.

### Scenario C.7: drizzle-orm imports are scoped

Covers **DC-8**.

1. `grep -rnE "from ['\"]drizzle-orm" apps/platform/src | grep -vE '/(db|server/repositories|test)/'`.

Pass when: the grep returns no hits. `drizzle-orm` only appears under `apps/platform/src/db/**`, `apps/platform/src/server/repositories/**`, and `apps/platform/src/test/**` (the test runner imports the pglite migrator).

### Scenario C.8: repository tests cover the contract from step 11

Covers **DC-9**.

1. With Docker stopped: `docker compose down`.
2. `pnpm test`.

Pass when: 13 tests pass against pglite (no Docker required) across `teamRepository.test.ts` (4 tests) and `teamMemberRepository.test.ts` (9 tests), covering insert, dedupe-via-23505, soft delete, re-add after soft delete, ordering, and `countByTeam`.

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

### Scenario C.11: `db:migrate` is loud when Postgres is down

Covers slice 002 verification §7. Verifies the dev/prod path still fails fast even though tests no longer need Docker.

1. `docker compose down`.
2. `pnpm --filter @stijnvanhulle/platform run db:migrate`.

Pass when: the script exits non-zero with a clear `ECONNREFUSED` error. (Tests on the same checkout still pass via pglite; only the migrate path is gated on the real container.)

---

## Section H. Slice 007-extras closeout

Closes [007-extras.md](007-extras.md) (bookmarks + pagination). The slice has no `AC-N` of its
own, so each scenario maps to one bullet under the slice's "Verification" section (V-1..V-7)
and to its "Done criteria".

Run on 2026-05-27 against the dev server on `http://localhost:3000`, driven through the
Claude in Chrome extension.

### Scenario H.1: bookmark toggle and badge

Covers **V-1**, Done criteria 1, 3, 4, 5.

1. Open `/characters/1` (Luke).
2. Click the heart button next to "Add to team".
3. Watch the side nav bookmark icon.

Pass when: the heart flips to filled, the side nav bookmark glyph shows a `1` count badge, and
`localStorage.getItem('whale.bookmarks.v1') === '[1]'`.

### Scenario H.2: bookmarks survive a reload

Covers **V-2**, Done criteria 2.

1. With at least one character bookmarked from H.1, hard-refresh the browser.
2. Open devtools, Application, Local Storage, `http://localhost:3000`.
3. Inspect `whale.bookmarks.v1`.

Pass when: the heart stays filled, the badge stays at the same count, and `whale.bookmarks.v1`
holds a JSON array containing the bookmarked id.

### Scenario H.3: bookmarks page and clear all

Covers **V-3**, Done criteria 4, 5.

1. Bookmark two characters.
2. Navigate to `/bookmarks` via the side nav.
3. Click "Clear all".

Pass when: `/bookmarks` lists both cards, the badge reads `2`, "Clear all" empties the list
(empty state "No bookmarks yet") and drops `localStorage.whale.bookmarks.v1` to `[]`.

### Scenario H.4: paginated home grid

Covers **V-4**, Done criteria 6.

1. Open `/`.
2. Count the cards on the first page.
3. Click page `2` in the pager.

Pass when: page 1 shows exactly 24 cards, the pager shows pages 1..4 (`Math.ceil(87 / 24) = 4`),
clicking page 2 changes the URL to `/?page=2`, the grid renders the next 24 ids (starting at
"Lobot"), and the viewport scrolls to the top.

### Scenario H.5: URL clamping

Covers **V-5**, Done criteria 6.

1. Visit `/?page=99`.
2. Visit `/?page=foo`.

Pass when: `?page=99` renders the last valid page (15 cards) and `?page=foo` falls back to
page 1 (24 cards) without an error.

### Scenario H.6: detail prev/next wraps the full list

Covers **V-6**, Done criteria 7.

Note: ids are not contiguous 1..87. `GET /api/characters` returns 87 items, the first is id 1
(Luke) and the last is id 88 (Captain Phasma). The wrap is on list order, not id arithmetic.

1. Visit `/characters/88` (Captain Phasma) and click `Next`.
2. Visit `/characters/1` (Luke) and click `Prev`.

Pass when: `Next` on id 88 lands on id 1 and `Prev` on id 1 lands on id 88, regardless of the
home page last viewed.

### Scenario H.7: typecheck, lint, test all green

Covers **V-7**, Done criteria 8, 9.

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`

Pass when: every command exits 0. Vitest covers the bookmark reducer cases (empty, add, remove,
toggle, clear), the `paginate` window cases (empty, first, middle, overshoot), and the bookmark
store-integration test (`preloadedState` plus dispatch).

### Results

| Scenario | Covers | Status |
| --- | --- | --- |
| H.1 | V-1 | PASS, click on Luke's heart flipped the icon to filled, side nav badge went 0 → 1, `localStorage.whale.bookmarks.v1 === "[1]"` |
| H.2 | V-2 | PASS, after `location.reload()` the heart stayed filled, the badge stayed at `1`, and `localStorage.whale.bookmarks.v1 === "[1]"` |
| H.3 | V-3 | PASS, bookmarked Luke + R2-D2, `/bookmarks` listed both cards, badge `2`, "Clear all" emptied the page and dropped `localStorage` to `[]` |
| H.4 | V-4 | PASS, `/` rendered 24 cards, pager showed pages 1..4, clicking page 2 changed URL to `/?page=2`, grid rendered the next 24 starting at "Lobot", `window.scrollY === 0` |
| H.5 | V-5 | PASS, `/?page=99` rendered 15 cards (last page) and `/?page=foo` rendered 24 cards (page 1 fallback), no error |
| H.6 | V-6 | PASS, `/characters/88` Next went to `/characters/1`, `/characters/1` Prev went to `/characters/88` |
| H.7 | V-7 | PASS, `pnpm typecheck` + `pnpm lint` + `pnpm test` (19 files, 90 tests) all exit 0 |

#### Discovery, ids are not contiguous

`GET /api/characters` returns 87 items but ids run 1..88 with one gap. The slice's V-6
originally said "Next on id 87 wraps to id 1", which is wrong: id 87 is BB8 (index 86) and the
actual last item is Captain Phasma (id 88). The wrap behaviour is correct, it walks list order
not id arithmetic. Scenario H.6 above is rewritten against the real endpoints.

#### Outcome

All seven scenarios pass. The slice's Done criteria stay checked.

---

## Section I. Slice 008-testing closeout

Closes [008-testing.md](008-testing.md) (Playwright e2e, CI Postgres service, initial changeset,
README refresh, research close-out). The slice's "Verification" section lists eight bullets
(V-1..V-8). Each scenario below maps to one of those.

Run on 2026-05-27 against `postgres:17-alpine` (Docker) and the built Next.js app.

### Scenario I.1: build + e2e green locally

Covers **V-1**, **V-2**, and Done criteria 1, 2, 3.

1. `docker compose up -d postgres`
2. `pnpm --filter @stijnvanhulle/platform run db:migrate`
3. `pnpm build`
4. `pnpm --filter @stijnvanhulle/platform run test:e2e`

Pass when: build exits 0, all six Playwright tests pass against `pnpm start` with
`E2E_FIXTURES=1`, total runtime under two minutes.

### Scenario I.2: cap regression bites

Covers **V-3**, Done criteria 1.

1. Comment out the `current >= TEAM_CAP` guard in `src/server/services/teamService.ts`.
2. Re-run `pnpm test:e2e`.
3. Restore the guard.

Pass when: `e2e/cap.spec.ts` fails on the alert visibility assertion and the direct POST
`expect(direct.status()).toBe(422)`. After restoring, the suite is green again.

### Scenario I.3: dark-side regression bites

Covers **V-4**, Done criteria 1.

1. Change `isDarkSide` in `src/lib/darkSide.ts` to always return `false`.
2. Re-run `pnpm test:e2e`.
3. Restore.

Pass when: `e2e/darkSide.spec.ts` fails on the `Add to team` disabled assertion and the `422
EVIL_FORBIDDEN` response check for each of the three rules. After restoring, the suite is
green again.

### Scenario I.4: CI exercises the full pyramid

Covers **V-5**, Done criteria 4.

1. Push the branch.
2. Open the resulting workflow run.

Pass when: the `E2E` job uses the `postgres:17-alpine` service, runs `playwright:install`,
`db:migrate`, `build`, then `test:e2e`, and uploads `playwright-report/` + `test-results/` on
failure. The job finishes green.

### Scenario I.5: one initial changeset is staged

Covers **V-6**, Done criteria 5.

1. `pnpm changeset status`

Pass when: the output lists one pending changeset that bumps `@stijnvanhulle/platform` and
`@stijnvanhulle/components` at `minor`.

### Scenario I.6: README covers the four required sections

Covers **V-7**, Done criteria 6.

1. Open `README.md`.

Pass when: there is a "Whale Star Wars Team Builder" section with use cases, tech stack as a
bullet list, folder structure, getting started linking to verification + slice 001, and
status. No `_TBD_` markers remain inside that section.

### Scenario I.7: research has no unresolved open items

Covers **V-8**, Done criteria 7.

1. Open `plans/starwars-team-builder/research.md`.

Pass when: the "Open questions" and "Open items" sections both record their items as resolved
(struck through, with the slice + step that closed them), with no pending entries.

### Scenario I.8: all gates green

Covers Done criteria 9.

1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm test:e2e`

Pass when: each command exits 0.

### Results

| Scenario | Covers | Status |
| --- | --- | --- |
| I.1 | V-1, V-2 | PASS, build + 6 e2e tests green in ~5s local against Postgres on Docker |
| I.2 | V-3 | PASS, with the `current >= TEAM_CAP` guard commented out in `teamService.ts`, `cap.spec.ts` failed on the 6th-add status assertion. Guard restored, suite green again |
| I.3 | V-4 | PASS, with `isDarkSide` forced to `return false`, all three `darkSide.spec.ts` tests failed (disabled-button + 422 EVIL_FORBIDDEN). Predicate restored, suite green again |
| I.4 | V-5 | PENDING CI, the `E2E` job is added to `.github/workflows/pr.yml`; first run on push |
| I.5 | V-6 | PASS, `pnpm changeset status` lists `@stijnvanhulle/platform` and `@stijnvanhulle/components` at minor (initial release) |
| I.6 | V-7 | PASS, README has the new section with use cases, tech stack, folder structure, getting started, status |
| I.7 | V-8 | PASS, research.md "Open questions" and "Open items" both note "All ... resolved" with per-slice references |
| I.8 | DC-9 | PASS, `pnpm typecheck` + `pnpm lint` + `pnpm test` (19 files, 90 tests) + `pnpm test:e2e` (6 tests) all exit 0 |

### Outcome

Seven of eight scenarios pass locally. Only I.4 (CI run) is pending and lands on the first
push to the branch; everything the spec calls a "Done criteria" check is green.
