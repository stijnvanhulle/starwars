# 006: Features

## Context

Assemble the three screens (`/`, `/characters/[id]`, `/team`) and the persistent `<TeamSidebar />` from earlier slices. Real `isDarkSide` rules land in `src/lib/darkSide.ts` and are wired into both the server guard (with master resolution via `starwars-api`) and the UI Add-button state. No new infrastructure, if something here needs a new dep or generated file, it belongs in an earlier slice.

## Goal (demoable outcome)

`pnpm dev` boots and a visitor can complete every acceptance criterion in [`spec.md`](spec.md) and every scenario in [`quickstart.md`](quickstart.md). The team persists across reloads. The sixth add returns `422 TEAM_FULL` and is shown as an inline error. Darth Vader's Add button is disabled with a tooltip, and forcing the request returns `422 EVIL_FORBIDDEN`. The sidebar updates instantly after any add or remove.

## Prerequisites

- Slice 005 is done. `<Providers />` is in `layout.tsx`. The single `api` RTK Query slice exists. Generated types and Zod are present under `src/gen/api/` (frontend) and `src/gen/starwars/` (server-only).
- The smoke `useListCharactersQuery()` consumer from Slice 005's `page.tsx` exists and is about to be replaced.

## Steps

1. **Implement `isDarkSide`** in `apps/platform/src/lib/darkSide.ts`. Replace Slice 004's `return false`. Signature is `isDarkSide(character: Character): boolean`. Three rules OR'd, in this order:
   1. `/darth|sith/i.test(character.name)`.
   2. `character.affiliations?.some(a => /darth|sith/i.test(a)) ?? false`. The frontend `Character` carries only current affiliations (the proxy strips `formerAffiliations`), so there is no "former" branch to guard against here.
   3. `character.masters?.some(m => /darth/i.test(m)) ?? false`. `masters` is `string[]` upstream (entries sometimes carry a parenthetical role like `"Darth Sidious (Sith Master)"`); substring match covers that.
   Defensive defaults if a field is missing: treat absent `affiliations` / `masters` as empty arrays (the rule short-circuits to `false` for that rule, not for the whole predicate). Pure, synchronous, no fetches inside. `TeamService.add()`'s `isDarkSide(character)` call from Slice 004 has everything it needs; there is no separate master-resolution step.
2. **Add a request-scoped character cache** at `apps/platform/src/server/starwars-api.ts`. Replace the bare `fetchCharacter` / `fetchAllCharacters` with `createCharacterFetcher()` that returns a `{ all, byId }` pair backed by an internal `Map<number, Promise<StarwarsApiCharacter | null>>` so a single request never fetches the same id twice. The proxy routes (`/api/characters`, `/api/characters/{id}`) and the service factory in `createTeamService()` both call this once per request and thread the fetcher through.
3. **Build `<CharacterList />`** at `packages/components/src/characters/CharacterList.tsx`. Reads `useListCharactersQuery()` (from the `api` slice → `GET /api/characters`), renders `<StatePanel variant="loading|error">` for the in-flight and failed states, and a responsive grid of `<CharacterCard />` (from Slice 003) for the success state. Each card links to `/characters/[id]` using `next/link`.
4. **Replace the smoke `page.tsx`** from Slice 005 with the real home page. Server component shell, client `<CharacterList />` inside. Title and copy come from `design.md`.
5. **Build the detail page** at `apps/platform/src/app/characters/[id]/page.tsx`. Server component reads the route param, passes it to a client `<CharacterDetail id={id} />`. The client component:
   - Calls `useGetCharacterQuery(id)` for the detail data.
   - Calls `useListCharactersQuery()` for the list (already cached after a visit to `/`), uses it for prev/next navigation. `character.masters` is already `string[]`; no client-side resolution.
   - Renders name, image, height, mass, affiliations per FR-3.
   - Renders an `<ActionButton />` (from Slice 003) labelled "Add to team" / "Remove from team" based on `useListTeamQuery()` membership. If `isDarkSide(character)` is true and the character is not already on the team, the button is disabled and `disabledReason="Evil characters cannot join the team."` (the exact tooltip text comes from `design.md`). Clicks dispatch `addTeamMember` / `removeTeamMember`; on `422`/`409` errors, show the server's message inline.
   - Prev/Next: compute `prevId` and `nextId` from the cached list. Wraps at both ends: first character's `Prev` goes to the last id; last character's `Next` goes to the first id. Buttons are always enabled. The buttons use `next/link` so back-button history works per quickstart §3.
