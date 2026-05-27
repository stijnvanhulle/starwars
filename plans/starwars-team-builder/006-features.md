# 006: Features

## Context

Assemble the three screens (`/`, `/characters/[id]`, `/team`) and the persistent right-rail team panel from earlier slices. Real `isDarkSide` rules land in `src/lib/darkSide.ts` and are wired into both the server guard and the UI Add-button state. Slice 003 stopped at the presentational primitives; this slice owns data wiring, layout shell, the styling pattern the rest of the app follows, and the platform-side containers that bind the lib to RTK Query.

### Styling architecture

`@stijnvanhulle/components` is the single source of truth for visual primitives and the design tokens. It pulls its own weight via three layered surfaces:

- **MUI primitives in JSX.** Every component composes `Card`, `Stack`, `Box`, `Typography`, `Chip`, `Skeleton`, `Tooltip`, `Avatar`, `IconButton`, `Paper`, `Button`, `ButtonBase`, `CircularProgress`. No hand-rolled HTML buttons or divs for things MUI already covers.
- **MUI CSS theme variables under a `whale` prefix.** [packages/components/src/theme/theme.ts](../../packages/components/src/theme/theme.ts) calls `createTheme({ cssVariables: { cssVarPrefix: 'whale' }, palette: {...} })`. MUI emits palette/typography/spacing as `--whale-palette-primary-main`, `--whale-palette-error-light`, `--whale-palette-text-primary`, etc. The platform's `providers.tsx` imports `lightTheme` from the lib and feeds it to `<ThemeProvider>`. The MUI doc this follows: https://mui.com/material-ui/customization/css-theme-variables/configuration/#customizing-variable-prefix.
- **CSS modules where the design has a non-MUI layout.** Only three modules remain: `AppShell.module.css` (sticky 80 / 1fr / 280 grid), `CharacterCard.module.css` (corner badge over an aspect-ratio media slot), `CharacterDetail.module.css` (multi-region detail card). Each module reads colors and radii from the `--whale-palette-*` variables and inlines the handful of values with no palette equivalent (nav rail `#0F1664`, neutral-100 `#F1F5F9`, error-border `#FCA5A5`, deep-wine error text `#7F1D1D`). Everything else uses MUI `sx` with theme palette keys (`primary.main`, `text.disabled`, `error.light`, etc.). The MUI doc this follows: https://mui.com/material-ui/integrations/interoperability/#css-modules.

### Packaging

`@stijnvanhulle/components` ships built artifacts via `tsdown` + `@tsdown/css`:

- `dist/index.js` (ESM) + `dist/index.d.ts`
- `dist/style.css` — every `*.module.css` (and the few inline CSS-module bits) bundled into a single stylesheet, side-effect-imported once by the platform's `app/layout.tsx` via `import '@stijnvanhulle/components/style.css'`
- `@mui/material`, `@emotion/react`, `@emotion/styled`, `react`, `react-dom` are peer deps; the lib never bundles them

No new dependency lands in this slice beyond `@mui/icons-material` for the left-nav glyphs.

## Goal (demoable outcome)

`pnpm dev` boots and a visitor can complete every acceptance criterion in [`spec.md`](spec.md) and every scenario in [`verification.md`](verification.md). The team persists across reloads. The sixth add returns `422 TEAM_FULL` and is shown as an inline error. Darth Vader's Add button is disabled with a tooltip, and forcing the request returns `422 EVIL_FORBIDDEN`. The right-rail team panel updates instantly after any add or remove. Skeleton placeholders render while data is in flight (correct heights, no zero-height pulses).

## Prerequisites

- Slice 005 is done. The single `api` RTK Query slice exists. Generated types and Zod are present under `src/gen/api/` (frontend) and `src/gen/starwars/` (server-only). `<Providers />` wraps the app in `layout.tsx`.
- The smoke `useListCharactersQuery()` consumer from Slice 005's `page.tsx` exists and is about to be replaced.
- Pages-Router API routes from Slice 004 live under `src/pages/api/**` (per the `App Router for UI, Pages Router for API` rule). The slice text below uses those paths.

## Steps

### Server

