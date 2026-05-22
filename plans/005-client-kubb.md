# 005: Client (Kubb)

## Context

Run Kubb against both OpenAPI contracts, wire the **single** frontend RTK Query slice, and stand up the Redux store. Two pipelines:

- `api` pipeline (frontend): consumes `apps/platform/openapi/api.yaml`. Emits types + client + Zod under `src/gen/api/` for every documented endpoint (characters and team) plus the shared schemas. This is the only generated code the browser bundle imports. Zod also replaces Slice 004's hand-rolled POST body guard.
- `starwars` pipeline (server-only): consumes `apps/platform/openapi/starwars.yaml`. Emits types + Zod under `src/gen/starwars/` for typing the source-API fetcher. Only `src/server/**` imports it; bundler config keeps it out of the browser.

Every endpoint the browser calls is documented in `api.yaml`, so RTK Query endpoints are all backed by generated operations. The frontend never imports `starwars.yaml` or any code generated from it. `isDarkSide` stays a stub; real rules land in Slice 006.

## Goal (demoable outcome)

`pnpm --filter platform gen` runs `Kubb` and produces `apps/platform/src/gen/api/` (types + client + Zod for `listCharacters`, `getCharacter`, and every team operation) and `apps/platform/src/gen/starwars/` (types + Zod, server-only). `apps/platform/src/store/` exports a Redux store wiring a single `RTK Query` slice (`api`) whose endpoints are all backed by the generated client. `<Providers />` wraps the app in `layout.tsx`. A throwaway client component reads `useListCharactersQuery()` and renders the count of characters returned by `/api/characters`, proof the wiring works end to end. The browser's network panel shows requests only to `/api/*`. No screens land yet; Slice 006 builds those.

## Prerequisites

- Slice 003 is done (`packages/components` exports the primitives).
- Slice 004 is done (`/api/characters` and `/api/team` exist; `apps/platform/openapi/api.yaml` and `apps/platform/openapi/starwars.yaml` are mirrored from `plans/contracts/`).

## Steps