6. **Build the team page** at `apps/platform/src/app/team/page.tsx`. Client component. `useListTeamQuery()` + `useListCharactersQuery()` are joined locally to render `<TeamMemberRow />` (from Slice 003) for each team member with name/image resolved from the cached character list. Remove control dispatches `removeTeamMember`. `<StatePanel variant="empty">` shows when the team is empty.
7. **Wire `<TeamSidebar />` for real**. `TeamSidebar` stays presentational (Slice 003 rule). Build `<TeamSidebarContainer />` at `packages/components/src/team/TeamSidebarContainer.tsx` that owns the queries, joins team rows to character names/images, and renders `<TeamSidebar>` with the rows as children. Add it to the layout shell (see next step).
8. **Insert the layout shell** in `apps/platform/src/app/layout.tsx`. The structure becomes `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers>` → `<AppShell topBar={<TopBar />} sidebar={<TeamSidebarContainer />}>{children}</AppShell>`. `<TopBar />` is a tiny client component under `packages/components/src/shell/TopBar.tsx` with the app name and a `next/link` to `/team`.
9. **Surface API errors** at `apps/platform/src/lib/apiError.ts`. Tiny helper that takes an `RTK Query` error union and returns `{ code, message }` typed against the generated `Error` schema. Detail page and team page use it to render `422 TEAM_FULL` / `422 EVIL_FORBIDDEN` / `409 ALREADY_MEMBER` / `404 NOT_FOUND` inline. Toasts are out of scope; inline is enough per the spec.
10. **Unit-test `isDarkSide`** next to it at `apps/platform/src/lib/darkSide.test.ts`. Cases:
    - Empty everything → `false`.
    - `name: "Darth Vader"` → `true` (rule 1, case-insensitive).
    - `name: "sith Lord"` → `true` (rule 1).
    - `affiliations: ["Sith Order"]` → `true` (rule 2).
    - `affiliations: []` with everything else neutral → `false` (rule 2 short-circuits on empty; mirrors the "left the Sith" scenario, since the proxy already stripped `formerAffiliations`).
    - `masters: ["Darth Sidious (Sith Master)"]` → `true` (rule 3, substring match tolerates parenthetical suffix).
    - `masters: ["Obi-Wan Kenobi"]` → `false` (no "Darth" anywhere).
    - `masters: []` → `false` (rule 3 short-circuits on empty).
11. **Component-test the disabled-Add wiring** next to it at `packages/components/src/characters/CharacterDetail.test.tsx`. Render `<CharacterDetail>` with a Vader-shaped character; assert the `ActionButton` is disabled and the tooltip text contains "evil" (case-insensitive). Render again with a neutral character; assert the button is enabled.
12. **Cover the team API `EVIL_FORBIDDEN` branch** at `apps/platform/src/app/api/team/route.test.ts`. Feed the mocked `fetchCharacter` a Vader-shaped payload (`name: "Darth Vader"`, or any payload whose `masters` includes `"Darth Sidious (Sith Master)"`). Assert `422 EVIL_FORBIDDEN`. The proxy happy path and upstream-failure → `404` cases from Slice 004 still apply.
13. **Walk `quickstart.md` end-to-end** against a clean checkout. Every scenario must pass with the real app. Where the doc says "the team page" or "the sidebar", verify both. If something in `quickstart.md` no longer matches what the app does, fix the app, the spec is the contract, not the implementation.