1. **Implement `isDarkSide`** in `apps/platform/src/lib/darkSide.ts`. Replace Slice 004's `return false`. Signature is `isDarkSide(character: StarwarsApiCharacter): boolean`. Three rules OR'd:
   1. `/darth|sith/i.test(character.name)`.
   2. `character.affiliations` contains a string matching `/darth|sith/i`.
   3. `character.masters` contains a string matching `/darth/i`.
   A small `toArray(value: unknown)` helper coerces strings to single-element arrays before `.some(...)`, because upstream `starwars-api` returns `masters` as a bare string for 8 of 87 records (Leia, Palpatine, Qui-Gon Jinn, Darth Maul, Mace Windu, Barriss Offee, Grievous, Rey). Each rule short-circuits to `false` when its source is empty so a partial upstream payload never flips a character to evil. Pure, synchronous.
2. **Request-scoped character fetcher** at `apps/platform/src/server/starwars-api.ts`. Replace the named `fetchCharacter` / `fetchAllCharacters` exports with `createCharacterFetcher()` that returns `{ all, byId }` backed by an internal `Map<number, Promise<StarwarsApiCharacter | null>>` so one request never fetches the same id twice. Update call sites: `src/pages/api/characters/index.api.ts` (`all()`), `src/pages/api/characters/[id].api.ts` (`byId(id)`), and `src/pages/api/team/index.api.ts` (passes `fetcher.byId` to `addTeamMember`).
3. **Normalize the frontend `Character` shape** in `apps/platform/src/server/utils.ts`. `toCharacter()` coerces stringy `affiliations` / `masters` to arrays before shipping to the browser, so the contract type `Character.masters: string[]` is honored even when upstream lies.
4. **Preserve `{ code, message }` through the fetch seam.** Extend `apps/platform/src/gen/fetchClient.ts` with a tagged `ApiRequestError` (factory + `isApiRequestError` predicate, no ES class) that carries `status`, `statusText`, and the parsed JSON body. The kubb generated clients throw it on any non-2xx response. `wrap` in `src/store/api.ts` reads `error.body` so `error.code` / `error.message` reach the UI.

### Library: presentational components in `@stijnvanhulle/components`

5. **Theme.** Move `lightTheme` from the app to `packages/components/src/theme/theme.ts`. Enable MUI CSS variables with `cssVariables: { cssVarPrefix: 'whale' }`. `shape.borderRadius` is `4` so `sx borderRadius: 3` = 12px (md) and `borderRadius: 4` = 16px (lg) match the design token scale. The theme references `--font-nunito`, supplied by the platform's `next/font/google` setup in `app/layout.tsx`. Re-exported from the lib barrel.
6. **Common primitives** (all `sx`-styled, no CSS modules):
   - `ActionButton`: MUI `Button` + `CircularProgress` + `Tooltip`. `loading` swaps children for a spinner; `disabledReason` disables the button and surfaces the tooltip on hover/focus.
   - `PrimaryButton`: pink filled `Button` + `Tooltip` wrapper for the team-add CTA.
   - `StatCard`: MUI `Paper` with a small uppercase label and a 22px tabular value + muted unit.
   - `ProgressPill`: MUI `Paper` + dots (filled `primary.main`, empty `divider`) for the team page header.
   - `StatePanel`: MUI `Paper` + `Stack` + `Typography` (+ `CircularProgress` for the loading variant).
7. **Characters**:
   - `CharacterCard`: MUI `ButtonBase` as the root, with an inline-overlay corner chip and a hairline-divided body. Styled by `CharacterCard.module.css` so the badge positioning and aspect-ratio media slot live in one place. Two chips: `on-team` (pink) and `dark-side` (red).
   - `CharacterList`: `Box` grid (`repeat(auto-fill, minmax(220px, 1fr))`). Routes `loading` to `<CharacterListSkeleton>`, `error` to `<StatePanel variant="error">`, empty to `<StatePanel variant="empty">`.
   - `CharacterDetail`: presentational, styled by `CharacterDetail.module.css`. Pager pills + `N OF total` counter via inline MUI `Button`s, hero card with `Dark side` chip, h1 name, `StatCard` stats, tinted affiliation chips, red action box (icon disc + copy + disabled `PrimaryButton`) for evil characters, plain action row otherwise.
   - `CharacterListSkeleton` / `CharacterDetailSkeleton`: MUI `Skeleton` inside aspect-ratio `Box` wrappers. Skeletons override MUI's default scale transform (`transform: 'none'`) so the media slots render at the right height instead of collapsing to a 0.6× pulse.
   - `pickChip(character, onTeam)`: pure helper exported from the lib so the home page maps a `Character` + team membership to the right chip without duplicating the rule.
