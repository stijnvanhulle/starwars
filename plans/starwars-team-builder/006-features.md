# 006: Features

## Context

Assemble the three screens (`/`, `/characters/[id]`, `/team`) and the persistent team sidebar from earlier slices. Real `isDarkSide` rules land in `src/lib/darkSide.ts` and are wired into both the server guard and the UI Add-button state. Slice 003 stops at the presentational primitives; this slice owns the data wiring, layout shell, and the styling pattern the rest of the app follows.

Two styling tracks coexist by the end of this slice and that is intentional:

- `packages/components` stays on MUI `sx`. The library is published, has no CSS-loader assumption, and must render the same in any Next.js (or non-Next) consumer.
- `apps/platform` may use either `sx` or colocated `*.module.css` files. CSS modules are migrated for two files in this slice (`CharacterCard.module.css`, `ProgressPill.module.css`) so the pattern is established by two reference examples. The Next.js build pipeline already handles `.module.css`, we just opt in.

No new dependency lands here. If something needs a new package or generated file, it belongs in an earlier slice.

## Goal (demoable outcome)

`pnpm dev` boots and a visitor can complete every acceptance criterion in [`spec.md`](spec.md) and every scenario in [`verification.md`](verification.md). The team persists across reloads. The sixth add returns `422 TEAM_FULL` and is shown as an inline error. Darth Vader's Add button is disabled with a tooltip, and forcing the request returns `422 EVIL_FORBIDDEN`. The right-rail team panel updates instantly after any add or remove. Skeleton placeholders render while data is in flight. `CharacterCard` and one common component (`ProgressPill`) are styled by CSS modules.

## Prerequisites

- Slice 005 is done. The single `api` RTK Query slice exists. Generated types and Zod are present under `src/gen/api/` (frontend) and `src/gen/starwars/` (server-only). `<Providers />` wraps the app in `layout.tsx`.
- The smoke `useListCharactersQuery()` consumer from Slice 005's `page.tsx` exists and is about to be replaced.
- The Pages-Router API routes from Slice 004 live under `src/pages/api/**` (per the `App Router for UI, Pages Router for API` rule). The slice text below uses those paths.

## Steps

1. **Implement `isDarkSide`** in `apps/platform/src/lib/darkSide.ts`. Replace Slice 004's `return false`. Signature is `isDarkSide(character: StarwarsApiCharacter): boolean`. Three rules OR'd, in this order:
   1. `/darth|sith/i.test(character.name)`.
   2. `character.affiliations?.some(a => /darth|sith/i.test(a)) ?? false`. The frontend `Character` carries only current affiliations (the proxy strips `formerAffiliations`), so there is no "former" branch to guard against here.
   3. `character.masters?.some(m => /darth/i.test(m)) ?? false`. `masters` is `string[]` upstream (entries sometimes carry a parenthetical role like `"Darth Sidious (Sith Master)"`); substring match covers that.
   Defensive defaults if a field is missing: treat absent `affiliations` / `masters` as empty arrays (the rule short-circuits to `false` for that rule, not for the whole predicate). Pure, synchronous, no fetches inside.