## Files touched

- `apps/platform/src/lib/darkSide.ts`: real rules replace the Slice 004 stub
- `apps/platform/src/lib/apiError.ts`: created
- `apps/platform/src/server/starwars-api.ts`: request-scoped `createCharacterFetcher()`
- `apps/platform/src/app/layout.tsx`: `AppShell` + `TopBar` + `TeamSidebarContainer` wired in
- `apps/platform/src/app/page.tsx`: home page renders `<CharacterList />`
- `apps/platform/src/app/characters/[id]/page.tsx`: created
- `apps/platform/src/app/team/page.tsx`: created
- `packages/components/src/characters/CharacterList.tsx`: created
- `packages/components/src/characters/CharacterDetail.tsx`: created
- `packages/components/src/team/TeamSidebarContainer.tsx`: created
- `packages/components/src/shell/TopBar.tsx`: created
- `packages/components/src/index.ts`: top-level barrel updated to re-export the new components (no per-feature barrels)
- `apps/platform/src/lib/darkSide.test.ts`: created
- `apps/platform/src/server/services/teamService.test.ts`: covers the real `isDarkSide(character)` call path
- `packages/components/src/characters/CharacterDetail.test.tsx`: created
- `apps/platform/src/app/api/team/route.test.ts`: `EVIL_FORBIDDEN` branch driven by the real `isDarkSide` against fixture payloads

## Verification

1. `docker compose up -d postgres && pnpm --filter platform db:migrate && pnpm --filter platform gen && pnpm dev`. App boots.
2. Walk each of the six scenarios in [`quickstart.md`](quickstart.md). All pass.
3. Specifically for AC-9: Darth Vader's detail page shows a disabled `Add to team` button; hovering it reveals the tooltip; clicking does nothing. Force `POST /api/team` with Vader's id via devtools network panel; server returns `422 EVIL_FORBIDDEN`.
4. Specifically for AC-8: add five non-evil characters, attempt a sixth; the inline error appears and the team stays at five rows in the DB (`psql -c "select count(*) from team_members;"` returns 5).
5. `pnpm --filter platform test` is green; `darkSide.test.ts` covers the seven cases in step 10.
6. `pnpm --filter platform test` is green; the `EVIL_FORBIDDEN` integration test passes against the real `isDarkSide`.
7. `pnpm --filter platform test` (Testing Library component tests) is green; `<CharacterDetail>` test covers both Vader-disabled and neutral-enabled.
8. `pnpm typecheck && pnpm lint` are green across the workspace.
9. Reload `/` after adding two characters. The sidebar still shows them (persistence).
10. On the detail page, click `Next` from the last character: button is either disabled or wraps, matching what `design.md` chose.

## Done criteria

- [ ] `src/lib/darkSide.ts` implements the three rules with the documented short-circuit and is pure + synchronous
- [ ] `TeamService.add()` resolves masters via `starwars-api` and threads them into `isDarkSide`
- [ ] Request-scoped `createCharacterFetcher()` dedupes repeat fetches within one request
- [ ] `/` renders the character list with loading and error states
- [ ] `/characters/[id]` shows name, image, height, mass, affiliations, and prev/next navigation
- [ ] `<ActionButton>` on the detail page is disabled with a tooltip for evil characters
- [ ] `/team` lists members with remove controls and an empty state
- [ ] `<TeamSidebarContainer>` is visible on every page and reflects the current team in real time
- [ ] API errors (`409`, `422 TEAM_FULL`, `422 EVIL_FORBIDDEN`, `404 NOT_FOUND`) render inline using the generated `Error` shape
- [ ] Every scenario in `quickstart.md` passes against a clean checkout
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` are all green
- [ ] No new external dependency or generated file is introduced in this slice
