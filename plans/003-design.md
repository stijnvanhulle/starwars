# 003 — Design

## Context

The slice files describe behavior and architecture, but without a design pass the UI work in 006 collapses into ad-hoc styling and `packages/components` gets shaped by whichever screen happens to be built first. This slice pins the design language (palette, type, spacing) into the `MUI` theme, lays down the layout shell and the four foundational components every screen will reuse, and proves all of it works by rendering a `/design` preview route that shows each component in every state. 006 then assembles screens from these primitives instead of inventing them.

## Goal (demoable outcome)

`pnpm dev` boots and `http://localhost:3000/design` renders a preview page showing the layout shell (`<AppShell />` with top bar + `<TeamSidebar />` placeholder + content slot) and each foundational component (`<CharacterCard />`, `<StatePanel />`, `<TeamMemberRow />`, `<ActionButton />`) in every state defined in this slice. The `MUI` theme reflects the tokens written into this file. `plans/design.md` is checked in with the screen sketches for `/`, `/characters/[id]`, and `/team`.

## Prerequisites

Slice 001 is done (`MUI` theme provider wired, `AppRouterCacheProvider` in place, `packages/components` exists with a placeholder export).

## Steps

1. **Write `plans/design.md`**. Sections:
   - Design tokens (palette, typography scale, spacing scale, radius, elevation, motion durations). One accent, one neutral ramp (50..900), semantic states (`success`, `warning`, `error`, `info`).
   - Layout shell sketch (ASCII): top bar with app name, sidebar 280px on desktop / drawer on mobile, content slot.
   - Screen sketches (ASCII) for `/`, `/characters/[id]`, `/team`. Each lists the components it consumes and the data shape bound to each.
   - Component inventory. Mark each as `packages/components/*` (shared shell) or `apps/platform/src/components/*` (single-consumer, deferred to 006).
   - State matrix per component: default, hover, focus, disabled, loading, error, empty.
   - Accessibility floor: WCAG AA contrast on text, visible focus rings on every interactive, `aria-label` on icon-only buttons, keyboard order for list + prev/next.
2. **Wire the tokens into the `MUI` theme** at `apps/platform/src/theme/theme.ts`. Export `lightTheme` (and `darkTheme` if the design.md decides on dark mode). The values come from `design.md`, this file just imports them.
3. **Build the layout shell** in `packages/components/src/AppShell.tsx`. Slots: `topBar`, `sidebar`, `children`. No business logic, no data fetching.
4. **Build the placeholder `<TeamSidebar />`** in `packages/components/src/TeamSidebar.tsx`. Renders a static "Your team (0/5)" header and an empty-state message. Real data wiring lands in 006.
5. **Build `<CharacterCard />`** in `packages/components/src/CharacterCard.tsx`. Props: `name`, `image`, `onClick`. Hover, focus, and disabled states.
6. **Build `<StatePanel />`** in `packages/components/src/StatePanel.tsx`. Props: `variant: 'loading' | 'empty' | 'error'`, `title`, `description`, `action?`. Used for the empty team, loading list, and failed API calls.
7. **Build `<TeamMemberRow />`** in `packages/components/src/TeamMemberRow.tsx`. Props: `name`, `image`, `onRemove`. Used in both the sidebar and `/team`.
8. **Build `<ActionButton />`** in `packages/components/src/ActionButton.tsx`. Wraps `MUI` Button with the project's loading and disabled-with-tooltip patterns. Props: `loading`, `disabledReason?` (when present, the button is disabled and the reason renders as a tooltip).
9. **Update the barrel export** `packages/components/src/index.ts` to expose the five components.
10. **Build `/design` preview route** at `apps/platform/src/app/design/page.tsx`. For each component, render a section showing every state side by side with a label. No `RTK Query`, no fetches; data is hardcoded in the page.
11. **Add a `Vitest` smoke test** for each component (`packages/components/tests/*.test.tsx`) using Testing Library: renders without crashing, primary prop is reflected in the DOM, and the disabled-with-tooltip pattern works on `<ActionButton />`.

## Files touched

- `plans/design.md` — created
- `apps/platform/src/theme/theme.ts` — modified (tokens replace the 001 placeholder values)
- `apps/platform/src/app/design/page.tsx` — created
- `packages/components/src/AppShell.tsx` — created
- `packages/components/src/TeamSidebar.tsx` — created
- `packages/components/src/CharacterCard.tsx` — created
- `packages/components/src/StatePanel.tsx` — created
- `packages/components/src/TeamMemberRow.tsx` — created
- `packages/components/src/ActionButton.tsx` — created
- `packages/components/src/index.ts` — modified (re-export the five components)
- `packages/components/tests/AppShell.test.tsx` — created
- `packages/components/tests/CharacterCard.test.tsx` — created
- `packages/components/tests/StatePanel.test.tsx` — created
- `packages/components/tests/TeamMemberRow.test.tsx` — created
- `packages/components/tests/ActionButton.test.tsx` — created

## Verification

1. `pnpm install && pnpm --filter @whale/components build && pnpm dev`. App boots without errors.
2. Open `http://localhost:3000/design`. Every component appears with every state labeled. No console errors.
3. Resize the viewport to 375px wide. The sidebar collapses into a drawer; the top bar remains visible; no horizontal scroll.
4. Tab through `/design` with the keyboard. Every interactive element shows a visible focus ring; focus order matches reading order.
5. Hover the disabled `<ActionButton disabledReason="..." />` example. The tooltip appears within 500ms.
6. `pnpm --filter @whale/components test` is green.
7. `pnpm typecheck && pnpm lint` is green.
8. `plans/design.md` is checked in and renders cleanly (every code fence closes; no `_TBD_` markers remain).

## Done criteria

- [ ] `plans/design.md` is filled in (no `_TBD_`) and includes ASCII sketches for `/`, `/characters/[id]`, `/team`
- [ ] `apps/platform/src/theme/theme.ts` reflects the tokens in `design.md`
- [ ] `packages/components` exports `AppShell`, `TeamSidebar`, `CharacterCard`, `StatePanel`, `TeamMemberRow`, `ActionButton`
- [ ] `/design` renders every component in every documented state
- [ ] `<ActionButton disabledReason>` shows a tooltip on hover and is disabled (the pattern Vader's Add button uses in 006)
- [ ] Layout shell collapses cleanly at 375px
- [ ] Visible focus rings on every interactive element
- [ ] `pnpm --filter @whale/components test`, `pnpm typecheck`, and `pnpm lint` are green
