# Design. Whale Star Wars Team Builder

Authored in Planning Phase 3 (ASCII pass + Claude design hi-fi pass). Gates Slice 003. This file stays the source of truth for tokens, sketches, components, and states.

**Hi-fi mockups** (`plans/design/`, open in any browser):

- [home.html](./design/home.html). character list grid with sidebar
- [character-detail.html](./design/character-detail.html). Darth Vader page showing the disabled-with-tooltip Add button and dark-side warning
- [team.html](./design/team.html). team management with TeamMemberRow + progress dots

**Visual reference**: the [Whale product app](https://app.usewhale.io/dashboard) (auth-gated; inspected from screenshots) is the primary reference, with [usewhale.io](https://usewhale.io/) supplying typography + the pink brand accent. The app uses:

- **Left navy icon-only nav** (~80px wide, deep navy `#0F1664` bg) with white-stroke icons.
- **Tinted main content area** on `#F5F7FB`, with white cards stacked on it.
- **Two CTA colors**: pink (`#FF348A`) for primary creative actions, navy (`#1E2A8D`) for content/library actions. Secondary CTAs use a pink-on-white pill with pink border (the "Ask Alice" pattern).
- **Soft-bordered cards** with `12px–16px` radius and a one-pixel border, not the chunky 24px halo the marketing site uses.
- **Trial/upgrade strip** docked to the top of the app, full-width navy bar.

The product is simple by intent: no animations, no transforms on hover, no fancy effects. Colors and borders change on interaction and that's it.

## Design tokens

Pure values. Slice 003's `apps/platform/src/theme/theme.ts` imports them; no theme code lives here.

### Palette

Mirrors [usewhale.io](https://usewhale.io/)'s pink-on-white system. One accent for primary actions; the four semantic states keep their own ramps.

| Token              | Value     | Use                                                                |
| ------------------ | --------- | ------------------------------------------------------------------ |
| `accent.500`       | `#FF348A` | Primary creative actions ("+ Create new"-style), Whale brand pink  |
| `accent.600`       | `#E61F75` | Hover state of the primary accent                                  |
| `accent.700`       | `#C01060` | Pressed / active state                                             |
| `accent.50`        | `#FFF0F6` | Accent-tinted backgrounds (selected sidebar row, pink outline pill bg) |
| `navy.700`         | `#1E2A8D` | Secondary CTA solid (content/library actions like "New playbook")  |
| `navy.800`         | `#152178` | Navy CTA hover                                                     |
| `nav.bg`           | `#0F1664` | Deep navy of the left icon nav                                     |
| `nav.fg`           | `#FFFFFF` | Nav icon stroke + text                                             |
| `nav.active`       | `#1E2A8D` | Active nav item background pill                                    |
| `neutral.0`        | `#FFFFFF` | Card surface                                                       |
| `surface.app`      | `#F5F7FB` | Main content area background (the tinted gray-blue behind cards)   |
| `neutral.100`      | `#F1F5F9` | Subtle inner-card surface, sidebar nested rows                     |
| `neutral.200`      | `#E2E8F0` | Borders, dividers                                                  |
| `neutral.400`      | `#94A3B8` | Secondary text, disabled foreground                                |
| `neutral.600`      | `#334155` | Body text                                                          |
| `neutral.900`      | `#121A52` | Headings (matches Whale's deep navy)                               |
| `semantic.success` | `#16A34A` | Successful add inline                                              |
| `semantic.warning` | `#D97706` | Cap-near-full hints                                                |
| `semantic.error`   | `#DC2626` | 422 / 409 inline errors                                            |
| `semantic.info`    | `#0284C7` | Loading / informational                                            |

Top bar is white (`neutral.0`) with a bottom border (`neutral.200`), not the dark band a Star Wars theme would imply. Matches Whale's clean horizontal nav.

### Typography

Whale uses **Sofia Pro Soft** for headings (paid Adobe font) and **Nunito Sans** for body. We mirror the body face exactly (Nunito Sans is free on Google Fonts); for headings we fall back to Nunito Sans 700 if Sofia Pro Soft is not licensed.

| Token        | Value                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| `font.body`  | `"Nunito Sans", Inter, system-ui, sans-serif`                              |
| `font.head`  | `"Sofia Pro Soft", "Nunito Sans", Inter, system-ui, sans-serif`            |
| `font.mono`  | `JetBrains Mono, ui-monospace, monospace`                                  |
| `size.xs`    | `0.75rem` (12px)                                                           |
| `size.sm`    | `0.875rem` (14px)                                                          |
| `size.md`    | `1rem` (16px, body default, matches Whale)                                 |
| `size.lg`    | `1.125rem` (18px)                                                          |
| `size.xl`    | `1.5rem` (24px, h3)                                                        |
| `size.2xl`   | `2rem` (32px, h2; line-height 40px, matches Whale)                         |
| `size.3xl`   | `3rem` (48px, h1; line-height 52px, matches Whale's hero)                  |
| `weight.reg` | 400                   |
| `weight.med` | 600                   |
| `weight.bold`| 700 (headings + CTAs) |
| `line.tight` | 1.1                   |
| `line.body`  | 1.5                   |

### Spacing

4-point scale: `0, 4, 8, 12, 16, 24, 32, 48, 64`. Use the smallest step that visually works. Never invent in-between values.

### Radius

The app uses soft 12-16px radii on cards and pill-shaped buttons.

| Token         | Value    | Use                                                       |
| ------------- | -------- | --------------------------------------------------------- |
| `radius.sm`   | `4px`    | Inputs, small chips                                       |
| `radius.md`   | `12px`   | Card inner regions, sidebar rows, secondary surfaces      |
| `radius.lg`   | `16px`   | `CharacterCard`, `TeamMemberRow`, welcome cards           |
| `radius.pill` | `9999px` | Primary buttons (Add to team, Remove), Ask-Alice pill     |

### Elevation

The app uses soft borders, not drop shadows. Cards are `1px` `neutral.200` border on `neutral.0`, sitting on the `surface.app` tinted bg. A barely-there shadow is reserved for elevated regions (modals, dropdowns) which this app doesn't have many of.

| Token           | Value                              | Use                                                |
| --------------- | ---------------------------------- | -------------------------------------------------- |
| `border.card`   | `1px solid #E2E8F0`                | All cards (`CharacterCard`, `TeamMemberRow`, etc.) |
| `shadow.subtle` | `0 1px 2px rgba(18, 26, 82, 0.04)` | Stickied top bar, optional card lift               |

Cards do not lift or scale on hover. Their border-color changes from `neutral.200` to `accent.500` on hover/focus. Buttons and links change `background` or `border-color` only. No transforms, no fade transitions.

### Motion

No animations. Hover and focus change colors or borders only; nothing moves. The sidebar drawer toggle (mobile only) is the single exception and uses a `200ms` ease-out slide-in.

## Layout shell

Single shell wraps every page: top bar (fixed), sidebar (fixed on desktop, drawer on mobile), main content slot (scrollable).

```
+----+---------------------------------------------+-------------------+
| NN | TOP BAR  64px, neutral.0 bg, border-bottom  |                   |
| AA |  ⌄ Breadcrumb / Page title     [ Team 2/5 ] |                   |
| VV +---------------------------------------------+                   |
| YY |                                             |  TEAM PANEL       |
|    |                                             |  280px sticky     |
| 80 |  MAIN CONTENT                               |  neutral.0 card   |
| px |  surface.app (#F5F7FB) bg                   |  border.card      |
|    |  page max-width 1480 minus side rails       |  radius.lg        |
|    |  inner content max-width 1200, 32px pad     |                   |
|    |                                             |  Your team [2/5]  |
|    |  (cards stack inside; white cards on the    |  +-------------+  |
|    |   tinted bg, border.card, radius.lg)        |  | Luke  [x]   |  |
|    |                                             |  +-------------+  |
|    |                                             |  | Leia  [x]   |  |
|    |                                             |  +-------------+  |
|    |                                             |  [ Manage team ]  |
+----+---------------------------------------------+-------------------+
```

- **Left nav.** 80px wide, `nav.bg` deep navy (`#0F1664`), no labels, icon-only with `nav.fg` white strokes. Items: characters grid (`/`), team (`/team`). Active item gets a `nav.active` rounded-square background. Whale mark at top, settings cog at the bottom.
- **Top bar.** 64px, `neutral.0` bg with a 1px `neutral.200` bottom border. Breadcrumb / page title on the left; a pink-bordered pill on the right showing "Team 2/5" that links to `/team`. The "+ Create new"-style pink solid CTA is reserved for actions like "Build new team" if we add multi-team later; for v1 we don't need it.
- **Team panel** (right context pane). 280px sticky. It's a single `neutral.0` card with `border.card` and `radius.lg`, sitting on the `surface.app` tinted bg. Title + count pill at top, roster rows below (compact `TeamMemberRow` variant), CTA at the bottom. The CTA is contextual: solid navy "Manage team" link on `/` and `/characters/[id]`, outline "+ Add from roster" on `/team` (where you already are, so the CTA points back to the roster instead of to itself).
- **Breakpoints.** Viewport ≥ 1100px shows the team panel inline (above). Below 1100px the panel hides and the top-bar "Team 2/5" pill opens it as a right-side `Drawer`. Below 720px the left nav also collapses to a hamburger.

## Screens

### `/`: Character list

```
+----+--------------------------------------------+-------------------+
| NN | Characters                  [ Team 2 / 5 ] |                   |
| AA +--------------------------------------------+                   |
| VV |                                            |  TEAM PANEL       |
|    | H1  Star Wars characters                   |  Your team [2/5]  |
|    | Lead: "Browse the roster, pick five."      |  Luke   [x]       |
|    |                                            |  Leia   [x]       |
|    | +------+ +------+ +------+ +------+        |                   |
|    | |[team]| |[team]| |      | |      |        |  [ Manage team ]  |
|    | | img  | | img  | | img  | | img  |        |                   |
|    | +------+ +------+ +------+ +------+        |                   |
|    | | Luke | | Leia | | Han  | | Chew |        |                   |
|    | +------+ +------+ +------+ +------+        |                   |
|    |                                            |                   |
|    | +------+ +------+ +------+ +------+        |                   |
|    | |[dark]| |      | |      | |      |        |                   |
|    | | img  | | img  | | img  | | img  |        |                   |
|    | +------+ +------+ +------+ +------+        |                   |
|    | |Vader | |Obi-W | |Yoda  | |R2-D2 |        |                   |
|    | +------+ +------+ +------+ +------+        |                   |
+----+--------------------------------------------+-------------------+
```

- **Breadcrumb + H1 + lead** stack at top. Breadcrumb is `nav.fg`-adjacent gray text → pink current item. Lead max-width 720px.
- **Grid.** `repeat(4, 1fr)` at ≥1240px, 3 cols ≥980px, 2 cols ≥560px, 1 col below. Gap `24px`.
- **Card.** White, `radius.lg` (16px), `border.card` (1px `neutral.200`). Square media + body (just the character's name as H3). No height/mass/affiliations preview, the spec puts those on the detail page. On hover: border-color flips to `accent.500`, no movement.
- **Badges.** Top-left chip on the media: `On team` (pink solid) or `Dark side` (red solid), uppercase. Solid background only, no blur.
- **Component.** `<CharacterCard name image onClick badge?>` from `packages/components`.
- **Data.** `useGetAllCharactersQuery()` from `starwarsApi`, joined with `useListTeamQuery()` for the "On team" badge.
- **States.** Loading → `<StatePanel variant="loading">`. Error → `<StatePanel variant="error" action={retry}>`. Empty (guard only; `akabab` always has data) → `<StatePanel variant="empty">`.
- The filter chip row from earlier mockups is dropped: the app doesn't show one and the spec doesn't ask for it.

### `/characters/[id]`: Character detail

```
+----+--------------------------------------------+-------------------+
| NN | Characters / Darth Vader        [ Team 2/5 ]  |                   |
| AA +--------------------------------------------+                   |
| VV |                                            |  TEAM PANEL       |
|    | [ ← Prev (R2-D2) ]  [ Next (Leia) → ]      |                   |
|    |                              4 OF 87       |  Your team [2/5]  |
|    |                                            |  Luke   [x]       |
|    | +-------------+   H1  Darth Vader          |  Leia   [x]       |
|    | | [Dark side] |                            |                   |
|    | |  image 4:5  |   +---------+ +---------+  |  [ Manage team ]  |
|    | |  navy bg    |   | HEIGHT  | | MASS    |  |                   |
|    | |  16px radius|   | 202 cm  | | 136 kg  |  |                   |
|    | +-------------+   +---------+ +---------+  |                   |
|    |                                            |                   |
|    |                   AFFILIATIONS             |                   |
|    |                   [Sith Order] [Darth ...] |                   |
|    |                   [Galactic Empire] [501st]|                   |
|    |                                            |                   |
|    |                   +-----------------------+|                   |
|    |                   |⚠ On the dark side     ||                   |
|    |                   | Two affiliations match||                   |
|    |                   | Sith rule. Can't join.||                   |
|    |                   |       [ Add to team ] ||                   |
|    |                   +-----------------------+|                   |
+----+--------------------------------------------+-------------------+
```

- **Pager.** Two outline pills with the adjacent character's name in the label. Position counter on the right (`N OF 87`, tabular numerals).
- **Hero card.** 4:5 image, `radius.lg` (16px), `border.card`. Top-left chip: red `Dark side` solid or pink `On team` solid.
- **Info column.** H1 + two-cell stats grid for `height` and `mass` (label uppercase 12px, value 24px navy). Affiliation chips below, Sith ones in `semantic.error` red. The spec's five required fields (name, image, height, mass, affiliations) all land here and nothing else.
- **Action bar.** Wraps the primary CTA in a colored box: red-tinted with a warning icon + copy for the evil path; on the non-evil path it's just the pink Add button without a banner.
- **`<ActionButton>` states.** Default pink (`accent.500`); hover `accent.600`; pressed `accent.700`; disabled `neutral.200` bg + `neutral.400` text + `disabledReason` tooltip on hover / `focus-within`. Already-on-team flips to outlined navy "Remove from team".
- **Prev/Next.** First character's `Prev` is disabled (not wrapping). Last character's `Next` is disabled.
- **Data.** `useGetCharacterQuery(id)` hero; `useGetAllCharactersQuery()` for prev/next + `masterNames`; `useListTeamQuery()` for membership.

### `/team`: Team management

```
+----+--------------------------------------------+-------------------+
| NN | Team                        [ Team 2 / 5 ] |                   |
| AA +--------------------------------------------+                   |
| VV |                                            |  TEAM PANEL       |
|    | H1  Your team       [ 2 / 5  • • · · · ]   |  Your team [2/5]  |
|    | Lead: "Two locked in. Three open."         |  Luke   [x]       |
|    |                                            |  Leia   [x]       |
|    | +-----------------------------------+      |                   |
|    | | [avatar]  Luke Skywalker  [Remove]|      |  [ + Add from     |
|    | |           [Rebel] [Jedi]          |      |    roster ]       |
|    | +-----------------------------------+      |                   |
|    | +-----------------------------------+      |                   |
|    | | [avatar]  Leia Organa     [Remove]|      |                   |
|    | |           [Rebel] [Organa]        |      |                   |
|    | +-----------------------------------+      |                   |
|    |                                            |                   |
|    | (empty team -> StatePanel variant=empty)   |                   |
+----+--------------------------------------------+-------------------+
```

- **Page header.** Breadcrumb (`Team`) + H1 + lead on the left, progress pill on the right: tabular `N / 5` label + five dots (filled pink for taken, gray `neutral.200` for open).
- **Member rows.** White cards with `radius.lg` (16px) + `border.card`. Layout: 80–96px rounded-square avatar | info column | Remove pill. Info column: H2 name + a small row of affiliation meta chips pulled from `character.affiliations`. No invented "role" eyebrow; the spec doesn't define one and `akabab` doesn't return one. Remove button is outline by default; on hover its border, bg, and text all flip to `semantic.error` family.
- **Empty team.** When `team.length === 0`, the member list is replaced by `<StatePanel variant="empty" title="No team yet" description="Add characters from a detail page." action={...}>`. The empty-slot CTA cards from earlier mockups are dropped (not in spec, the app uses StatePanel for empty states).
- **Component.** `<TeamMemberRow avatar name meta onRemove>`. The team panel reuses a compact variant (smaller avatar, single-line name, no meta chips).
- **Data.** `useListTeamQuery()` joined locally with `useGetAllCharactersQuery()` for name/image/affiliations (the team API stores `characterId` only).

## Component inventory

| Component                  | Lives in                                 | Notes                                                  |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `AppShell`                 | `packages/components`                    | Top bar + sidebar + content slots                      |
| `TeamSidebar`              | `packages/components`                    | Presentational; compact roster rows passed as children |
| `CharacterCard`            | `packages/components`                    | List grid card; props include optional `badge`         |
| `StatePanel`               | `packages/components`                    | Loading / empty / error variants                       |
| `TeamMemberRow`            | `packages/components`                    | Two variants: `compact` (sidebar) and `full` (`/team`) |
| `ActionButton`             | `packages/components`                    | Loading + `disabledReason` (tooltip) patterns          |
| `Pill` / `Chip`            | `packages/components`                    | Filter chips, affiliation chips, meta chips, badges    |
| `Pager`                    | `packages/components`                    | Prev/Next + position counter on the detail page        |
| `ProgressDots`             | `packages/components`                    | The `n / 5` dots on `/team`                            |
| `Tooltip`                  | `packages/components`                    | Hover/focus tooltip; used by `ActionButton`            |
| `TopBar`                   | `apps/platform/src/components`           | Single-consumer; app name + team link                  |
| `CharacterList`            | `apps/platform/src/components`           | Data-aware grid wrapper with filter chips              |
| `CharacterDetail`          | `apps/platform/src/components`           | Detail page body, Add/Remove wiring, action bar        |
| `TeamSidebarContainer`     | `apps/platform/src/components`           | Joins team rows to character data                      |
| `ActionBar`                | `apps/platform/src/components`           | Wraps `ActionButton` with status banner (`/characters`) |

Anything single-consumer stays in `apps/platform`. It moves to `packages/components` only when a second consumer appears.

## State matrix

One row per interactive component. `✓` = required, `n/a` = not applicable.

| Component       | default | hover | focus | disabled | loading | empty | error |
| --------------- | :-----: | :---: | :---: | :------: | :-----: | :---: | :---: |
| `CharacterCard` |   ✓     |   ✓   |   ✓   |   n/a    |   ✓     |  n/a  |  n/a  |
| `ActionButton`  |   ✓     |   ✓   |   ✓   |    ✓     |   ✓     |  n/a  |  n/a  |
| `TeamMemberRow` |   ✓     |   ✓   |   ✓   |   n/a    |   n/a   |  n/a  |  n/a  |
| `Pill` / `Chip` |   ✓     |   ✓   |   ✓   |    ✓     |   n/a   |  n/a  |  n/a  |
| `Pager` button  |   ✓     |   ✓   |   ✓   |    ✓     |   n/a   |  n/a  |  n/a  |
| `StatePanel`    |   n/a   |  n/a  |  n/a  |   n/a    |   ✓     |   ✓   |   ✓   |
| `TeamSidebar`   |   ✓     |  n/a  |  n/a  |   n/a    |   ✓     |   ✓   |  n/a  |

`ActionButton`'s `disabled` state always pairs with a tooltip (`disabledReason`).

## Beyond spec, kept as optional UX

The mockups carry a few elements the prompt does not require. They're easy to drop if scope tightens, and they don't replace any required behavior.

- **Position counter on the pager** (`N OF 87`) and **adjacent-character name labels** (`Prev (R2-D2)`). Plain Prev/Next would meet the spec.
- **Action bar warning copy on the detail page** when a character is dark side. The required behavior is "disabled Add button with reason"; the bigger banner is a UX amplification of that. If we drop it, the tooltip on `<ActionButton>` alone still covers the requirement.
- **Team panel "Manage team" footer link**. A hint, not a requirement.

Removed in the app-aligned pass: filter chips on `/`, empty-slot CTAs on `/team`, the fabricated role eyebrows.

If a slice is over budget, cut from this list first.

## Deferred

Tracked in `plans/research.md`'s Open items:

- Toast vs inline errors (current: inline)
- Prev/Next wrap behavior (current: disabled at endpoints)
