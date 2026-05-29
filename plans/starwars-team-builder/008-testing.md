# 008: Testing

## Context

Add Playwright e2e specs and a CI pipeline that runs unit + integration + e2e against a Postgres service container. Plus the Changesets entry and the README refresh.
No new product features. If an e2e spec fails, the fix lives in Slice 006.

## Goal (demoable outcome)

`turbo run test:e2e` (Playwright) runs four specs against a freshly migrated Postgres and a built Next.js app: browse, add+remove, cap-of-5, dark-side. All pass. On GitHub Actions, a single workflow runs `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` against a Postgres service container, and a Changesets-versioning step lands. A `CHANGELOG.md` entry exists for the initial release.

## Prerequisites

- Slice 006 is done. Every verification scenario passes manually.
- Slice 001 has installed `@playwright/test`, the chromium browser, and `apps/platform/playwright.config.ts` (testDir, webServer, baseURL, project). This slice only fills in the DB env on `webServer.env` and the spec files.
- The `starwars-api` is rate-limited from CI. Since the browser only talks to `/api/*`, e2e specs mock the `starwars-api` at the server-side boundary (the `starwars-api.ts` fetcher) rather than intercepting browser network calls. This keeps the test surface aligned with how the app actually runs.

## Steps

1. **Extend `apps/platform/playwright.config.ts`** (created in Slice 001) with the DB connection on `webServer.env`: `DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'` plus the `E2E_FIXTURES=1` flag wired in step 2.
2. **Add the test setup** at `apps/platform/e2e/setup.ts`. Two helpers:
   - `resetTeam()`: opens a `pg` client, runs `UPDATE team_members SET deleted_at = now() WHERE deleted_at IS NULL`, closes. Called from a `test.beforeEach` in every spec so each test starts with no active members. We never `TRUNCATE` or hard-`DELETE`. The table is append-only with a soft-delete column, and read queries already filter `deletedAt IS NULL`.
   - **`starwars-api` fixture mode** for the dev server itself. Add an `E2E_FIXTURES=1` env var read inside `src/server/starwars-api.ts`. When set, the module loads `apps/platform/e2e/fixtures/characters.ts` from disk and serves them in place of the real `starwars-api` fetch. The Playwright `webServer.env` passes `E2E_FIXTURES=1`. This keeps the test surface the same as production (browser → `/api/*` → `starwars-api.ts`). Only the bottom of that chain is faked. Fixtures include at least: Luke (neutral), Leia (neutral), three more neutrals, Vader (rule 1 via name), a Sith-affiliated character (rule 2 via `affiliations`), and a character whose `masters` array contains a string with `"Darth"` (rule 3, e.g. `["Darth Sidious (Sith Master)"]`).
3. **Write `apps/platform/e2e/browse.spec.ts`** for AC-1..AC-4:
   - List loads at `/`, shows the seven fixture characters.
   - Click Luke. URL becomes `/characters/1` (or whatever id the fixture pins). Detail shows name, image, height, mass, affiliations.
   - Click `Next`. URL changes to the next id. Click `Prev` twice. URL is one before the start.
4. **Write `apps/platform/e2e/team.spec.ts`** for AC-5..AC-7:
   - From Luke's detail page, click `Add to team`. Sidebar shows Luke.
   - Navigate to `/`. Sidebar still shows Luke.
   - Navigate to `/team`. Luke is listed with a remove control.
   - Click remove. Sidebar empties, and the detail page for Luke shows `Add to team` again.
5. **Write `apps/platform/e2e/cap.spec.ts`** for AC-8:
   - Add five neutral characters via the API (helper: `addCharacter(id)` that POSTs to `/api/team`). Faster than clicking through five detail pages.
   - Open the detail page for a sixth neutral character. Click `Add to team`.
   - Assert the inline error contains "five" or "TEAM_FULL" (whichever copy Slice 006 chose), and `select count(*) from team_members` is still 5.
6. **Write `apps/platform/e2e/darkSide.spec.ts`** for AC-9:
   - Open Vader's detail page. Assert the `Add to team` button is disabled. Hover it. Assert the tooltip text is visible.
   - Use `page.request.post('/api/team', { data: { characterId: vaderId } })` to force the server-side check. Assert the response is `422` and the body's `code` is `EVIL_FORBIDDEN`.
   - Repeat for the Sith-affiliated and master-of-Vader fixtures (all three rules).
7. **Extend the CI workflow** at `.github/workflows/ci.yml` (Slice 001 skeleton, Postgres + `db:migrate` from 002, `gen` from 005) with the Playwright steps now that the specs exist:
   - `turbo run playwright:install` after `setup`.
   - `pnpm test:e2e` after `pnpm build`. No guard needed. The four spec files land in this slice.
   - On failure, upload `apps/platform/playwright-report/` and `apps/platform/test-results/` via `actions/upload-artifact@v4` with `if: failure()`.
