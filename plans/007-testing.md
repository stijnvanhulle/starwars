# 007: Testing

## Context

Add Playwright e2e specs and a CI pipeline that runs unit + integration + e2e against a Postgres service container. Plus the Changesets entry and the README refresh. No new product features; if an e2e spec fails, the fix lives in Slice 006.

## Goal (demoable outcome)

`pnpm --filter platform test:e2e` (Playwright) runs four specs against a freshly migrated Postgres and a built Next.js app: browse, add+remove, cap-of-5, dark-side. All pass. On GitHub Actions, a single workflow runs `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` against a Postgres service container, and a Changesets-versioning step lands. A `CHANGELOG.md` entry exists for the initial release.

## Prerequisites

- Slice 006 is done. Every quickstart scenario passes manually.
- The `starwars-api` is rate-limited from CI. Since the browser only talks to `/api/*`, e2e specs mock the `starwars-api` at the **server-side** boundary (the `starwars-api.ts` fetcher) rather than intercepting browser network calls. This keeps the test surface aligned with how the app actually runs.

## Steps

1. **Install Playwright** in `apps/platform`: `@playwright/test@^1.60.0`. Run `pnpm --filter platform exec playwright install --with-deps chromium` once locally (CI will rerun this in its setup step). Pin only the chromium browser; firefox and webkit are not needed for this app.
2. **Add the Playwright config** at `apps/platform/playwright.config.ts`. Settings:
   - `testDir: './e2e'`, `fullyParallel: false` (the team table is global state).
   - `webServer: { command: 'pnpm start', port: 3000, reuseExistingServer: !process.env.CI, env: { DATABASE_URL: ... } }`.
   - `use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' }`.
   - `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`.
3. **Add the test setup** at `apps/platform/e2e/setup.ts`. Two helpers:
   - `resetTeam()`: opens a `pg` client, runs `TRUNCATE team_members RESTART IDENTITY`, closes. Called from a `test.beforeEach` in every spec so each test starts from an empty team.
   - **`starwars-api` fixture mode** for the dev server itself. Add an `E2E_FIXTURES=1` env var read inside `src/server/starwars-api.ts`; when set, the module loads `apps/platform/e2e/fixtures/characters.ts` from disk and serves them in place of the real `starwars-api` fetch. The Playwright `webServer.env` passes `E2E_FIXTURES=1`. This keeps the test surface the same as production (browser → `/api/*` → `starwars-api.ts`), only the bottom of that chain is faked. Fixtures include at least: Luke (neutral), Leia (neutral), three more neutrals, Vader (rule 1 via name), a Sith-affiliated character (rule 2 via `affiliations`), and a character whose `masters` array contains a string with `"Darth"` (rule 3, e.g. `["Darth Sidious (Sith Master)"]`).
4. **Write `apps/platform/e2e/browse.spec.ts`** for AC-1..AC-4:
   - List loads at `/`, shows the seven fixture characters.
   - Click Luke. URL becomes `/characters/1` (or whatever id the fixture pins). Detail shows name, image, height, mass, affiliations.
   - Click `Next`. URL changes to the next id. Click `Prev` twice. URL is one before the start.
5. **Write `apps/platform/e2e/team.spec.ts`** for AC-5..AC-7:
   - From Luke's detail page, click `Add to team`. Sidebar shows Luke.
   - Navigate to `/`. Sidebar still shows Luke.
   - Navigate to `/team`. Luke is listed with a remove control.
   - Click remove. Sidebar empties; detail page for Luke shows `Add to team` again.
6. **Write `apps/platform/e2e/cap.spec.ts`** for AC-8:
   - Add five neutral characters via the API (helper: `addCharacter(id)` that POSTs to `/api/team`). Faster than clicking through five detail pages.
   - Open the detail page for a sixth neutral character. Click `Add to team`.
   - Assert the inline error contains "five" or "TEAM_FULL" (whichever copy Slice 006 chose), and `select count(*) from team_members` is still 5.
7. **Write `apps/platform/e2e/darkSide.spec.ts`** for AC-9:
   - Open Vader's detail page. Assert the `Add to team` button is disabled. Hover it. Assert the tooltip text is visible.
   - Use `page.request.post('/api/team', { data: { characterId: vaderId } })` to force the server-side check. Assert the response is `422` and the body's `code` is `EVIL_FORBIDDEN`.
   - Repeat for the Sith-affiliated and master-of-Vader fixtures (all three rules).
