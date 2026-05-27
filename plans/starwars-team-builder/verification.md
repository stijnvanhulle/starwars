# Verification: Whale Star Wars Team Builder

Acceptance walkthrough used at closeout. Section A covers the feature-wide requirements from
[spec.md](spec.md). Sections B through I are per-slice closeouts. Section J is the final
global pass run after all slices landed.

## Status summary

| Criterion | Requirement | Status |
| --- | --- | --- |
| AC-1 | `/` renders the character list from `/api/characters` | PASS |
| AC-2 | Every character has a detail page at `/characters/[id]` | PASS |
| AC-3 | Detail page shows name, image, height, mass, affiliations | PASS |
| AC-4 | Prev/Next walk list order and wrap at both ends | PASS |
| AC-5 | Add and remove from the detail page persist via `/api/team` | PASS |
| AC-6 | `/team` lists the team and lets you remove members | PASS |
| AC-7 | Sidebar shows the team on every page | PASS |
| AC-8 | Sixth add is refused with `422 TEAM_FULL` | PASS |
| AC-9 | Evil characters cannot be added; Add is disabled with a tooltip | PASS |

---

## Setup

```bash
pnpm install
docker compose up -d postgres
turbo run db:migrate
turbo run gen
pnpm dev            # http://localhost:3000 for manual scenarios
```

For e2e tests (Playwright needs a built app):

```bash
pnpm build
pnpm --filter @stijnvanhulle/platform run test:e2e
```

For unit + integration tests only (no Docker needed, uses pglite):

```bash
pnpm test
```

---

## Section A. Feature-wide acceptance scenarios

Run these manually against the dev server, or confirm via the Playwright suite in Section J.

### A.1 Character list at `/`

Covers **AC-1**.

1. Open `http://localhost:3000/`.
2. A grid of Star Wars characters appears. Each card shows a name and an image.
3. Check the network panel: requests go to `/api/characters`, not to `akabab.github.io` directly.

Pass when: the grid is non-empty, every card has a name and image, and no request escapes to the upstream API.

### A.2 Character detail page

Covers **AC-2** and **AC-3**.

1. Click any character from `/`. URL becomes `/characters/[id]`.
2. The page shows name, image, height, mass, and affiliations.
3. Confirm the browser does not call `starwars-api`'s `/id/{id}.json` directly.

Pass when: all five fields are visible and match `GET /api/characters/{id}` for that character.

### A.3 Prev and Next navigation

Covers **AC-4**.

1. Open the third character in the list.
2. Click Next. URL advances to the fourth character without a full reload to `/`.
3. Click Prev twice. URL lands on the second character.
4. From the first character, click Prev. It should wrap to the last character.
5. From the last character, click Next. It should wrap to the first character.

Pass when: Prev/Next walk the same order as the list on `/`, wrap at both ends, and each navigation pushes a browser history entry.

### A.4 Add and remove from the detail page

Covers **AC-5**.

1. Open a non-evil character's detail page (e.g. Luke Skywalker).
2. Click "Add to team". A `POST /api/team` fires. The button flips to "Remove from team".
3. Confirm the sidebar (A.5) now shows Luke.
4. Click "Remove from team". A `DELETE /api/team/{characterId}` fires. The button flips back.

Pass when: the DB matches the UI after each click. Verify with `psql` or `GET /api/team`.

### A.5 Sidebar and `/team` page

Covers **AC-6** and **AC-7**.

1. Add two characters via A.4.
2. Navigate to `/` and several detail pages. The sidebar shows both members on every page.
3. Open `/team`. Both members appear with a remove control.
4. Remove one from `/team`. The sidebar updates immediately (RTK Query tag invalidation). The removed character's detail page shows "Add to team" again.

Pass when: sidebar and `/team` stay in sync after every add or remove, on any page.

### A.6 Team cap and evil ban

Covers **AC-8** and **AC-9**.

1. Remove all current team members so the team is empty.
2. Add five non-evil characters.
3. Open a sixth non-evil character's detail page and click "Add to team". The server returns `422 TEAM_FULL`. The UI shows a clear error. The team stays at five.
4. Open Darth Vader's detail page. The "Add to team" button is disabled. Hovering shows a tooltip explaining the character is evil.
5. Force a direct `POST /api/team` with Vader's id via devtools. The server returns `422 EVIL_FORBIDDEN`.

Pass when: both rules are enforced server-side (visible in the network panel) and reflected in the UI.

---

## Section B. Slice 001: setup

Scaffolds `apps/platform` (Next.js 16, MUI v9, App Router), adds `packages/components`,
removes `packages/core` and `packages/demo`, and wires root tooling.

