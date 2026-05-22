# 003 — Design

## Context

The slice files describe behavior and architecture, but without a design pass the UI work in 006 collapses into ad-hoc styling and `packages/components` gets shaped by whichever screen happens to be built first. This slice pins the design language (palette, type, spacing) into the `MUI` theme and lays down the layout shell plus five foundational components every screen will reuse. 006 then assembles screens from these primitives instead of inventing them.

## Goal (demoable outcome)

`pnpm dev` still boots cleanly with the new `MUI` theme tokens applied. `packages/components` exports `<AppShell />`, `<TeamSidebar />`, `<CharacterCard />`, `<StatePanel />`, `<TeamMemberRow />`, and `<ActionButton />`, each covered by a Vitest smoke test that renders the component in its key states. `plans/design.md` is checked in with the screen sketches for `/`, `/characters/[id]`, and `/team`. No new app routes are added; the components are consumed for the first time in Slice 006.

## Prerequisites

Slice 001 is done (`MUI` theme provider wired, `AppRouterCacheProvider` in place, `packages/components` exists with a placeholder export).

## Steps

1. **Produce wireframes and (optionally) a hi-fi mockup** before any component code. The point is to disagree on layout in a doc, not in TSX.
   - **Wireframes (required, lo-fi):** ASCII or mermaid sketches checked in under `plans/design.md`. One per screen: `/`, `/characters/[id]`, `/team`. Show the grid, the regions, and where each component lands. No colors, no copy beyond labels.
   - **Mockups (optional, hi-fi):** a colored render of at least the home page and the detail page, demonstrating the palette, type, and spacing from the tokens in step 2. Skip entirely if the wireframes + tokens are enough to align on. If you do produce them, check the source (or an exported PNG/SVG) into `plans/design/` and link it from `plans/design.md`.
   - **Tooling is open.** ASCII or mermaid in markdown is always acceptable. Claude's frontend-design / Artifacts works well for fast hi-fi from a prompt. Any other tool is fine as long as the output lands in `plans/` — the deliverable is the artifact, not the tool that produced it.
2. **Write the rest of `plans/design.md`** around those wireframes. Sections:
   - Design tokens (palette, typography scale, spacing scale, radius, elevation, motion durations). One accent, one neutral ramp (50..900), semantic states (`success`, `warning`, `error`, `info`).
   - Layout shell sketch: top bar with app name, sidebar 280px on desktop / drawer on mobile, content slot. Cross-reference the wireframes from step 1.
   - Screen notes for `/`, `/characters/[id]`, `/team`. Each lists the components it consumes and the data shape bound to each. Pairs with the corresponding wireframe.
   - Component inventory. Mark each as `packages/components/*` (shared shell) or `apps/platform/src/components/*` (single-consumer, deferred to 006).
   - State matrix per component: default, hover, focus, disabled, loading, error, empty.
   - Accessibility floor: WCAG AA contrast on text, visible focus rings on every interactive, `aria-label` on icon-only buttons, keyboard order for list + prev/next.
3. **Wire the tokens into the `MUI` theme** at `apps/platform/src/theme/theme.ts`. Export `lightTheme` (and `darkTheme` if the design.md decides on dark mode). The values come from `design.md`, this file just imports them.
4. **Build the layout shell** in `packages/components/src/AppShell.tsx`. Slots: `topBar`, `sidebar`, `children`. No business logic, no data fetching.
5. **Build the placeholder `<TeamSidebar />`** in `packages/components/src/TeamSidebar.tsx`. Renders a static "Your team (0/5)" header and an empty-state message. Real data wiring lands in 006.
6. **Build `<CharacterCard />`** in `packages/components/src/CharacterCard.tsx`. Props: `name`, `image`, `onClick`. Hover, focus, and disabled states.
7. **Build `<StatePanel />`** in `packages/components/src/StatePanel.tsx`. Props: `variant: 'loading' | 'empty' | 'error'`, `title`, `description`, `action?`. Used for the empty team, loading list, and failed API calls.
8. **Build `<TeamMemberRow />`** in `packages/components/src/TeamMemberRow.tsx`. Props: `name`, `image`, `onRemove`. Used in both the sidebar and `/team`.
9. **Build `<ActionButton />`** in `packages/components/src/ActionButton.tsx`. Wraps `MUI` Button with the project's loading and disabled-with-tooltip patterns. Props: `loading`, `disabledReason?` (when present, the button is disabled and the reason renders as a tooltip).
10. **Update the barrel export** `packages/components/src/index.ts` to expose the six components (`AppShell`, `TeamSidebar`, `CharacterCard`, `StatePanel`, `TeamMemberRow`, `ActionButton`).
11. **Add a `Vitest` smoke test** for each component (`packages/components/tests/*.test.tsx`) using Testing Library: renders without crashing, primary prop is reflected in the DOM, the disabled-with-tooltip pattern works on `<ActionButton />`, and `<StatePanel variant="loading" | "empty" | "error">` each render their distinct content.

## Files touched

- `plans/design.md` — created (includes wireframes for `/`, `/characters/[id]`, `/team`)
- `plans/design/` — created if hi-fi mockups are produced (exported PNG/SVG or tool source files); skipped otherwise
- `apps/platform/src/theme/theme.ts` — modified (tokens replace the 001 placeholder values)
- `packages/components/src/AppShell.tsx` — created
- `packages/components/src/TeamSidebar.tsx` — created
- `packages/components/src/CharacterCard.tsx` — created
- `packages/components/src/StatePanel.tsx` — created
- `packages/components/src/TeamMemberRow.tsx` — created
- `packages/components/src/ActionButton.tsx` — created
- `packages/components/src/index.ts` — modified (re-export the six components)
- `packages/components/tests/AppShell.test.tsx` — created
- `packages/components/tests/CharacterCard.test.tsx` — created
- `packages/components/tests/StatePanel.test.tsx` — created
- `packages/components/tests/TeamMemberRow.test.tsx` — created
- `packages/components/tests/ActionButton.test.tsx` — created

## Verification

1. `pnpm install && pnpm --filter @stijnvanhulle/components build && pnpm dev`. App boots without errors; the placeholder page from Slice 001 still renders with the new theme tokens applied (devtools shows the new font / primary color).
2. `pnpm --filter @stijnvanhulle/components test` is green.
3. `pnpm typecheck && pnpm lint` are green.
4. `plans/design.md` is checked in and renders cleanly (every code fence closes; no `_TBD_` markers remain).
5. `git grep -nE "from '@stijnvanhulle/components'"` shows the barrel re-export resolves cleanly to the new files (no broken imports).

## Done criteria

- [ ] `plans/design.md` is filled in (no `_TBD_`) and includes lo-fi wireframes for `/`, `/characters/[id]`, `/team`
- [ ] Hi-fi mockups are either checked in under `plans/design/` and linked from `plans/design.md`, or explicitly noted as skipped
- [ ] `apps/platform/src/theme/theme.ts` reflects the tokens in `design.md`
- [ ] `packages/components` exports `AppShell`, `TeamSidebar`, `CharacterCard`, `StatePanel`, `TeamMemberRow`, `ActionButton`
- [ ] `<ActionButton disabledReason>` is disabled and the reason renders as a tooltip (the pattern Vader's Add button uses in 006)
- [ ] Each component has a passing Vitest smoke test
- [ ] `pnpm --filter @stijnvanhulle/components test`, `pnpm typecheck`, and `pnpm lint` are green
- [ ] No new app routes are added in this slice; first consumer is Slice 006
