# 001: Setup

## Context

Transform the library-style template into a Next.js 16.2.6 app at `apps/platform` with `MUI v9` wired and a `packages/components` placeholder. No business code, no DB, no API, no Kubb, no Redux, those land in their own slices.

## Goal (demoable outcome)

`pnpm dev` serves an `MUI`-themed `Next.js` page at `http://localhost:3000` that renders the project name and a sample `MUI` `Button` to prove the theme provider is wired. `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass.
Vitest and Playwright are installed and configured (no specs yet; Slice 002 lands the first unit/integration tests, Slice 007 the e2e specs). `packages/core` and `packages/demo` are gone.
The workspace now includes `apps/platform` and `packages/components`.

## Prerequisites

None. This is the first execution slice.

## Steps

1. **Add `apps/*` to the workspace.** Edit [`pnpm-workspace.yaml`](pnpm-workspace.yaml) so `packages:` includes `apps/*`. Mirror the same glob into the root `package.json` `workspaces.packages` array.
2. **Delete `packages/core` and `packages/demo`.** Remove both directories. In root `tsconfig.json`, replace the two stale `paths` aliases (`@stijnvanhulle/template-core` and `@stijnvanhulle/template-demo`) with `@stijnvanhulle/components → ./packages/components/src/index.ts` so IDE go-to-definition and inline typechecking resolve to the source. Remove any `cspell.json` allow-list entries that only existed because of those packages. Update `.gitignore` to cover `apps/*/.next/`, `apps/*/.turbo/`, and `apps/*/node_modules/` if not already matched by an existing wildcard.
3. **Scaffold `apps/platform`** with `package.json` (`name: "@stijnvanhulle/platform"`, `private: true`, `type: "module"`), `tsconfig.json` extending `configs/base.json`, and Next.js's standard layout. Use the App Router. Pin `next@16.2.6`; let `react` / `react-dom` resolve to whatever Next.js 16.2.6 ships with. Add the `dev`, `build`, `start`, `lint`, `typecheck` scripts. Notes:
   - The tsconfig override needs `verbatimModuleSyntax: false`, `allowImportingTsExtensions: false`, `noUnusedLocals: false`, `noUnusedParameters: false` so the Next-friendly bundler resolution wins over the strict defaults in `configs/base.json`.
   - `lint` runs oxlint against `./src`, not `next lint` (removed in Next 16).
   - Add a `pretypecheck: "next typegen"` step. Next 16's typed routes feature regenerates `next-env.d.ts` with an `import './.next/dev/types/routes.d.ts'` line that fails `tsc` on a clean clone, so typegen must run first.
4. **Install `MUI v9` (`9.0.1`) and the App Router cache provider** in `apps/platform`: `@mui/material@9.0.1`, `@mui/material-nextjs@9.0.1`, `@emotion/react`, `@emotion/cache`, `@emotion/styled`. Import `AppRouterCacheProvider` from `@mui/material-nextjs/v16-appRouter` (the Next 16 subpath; the `v15-` subpath warns under Next 16). Create `apps/platform/src/theme/theme.ts` with a placeholder `createTheme(...)` call (real tokens land in Slice 003).
5. **Wire the providers** through a `'use client'` `apps/platform/src/app/providers.tsx` component that wraps children in `<AppRouterCacheProvider>` then `<ThemeProvider theme={lightTheme}>` and `<CssBaseline />`. `layout.tsx` (a server component) renders `<Providers>{children}</Providers>` inside `<body>`. The split is required because the MUI theme object contains functions (`breakpoints.up`, etc.) that cannot cross the server/client boundary, which otherwise breaks the `/_not-found` prerender.
6. **Build the placeholder home page** at `apps/platform/src/app/page.tsx`. One `Container`, one `Typography variant="h3"` with the app name ("Whale Star Wars Team Builder"), one `Button variant="contained"` that does nothing.
7. **Scaffold `packages/components`** mirroring the existing `packages/core` pattern, minus the `start` (watch) script so `turbo run start` does not collide with `apps/platform`'s `next start`: `package.json` (`name: "@stijnvanhulle/components"`, `type: "module"`, `sideEffects: false`, `types: "./dist/index.d.ts"`, `exports: { ".": "./dist/index.js", "./package.json": "./package.json" }`, scripts `build: tsdown`, `clean: rm -rf ./dist`, `test: vitest --passWithNoTests`, `typecheck: tsc -p ./tsconfig.json --noEmit`), `tsconfig.json` extending `../../configs/bundler.json` (not the root `tsconfig.json`, which pulls monorepo-wide `paths` and `include` in), `tsdown.config.ts` (copy from the deleted `packages/core/tsdown.config.ts`), and `src/index.ts` exporting a single placeholder named export (e.g. `export const PLACEHOLDER = "components";`). Drop `bun-types` from the component package's `types` — this is a UI package and should not surface Bun globals. Real components and a watch script arrive in Slice 003. Add it as a dependency in `apps/platform/package.json` (`"workspace:*"`).
8. **Configure `apps/platform/next.config.ts`.** Add `images.remotePatterns` allowing `https://akabab.github.io/starwars-api/api/**` and any other host the `starwars-api` payload references. `packages/components` is consumed from its tsdown-built `dist/`, so no `transpilePackages` entry is needed.
9. **Update root scripts.** Each root script becomes a plain `turbo run <task>` (no `--filter`); turbo picks up whichever workspaces define the task. Adjust the root `package.json`:
   - `dev`: `turbo run dev` (only `apps/platform` defines `dev` at this point)
   - `build`: `turbo run build` (drops the current `--filter` list)
   - `start`: `turbo run start` (only `apps/platform` defines `start`; Slice 007's Playwright `webServer` runs `pnpm start`)
   - `typecheck`: `turbo run typecheck --continue`
   - `test`: `turbo run test` (replaces the current root-level vitest invocation; each workspace runs its own `test` script, so `apps/platform` runs Vitest via the config defined in step 10)
   - `test:e2e`: add `"test:e2e": "turbo run test:e2e"` (only `apps/platform` defines it)
   - `lint` / `lint:fix`: also lint `./apps`
   - `format`: also format `apps`

   Add two tasks to `turbo.json` `tasks` and trim the existing ones:
   - `dev`: `{ "cache": false, "persistent": true, "dependsOn": ["^build"], "inputs": ["src/**", "next.config.ts", "package.json", "tsconfig.json"] }`. `^build` ensures `packages/components` is built into `dist/` before the app dev server starts.
   - `test:e2e`: `{ "dependsOn": ["build"], "cache": false, "outputs": ["playwright-report/**", "test-results/**"] }`. Slice 007's CI workflow runs `pnpm test:e2e` from the root after `pnpm build`; `dependsOn: ["build"]` keeps that contract.
   - `start`: drop `dependsOn: ["^start"]` and `outputs: ["dist/**"]`. Persistent tasks cannot be depended on, and `next start` produces no outputs. Slice 007's Playwright `webServer` runs `pnpm start`, so leaving the legacy `^start` chain in place can block the e2e boot.
   - `build`: extend `outputs` with `.next/**` and `!.next/cache/**`, and add `next.config.ts` to `inputs`.
   - `test`: clear `outputs` (no coverage today) and drop the dead `test/**` glob from `inputs` since tests are colocated under `src/`.
10. **Wire Vitest in `apps/platform`.** Install `vitest` (catalog). Create `apps/platform/vitest.config.ts` with `test.include: ['src/**/*.test.{ts,tsx}']` and a manual `resolve.alias` mapping `@` to `./src` (Vitest 4 does not have a `resolve.tsconfigPaths` option; use `fileURLToPath(new URL('./src', import.meta.url))` or add `vite-tsconfig-paths`). Add the script `"test": "vitest run --config ./vitest.config.ts --passWithNoTests"` to `apps/platform/package.json` (the `--passWithNoTests` flag keeps the root `pnpm test` quiet while there are no specs yet; it drops out in Slice 002 once repository tests land). The root `pnpm test` (updated in step 9) shells out to this script via turbo. Slice 002 layers on the DB-reset `setupFiles` and the `poolOptions.threads.singleThread = true` option once Postgres-backed tests land.
11. **Wire Playwright in `apps/platform`.** Install `@playwright/test@^1.60.0`. Add scripts to `apps/platform/package.json`: `"playwright:install": "playwright install --with-deps chromium"`, `"test:e2e": "playwright test"`, `"test:e2e:headed": "playwright test --headed"`, `"test:e2e:report": "playwright show-report"`. Run `turbo run playwright:install` once locally (CI re-runs it in its setup step); only chromium is pinned, firefox and webkit are not needed. Create `apps/platform/playwright.config.ts` with `testDir: './e2e'`, `fullyParallel: false` (the team table is global state), `webServer: { command: 'pnpm start', port: 3000, reuseExistingServer: !process.env.CI }`, `use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' }`, `projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]`. Do not create `apps/platform/e2e/` in this slice; Slice 007 creates the directory alongside the first spec, with the `starwars-api` fixture wiring and the four spec files.
12. **CI workflow.** The existing `.github/workflows/pr.yml` already runs `build`, `typecheck`, `test`, `lint`, and spellcheck on every PR via parallel jobs, so this slice does not add a separate `ci.yml`. Later slices extend `pr.yml` with the piece they introduce (Slice 002 adds a Postgres service container and `db:migrate`, Slice 005 adds `gen`, Slice 007 adds Playwright). Sanity-check that the existing `pr.yml` jobs still pass with the new workspace layout (the build job runs `pnpm build` from root, which now also covers `apps/platform`).
13. **Update the release workflow** at `.github/workflows/release.yml`. The pre-existing workflow uses `changesets/action@v1`. Make two changes for this slice: extend the `paths` filter to include `apps/**` (so changesets that touch `apps/platform` still fire the workflow), and update the `get-version` job's `script` to look up `@stijnvanhulle/components` instead of the deleted `@stijnvanhulle/template-core`. The product is private (apps don't publish), but the Changesets entry still drives the `CHANGELOG.md` and version bump for `apps/platform` and `packages/components`.
14. **Verify the green tree.** Run `pnpm install`, then in parallel: `pnpm typecheck`, `pnpm lint`, `pnpm test`. Then `turbo run test:e2e -- --list`. Every command must exit 0 **and produce zero warnings**. The usual offenders to fix at this stage: missing peer-dependency warnings from `pnpm install` (resolve via explicit versions in `apps/platform/package.json`), Next.js / MUI deprecation notices in the dev server boot, Vitest's "no test files found" warning (mitigated by `--passWithNoTests`), unresolved imports left over from the deleted `packages/core` / `packages/demo` aliases.