8. **Author the initial Changesets entry**. `pnpm changeset add`. Mark `apps/platform` and `packages/components` as `minor` (this is the first releasable surface). Summary: "Initial release of the Whale Star Wars Team Builder." Commit the resulting `.changeset/*.md` file. The release workflow itself was scaffolded in Slice 001, and this is the first changeset for it to act on.
9. **Refresh `README.md`** per the prompt:
    1. Tech stack as a bullet list pulled from `plan.md`'s Technical Context table.
    2. Use cases in three sentences from `spec.md`.
    3. Folder structure copied from `plan.md`'s Project Structure tree.
    4. Getting started, linking to `plans/starwars-team-builder/verification.md` for the user flow walk-through and `plans/starwars-team-builder/001-setup.md` for the first execution slice.
    5. Status, e.g. "All seven slices complete, see `plans/starwars-team-builder/plan.md` Progress Tracking".
10. **Close out the open items** in `plans/starwars-team-builder/research.md`. The Phase 0/1 items were resolved earlier. Confirm those closures are still recorded:
    - Optional-field fallbacks (Slice 006 step 1): placeholder image, "Unknown" stats, hidden empty lists.
    - `isDarkSide` with missing fields (Slice 006 step 1): `?? false` short-circuit on the array probes.
    - Proxy cache scope (Slice 006 step 2): request-scoped `Map` memo inside `createCharacterFetcher`.

    Any items added during Slices 002–006 (e.g. the `400`-on-bad-body shape pinned in Slice 004 step 9, the dark-mode decision deferred from `design.md`) either get resolved with a one-line decision or moved to a follow-up issue. End state: zero items under "Open" without a decision or a follow-up link.

## Files touched

- `apps/platform/playwright.config.ts`: modified (add `webServer.env` with DATABASE_URL and `E2E_FIXTURES=1`)
- `apps/platform/e2e/setup.ts`: created
- `apps/platform/e2e/fixtures/characters.ts`: created
- `apps/platform/e2e/browse.spec.ts`: created
- `apps/platform/e2e/team.spec.ts`: created
- `apps/platform/e2e/cap.spec.ts`: created
- `apps/platform/e2e/darkSide.spec.ts`: created
- `.gitignore`: modified (ignore `apps/platform/playwright-report/`, `apps/platform/test-results/`)
- `.github/workflows/ci.yml`: modified (add `playwright:install` + `pnpm test:e2e` + failure artifact upload)
- `.changeset/*.md`: created (initial release entry, and the workflow that consumes it was scaffolded in Slice 001)
- `README.md`: modified (tech stack, use cases, folder structure, status)
- `plans/starwars-team-builder/research.md`: modified (final open-item close-out)
- `plans/starwars-team-builder/plan.md`: modified (flip the relevant checkboxes to done)

## Verification

1. `docker compose up -d postgres && turbo run db:migrate && turbo run gen && turbo run build`. Build succeeds.
2. `pnpm test:e2e`. All four specs pass against the local Postgres. Total runtime under two minutes on a developer laptop.
3. Force a regression: comment out the cap-of-5 check in `TeamService.add()`. Re-run `test:e2e`. `cap.spec.ts` fails with a clear assertion message about the team size. Revert.
4. Force a regression: change `isDarkSide` to always return `false`. Re-run `test:e2e`. `darkSide.spec.ts` fails on the disabled-button assertion and on the 422 response. Revert.
5. Push the branch. GitHub Actions runs the full pyramid. The workflow finishes green. On failure, the Playwright report is downloadable from the run's artifacts.
6. `pnpm changeset status` shows one pending changeset.
7. `cat README.md` shows the four required sections from the prompt, and no `_TBD_` markers.
8. `plans/starwars-team-builder/research.md` has no items left under "Open" without either a decision or a follow-up link.

## Done criteria

- [x] Four Playwright specs cover AC-1..AC-9 and pass locally and in CI
- [x] The `starwars-api` is faked via the `E2E_FIXTURES=1` server-side switch, no real network calls leave CI, and the browser still hits only `/api/*`
- [x] `apps/platform/playwright.config.ts` runs against the built app (`pnpm start`), not the dev server, in CI
- [x] The CI workflow scaffolded in Slice 001 now exercises unit, integration, and e2e against the `postgres:17-alpine` service on every push, and uploads the Playwright report on failure
- [x] One initial changeset is checked in, and the Slice 001 release workflow picks it up on the next push to `main`
- [x] `README.md` covers tech stack, use cases, folder structure, and current status per the prompt
- [x] `plans/starwars-team-builder/research.md` has no unresolved open items at slice close
- [x] `plans/starwars-team-builder/plan.md` Progress Tracking shows all slices and the three Close-out items as done
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` are green locally and in CI