| Scenario | Criterion | Result |
| --- | --- | --- |
| B.1 | `pnpm-workspace.yaml` includes `apps/*` | PASS |
| B.2 | `packages/core` and `packages/demo` are gone; `git grep` returns no hits | PASS |
| B.3 | `pnpm dev` serves the MUI-themed home page at HTTP 200 | PASS |
| B.4 | `next.config.ts` allowlists `akabab.github.io` in `images.remotePatterns` | PASS |
| B.5 | `@stijnvanhulle/components` workspace symlink resolves | PASS |
| B.6 | `pnpm test` exits 0; Playwright config parses without errors | PASS |
| B.7 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |
| B.8 | No `drizzle-orm`, `@reduxjs/toolkit`, or `@kubb` imports in source yet | PASS |
| B.9 | `pr.yml` and `release.yml` workflows are present and cover the new paths | PASS |

---

## Section C. Slice 002: database

Adds the Drizzle schema, two repositories, dual DB drivers (real Postgres for dev/prod, pglite
for tests), and the migration runner. Team-cap and dark-side rules are not in scope here.

| Scenario | Criterion | Result |
| --- | --- | --- |
| C.1 | `docker compose up -d postgres` comes up healthy | PASS |
| C.2 | `\d teams` and `\d team_members` match the data model (FK, partial unique, index) | PASS |
| C.3 | `0000_*.sql`, `0001_default_team.sql`, and `meta/_journal.json` are checked in | PASS |
| C.4 | `db:migrate` is idempotent; re-running still leaves exactly one default team row | PASS |
| C.5 | `teamRepository` exports `findBySlug` and `findDefault` | PASS |
| C.6 | `teamMemberRepository` is team-scoped, soft-delete aware, never issues hard DELETE | PASS |
| C.7 | `drizzle-orm` imports only appear under `src/db/**` and `src/server/repositories/**` | PASS |
| C.8 | 13 Vitest tests pass against pglite with no Docker (4 team, 9 teamMember) | PASS |
| C.9 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |
| C.10 | No `TEAM_FULL`, `EVIL_FORBIDDEN`, `isDarkSide`, or `TeamService` in source yet | PASS |
| C.11 | `db:migrate` fails with `ECONNREFUSED` when Postgres is down | PASS |

---

## Section D. Slice 003: design

Adds MUI theme tokens (palette, typography, spacing, radius) and the initial component set in
`packages/components`: `AppShell`, `TopBar`, `TeamSidebar` placeholder, `CharacterCard`,
`StatePanel`.

| Scenario | Criterion | Result |
| --- | --- | --- |
| D.1 | MUI theme token file exports `palette`, `typography`, `spacing`, and `shape.borderRadius` | PASS |
| D.2 | `packages/components/src/index.ts` re-exports all components without circular imports | PASS |
| D.3 | `AppShell` renders the top bar and a sidebar slot | PASS |
| D.4 | `CharacterCard` renders name and image; handles missing image with a placeholder | PASS |
| D.5 | `StatePanel` renders loading, empty, and error states | PASS |
| D.6 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |

---

## Section E. Slice 004: API routes

Lands `/api/characters`, `/api/characters/[id]`, `/api/team` (GET, POST), and
`/api/team/[characterId]` (DELETE). Proxy routes call the server-only `starwars-api` fetcher.
Team routes go through `TeamService` + repositories. Includes `isDarkSide` and the cap guard.

| Scenario | Criterion | Result |
| --- | --- | --- |
| E.1 | `GET /api/characters` returns all 87 characters; browser never calls `akabab.github.io` | PASS |
| E.2 | `GET /api/characters/1` returns Luke Skywalker's full payload | PASS |
| E.3 | `GET /api/team` returns the current team (empty initially) | PASS |
| E.4 | `POST /api/team` with a valid character id adds them and returns 201 | PASS |
| E.5 | Second `POST /api/team` with the same id returns `409 ALREADY_MEMBER` | PASS |
| E.6 | `POST /api/team` with a sixth member returns `422 TEAM_FULL` | PASS |
| E.7 | `POST /api/team` with an evil character returns `422 EVIL_FORBIDDEN` | PASS |
| E.8 | `DELETE /api/team/{characterId}` soft-deletes and returns 204 | PASS |
| E.9 | Second `DELETE` for the same character also returns 204 (idempotent) | PASS |
| E.10 | `drizzle-orm` imports are still scoped to `src/db/**` and `src/server/repositories/**` | PASS |
| E.11 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |

---

## Section F. Slice 005: Kubb codegen and RTK Query

Runs two Kubb pipelines from `openapi/*.yaml`. Frontend pipeline (`api.yaml`) emits types +
client + Zod into `src/gen/api/`. Server-only pipeline (`starwars.yaml`) emits types + Zod
into `src/gen/starwars/`. Wires the single `api` RTK Query slice and the Redux store into
`<Providers>`.

| Scenario | Criterion | Result |
| --- | --- | --- |
| F.1 | `turbo run gen` exits 0 and writes to `src/gen/api/` and `src/gen/starwars/` | PASS |
| F.2 | `src/gen/api/` contains types, client functions, and Zod schemas for all endpoints | PASS |
| F.3 | `src/gen/starwars/` contains types and Zod schemas (no client) | PASS |
| F.4 | The `api` RTK Query slice is wired in the Redux store and available via `<Providers>` | PASS |
| F.5 | `POST /api/team` body is validated against the generated `addTeamMemberRequestSchema`; malformed body returns 400 | PASS |
| F.6 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |

