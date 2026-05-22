# 005 — Client (Kubb)

## Context

Two API surfaces need typed access from the browser: our own `team` API (Slice 004) and the upstream `akabab` `starwars` API. Both have hand-written `OpenAPI 3.1` contracts. `Kubb 5.0.0-beta.23` is the prompt-mandated generator. This slice runs `Kubb` against both contracts, wires the generated artefacts into `RTK Query`, and stands up the Redux store so the providers in `layout.tsx` are ready for Slice 006 to consume.

Two pipelines, intentionally different:

- **team** emits types **and** a `fetch` client **and** Zod schemas. The Zod replaces the hand-rolled body guard in Slice 004's `POST` handler.
- **starwars** emits types **and** Zod only. No client: `RTK Query` does the fetching for us, and adding a generated client would just be a second way to call the same URLs.

`isDarkSide` stays a `false` stub. Real evil detection (and the server-side master-resolution it needs) lands in Slice 006.

## Goal (demoable outcome)

`pnpm --filter platform gen` runs `Kubb` and produces `apps/platform/src/gen/team/` (types + client + Zod) and `apps/platform/src/gen/starwars/` (types + Zod). `apps/platform/src/store/` exports a Redux store wiring two `RTK Query` slices, `starwarsApi` and `teamApi`. `<Providers />` wraps the app in `layout.tsx`. A throwaway client component reads `useGetAllCharactersQuery()` and renders the count of characters fetched from `akabab` — proof the wiring works end to end. No screens land yet; Slice 006 builds those.

## Prerequisites

- Slice 003 is done (`packages/components` exports the primitives).
- Slice 004 is done (`/api/team` exists and the contract file is mirrored under `apps/platform/openapi/team.yaml`).
- `plans/contracts/starwars.openapi.yaml` exists and is up to date.

## Steps