1. **Verify the mirrored contracts**. `apps/platform/openapi/api.yaml` and `apps/platform/openapi/starwars.yaml` are already in place from Slice 004 with the do-not-edit header. Confirm they match `plans/contracts/`.
2. **Install `Kubb` packages** in `apps/platform`: `kubb@5.0.0-beta.23` (unified package, exports `defineConfig`), `@kubb/adapter-oas@5.0.0-beta.23` (replaces v4's `@kubb/plugin-oas`), `@kubb/plugin-ts@5.0.0-beta.23`, `@kubb/plugin-client@5.0.0-beta.23`, `@kubb/plugin-zod@5.0.0-beta.23`. Pinned exactly per the prompt; no `^`.
3. **Write `apps/platform/kubb.config.ts`** as an array `defineConfig([apiCfg, starwarsCfg])` (v5 supports multiple configs from one file). `defineConfig` comes from `'kubb'`, not `'@kubb/core'`. Each entry uses the v5 layered shape:
   - **Top-level `adapter`**: `adapterOas({ integerType: 'number' })` from `'@kubb/adapter-oas'`. The `integerType: 'number'` override is required, v5 defaults to `'bigint'`, but `Character.id`, `height`, `mass` and `TeamMember.characterId` are plain `number` everywhere else in the app.
   - **`output.barrel`**: `{ type: 'named' }` (v4's `output.barrelType: 'named'` no longer exists) so consumers can `import { listCharacters } from '@/gen/api'`.
   - **api** (`input.path: './openapi/api.yaml'`, `output.path: './src/gen/api'`): plugins `pluginTs()`, `pluginClient({ baseURL: '/', client: { importPath: '../fetchClient' } })`, `pluginZod()`. This is the only generated bundle the browser imports.
   - **starwars** (`input.path: './openapi/starwars.yaml'`, `output.path: './src/gen/starwars'`): plugins `pluginTs()`, `pluginZod()`. No `pluginClient`. Server-only; keep imports under `src/server/**`.
   `pluginOas` is gone, its config now lives on the top-level `adapter`. Do not pass `version` to `pluginZod` (v5 is always Zod v4) and do not pass `mapper` to `pluginTs` (use `adapter.resolver` if a rename is ever needed).
4. **Add a tiny fetch client wrapper** at `apps/platform/src/gen/fetchClient.ts`. Default-export a function `client(config) => Promise<Response>` that wraps native `fetch`, throws on non-2xx, returns the parsed JSON. The `pluginClient` generated code imports this; we own it so we can plug in error handling later without re-generating.
5. **Ignore generated output**. Add `apps/platform/src/gen/` to `.gitignore` (the whole directory is regenerated). Keep `apps/platform/src/gen/fetchClient.ts` checked in (it's the seam, not generated). One way: ignore `src/gen/api/` and `src/gen/starwars/` explicitly rather than the parent folder.
6. **Add the `gen` script** to `apps/platform/package.json`: `"gen": "kubb generate --config kubb.config.ts"`. Also add a `prebuild` hook (`"prebuild": "pnpm gen"`) so CI never builds against stale generated code.
7. **Install Redux packages**: `@reduxjs/toolkit@^2.12.0`, `react-redux@^9.3.0`. (Pin per the Technical Context table.)
8. **Build the single `api` slice** at `apps/platform/src/store/api.ts`. `createApi` with `reducerPath: 'api'`, `baseQuery: fetchBaseQuery({ baseUrl: '/api' })`, and these endpoints, all backed by the generated `@/gen/api` client and types:
   - `listCharacters` → `GET /characters`, returns `Character[]`. No tags; the source API is static for the session and refetch-on-focus handles staleness.
   - `getCharacter` → `GET /characters/{id}`, returns `Character`.
   - `getTeam` → `GET /team`, returns `TeamMember[]`. Provides tag `'team'`. (Matches the contract's `operationId: getTeam`; the generated hook is `useGetTeamQuery`.)
   - `addTeamMember` → `POST /team` with body `{ characterId }`, returns `TeamMember`. Invalidates `'team'`.
   - `removeTeamMember` → `DELETE /team/${characterId}`. Invalidates `'team'`.
   One slice means one `reducerPath`, one middleware, one cache. The sidebar re-renders automatically when team mutations invalidate the `'team'` tag.
10. **Build `<Providers />`** at `apps/platform/src/store/Providers.tsx`. Client component (`'use client'`), wraps children in `<ReduxProvider store={store}>`. Replace the placeholder layout from Slice 001 so `layout.tsx` now nests `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers>` → `{children}`.
11. **Adopt the generated Zod in the POST handler**. In `apps/platform/src/app/api/team/route.ts`, replace Slice 004's hand-rolled `isAddTeamMemberRequest` guard with the generated `addTeamMemberRequestSchema` from `@/gen/api`. On parse failure, return `400` with the Zod error message (still not in the contract's enumerated error codes; the 400-body shape stays a plain `{ message }`). Update the matching integration test if needed.
12. **Wire the proxy fetcher to the generated `starwars-api` type**. In `apps/platform/src/server/starwars-api.ts`, replace the hand-rolled `StarwarsApiCharacter` interface with the generated `Character` type from `@/gen/starwars`. The downconverter `toCharacter` now takes that generated type and returns the `@/gen/api` `Character`. No browser code imports `@/gen/starwars`; enforce with an oxlint rule restricting that import path to `src/server/**` and `src/lib/darkSide.ts`.
13. **Add a smoke client component** at `apps/platform/src/app/page.tsx` (replacing Slice 001's static placeholder): a `'use client'` component that calls `useListCharactersQuery()` and renders the character count plus a loading/error state via Slice 003's `<StatePanel />`. This is throwaway scaffolding; Slice 006 replaces the body with the real character list. It exists in this slice only to prove the wiring works in the browser.
14. **Resolve Slice 004's open question** about `isAddTeamMemberRequest`: it is replaced by the generated Zod in step 11. Update `plans/research.md` to mark that open item closed and reference Slice 005.

## Files touched

- `apps/platform/kubb.config.ts`: created
- `apps/platform/src/gen/fetchClient.ts`: created
- `apps/platform/src/gen/api/`: generated (gitignored)
- `apps/platform/src/gen/starwars/`: generated (gitignored)
- `apps/platform/.gitignore` (or root `.gitignore`): modified (ignore `apps/platform/src/gen/api/`, `apps/platform/src/gen/starwars/`)
- `apps/platform/package.json`: modified (`gen` script, `prebuild` hook, deps: `kubb`, `@kubb/adapter-oas`, `@kubb/plugin-ts`, `@kubb/plugin-client`, `@kubb/plugin-zod`, `@reduxjs/toolkit`, `react-redux`)
- `apps/platform/src/store/store.ts`: created
- `apps/platform/src/store/hooks.ts`: created
- `apps/platform/src/store/api.ts`: created (single RTK Query slice)
- `apps/platform/src/store/Providers.tsx`: created
- `apps/platform/src/server/starwars-api.ts`: modified (use generated `@/gen/starwars` type instead of hand-rolled interface)
- `apps/platform/src/server/toCharacter.ts`: modified (signature uses generated `starwars-api` + frontend `Character`)
- `apps/platform/src/app/layout.tsx`: modified (insert `<Providers />`)
- `apps/platform/src/app/page.tsx`: modified (smoke `useListCharactersQuery()` consumer)
- `apps/platform/src/app/api/team/route.ts`: modified (replace hand-rolled guard with generated Zod)
- `apps/platform/src/app/api/team/route.test.ts`: modified if the 400-body shape changes
- `.oxlintrc` (or equivalent): modified (restrict `@/gen/starwars` imports to `src/server/**` and `src/lib/darkSide.ts`)
- `plans/research.md`: modified (close the "hand-rolled guard" open item)

## Verification

1. `pnpm --filter platform gen` exits 0. `apps/platform/src/gen/api/` contains `types.ts` (including `Character` and `TeamMember`), generated operation files for every documented endpoint (e.g. `listCharacters.ts`, `getCharacter.ts`, `getTeam.ts`), `*.zod.ts`, and `index.ts`. `apps/platform/src/gen/starwars/` contains `types.ts`, `*.zod.ts`, `index.ts`, and no `*.client.ts` files.
2. Re-run `pnpm gen`. Output is identical on the second run.
3. Delete `apps/platform/src/gen/` and run `pnpm --filter platform build`. The `prebuild` hook regenerates it; build succeeds.
4. `pnpm typecheck` is green. The team route handler now imports the generated Zod and types from `@/gen/api`; the proxy fetcher imports the `starwars-api` type from `@/gen/starwars`.
5. `pnpm --filter platform test` and `pnpm --filter platform test` are green; the Slice 004 integration tests still pass (with the 400-body shape adjusted where needed).
6. `pnpm --filter platform dev` boots. Visit `http://localhost:3000/`. The smoke component renders "N characters" (where N matches the `starwars-api` `/all.json` length, currently 87) after the loading state. Devtools network panel shows requests **only** to `/api/characters`, zero to `akabab.github.io`.
7. `pnpm lint` reports any forbidden `@/gen/starwars` import outside `src/server/**` / `src/lib/darkSide.ts` (introduce a deliberate violation in a scratch branch to confirm).

## Done criteria

- [ ] Both `OpenAPI` contracts are mirrored into `apps/platform/openapi/` with the do-not-edit header
- [ ] `kubb.config.ts` wires two pipelines: `api` (ts + client + zod, frontend-facing; every documented endpoint gets an operation file) and `starwars` (ts + zod only, server-only)
- [ ] Every RTK Query endpoint in `src/store/api.ts` is backed by the generated `@/gen/api` client; nothing is hand-rolled against `Character`
- [ ] `pnpm gen` is safe to re-run (same output every time) and a `prebuild` hook runs it
- [ ] `apps/platform/src/gen/{api,starwars}/` are gitignored; `fetchClient.ts` is checked in
- [ ] `store.ts`, `api.ts`, `Providers.tsx`, `hooks.ts` exist under `src/store/`; there is only one RTK Query slice
- [ ] `layout.tsx` nests `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers />` → children
- [ ] The `'team'` tag drives cache invalidation on `addTeamMember` / `removeTeamMember`
- [ ] The home page's smoke component renders the character count via `useListCharactersQuery` and the browser's network panel shows zero requests to `akabab.github.io`
- [ ] `POST /api/team` validates with the generated Zod schema (not the hand-rolled guard)
- [ ] `@/gen/starwars` is never imported from browser code (lint rule enforces it)
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` are green
- [ ] `plans/research.md` closes the "hand-rolled guard" open item with a pointer to Slice 005
- [ ] `isDarkSide` is still a stub; real rules land in Slice 006 (`Character.masters` is `string[]`, so no resolution step is needed)