8. **Team**:
   - `TeamSidebar`: MUI `Paper` + `Stack`, title + count pill in the header, contextual CTA slot at the bottom.
   - `TeamMemberRow`: two variants (`compact` for the sidebar with 36px `Avatar` + `IconButton`, `full` for the `/team` page with 72px rounded `Avatar` + outlined Remove `Button`). Pure `sx`, no CSS modules.
   - `TeamListSkeleton`: full-row skeletons using MUI `Skeleton` + `Paper`.
   - `RosterSkeleton`: compact-roster skeletons for the right-pane loading state.
9. **Shell**:
   - `AppShell`: sticky 80 / 1fr / 280 grid styled by `AppShell.module.css`. Accepts `topBar`, `sidebar`, optional `rightPane` slots; right pane shows only at ≥ 1100px.
   - `TopBar`: thin `Box` row with `title` and `teamLink` slots. Pure `sx`.

### Platform: app-side containers

10. **Layout shell** in `apps/platform/src/app/providers.tsx` (replacing Slice 005's placeholder). The structure becomes `<AppRouterCacheProvider>` → `<ThemeProvider theme={lightTheme}>` → `<CssBaseline />` → `<StoreProviders>` → `<AppShell topBar={<AppTopBar />} sidebar={<SideNav />} rightPane={<TeamSidebarContainer />}>{children}</AppShell>`.
11. **Side nav** at `apps/platform/src/app/_components/SideNav.tsx`. 80px column with a Whale glyph (SVG) and three icon-only `next/link` items (Characters, Team, Bookmarks placeholder). Active state matches the design's navy-blue rounded square. Tooltips on hover. `usePathname` decides the active item.
12. **Top bar** at `apps/platform/src/app/_components/AppTopBar.tsx`. Route-aware breadcrumb left (`Characters` / `Characters / <name>` / `Team`) + outline `Your team N/5` pill right that goes solid pink on `/team`.
13. **Team sidebar container** at `apps/platform/src/app/_components/TeamSidebarContainer.tsx`. RTK-bound wrapper around the library's `<TeamSidebar>`. Reads `useGetTeamQuery()` + `useListCharactersQuery()`, joins to character names/images, dispatches `removeTeamMember`, and picks the contextual CTA (`Manage team` navy on `/`, outlined `+ Add characters` on `/team`).
14. **Home** at `apps/platform/src/app/page.tsx` (`'use client'`). `useListCharactersQuery` + `useGetTeamQuery`, maps results to `CharacterListItem[]` via `pickChip`, pushes to `/characters/[id]` via `useRouter`. Header is `Star Wars characters` (h1, 40px) + the lead copy.
15. **Detail** at `apps/platform/src/app/characters/[id]/page.tsx` (server) + `CharacterDetailContainer.tsx` (`'use client'`). The container computes `prev`/`next` from the cached full list (wraps at both ends), evaluates a client-side `isDarkSide` mirror, and supplies all props to `<CharacterDetail>`. Skeleton-loaded.
16. **Team** at `apps/platform/src/app/team/page.tsx` (`'use client'`). Header row is the h1 left + `<ProgressPill current={count} total={5} />` right. Rows are `<TeamMemberRow variant="full">`. Loading → `<TeamListSkeleton>`, empty → `<StatePanel variant="empty">`, errors → `describeApiError`.
17. **Nunito Sans via `next/font`** in `apps/platform/src/app/layout.tsx` (`Nunito_Sans` weights `400/600/700/800`, exposed as `--font-nunito`). The MUI theme reads `var(--font-nunito)`. The layout also side-effect imports `@stijnvanhulle/components/style.css`, so the lib's bundled stylesheet ships with the page.
18. **`describeApiError`** at `apps/platform/src/lib/apiError.ts`. Accepts our tagged `ClientError` (`{ status, code, message }`) or RTK Query's `SerializedError`. Picks a user-facing message with a code-aware fallback for `TEAM_FULL`, `EVIL_FORBIDDEN`, `ALREADY_MEMBER`, `NOT_FOUND`.
19. **oxlint restriction** on `@/gen/starwars` imports: only `**/src/server/**`, `**/src/lib/**`, `**/src/pages/api/**` may import the server-only generated bundle.

### Tests

20. **`isDarkSide`** at `apps/platform/src/lib/darkSide.test.ts`. Cases: empty, name match (Darth/sith case-insensitive), affiliations match, empty affiliations short-circuit, masters substring match (tolerates parenthetical role suffix), benign masters, empty masters, **bare-string masters** (covers the upstream-lies case for Leia/Palpatine/Maul).
21. **`<CharacterDetail>` evil-disabled** at `packages/components/src/characters/CharacterDetail.test.tsx`. Vader-shaped character → Add disabled, tooltip mentions "evil". Neutral character → Add enabled.
22. **`<ActionButton>`** at `packages/components/src/common/ActionButton.test.tsx`. Three cases: default-enabled, `disabledReason` shows the MUI Tooltip on hover, `loading` disables.
23. **Team route `EVIL_FORBIDDEN`** at `apps/platform/src/pages/api/team/index.test.ts`. MSW feeds a Vader-shaped upstream payload (name + Sith master). Assert `422` + `{ code: 'EVIL_FORBIDDEN' }`. Drove by the real `isDarkSide`, no `vi.spyOn` stub.

## Files touched

### Server
- `apps/platform/src/lib/darkSide.ts`: real rules with `toArray` coercion
- `apps/platform/src/lib/darkSide.test.ts`: created
- `apps/platform/src/lib/apiError.ts`: created
- `apps/platform/src/server/starwars-api.ts`: `createCharacterFetcher()` factory + per-request id cache
- `apps/platform/src/server/utils.ts`: `toCharacter()` coerces stringy `affiliations` / `masters`
- `apps/platform/src/pages/api/characters/index.api.ts`, `[id].api.ts`, `team/index.api.ts`: use the fetcher
- `apps/platform/src/pages/api/team/index.test.ts`: `EVIL_FORBIDDEN` branch driven by the real `isDarkSide`
- `apps/platform/src/gen/fetchClient.ts`: tagged `ApiRequestError`; non-2xx preserves the parsed body
- `apps/platform/src/store/api.ts`: `wrap` reads `ApiRequestError.body`

### Library (`@stijnvanhulle/components`)
- `packages/components/src/theme/theme.ts`: moved from the app; `cssVariables: { cssVarPrefix: 'whale' }`; shape.borderRadius = 4
- `packages/components/src/shell/AppShell.{tsx,module.css}`: 80/1fr/280 grid with optional right pane
- `packages/components/src/shell/TopBar.tsx`: sx-only Box row
- `packages/components/src/characters/CharacterCard.{tsx,module.css}`: ButtonBase + module
- `packages/components/src/characters/CharacterList.tsx`: sx grid
- `packages/components/src/characters/CharacterListSkeleton.tsx`: MUI Skeleton in aspect-ratio Box
- `packages/components/src/characters/CharacterDetail.{tsx,module.css}`: full detail card layout
- `packages/components/src/characters/CharacterDetailSkeleton.tsx`: MUI Skeleton mirroring the detail grid
- `packages/components/src/characters/CharacterDetail.test.tsx`: created
- `packages/components/src/characters/pickChip.ts`: created
- `packages/components/src/team/TeamSidebar.tsx`: MUI Paper + Stack
- `packages/components/src/team/TeamMemberRow.tsx`: compact + full variants, sx-only
- `packages/components/src/team/TeamListSkeleton.tsx`, `RosterSkeleton.tsx`: created
- `packages/components/src/common/ActionButton.tsx`, `PrimaryButton.tsx`, `StatCard.tsx`, `ProgressPill.tsx`, `StatePanel.tsx`: created/rewritten, MUI primitives + sx
- `packages/components/src/index.ts`: barrel exports `lightTheme`, `tokens`, every component + type, plus `pickChip`
- `packages/components/tsdown.config.ts` + `package.json`: `@tsdown/css` to bundle `*.module.css` into `dist/style.css`; new exports entry `./style.css`

### Platform
- `apps/platform/src/app/layout.tsx`: loads `Nunito_Sans` + imports `@stijnvanhulle/components/style.css`
- `apps/platform/src/app/providers.tsx`: `<ThemeProvider theme={lightTheme}>` from the lib + `<AppShell>` with the three slots
- `apps/platform/src/app/page.tsx`: home page renders `<CharacterList />`, picks chips via `pickChip`, pushes to detail
- `apps/platform/src/app/characters/[id]/page.tsx`, `CharacterDetailContainer.tsx`: server route + client container
- `apps/platform/src/app/team/page.tsx`: team page with header + `<ProgressPill>`
- `apps/platform/src/app/_components/AppTopBar.tsx`: breadcrumb + Your team pill
- `apps/platform/src/app/_components/SideNav.tsx`: Whale glyph + characters + team SVG icons
- `apps/platform/src/app/_components/TeamSidebarContainer.tsx`: RTK-bound wrapper
- `apps/platform/next.config.ts`: no `transpilePackages` (the lib ships built dist)
- `oxlint.config.ts`: `@/gen/starwars` import override (`**/src/server/**`, `**/src/lib/**`, `**/src/pages/api/**`)
- `apps/platform/package.json`: adds `@mui/icons-material`

## Verification

1. `docker compose up -d postgres && pnpm db:migrate && pnpm gen && pnpm --filter @stijnvanhulle/components build && pnpm dev`. App boots.
2. Walk each of the six scenarios in [`verification.md`](verification.md). All pass.
3. AC-9: Darth Vader's detail page shows a disabled `Add to team` button; hovering it reveals the MUI tooltip; clicking does nothing. Force `POST /api/team` with Vader's id; server returns `422 EVIL_FORBIDDEN`.
4. AC-8: add five non-evil characters, attempt a sixth. The inline error appears and the team stays at five rows in the DB.
5. `pnpm test` is green; `darkSide.test.ts` covers the seven rule cases + the upstream-string-masters case.
6. `pnpm test` is green; `EVIL_FORBIDDEN` integration test passes against the real `isDarkSide`.
7. `pnpm test` is green; `<CharacterDetail>` covers Vader-disabled + neutral-enabled; `<ActionButton>` covers default/disabled-tooltip/loading.
8. `pnpm typecheck && pnpm lint` are green across the workspace.
9. Reload `/` after adding two characters. The right-rail panel still shows them (persistence).
10. `Next` from the last character (id 87) wraps to the first id.
11. Loading paths on `/`, `/characters/[id]`, `/team`, and the right-rail roster render MUI `<Skeleton>` placeholders with correct heights (aspect-ratio Box wrappers + `transform: 'none'`).
12. Devtools confirm `<html>` exposes `--whale-palette-primary-main` = `#FF348A`, `--whale-palette-divider` = `#E2E8F0`, etc. Cards carry classes like `MuiButtonBase-root <hashed-card-class> mui-...`.

## Done criteria

- [x] `src/lib/darkSide.ts` implements the three rules with the documented short-circuit and is pure + synchronous
- [x] `toArray` defensively coerces bare-string `masters` / `affiliations` from upstream
- [x] `addTeamMember()` calls the real `isDarkSide(character)` on the `starwars-api`-shaped payload returned by the request-scoped fetcher
- [x] Request-scoped `createCharacterFetcher()` dedupes repeat fetches within one request
- [x] `toCharacter()` ships array-shaped `affiliations` / `masters` to the browser regardless of what upstream returns
- [x] `/` renders the character list with loading (skeleton) and error states
- [x] `/characters/[id]` shows name, image, height, mass, affiliations, and prev/next navigation (wraps)
- [x] The `Add to team` button on the detail page is disabled with a tooltip for evil characters
- [x] `/team` lists members with remove controls, a progress pill, and an empty state
- [x] The right-rail `<TeamSidebar>` is visible on every page and reflects the current team in real time
- [x] API errors (`409`, `422 TEAM_FULL`, `422 EVIL_FORBIDDEN`, `404 NOT_FOUND`) render inline using the generated `Error` shape (preserved through `ApiRequestError.body`)
- [x] `@stijnvanhulle/components` exports every UI primitive plus `lightTheme`, `tokens`, and `pickChip`
- [x] MUI CSS variables are emitted under the `--whale-*` prefix and consumed by both `sx` (via theme palette keys) and the remaining CSS modules (via `var(--whale-palette-*)`)
- [x] Only three CSS modules remain (`AppShell`, `CharacterCard`, `CharacterDetail`); everything else is MUI primitives + `sx`; `dist/style.css` is under 7 kB
- [x] The lib ships built `dist/index.js` + `dist/index.d.ts` + `dist/style.css`; `@mui/material`, `@emotion/*`, `react`, `react-dom` are peer deps
- [x] Loading paths use `<CharacterListSkeleton>`, `<CharacterDetailSkeleton>`, `<TeamListSkeleton>`, `<RosterSkeleton>`; skeletons render with correct heights via aspect-ratio `Box` wrappers and `transform: 'none'`
- [x] Nunito Sans is loaded via `next/font` and wired into the lib's MUI theme via `var(--font-nunito)`
- [x] `theme.shape.borderRadius` is 4 so `sx borderRadius` numbers map onto the design's 4 / 12 / 16 scale
- [x] Every scenario in `verification.md` passes against a clean checkout
- [x] `pnpm test`, `pnpm typecheck`, `pnpm lint` are all green
- [x] Only `@mui/icons-material` was added as a new dependency in this slice