## Files touched

- `pnpm-workspace.yaml`: modified (add `apps/*` to `packages:`)
- `package.json`: modified (workspaces glob, scripts)
- `turbo.json`: modified (add persistent `dev` task)
- `tsconfig.json`: modified (drop references to deleted packages, add `apps/platform`)
- `packages/core/`: deleted
- `packages/demo/`: deleted
- `packages/components/package.json`: created
- `packages/components/tsconfig.json`: created
- `packages/components/tsdown.config.ts`: created
- `packages/components/src/index.ts`: created
- `apps/platform/package.json`: created
- `apps/platform/tsconfig.json`: created
- `apps/platform/next.config.ts`: created
- `apps/platform/next-env.d.ts`: created
- `apps/platform/src/app/layout.tsx`: created
- `apps/platform/src/app/page.tsx`: created
- `apps/platform/src/theme/theme.ts`: created
- `apps/platform/vitest.config.ts`: created
- `apps/platform/playwright.config.ts`: created
- `apps/platform/e2e/`: created by Slice 007 alongside the first spec (no placeholder file in this slice)
- `.gitignore`: modified (only if existing wildcards do not already cover `apps/*/.next/`, `apps/*/.turbo/`, `apps/*/node_modules/`)
- `cspell.json`: modified (only if it referenced the deleted packages)
- `.github/workflows/release.yml`: created (Changesets action on push to `main`)