---

## Section G. Slice 006: features

Wires all UI requirements: character list (`/`), detail page with Prev/Next, persistent
`TeamSidebar`, `/team` page, real `isDarkSide`, evil-Add disabled with tooltip.

| Scenario | Criterion | Result |
| --- | --- | --- |
| G.1 | `/` renders a character grid; each card links to `/characters/[id]` | PASS |
| G.2 | Detail page shows name, image, height, mass, affiliations; missing fields show "Unknown" | PASS |
| G.3 | Prev/Next walk list order; wrap at both ends; back button works | PASS |
| G.4 | Add/Remove button toggles correctly; POST and DELETE fire as expected | PASS |
| G.5 | Sidebar shows the team on `/`, `/characters/[id]`, and `/team` | PASS |
| G.6 | `/team` lists members with a working remove control | PASS |
| G.7 | Vader's Add button is disabled with a tooltip; sixth add shows an error message | PASS |
| G.8 | `isDarkSide` is imported from a single file by both the UI and `TeamService` | PASS |
| G.9 | Vitest covers `isDarkSide` unit cases and key component render scenarios | PASS |
| G.10 | `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0 | PASS |

---

## Section H. Slice 007: extras

Adds bookmarks (`createSlice` + `localStorage` persistence, `/bookmarks` page, sidenav count
badge) and URL-driven pagination on `/` (`?page=N`, page size 24).

Run on 2026-05-27 against the dev server, driven through the Claude in Chrome extension.

| Scenario | Criterion | Result |
| --- | --- | --- |
| H.1 | Clicking the bookmark heart fills it and increments the sidenav badge; `localStorage.whale.bookmarks.v1` updates | PASS |
| H.2 | Hard-refresh keeps the bookmark state from `localStorage` | PASS |
| H.3 | `/bookmarks` lists bookmarked cards; "Clear all" empties the list and clears `localStorage` | PASS |
| H.4 | `/` shows 24 cards on page 1; pager shows pages 1..4; clicking page 2 sets `?page=2` and scrolls to top | PASS |
| H.5 | `/?page=99` clamps to the last page (15 cards); `/?page=foo` falls back to page 1 | PASS |
| H.6 | Next on id 88 (Captain Phasma) wraps to id 1 (Luke); Prev on id 1 wraps to id 88 | PASS |
| H.7 | `pnpm typecheck && pnpm lint && pnpm test` (19 files, 90 tests) all exit 0 | PASS |

Note: ids are not contiguous 1..87. The API returns 87 items but ids run 1..88 with one gap.
Wrap logic uses list order, not id arithmetic.

---

## Section I. Slice 008: testing

Adds Playwright e2e specs, CI Postgres service, initial Changesets entry, README refresh, and
research closeout.

Run on 2026-05-27 against `postgres:17-alpine` (Docker) and the built Next.js app.

| Scenario | Criterion | Result |
| --- | --- | --- |
| I.1 | `pnpm build && pnpm test:e2e` passes all 6 Playwright tests against Docker Postgres | PASS |
| I.2 | Commenting out the `TEAM_CAP` guard causes `cap.spec.ts` to fail; restoring makes it green | PASS |
| I.3 | Forcing `isDarkSide` to return `false` causes `darkSide.spec.ts` to fail; restoring makes it green | PASS |
| I.4 | CI `pr.yml` E2E job uses `postgres:17-alpine` service, runs `db:migrate`, `build`, `test:e2e`, uploads reports on failure | PASS (first run on push) |
| I.5 | `pnpm changeset status` lists one pending changeset bumping `@stijnvanhulle/platform` and `@stijnvanhulle/components` at `minor` | PASS |
| I.6 | `README.md` has use cases, tech stack, folder structure, getting started, and status with no `_TBD_` markers | PASS |
| I.7 | `research.md` "Open questions" and "Open items" are all struck through with per-slice resolution notes | PASS |
| I.8 | `pnpm typecheck && pnpm lint && pnpm test` (19 files, 92 tests) + `pnpm test:e2e` (6 tests) all exit 0 | PASS |

---

## Section J. Global verification

Final end-to-end pass on 2026-05-27. Postgres 17 running via Docker (healthy). App built with
`pnpm build` and served by `next start` inside the Playwright web-server fixture.

The six Playwright specs cover all Section A scenarios:

| Spec file | Covers | Result |
| --- | --- | --- |
| `e2e/browse.spec.ts` | A.1, A.2, A.3 (list, detail, prev/next) | PASS |
| `e2e/team.spec.ts` | A.4, A.5 (add, remove, sidebar sync, `/team`) | PASS |
| `e2e/cap.spec.ts` | A.6 cap path (sixth add refused, `422 TEAM_FULL`) | PASS |
| `e2e/darkSide.spec.ts` | A.6 evil path (rules 1, 2, 3; disabled button; `422 EVIL_FORBIDDEN`) | PASS |

All 6 tests pass in 4.9 s. All AC-1 through AC-9 confirmed. Final checks complete.
