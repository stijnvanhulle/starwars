# 007: Extras (bookmarks + pagination)

## Context

Two showcase additions before the test slice. Both stay inside `apps/platform` and add no new external dependency:

- **Bookmarks** — a second Redux slice built with `createSlice` from `@reduxjs/toolkit`. Pure client state, persists in `localStorage`. Adds the first real consumer for the typed `useAppDispatch` / `useAppSelector` hooks (the RTK Query `api` slice from 005 covered every read until now). A `/bookmarks` page lists every bookmarked character.
- **Pagination** — paginate the home grid so the 87-character list reads as multiple pages instead of one giant scroll. The page index lives in the URL (`/?page=N`) so the back button works. RTK Query keeps the full list in cache (the proxy returns all 87 in one shot); the page slices it locally.


## Goal (demoable outcome)

`pnpm dev` boots. The visitor:

- Hits a bookmark icon on a character detail page, it flips filled, and the navigation rail shows a count badge.
- Refreshes the browser, and the bookmarked characters survive (re-hydrated from `localStorage`).
- Visits `/bookmarks` and sees a grid of every bookmarked character with a remove control.
- On `/`, sees one page of characters (page size `24`) plus a pagination control at the bottom. Clicking page 2 changes the URL to `/?page=2`, scrolls to the top of the grid, and renders the next 24. The browser back button returns to page 1.
- The detail page's "Prev / Next" wraps across the full 87-character list (unchanged), independent of the home page's current page.

Existing tests still pass. New tests cover the bookmark reducers, the pagination window math, and a smoke render of `/bookmarks`.

## Prerequisites

- Slice 006 is done. The single `api` RTK Query slice and the per-request store factory `makeStore` exist in `src/store/`. Layout, side nav, and detail page are already wired.

## Steps

### Bookmarks

1. **Author the bookmarks slice** at `apps/platform/src/store/bookmarks.ts` using `createSlice({ name: 'bookmarks', initialState: [] as number[], reducers: { add, remove, toggle, clear } })`. Each reducer takes a `PayloadAction<number>` (a character id). Export the slice, its actions, and a selector `selectBookmarks(state)`.
2. **Persist to `localStorage`**. Add `apps/platform/src/store/persistBookmarks.ts`: a tiny middleware that listens for any bookmark action and writes the current bookmark array under `whale.bookmarks.v1`, plus a `loadBookmarks()` helper that reads it. Both sides guard `typeof window !== 'undefined'` so server passes don't touch storage.
3. **Wire the slice into `makeStore`**. Update `apps/platform/src/store/store.ts` to include `bookmarks: bookmarksReducer` in the root reducer, append the persist middleware in `middleware`, and accept an optional `preloadedState` argument. `Providers.tsx` calls `loadBookmarks()` (client-side only via `useRef + typeof window`) and passes it as `preloadedState`.
4. **Add typed hooks**. Create `apps/platform/src/store/hooks.ts` with `useAppDispatch` and `useAppSelector` using `useDispatch.withTypes<AppDispatch>()` and `useSelector.withTypes<RootState>()`. A single-line JSDoc explains they earn their place now that a second slice exists.
5. **Bookmark control on the detail page**. Extend `<CharacterDetail>` with `bookmarked: boolean` + `onBookmarkToggle?: () => void` props and render a heart icon button next to the `Add to team` action (filled when bookmarked, outlined otherwise). The component stays presentational. The wiring lives in `CharacterDetailContainer.tsx` (`useAppSelector(selectBookmarks)` + `useAppDispatch()` + `dispatch(toggle(id))`).
6. **Bookmarks page** at `apps/platform/src/app/bookmarks/page.tsx`. Client component. Reads `selectBookmarks` plus `useListCharactersQuery()` and renders a `<CharacterList>` of the bookmarked ids with `onSelect` pushing to the detail page. Empty state uses `<StatePanel variant="empty">`. A small "Clear all" outline button dispatches `clear()`.
7. **Nav glyph for bookmarks**. Add a third icon to `apps/platform/src/app/_components/SideNav.tsx` linking to `/bookmarks`. When `selectBookmarks(state).length > 0`, a small count badge sits in the top-right of the icon. Active state matches the other two items.
8. **Rename @stijnvanhulle to @whale**

### Pagination

8. **Add `<Pagination />` to the components library** at `packages/components/src/common/Pagination.tsx`. Thin wrapper over MUI `Pagination` (already in the dep graph, no install). Props: `page`, `count`, `onChange(page)`. Whale-styled: pink active page button, hairline borders, radius-pill. Export from the package barrel.
9. **Constant for the page size** at `apps/platform/src/lib/pagination.ts`: `export const CHARACTER_PAGE_SIZE = 24` and a tiny pure helper `paginate<T>(items, page, size) => T[]` that returns the window for the current page. Pure, unit-testable.
10. **URL-driven page state on `/`**. Update `apps/platform/src/app/page.tsx`:
   - Read `?page=` via `useSearchParams()`. Coerce with `Number.parseInt`; clamp to `[1, totalPages]`; fall back to `1` on bad input. Compute `totalPages = Math.ceil(items.length / CHARACTER_PAGE_SIZE)`.
   - Slice `items` with `paginate(items, page, CHARACTER_PAGE_SIZE)` and pass the window to `<CharacterList>`.
   - Render `<Pagination page={page} count={totalPages} onChange={(p) => router.push(p === 1 ? '/' : '/?page=' + p, { scroll: true })} />` below the grid.
   - When `data` is still loading, render `<CharacterListSkeleton />` (no pager); when it's empty, render the existing empty state (no pager).