## Verification

1. `pnpm install` completes without errors and resolves `@stijnvanhulle/components` as a workspace link in `apps/platform/node_modules`.
2. `pnpm typecheck` exits 0 with no warnings.
3. `pnpm lint` exits 0 with no warnings.
4. `pnpm test` exits 0 with no warnings (no specs yet; turbo runs Vitest via each workspace's `test` script, and `apps/platform`'s script passes `--passWithNoTests`).
5. `turbo run test:e2e -- --list` parses the config and reports "0 tests" without erroring or warning (specs land in Slice 007).
6. `pnpm dev` starts cleanly. No deprecation warnings or peer-dep complaints in the boot log. Visiting `http://localhost:3000` shows the app name and a contained `MUI` `Button` with the MUI primary color, confirming the theme provider is wired. Real font wiring lands in Slice 003 alongside design tokens.
7. `ls packages/` shows only `components/`. `packages/core` and `packages/demo` are gone.

## Done criteria

- [x] `pnpm-workspace.yaml` and root `package.json` include `apps/*`
- [x] `packages/core` and `packages/demo` deleted; no dangling references in configs or scripts
- [x] `apps/platform` boots via `pnpm dev` and renders an `MUI`-themed page at `/`
- [x] `AppRouterCacheProvider` + `ThemeProvider` + `CssBaseline` wrap the app in `layout.tsx`
- [x] `next.config.ts` allows `starwars-api` image URLs
- [x] `packages/components` exists with a placeholder export and is linked from `apps/platform`
- [x] `apps/platform/vitest.config.ts` and `apps/platform/playwright.config.ts` both parse cleanly; `pnpm test` and `pnpm test:e2e -- --list` succeed
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e -- --list`, and `pnpm dev` all run with zero warnings and zero errors
- [x] No code in this slice imports `Drizzle`, `Redux`, `Kubb`, or anything outside Next + MUI (those belong to later slices)
- [x] `.github/workflows/pr.yml` (existing) exercises `build`/`typecheck`/`test`/`lint`/spellcheck on every PR, with the new `apps/platform` and `packages/components` workspaces covered. Postgres, `gen`, and Playwright are layered on by Slices 002, 005, and 007 respectively
- [x] `.github/workflows/release.yml` exists and uses `changesets/action@v1` on push to `main`