1. **Copy the starwars contract into the app**. Copy `plans/contracts/starwars.openapi.yaml` to `apps/platform/openapi/starwars.yaml` with the same do-not-edit header used in Slice 004's team copy.
2. **Install `Kubb` packages** in `apps/platform`: `kubb@5.0.0-beta.23` (unified package, exports `defineConfig`), `@kubb/adapter-oas@5.0.0-beta.23` (replaces v4's `@kubb/plugin-oas`), `@kubb/plugin-ts@5.0.0-beta.23`, `@kubb/plugin-client@5.0.0-beta.23`, `@kubb/plugin-zod@5.0.0-beta.23`. Pinned exactly per the prompt; no `^`.
3. **Write `apps/platform/kubb.config.ts`** as an array `defineConfig([teamCfg, starwarsCfg])` (v5 supports multiple configs from one file). `defineConfig` comes from `'kubb'`, not `'@kubb/core'`. Each entry uses the v5 layered shape:
   - **Top-level `adapter`**: `adapterOas({ integerType: 'number' })` from `'@kubb/adapter-oas'`. The `integerType: 'number'` override is required — v5 defaults to `'bigint'`, but `Character.id`, `height`, `mass` and `TeamMember.characterId` are plain `number` everywhere else in the app.
   - **`output.barrel`**: `{ type: 'named' }` (v4's `output.barrelType: 'named'` no longer exists) so consumers can `import { getAllCharacters } from '@/gen/starwars'`.
   - **team** (`input.path: './openapi/team.yaml'`, `output.path: './src/gen/team'`): plugins `pluginTs()`, `pluginClient({ baseURL: '/', client: { importPath: '../fetchClient' } })`, `pluginZod()`.
   - **starwars** (`input.path: './openapi/starwars.yaml'`, `output.path: './src/gen/starwars'`): plugins `pluginTs()`, `pluginZod()`. No `pluginClient`.
   `pluginOas` is gone — its config now lives on the top-level `adapter`. Do not pass `version` to `pluginZod` (v5 is always Zod v4) and do not pass `mapper` to `pluginTs` (use `adapter.resolver` if a rename is ever needed).
4. **Add a tiny fetch client wrapper** at `apps/platform/src/gen/fetchClient.ts`. Default-export a function `client(config) => Promise<Response>` that wraps native `fetch`, throws on non-2xx, returns the parsed JSON. The `pluginClient` generated code imports this; we own it so we can plug in error handling later without re-generating.
5. **Ignore generated output**. Add `apps/platform/src/gen/` to `.gitignore` (the whole directory is regenerated). Keep `apps/platform/src/gen/fetchClient.ts` checked in (it's the seam, not generated). One way: ignore `src/gen/team/` and `src/gen/starwars/` explicitly rather than the parent folder.
6. **Add the `gen` script** to `apps/platform/package.json`: `"gen": "kubb generate --config kubb.config.ts"`. Also add a `prebuild` hook (`"prebuild": "pnpm gen"`) so CI never builds against stale generated code.
7. **Install Redux packages**: `@reduxjs/toolkit@^2.12.0`, `react-redux@^9.3.0`. (Pin per the Technical Context table.)
8. **Build `starwarsApi`** at `apps/platform/src/store/starwarsApi.ts`. Use `createApi` with `reducerPath: 'starwars'`, `baseQuery: fetchBaseQuery({ baseUrl: 'https://akabab.github.io/starwars-api/api' })`, and `endpoints` `getAllCharacters` (`/all.json`) and `getCharacter` (`/id/${id}.json`). Type the responses with the generated `Character` from `src/gen/starwars`. No tags; `akabab` is static.
9. **Build `teamApi`** at `apps/platform/src/store/teamApi.ts`. `createApi` with `reducerPath: 'team'`, `baseQuery: fetchBaseQuery({ baseUrl: '/api/team' })`, endpoints `listTeam` (`GET ''`), `addTeamMember` (`POST '' body: { characterId }`), `removeTeamMember` (`DELETE /${characterId}`). Request and response bodies typed by the generated `@/gen/team` types. Tag `'team'` invalidated by `add` / `remove`, provided by `list`, so the sidebar re-renders automatically.
10. **Build the store** at `apps/platform/src/store/store.ts`. `configureStore({ reducer: { [starwarsApi.reducerPath]: starwarsApi.reducer, [teamApi.reducerPath]: teamApi.reducer }, middleware: (gdm) => gdm().concat(starwarsApi.middleware, teamApi.middleware) })`. Export `RootState`, `AppDispatch`, and pre-typed `useAppDispatch` / `useAppSelector` hooks from `apps/platform/src/store/hooks.ts`. Call `setupListeners(store.dispatch)` for refetch-on-focus.
11. **Build `<Providers />`** at `apps/platform/src/store/Providers.tsx`. Client component (`'use client'`), wraps children in `<ReduxProvider store={store}>`. Replace the placeholder layout from Slice 001 so `layout.tsx` now nests `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers>` → `{children}`.
12. **Adopt the generated Zod in the POST handler**. In `apps/platform/src/app/api/team/route.ts`, replace Slice 004's hand-rolled `isAddTeamMemberRequest` guard with the generated `addTeamMemberRequestSchema` from `@/gen/team`. On parse failure, return `400` with the Zod error message (still not in the contract's enumerated error codes; the 400-body shape stays a plain `{ message }`). Update the matching integration test if needed.
13. **Add a smoke client component** at `apps/platform/src/app/page.tsx` (replacing Slice 001's static placeholder): a `'use client'` component that calls `useGetAllCharactersQuery()` and renders the character count plus a loading/error state via Slice 003's `<StatePanel />`. This is throwaway scaffolding; Slice 006 replaces the body with the real character list. It exists in this slice only to prove the wiring works in the browser.
14. **Resolve Slice 004's open question** about `isAddTeamMemberRequest`: it is replaced by the generated Zod in step 12. Update `plans/research.md` to mark that open item closed and reference Slice 005.

## Files touched

- `apps/platform/openapi/starwars.yaml` — created (mirror of `plans/contracts/starwars.openapi.yaml`)
- `apps/platform/kubb.config.ts` — created
- `apps/platform/src/gen/fetchClient.ts` — created
- `apps/platform/src/gen/team/` — generated (gitignored)
- `apps/platform/src/gen/starwars/` — generated (gitignored)
- `apps/platform/.gitignore` (or root `.gitignore`) — modified (ignore `apps/platform/src/gen/team/`, `apps/platform/src/gen/starwars/`)
- `apps/platform/package.json` — modified (`gen` script, `prebuild` hook, deps: `kubb`, `@kubb/adapter-oas`, `@kubb/plugin-ts`, `@kubb/plugin-client`, `@kubb/plugin-zod`, `@reduxjs/toolkit`, `react-redux`)
- `apps/platform/src/store/store.ts` — created
- `apps/platform/src/store/hooks.ts` — created
- `apps/platform/src/store/starwarsApi.ts` — created
- `apps/platform/src/store/teamApi.ts` — created
- `apps/platform/src/store/Providers.tsx` — created
- `apps/platform/src/app/layout.tsx` — modified (insert `<Providers />`)
- `apps/platform/src/app/page.tsx` — modified (smoke `useGetAllCharactersQuery()` consumer)
- `apps/platform/src/app/api/team/route.ts` — modified (replace hand-rolled guard with generated Zod)
- `apps/platform/tests/integration/teamApi.test.ts` — modified if the 400-body shape changes
- `plans/research.md` — modified (close the "hand-rolled guard" open item)

## Verification

1. `pnpm --filter platform gen` exits 0. `apps/platform/src/gen/team/` contains `types.ts`, generated operation files (e.g. `getTeam.ts`), `*.zod.ts`, and `index.ts`. `apps/platform/src/gen/starwars/` contains `types.ts`, `*.zod.ts`, `index.ts` — and no `*.client.ts` files.
2. Re-run `pnpm gen`. Output is identical (idempotent).
3. Delete `apps/platform/src/gen/` and run `pnpm --filter platform build`. The `prebuild` hook regenerates it; build succeeds.
4. `pnpm typecheck` is green. The team route handler now imports the generated Zod and types.
5. `pnpm --filter platform test:unit` and `pnpm --filter platform test:integration` are green; the Slice 004 integration tests still pass (with the 400-body shape adjusted where needed).
6. `pnpm --filter platform dev` boots. Visit `http://localhost:3000/`. The smoke component renders "N characters" (where N matches `akabab`'s `/all.json` length, currently 87) after the loading state. Devtools network panel shows one request to `akabab.github.io` and zero to `/api`.

## Done criteria

- [ ] Both `OpenAPI` contracts are mirrored into `apps/platform/openapi/` with the do-not-edit header
- [ ] `kubb.config.ts` wires two pipelines: team (ts + client + zod) and starwars (ts + zod only)
- [ ] `pnpm gen` is idempotent and a `prebuild` hook runs it
- [ ] `apps/platform/src/gen/{team,starwars}/` are gitignored; `fetchClient.ts` is checked in
- [ ] `store.ts`, `starwarsApi.ts`, `teamApi.ts`, `Providers.tsx`, `hooks.ts` exist under `src/store/`
- [ ] `layout.tsx` nests `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers />` → children
- [ ] `teamApi` tags drive cache invalidation on `add` / `remove`
- [ ] The home page's smoke component renders the character count via `useGetAllCharactersQuery`
- [ ] `POST /api/team` validates with the generated Zod schema (not the hand-rolled guard)
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm test:integration` are green
- [ ] `plans/research.md` closes the "hand-rolled guard" open item with a pointer to Slice 005
- [ ] `isDarkSide` is still a stub; real rules and server-side master-resolution land in Slice 006