2. **Add a request-scoped character cache** at `apps/platform/src/server/starwars-api.ts`. Replace the bare `fetchCharacter` / `fetchAllCharacters` exports with `createCharacterFetcher()` that returns `{ all, byId }` backed by an internal `Map<number, Promise<StarwarsApiCharacter | null>>` so a single request never fetches the same id twice. Update every call site from Slice 004: `src/pages/api/characters/index.api.ts` (calls `all()`), `src/pages/api/characters/[id].api.ts` (calls `byId(id)`), and `src/pages/api/team/index.api.ts` (passes `fetcher.byId` to `addTeamMember` in place of the named `fetchCharacter`). Existing MSW-based integration tests still pass because they intercept the upstream HTTP, not the fetcher.
3. **Build the presentational `<CharacterList />`** at `packages/components/src/characters/CharacterList.tsx`. Pure: accepts `state: 'loading' | 'error' | 'success'`, an optional `characters: CharacterListItem[]` with `chip?: 'on-team' | 'dark-side'`, and an `onSelect(id)` callback. Loading state delegates to `<CharacterListSkeleton />` (see step 7). Error state uses `<StatePanel variant="error">`. Success state renders a responsive grid of `<CharacterCard />` and forwards selection via `onSelect`. No data fetching here; the library stays decoupled from RTK Query.
4. **Build the presentational `<CharacterDetail />`** at `packages/components/src/characters/CharacterDetail.tsx`. Props: the character, `onTeam`, `evil`, optional `loading`, optional `errorMessage`, optional `prevName` / `nextName` / `position`, and the action callbacks. Renders the pager pills + `N OF total` counter, the detail card (hero portrait + name + stat cards + tinted affiliation chips + the red action bar for evil + the `<PrimaryButton>`). Library helpers (`PagerButton`, `StatCard`, `PrimaryButton`) live next to it in `common/`.
5. **Wire the home page** at `apps/platform/src/app/page.tsx` (client component). Reads `useListCharactersQuery()` and `useGetTeamQuery()`, maps results to `CharacterListItem` via the library's `pickChip(character, onTeam)` helper, and pushes to `/characters/[id]` via `useRouter`. Renders the page header from `design.md` (40px navy h1 + 16px neutral-600 lead). Skeleton replaces the loading `<StatePanel>`.
6. **Wire the detail page** at `apps/platform/src/app/characters/[id]/page.tsx` (server component) plus `CharacterDetailContainer.tsx` (`'use client'`). The server file parses the id from `params` and forwards to the container. The container calls `useGetCharacterQuery(id)`, `useListCharactersQuery()` (already cached after a visit to `/`), `useGetTeamQuery()`, plus `useAddTeamMemberMutation` and `useRemoveTeamMemberMutation`. It computes `prev`/`next` from the cached list (wraps at both ends), evaluates a client-side `isDarkSide` mirror, and supplies all props to the presentational `<CharacterDetail />`. Skeleton-loaded.
7. **Add loading skeletons** in the library: `CharacterListSkeleton`, `CharacterDetailSkeleton`, `TeamListSkeleton`, `RosterSkeleton`. Each mirrors the live layout (card grid, detail grid, team-row list, compact roster) using MUI `<Skeleton>` so the content shape stays stable while data lands. The page-level loading paths (home, detail, team, sidebar) call these instead of the generic `<StatePanel variant="loading">`.
8. **Build the team page** at `apps/platform/src/app/team/page.tsx` (client). `useGetTeamQuery()` + `useListCharactersQuery()` join locally to render `<TeamMemberRow variant="full">` rows. Loading falls back to `<TeamListSkeleton />`, empty falls back to `<StatePanel variant="empty">`, errors to `describeApiError`. Header row is the 40px h1 left + `<ProgressPill current={count} total={5} />` right.
9. **Wire the right-rail team panel via a container in the app**. Slice 003 left `<TeamSidebar>` and `<TeamMemberRow>` purely presentational; the hook-bound container lives in the app (not the library) to keep `packages/components` free of an RTK dependency. Build `apps/platform/src/app/_components/TeamSidebarContainer.tsx` that owns the queries and the mutation, plus a tiny `apps/platform/src/app/_components/AppTopBar.tsx` (route-aware breadcrumb + a `Your team N/5` pill) and `apps/platform/src/app/_components/SideNav.tsx` (Whale glyph + characters + team SVG icons, navy-active background).
10. **Insert the layout shell** in `apps/platform/src/app/providers.tsx` (replacing Slice 005's placeholder). The structure becomes `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<StoreProviders>` → `<AppShell topBar={<AppTopBar />} sidebar={<SideNav />} rightPane={<TeamSidebarContainer />}>{children}</AppShell>`. `<AppShell>` keeps a 80px / 1fr / 280px grid; the right pane is sticky and inset (no left padding) so its card sits 16px from the viewport edge.
11. **Load Nunito Sans via `next/font`** in `apps/platform/src/app/layout.tsx` (`Nunito_Sans` with weights `400/600/700/800`) and expose it as a CSS variable that the MUI theme picks up (`fontFamily: 'var(--font-nunito), system-ui, sans-serif'`). The design tokens already point at Nunito Sans; this step is what actually loads the font.
12. **Surface API errors** at `apps/platform/src/lib/apiError.ts`. `describeApiError(error, fallback)` accepts our tagged `ClientError` *or* RTK Query's built-in `SerializedError` and picks a user-facing message, with a code-aware fallback (`TEAM_FULL`, `EVIL_FORBIDDEN`, `ALREADY_MEMBER`, `NOT_FOUND`). The detail container, team page, and sidebar use it to render inline alerts.
13. **Preserve the server's `{ code, message }` body through the seam**. The kubb-generated client only knows the HTTP status from `fetchClient.ts`'s default error path. Extend the seam at `apps/platform/src/gen/fetchClient.ts` with a tagged `ApiRequestError` (`createApiRequestError` factory + `isApiRequestError` predicate, no ES class) that carries `status`, `statusText`, and the parsed JSON body. `wrap` in `src/store/api.ts` reads that body so `error.code` / `error.message` reach the UI.
14. **Adopt CSS modules for two reference components**. Inside `apps/platform`, migrate `CharacterCard` and `ProgressPill` to colocated `*.module.css` files (`apps/platform/src/components/CharacterCard/CharacterCard.module.css` and `ProgressPill/ProgressPill.module.css` if you keep them in the app, or `packages/components/src/.../*.module.css` if you keep them in the lib). The migration replaces `sx` style objects with className lookups and proves the toolchain works. Keep every other component in the library on `sx` so the library has no CSS-loader assumption. Mention both files in the README's "Styling" note.
15. **Test `isDarkSide`** at `apps/platform/src/lib/darkSide.test.ts`. Cases:
    - Empty everything → `false`.
    - `name: "Darth Vader"` → `true` (rule 1, case-insensitive).
    - `name: "sith Lord"` → `true` (rule 1).
    - `affiliations: ["Sith Order"]` → `true` (rule 2).
    - `affiliations: []` with everything else neutral → `false` (rule 2 short-circuits on empty).
    - `masters: ["Darth Sidious (Sith Master)"]` → `true` (rule 3, substring match tolerates parenthetical suffix).
    - `masters: ["Obi-Wan Kenobi"]` → `false` (no "Darth" anywhere).
    - `masters: []` → `false` (rule 3 short-circuits on empty).
16. **Component-test the disabled-Add wiring** at `packages/components/src/characters/CharacterDetail.test.tsx`. Render `<CharacterDetail>` with a Vader-shaped character; assert the `Add to team` button is disabled and the tooltip wrapper carries "evil" in its `aria-label`/`title`. Render again with a neutral character; assert the button is enabled.
17. **Cover the team API `EVIL_FORBIDDEN` branch with the real `isDarkSide`** at `apps/platform/src/pages/api/team/index.test.ts`. Feed the MSW-mocked upstream a Vader-shaped payload (`name: "Darth Vader"` and/or `masters: ["Darth Sidious (Sith Master)"]`). Assert `422` and `{ code: 'EVIL_FORBIDDEN' }`. Drop any earlier `vi.spyOn(darkSide, ...)` stub; the real rules drive the branch now.
18. **Walk `verification.md` end-to-end** against a clean checkout. Every scenario must pass with the real app. The spec is the contract, not the implementation; fix the app where the doc disagrees.

## Files touched

- `apps/platform/src/lib/darkSide.ts`: real rules replace the Slice 004 stub
- `apps/platform/src/lib/darkSide.test.ts`: created
- `apps/platform/src/lib/apiError.ts`: created
- `apps/platform/src/server/starwars-api.ts`: request-scoped `createCharacterFetcher()` replaces the named `fetchCharacter` / `fetchAllCharacters` exports
- `apps/platform/src/pages/api/characters/index.api.ts`: updated to construct a fetcher and call `all()`
- `apps/platform/src/pages/api/characters/[id].api.ts`: updated to construct a fetcher and call `byId(id)`
- `apps/platform/src/pages/api/team/index.api.ts`: updated to pass `fetcher.byId` to `addTeamMember`
- `apps/platform/src/pages/api/team/index.test.ts`: `EVIL_FORBIDDEN` branch now driven by the real `isDarkSide` against fixture payloads
- `apps/platform/src/gen/fetchClient.ts`: tagged `ApiRequestError` factory + predicate; non-2xx now preserves the parsed body
- `apps/platform/src/store/api.ts`: `wrap` reads `ApiRequestError.body` so `error.code` / `error.message` reach the UI
- `apps/platform/src/app/layout.tsx`: loads `Nunito_Sans` via `next/font` and exposes it as `--font-nunito`
- `apps/platform/src/app/providers.tsx`: wraps `<AppShell>` with `<AppTopBar>`, `<SideNav>`, `<TeamSidebarContainer>`
- `apps/platform/src/app/page.tsx`: home page renders `<CharacterList />`, picks chips, pushes to detail
- `apps/platform/src/app/characters/[id]/page.tsx`: created (server component)
- `apps/platform/src/app/characters/[id]/CharacterDetailContainer.tsx`: created (client, RTK-bound)
- `apps/platform/src/app/team/page.tsx`: created
- `apps/platform/src/app/_components/AppTopBar.tsx`: created (breadcrumb + Your team pill)
- `apps/platform/src/app/_components/SideNav.tsx`: created (Whale + characters + team SVG icons)
- `apps/platform/src/app/_components/TeamSidebarContainer.tsx`: created (RTK-bound wrapper around `<TeamSidebar>`)
- `apps/platform/src/theme/theme.ts`: `shape.borderRadius` set to 4 so `sx borderRadius` maps onto the design's 4/12/16 scale
- `packages/components/src/characters/CharacterList.tsx`: created
- `packages/components/src/characters/CharacterListSkeleton.tsx`: created
- `packages/components/src/characters/CharacterDetail.tsx`: created
- `packages/components/src/characters/CharacterDetailSkeleton.tsx`: created
- `packages/components/src/characters/CharacterDetail.test.tsx`: created
- `packages/components/src/characters/pickChip.ts`: created
- `packages/components/src/team/TeamListSkeleton.tsx`: created
- `packages/components/src/team/RosterSkeleton.tsx`: created
- `packages/components/src/common/PagerButton.tsx`: created
- `packages/components/src/common/PrimaryButton.tsx`: created
- `packages/components/src/common/StatCard.tsx`: created
- `packages/components/src/common/ProgressPill.tsx`: created
- `packages/components/src/shell/TopBar.tsx`: created (takes a `ReactNode` for the title slot)
- `packages/components/src/shell/AppShell.tsx`: extended with a `rightPane` slot (80 / 1fr / 280)
- `packages/components/src/index.ts`: top-level barrel updated with every new export
- `apps/platform/.../CharacterCard.module.css` and `.../ProgressPill.module.css`: created (CSS-module migration of two reference components)
- `oxlint.config.ts`: tightens the `@/gen/starwars` override paths (`**/src/server/**`, `**/src/lib/**`, `**/src/pages/api/**`)
- `apps/platform/package.json`: adds `@mui/icons-material` for the side-nav SVG fallbacks

## Verification

1. `docker compose up -d postgres && pnpm db:migrate && pnpm gen && pnpm dev`. App boots.
2. Walk each of the six scenarios in [`verification.md`](verification.md). All pass.
3. AC-9: Darth Vader's detail page shows a disabled `Add to team` button; hovering it reveals the tooltip; clicking does nothing. Force `POST /api/team` with Vader's id via devtools; server returns `422 EVIL_FORBIDDEN`.
4. AC-8: add five non-evil characters, attempt a sixth. The inline error appears and the team stays at five rows in the DB (`psql -c "select count(*) from team_members;"` returns 5).
5. `pnpm test` is green; `darkSide.test.ts` covers the seven cases in step 15.
6. `pnpm test` is green; the `EVIL_FORBIDDEN` integration test passes against the real `isDarkSide`.
7. `pnpm test` is green; `<CharacterDetail>` test covers both Vader-disabled and neutral-enabled.
8. `pnpm typecheck && pnpm lint` are green across the workspace.
9. Reload `/` after adding two characters. The right-rail panel still shows them (persistence).
10. From any character's detail page, click `Next` from the last character: focus wraps to the first id (per `design.md` decision).
11. Loading state on `/`, `/characters/[id]`, `/team`, and inside the right-rail roster renders MUI `<Skeleton>` placeholders, not the generic loading panel.
12. Inspect the rendered `CharacterCard` and `ProgressPill` in devtools: their root element carries a hashed class name from a `*.module.css` file (e.g. `CharacterCard_card__a1b2`).

## Done criteria

- [x] `src/lib/darkSide.ts` implements the three rules with the documented short-circuit and is pure + synchronous
- [x] `TeamService.add()` calls the real `isDarkSide(character)` on the `starwars-api`-shaped payload returned by the request-scoped fetcher; `character.masters` is already `string[]`, so no separate resolution step is needed
- [x] Request-scoped `createCharacterFetcher()` dedupes repeat fetches within one request
- [x] `/` renders the character list with loading (skeleton) and error states
- [x] `/characters/[id]` shows name, image, height, mass, affiliations, and prev/next navigation
- [x] The `Add to team` button on the detail page is disabled with a tooltip for evil characters
- [x] `/team` lists members with remove controls and an empty state
- [x] The right-rail `<TeamSidebar>` is visible on every page and reflects the current team in real time
- [x] API errors (`409`, `422 TEAM_FULL`, `422 EVIL_FORBIDDEN`, `404 NOT_FOUND`) render inline using the generated `Error` shape (preserved through `ApiRequestError.body`)
- [x] Nunito Sans is loaded via `next/font` and wired into the MUI theme
- [x] `theme.shape.borderRadius` is set to 4 so `sx borderRadius` numbers map onto the design's 4 / 12 / 16 scale
- [x] Loading paths use `<CharacterListSkeleton>`, `<CharacterDetailSkeleton>`, `<TeamListSkeleton>`, `<RosterSkeleton>` instead of the generic loading panel
- [x] `CharacterCard` and `ProgressPill` are styled by colocated `*.module.css` files; the rest of `packages/components` stays on `sx`
- [x] Every scenario in `verification.md` passes against a clean checkout
- [x] `pnpm test`, `pnpm typecheck`, `pnpm lint` are all green
- [x] No new external dependency beyond `@mui/icons-material` (used only by the icon-only side nav) is introduced in this slice
