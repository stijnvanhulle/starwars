# 003: Design

## Context

Pin the tokens from [`design.md`](design.md) into the `MUI` theme and ship the layout shell + five primitives in `packages/components`. Slice 006 assembles screens from these.

## Goal (demoable outcome)

`pnpm dev` still boots cleanly with the new `MUI` theme tokens applied. `packages/components` exports `<AppShell />`, `<TeamSidebar />`, `<CharacterCard />`, `<StatePanel />`, `<TeamMemberRow />`, and `<ActionButton />`, each covered by a Vitest smoke test that renders the component in its key states. `plan/starwars-team-builder/design.md` is checked in with the screen sketches for `/`, `/characters/[id]`, and `/team`. No new app routes are added; the components are consumed for the first time in Slice 006.

## Prerequisites

Slice 001 is done (`MUI` theme provider wired, `AppRouterCacheProvider` in place, `packages/components` exists with a placeholder export).

## Steps

1. **Produce wireframes and (optionally) a hi-fi mockup** before any component code. The point is to disagree on layout in a doc, not in TSX.
   - **Wireframes (required, lo-fi):** ASCII or mermaid sketches checked in under `plan/starwars-team-builder/design.md`. One per screen: `/`, `/characters/[id]`, `/team`. Show the grid, the regions, and where each component lands. No colors, no copy beyond labels.
   - **Mockups (optional, hi-fi):** a colored render of at least the home page and the detail page, demonstrating the palette, type, and spacing from the tokens in step 2. Skip entirely if the wireframes + tokens are enough to align on. If you do produce them, check the source (or an exported PNG/SVG) into `plan/starwars-team-builder/design/` and link it from `plan/starwars-team-builder/design.md`.
   - **Tooling is open.** ASCII or mermaid in markdown is always acceptable. Claude's frontend-design / Artifacts works well for fast hi-fi from a prompt. Any other tool is fine as long as the output lands in `plan/starwars-team-builder/`, the deliverable is the artifact, not the tool that produced it.
2. **Write the rest of `plan/starwars-team-builder/design.md`** around those wireframes. Sections:
   - Design tokens (palette, typography scale, spacing scale, radius, elevation, motion durations). One accent, one neutral ramp (50..900), semantic states (`success`, `warning`, `error`, `info`).
   - Layout shell sketch: top bar with app name, sidebar 280px on desktop / drawer on mobile, content slot. Cross-reference the wireframes from step 1.
   - Screen notes for `/`, `/characters/[id]`, `/team`. Each lists the components it consumes and the data shape bound to each. Pairs with the corresponding wireframe.
   - Component inventory. Every UI component lives under `packages/components/*`; `apps/platform/src/components/*` is reserved for non-reusable app wiring (route layouts, providers).
   - State matrix per component: default, hover, focus, disabled, loading, error, empty.
3. **Wire the tokens into the `MUI` theme** at `apps/platform/src/theme/theme.ts`. Export `lightTheme`. The values come from `design.md`, this file just imports them.
4. **Build the layout shell** in `packages/components/src/shell/AppShell.tsx`. Slots: `topBar`, `sidebar`, `children`. No business logic, no data fetching.
5. **Build the placeholder `<TeamSidebar />`** in `packages/components/src/team/TeamSidebar.tsx`. Renders a static "Your team (0/5)" header and an empty-state message. Real data wiring lands in 006.
6. **Build `<CharacterCard />`** in `packages/components/src/characters/CharacterCard.tsx`. Props: `name`, `image`, `onClick`. Hover, focus, and disabled states.
7. **Build `<StatePanel />`** in `packages/components/src/common/StatePanel.tsx`. Props: `variant: 'loading' | 'empty' | 'error'`, `title`, `description`, `action?`. Used for the empty team, loading list, and failed API calls.
8. **Build `<TeamMemberRow />`** in `packages/components/src/team/TeamMemberRow.tsx`. Props: `name`, `image`, `onRemove`. Used in both the sidebar and `/team`.
9. **Build `<ActionButton />`** in `packages/components/src/common/ActionButton.tsx`. Wraps `MUI` Button with the project's loading and disabled-with-tooltip patterns. Props: `loading`, `disabledReason?` (when present, the button is disabled and the reason renders as a tooltip).
10. **Update the top-level barrel** `packages/components/src/index.ts` to re-export the six components (`AppShell`, `TeamSidebar`, `CharacterCard`, `StatePanel`, `TeamMemberRow`, `ActionButton`) directly from their feature-folder paths. No per-feature `index.ts` files; consumers either import from the package root or deep-path the component file.
11. **Add a `Vitest` smoke test** next to each component (`packages/components/src/<feature>/<Name>.test.tsx`) using Testing Library: renders without crashing, primary prop is reflected in the DOM, the disabled-with-tooltip pattern works on `<ActionButton />`, and `<StatePanel variant="loading" | "empty" | "error">` each render their distinct content.

## Files touched

- `plan/starwars-team-builder/design.md`: created (includes wireframes for `/`, `/characters/[id]`, `/team`)
- `plan/starwars-team-builder/design/`: created if hi-fi mockups are produced (exported PNG/SVG or tool source files); skipped otherwise
- `apps/platform/src/theme/theme.ts`: modified (tokens replace the 001 placeholder values)
- `packages/components/src/shell/AppShell.tsx`: created
- `packages/components/src/team/TeamSidebar.tsx`: created
- `packages/components/src/team/TeamMemberRow.tsx`: created
- `packages/components/src/characters/CharacterCard.tsx`: created
- `packages/components/src/common/StatePanel.tsx`: created
- `packages/components/src/common/ActionButton.tsx`: created
- `packages/components/src/index.ts`: top-level barrel re-exporting the six components by file path
- `packages/components/src/shell/AppShell.test.tsx`: created
- `packages/components/src/team/TeamMemberRow.test.tsx`: created
- `packages/components/src/characters/CharacterCard.test.tsx`: created
- `packages/components/src/common/StatePanel.test.tsx`: created
- `packages/components/src/common/ActionButton.test.tsx`: created

## Verification

1. `pnpm install && pnpm --filter @stijnvanhulle/components build && pnpm dev`. App boots without errors; the placeholder page from Slice 001 still renders with the new theme tokens applied (devtools shows the new font / primary color).
2. `pnpm --filter @stijnvanhulle/components test` is green.
3. `pnpm typecheck && pnpm lint` are green.
4. `plan/starwars-team-builder/design.md` is checked in and renders cleanly (every code fence closes; no `_TBD_` markers remain).

## Done criteria

- [ ] `plan/starwars-team-builder/design.md` is filled in (no `_TBD_`) and includes lo-fi wireframes for `/`, `/characters/[id]`, `/team`
- [ ] Hi-fi mockups are either checked in under `plan/starwars-team-builder/design/` and linked from `plan/starwars-team-builder/design.md`, or explicitly noted as skipped
- [ ] `apps/platform/src/theme/theme.ts` reflects the tokens in `design.md`
- [ ] `packages/components` exports `AppShell`, `TeamSidebar`, `CharacterCard`, `StatePanel`, `TeamMemberRow`, `ActionButton`
- [ ] `<ActionButton disabledReason>` is disabled and the reason renders as a tooltip (the pattern Vader's Add button uses in 006)
- [ ] Each component has a passing Vitest smoke test
- [ ] `pnpm --filter @stijnvanhulle/components test`, `pnpm typecheck`, and `pnpm lint` are green
- [ ] No new app routes are added in this slice; first consumer is Slice 006