11. **Keep detail prev/next on the full list**. `CharacterDetailContainer.tsx` already uses the cached full list for `prev`/`next`; pagination does not change that. Add a comment so it stays that way.
12. **Page-size sanity check on the team page** (optional polish). The team page can stay un-paginated, since cap is 5 so the list never grows past 5 rows.

### Tests

13. **Slice tests** at `apps/platform/src/store/bookmarks.test.ts` covering: empty initial state; `add` is idempotent; `remove` is a no-op for missing ids; `toggle` flips both ways; `clear` resets. The reducers are pure so direct calls are enough.
14. **Pagination math test** at `apps/platform/src/lib/pagination.test.ts`: `paginate([], 1, 24) === []`; `paginate(0..86, 1, 24)` returns ids 1–24; `paginate(0..86, 4, 24)` returns the last 15; `paginate` clamps overshoot pages to the last window.
15. **Bookmark page smoke test** at `apps/platform/src/app/bookmarks/page.test.tsx` renders the page with a small preloaded state of two bookmark ids and asserts both cards appear. Use MSW for `/api/characters` (`server.use(http.get('/api/characters', ...))`).

## Files touched

- `apps/platform/src/store/bookmarks.ts`: created
- `apps/platform/src/store/persistBookmarks.ts`: created
- `apps/platform/src/store/store.ts`: modified (second reducer + middleware + `preloadedState`)
- `apps/platform/src/store/Providers.tsx`: modified (hydrate `preloadedState` from `localStorage`)
- `apps/platform/src/store/hooks.ts`: created (typed `useAppDispatch` / `useAppSelector`)
- `packages/components/src/characters/CharacterDetail.tsx`: modified (heart toggle prop)
- `apps/platform/src/app/characters/[id]/CharacterDetailContainer.tsx`: modified (bookmark toggle wired)
- `apps/platform/src/app/bookmarks/page.tsx`: created
- `apps/platform/src/app/bookmarks/page.test.tsx`: created
- `apps/platform/src/app/_components/SideNav.tsx`: modified (third nav item + count badge)
- `apps/platform/src/store/bookmarks.test.ts`: created
- `packages/components/src/common/Pagination.tsx`: created
- `packages/components/src/index.ts`: modified (export `Pagination`)
- `apps/platform/src/lib/pagination.ts`: created (`CHARACTER_PAGE_SIZE`, `paginate` helper)
- `apps/platform/src/lib/pagination.test.ts`: created
- `apps/platform/src/app/page.tsx`: modified (URL-driven page state + pager)

## Verification

1. `pnpm dev` boots. Detail page shows the heart toggle. Clicking it flips the icon and the sidenav badge increments.
2. Refresh the browser, and the bookmark survives. `localStorage.getItem('whale.bookmarks.v1')` matches.
3. `/bookmarks` lists every bookmarked character. Removing one updates both the list and the sidenav badge. `Clear all` empties the page.
4. On `/`, the grid shows exactly `CHARACTER_PAGE_SIZE` cards (24) for page 1 and the pager shows the right `totalPages`. Click page 2: URL becomes `/?page=2`, grid renders the next 24, the page scrolls to the top.
5. Manually edit the URL to `/?page=99`: the page clamps to the last valid page. `/?page=foo` falls back to page 1.
6. On a detail page, `Next` from id 87 still wraps to id 1 regardless of which home page was last viewed.
7. `pnpm typecheck`, `pnpm lint`, `pnpm test` are green. Slice covers the five reducer cases, the `paginate` helper covers the empty / first / middle / overshoot windows, and the `/bookmarks` smoke test passes.

## Done criteria

- [x] `bookmarksSlice` lives next to the RTK Query `api` slice in `src/store/`, uses `createSlice`, and is wired through `makeStore`
- [x] Bookmarks persist to `localStorage` via a middleware and hydrate into `preloadedState` on store creation
- [x] Typed `useAppDispatch` / `useAppSelector` exist in `src/store/hooks.ts` and are used by the bookmark UI
- [x] Detail page bookmark toggle and `/bookmarks` page both work and stay in sync
- [x] Sidenav shows a count badge when at least one character is bookmarked
- [x] Home grid renders `CHARACTER_PAGE_SIZE` cards per page, `<Pagination>` updates `?page=` in the URL, and bad input clamps gracefully
- [x] `paginate` helper is pure and unit-tested, and detail prev/next still wraps across the full 87-character list (unchanged)
- [x] Bookmark slice tests cover empty/add/remove/toggle/clear, pagination tests cover empty/first/middle/overshoot, and the bookmark store-integration test exercises preloadedState + dispatch flow (the JSX `/bookmarks` smoke test was dropped because the platform vitest config does not transform JSX without a new dependency, which the slice forbids, and the integration test covers the same data path)
- [x] No new external dependency is introduced
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` are green
