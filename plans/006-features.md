# 006: Features

## Context

Assemble the three screens (`/`, `/characters/[id]`, `/team`) and the persistent `<TeamSidebar />` from earlier slices. Real `isDarkSide` rules land in `src/lib/darkSide.ts` and are wired into both the server guard (with master resolution via `starwars-api`) and the UI Add-button state. No new infrastructure, if something here needs a new dep or generated file, it belongs in an earlier slice.

## Goal (demoable outcome)

`pnpm dev` boots and a visitor can complete every acceptance criterion in [`spec.md`](spec.md) and every scenario in [`quickstart.md`](quickstart.md). The team persists across reloads. The sixth add returns `422 TEAM_FULL` and is shown as an inline error. Darth Vader's Add button is disabled with a tooltip, and forcing the request returns `422 EVIL_FORBIDDEN`. The sidebar updates instantly after any add or remove.

## Prerequisites

- Slice 005 is done. `<Providers />` is in `layout.tsx`. The single `api` RTK Query slice exists. Generated types and Zod are present under `src/gen/api/` (frontend) and `src/gen/starwars/` (server-only).
- The smoke `useListCharactersQuery()` consumer from Slice 005's `page.tsx` exists and is about to be replaced.

## Steps

1. **Implement `isDarkSide`** in `apps/platform/src/lib/darkSide.ts`. Replace Slice 004's `return false`. Three rules OR'd, in this order:
   1. `/darth|sith/i.test(character.name)`.
   2. `character.affiliations.some(a => /darth|sith/i.test(a))`. Do not look at `formerAffiliations`.
   3. `character.masters.some(id => masterNames.get(id)?.match(/darth/i))`.
   Defensive defaults if a field is missing: treat absent `affiliations` / `masters` as empty arrays (the rule short-circuits to `false` for that rule, not for the whole predicate). Pure, synchronous, no fetches inside.
2. **Wire master resolution into `TeamService`** at `apps/platform/src/server/services/teamService.ts`. Replace the `new Map()` placeholder from Slice 004. New helper next to it:
   ```ts
   async function buildMasterNames(masters: number[]): Promise<Map<number, string>>
   ```
   Calls `fetchCharacter(id)` for each id in `masters`, dedupes, returns the map. A single round of fetches is enough; we do not recurse on the masters' own masters. If any of those fetches return `null`, that master is omitted from the map (rule 3 just can't fire for it). The fetcher used here is the same server-only `starwars-api` module the proxy routes use; the browser never sees these requests.
3. **Add a request-scoped character cache** at `apps/platform/src/server/starwars-api.ts`. Replace the bare `fetchCharacter` / `fetchAllCharacters` with `createCharacterFetcher()` that returns a `{ all, byId }` pair backed by an internal `Map<number, Promise<StarwarsApiCharacter | null>>` so a single request never fetches the same id twice. The proxy routes (`/api/characters`, `/api/characters/{id}`) and the service factory in `createTeamService()` both call this once per request and thread the fetcher through.
4. **Build `<CharacterList />`** at `apps/platform/src/components/CharacterList.tsx` (single-consumer, stays in `apps/platform`). Reads `useListCharactersQuery()` (from the `api` slice → `GET /api/characters`), renders `<StatePanel variant="loading|error">` for the in-flight and failed states, and a responsive grid of `<CharacterCard />` (from Slice 003) for the success state. Each card links to `/characters/[id]` using `next/link`.
5. **Replace the smoke `page.tsx`** from Slice 005 with the real home page. Server component shell, client `<CharacterList />` inside. Title and copy come from `design.md`.
6. **Build the detail page** at `apps/platform/src/app/characters/[id]/page.tsx`. Server component reads the route param, passes it to a client `<CharacterDetail id={id} />`. The client component:
   - Calls `useGetCharacterQuery(id)` for the detail data.
   - Calls `useListCharactersQuery()` for the list (already cached after a visit to `/`), uses it for prev/next navigation. The proxy already resolved `masters` to names server-side, so the client's `masterNames` map is built directly from `character.masters` without a second query.
   - Renders name, image, height, mass, affiliations per FR-3.
   - Renders an `<ActionButton />` (from Slice 003) labelled "Add to team" / "Remove from team" based on `useListTeamQuery()` membership. If `isDarkSide(character, masterNames)` is true and the character is not already on the team, the button is disabled and `disabledReason="Evil characters cannot join the team."` (the exact tooltip text comes from `design.md`). Clicks dispatch `addTeamMember` / `removeTeamMember`; on `422`/`409` errors, show the server's message inline.
   - Prev/Next: compute `prevId` and `nextId` from the cached list. The buttons use `next/link` so back-button history works per quickstart §3.