8. **Add the e2e script** to `apps/platform/package.json`: `"test:e2e": "playwright test"`, `"test:e2e:headed": "playwright test --headed"`, `"test:e2e:report": "playwright show-report"`.
9. **Replace the existing CI workflow** at `.github/workflows/ci.yml` (or add one if absent) so a single job runs the full pyramid against a Postgres service container. Outline:
   ```yaml
   services:
     postgres:
       image: postgres:17-alpine
       env: { POSTGRES_USER: platform, POSTGRES_PASSWORD: platform, POSTGRES_DB: platform }
       ports: [5432:5432]
       options: --health-cmd "pg_isready -U platform" --health-interval 5s --health-retries 10
   ```
   Steps:
   1. `actions/checkout@v4`.
   2. The existing `.github/setup` composite action (Node 22, pnpm, install).
   3. `pnpm --filter platform db:migrate` with `DATABASE_URL=postgres://platform:platform@localhost:5432/platform`.
   4. `pnpm --filter platform gen` (so generated code exists even though it's gitignored).
   5. `pnpm typecheck`, `pnpm lint`, `pnpm test` in parallel where Turborepo allows.
   6. `pnpm --filter platform exec playwright install --with-deps chromium`.
   7. `pnpm --filter platform build`.
   8. `pnpm --filter platform test:e2e`.
   9. Upload `apps/platform/playwright-report/` and `apps/platform/test-results/` on failure (`actions/upload-artifact@v4`, `if: failure()`).
10. **Add a release workflow** at `.github/workflows/release.yml` using the standard Changesets action: on push to `main`, run `changesets/action@v1` to either open a "Version Packages" PR or publish if one was merged. The product is private (apps don't publish), but the Changesets entry still drives the `CHANGELOG.md` and version bump for `apps/platform` and `packages/components`.
11. **Author the initial Changesets entry**. `pnpm changeset add`. Mark `apps/platform` and `packages/components` as `minor` (this is the first releasable surface). Summary: "Initial release of the Whale Star Wars Team Builder." Commit the resulting `.changeset/*.md` file.
12. **Refresh `README.md`** per the prompt:
    - **Tech stack**: bullet list pulled from `plan.md`'s Technical Context table.
    - **Use cases**: three sentences from `spec.md`.
    - **Folder structure**: the `tree` from `plan.md`'s Project Structure section.
    - **Getting started**: link to `plans/quickstart.md` for the user flow walk-through and to `plans/001-setup.md` for the first execution slice.
    - **Status**: current state ("All seven slices complete; see `plans/plan.md` Progress Tracking").
13. **Close out the open items** in `plans/research.md`. Anything still listed as open after Slices 005 and 006 either gets resolved (with a one-line decision) or moved to a follow-up issue. Common candidates: the `affiliations`-missing fallback, the 400-on-bad-body shape, the dark-mode decision deferred from `design.md`.

## Files touched

- `apps/platform/playwright.config.ts`: created
- `apps/platform/e2e/setup.ts`: created
- `apps/platform/e2e/fixtures/characters.ts`: created
- `apps/platform/e2e/browse.spec.ts`: created
- `apps/platform/e2e/team.spec.ts`: created
- `apps/platform/e2e/cap.spec.ts`: created
- `apps/platform/e2e/darkSide.spec.ts`: created
- `apps/platform/package.json`: modified (`test:e2e*` scripts, `@playwright/test` dep)
- `.gitignore`: modified (ignore `apps/platform/playwright-report/`, `apps/platform/test-results/`)
- `.github/workflows/ci.yml`: modified (Postgres service, full test pyramid, artifact upload on failure)
- `.github/workflows/release.yml`: created (Changesets action)
- `.changeset/*.md`: created (initial release entry)
- `README.md`: modified (tech stack, use cases, folder structure, status)
- `plans/research.md`: modified (final open-item close-out)
- `plans/plan.md`: modified (flip the relevant checkboxes to done)

## Verification

1. `docker compose up -d postgres && pnpm --filter platform db:migrate && pnpm --filter platform gen && pnpm --filter platform build`. Build succeeds.
2. `pnpm --filter platform test:e2e`. All four specs pass against the local Postgres. Total runtime under two minutes on a developer laptop.
3. Force a regression: comment out the cap-of-5 check in `TeamService.add()`. Re-run `test:e2e`. `cap.spec.ts` fails with a clear assertion message about the team size. Revert.
4. Force a regression: change `isDarkSide` to always return `false`. Re-run `test:e2e`. `darkSide.spec.ts` fails on the disabled-button assertion and on the 422 response. Revert.
5. Push the branch. GitHub Actions runs the full pyramid; the workflow finishes green. On failure, the Playwright report is downloadable from the run's artifacts.
6. `pnpm changeset status` shows one pending changeset.
7. `cat README.md` shows the four required sections from the prompt; no `_TBD_` markers.
8. `plans/research.md` has no items left under "Open" without either a decision or a follow-up link.

## Done criteria

- [ ] Four Playwright specs cover AC-1..AC-9 and pass locally and in CI
- [ ] The `starwars-api` is faked via the `E2E_FIXTURES=1` server-side switch; no real network calls leave CI and the browser still hits only `/api/*`
- [ ] `apps/platform/playwright.config.ts` runs against the built app (`pnpm start`), not the dev server, in CI
- [ ] CI runs unit, integration, and e2e against a `postgres:17-alpine` service container on every push
- [ ] CI uploads the Playwright report on failure
- [ ] Release workflow uses `changesets/action@v1`; one initial changeset is checked in
- [ ] `README.md` covers tech stack, use cases, folder structure, and current status per the prompt
- [ ] `plans/research.md` has no unresolved open items at slice close
- [ ] `plans/plan.md` Progress Tracking shows all slices and the three Close-out items as done
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` are green locally and in CI