7. **Build the team page** at `apps/platform/src/app/team/page.tsx`. Client component. `useListTeamQuery()` + `useListCharactersQuery()` are joined locally to render `<TeamMemberRow />` (from Slice 003) for each team member with name/image resolved from the cached character list. Remove control dispatches `removeTeamMember`. `<StatePanel variant="empty">` shows when the team is empty.
8. **Wire `<TeamSidebar />` for real** in `packages/components/src/TeamSidebar.tsx`, actually, no. `TeamSidebar` stays presentational (Slice 003 rule). Build `<TeamSidebarContainer />` at `apps/platform/src/components/TeamSidebarContainer.tsx` that owns the queries, joins team rows to character names/images, and renders `<TeamSidebar>` with the rows as children. Add it to the layout shell (see step 9).
9. **Insert the layout shell** in `apps/platform/src/app/layout.tsx`. The structure becomes `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<Providers>` → `<AppShell topBar={<TopBar />} sidebar={<TeamSidebarContainer />}>{children}</AppShell>`. `<TopBar />` is a tiny client component under `apps/platform/src/components/TopBar.tsx` with the app name and a `next/link` to `/team`.
10. **Surface API errors** at `apps/platform/src/lib/apiError.ts`. Tiny helper that takes an `RTK Query` error union and returns `{ code, message }` typed against the generated `Error` schema. Detail page and team page use it to render `422 TEAM_FULL` / `422 EVIL_FORBIDDEN` / `409 ALREADY_MEMBER` / `404 NOT_FOUND` inline. Toasts are out of scope; inline is enough per the spec.
11. **Unit-test `isDarkSide`** next to it at `apps/platform/src/lib/darkSide.test.ts`. Cases:
    - Empty everything → `false`.
    - `name: "Darth Vader"` → `true` (rule 1, case-insensitive).
    - `name: "sith Lord"` → `true` (rule 1).
    - `affiliations: ["Sith Order"]` → `true` (rule 2).
    - `formerAffiliations: ["Sith Order"]` alone → `false` (rule 2 ignores former).
    - `masters: [42]` with `masterNames: Map([[42, "Darth Sidious"]])` → `true` (rule 3).
    - `masters: [42]` with `masterNames: new Map()` → `false` (unresolved master can't fire rule 3).
12. **Component-test the disabled-Add wiring** next to it at `apps/platform/src/components/CharacterDetail.test.tsx`. Render `<CharacterDetail>` with a Vader-shaped character; assert the `ActionButton` is disabled and the tooltip text contains "evil" (case-insensitive). Render again with a neutral character; assert the button is enabled.
13. **Update the team API integration test** at `apps/platform/src/app/api/team/route.test.ts`. The `EVIL_FORBIDDEN` path no longer relies on monkey-patching `isDarkSide`: feed the mocked `fetchCharacter` a Vader-shaped payload (`name: "Darth Vader"`) and a master id pointing at another Vader-shaped payload. Assert `422 EVIL_FORBIDDEN`. The four other branches stay as in Slice 004. The Slice 004 character proxy tests (proxy happy path, `404`, `502`) remain valid; no changes needed there.
14. **Walk `quickstart.md` end-to-end** against a clean checkout. Every scenario must pass with the real app. Where the doc says "the team page" or "the sidebar", verify both. If something in `quickstart.md` no longer matches what the app does, fix the app, the spec is the contract, not the implementation.

## Files touched

- `apps/platform/src/lib/darkSide.ts`: modified (replace stub with real rules)
- `apps/platform/src/lib/apiError.ts`: created
- `apps/platform/src/server/starwars-api.ts`: modified (request-scoped `createCharacterFetcher()`)
- `apps/platform/src/server/services/teamService.ts`: modified (`buildMasterNames`, real `isDarkSide` call)
- `apps/platform/src/app/layout.tsx`: modified (insert `AppShell` + `TopBar` + `TeamSidebarContainer`)
- `apps/platform/src/app/page.tsx`: modified (replace smoke with `<CharacterList />`)
- `apps/platform/src/app/characters/[id]/page.tsx`: created
- `apps/platform/src/app/team/page.tsx`: created
- `apps/platform/src/components/CharacterList.tsx`: created
- `apps/platform/src/components/CharacterDetail.tsx`: created
- `apps/platform/src/components/TeamSidebarContainer.tsx`: created
- `apps/platform/src/components/TopBar.tsx`: created
- `apps/platform/src/lib/darkSide.test.ts`: created
- `apps/platform/src/server/services/teamService.test.ts`: modified (drop the empty-Map placeholder, cover the new master-resolution path)
- `apps/platform/src/components/CharacterDetail.test.tsx`: created
- `apps/platform/src/app/api/team/route.test.ts`: modified (`EVIL_FORBIDDEN` path uses real `isDarkSide`)

## Verification

1. `docker compose up -d postgres && pnpm --filter platform db:migrate && pnpm --filter platform gen && pnpm dev`. App boots.
2. Walk each of the six scenarios in [`quickstart.md`](quickstart.md). All pass.
3. Specifically for AC-9: Darth Vader's detail page shows a disabled `Add to team` button; hovering it reveals the tooltip; clicking does nothing. Force `POST /api/team` with Vader's id via devtools network panel; server returns `422 EVIL_FORBIDDEN`.
4. Specifically for AC-8: add five non-evil characters, attempt a sixth; the inline error appears and the team stays at five rows in the DB (`psql -c "select count(*) from team_members;"` returns 5).
5. `pnpm --filter platform test` is green; `darkSide.test.ts` covers the seven cases in step 11.
6. `pnpm --filter platform test` is green; the `EVIL_FORBIDDEN` test no longer patches `isDarkSide`.
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
