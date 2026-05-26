# Design. Whale Star Wars Team Builder

Authored in Planning Phase 3 (ASCII pass + Claude design hi-fi pass). Gates Slice 003. This file stays the source of truth for tokens, sketches, components, and states.

**Hi-fi mockups** (`plans/starwars-team-builder/design/`, open in any browser):

- [home.html](./design/home.html). character list grid with sidebar
- [character-detail.html](./design/character-detail.html). Darth Vader page showing the disabled-with-tooltip Add button and dark-side warning
- [team.html](./design/team.html). team management with TeamMemberRow + progress dots

**Visual reference**: the [Whale product app](https://app.usewhale.io/dashboard) (auth-gated; inspected from screenshots) is the primary reference, with [usewhale.io](https://usewhale.io/) supplying typography + the pink brand accent. The app uses:

- **Left navy icon-only nav** (~80px wide, deep navy `#0F1664` bg) with white-stroke icons.
- **Tinted main content area** on `#F5F7FB`, with white cards stacked on it.
- Two CTA colors: pink (`#FF348A`) for primary creative actions, navy (`#1E2A8D`) for content/library actions. Secondary CTAs use a pink-on-white pill with pink border (the "Ask Alice" pattern).
- **Soft-bordered cards** with `12px–16px` radius and a one-pixel border, not the chunky 24px halo the marketing site uses.
- **Trial/upgrade strip** docked to the top of the app, full-width navy bar.

The product is simple by intent: no animations, no transforms on hover, no fancy effects. Colors and borders change on interaction and that's it.

## Design tokens

Pure values. Slice 003's `apps/platform/src/theme/theme.ts` imports them; no theme code lives here.

### Palette

Mirrors [usewhale.io](https://usewhale.io/)'s pink-on-white system. One accent for primary actions. The four semantic states keep their own ramps.

| Token              | Value     | Use                                                                    |
| ------------------ | --------- | ---------------------------------------------------------------------- |
| `accent.500`       | `#FF348A` | Primary creative actions ("+ Create new"-style), Whale brand pink      |
| `accent.600`       | `#E61F75` | Hover state of the primary accent                                      |
| `accent.700`       | `#C01060` | Pressed / active state                                                 |
| `accent.50`        | `#FFF0F6` | Accent-tinted backgrounds (selected sidebar row, pink outline pill bg) |
| `navy.700`         | `#1E2A8D` | Secondary CTA solid (content/library actions like "New playbook")      |
| `navy.800`         | `#152178` | Navy CTA hover                                                         |
| `nav.bg`           | `#0F1664` | Deep navy of the left icon nav                                         |
| `nav.fg`           | `#FFFFFF` | Nav icon stroke + text                                                 |
| `nav.active`       | `#1E2A8D` | Active nav item background pill                                        |
| `neutral.0`        | `#FFFFFF` | Card surface                                                           |
| `surface.app`      | `#F5F7FB` | Main content area background (the tinted gray-blue behind cards)       |
| `neutral.100`      | `#F1F5F9` | Subtle inner-card surface, sidebar nested rows                         |
| `neutral.200`      | `#E2E8F0` | Borders, dividers                                                      |
| `neutral.400`      | `#94A3B8` | Secondary text, disabled foreground                                    |
| `neutral.600`      | `#334155` | Body text                                                              |
| `neutral.900`      | `#121A52` | Headings (matches Whale's deep navy)                                   |
| `semantic.success` | `#16A34A` | Successful add inline                                                  |
| `semantic.warning` | `#D97706` | Cap-near-full hints                                                    |
| `semantic.error`   | `#DC2626` | 422 / 409 inline errors                                                |
| `semantic.info`    | `#0284C7` | Loading / informational                                                |

Top bar sits on the same `surface.app` background as the content (no separate white band) with a 1px `neutral.200` bottom border, matching the hi-fi sketches. A "dark Star Wars" band would clash with the rest of the chrome.

### Typography

Whale uses **Sofia Pro Soft** for headings (paid Adobe font) and **Nunito Sans** for body. We mirror the body face exactly (Nunito Sans is free on Google Fonts); for headings we fall back to Nunito Sans 800 if Sofia Pro Soft is not licensed. The hi-fi sketches under `plans/starwars-team-builder/design/` load Nunito Sans only.

| Token         | Value                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| `font.body`   | `"Nunito Sans", system-ui, sans-serif`                                                 |
| `font.head`   | `"Sofia Pro Soft", "Nunito Sans", system-ui, sans-serif`                               |
| `font.mono`   | `JetBrains Mono, ui-monospace, monospace`                                              |
| `size.xs`     | `0.75rem` (12px; uppercase chips, stat labels, pair with `letter-spacing: 0.08em`)    |
| `size.sm`     | `0.875rem` (14px; secondary body, sidebar names, breadcrumbs, pill buttons)            |
| `size.body`   | `1rem` (16px; body default)                                                            |
| `size.h3`     | `1.125rem` (18px, line-height 24px, `letter-spacing: -0.01em`; card name + section h3) |
| `size.h2`     | `1.75rem` (28px, line-height 36px, `letter-spacing: -0.02em`; member-row titles)       |
| `size.h1`     | `2.5rem` (40px, line-height 44px, `letter-spacing: -0.02em`; page titles)              |
| `weight.reg`  | 400                                                                                    |
| `weight.med`  | 600                                                                                    |
| `weight.bold` | 700 (body emphasis, CTAs)                                                              |
| `weight.head` | 800 (all headings)                                                                     |
| `line.tight`  | 1.1                                                                                    |
| `line.body`   | 1.5                                                                                    |

### Spacing

4-point scale. Every spacing value is a multiple of 4. Common steps used here: `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Use the smallest step that visually works. Never invent in-between values (no 6, 10, 14, 18, 22, etc.).

### Radius

The app uses soft 12-16px radii on cards and pill-shaped buttons.

| Token         | Value    | Use                                                   |
| ------------- | -------- | ----------------------------------------------------- |
| `radius.sm`   | `4px`    | Inputs, small chips                                   |
| `radius.md`   | `12px`   | Card inner regions, sidebar rows, secondary surfaces  |
| `radius.lg`   | `16px`   | `CharacterCard`, `TeamMemberRow`, welcome cards       |
| `radius.pill` | `9999px` | Primary buttons (Add to team, Remove), Ask-Alice pill |

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

```text
+----+---------------------------------------------+-------------------+
| NN | TOP BAR  ~52px, surface.app bg, border-bot. |                   |
| AA |  Breadcrumb only (e.g. "Characters" or      |                   |
| VV |  "Characters / Darth Vader")                |                   |
| YY +---------------------------------------------+                   |
|    |                                             |  TEAM PANEL       |
|    |                                             |  280px sticky     |
| 80 |  MAIN CONTENT                               |  inset 16px right |
| px |  surface.app (#F5F7FB) bg                   |  neutral.0 card   |
|    |  inner content max-width 1200, 32px pad     |  border.card      |
|    |                                             |  radius.lg        |
|    |  (cards stack inside; white cards on the    |                   |
|    |   tinted bg, border.card, radius.lg)        |  Your team [2/5]  |
|    |                                             |  +-------------+  |
|    |                                             |  | ○ Luke  [x] |  |
|    |                                             |  +-------------+  |
|    |                                             |  | ○ Leia  [x] |  |
|    |                                             |  +-------------+  |
|    |                                             |  [ Manage team ]  |
+----+---------------------------------------------+-------------------+
```

- **Left nav.** 80px wide, `nav.bg` deep navy (`#0F1664`), no labels, icon-only with `nav.fg` white strokes. Items: characters grid (`/`) and team (`/team`). The active item gets a `nav.active` rounded-square (`radius.md`) background. Whale glyph at the top; no settings cog in v1 (the mockups omit it).
- **Top bar.** 16px vertical padding around a `size.sm` (14px) bold breadcrumb on the `surface.app` background (no white band, matches the content area) with a 1px `neutral.200` bottom border. Breadcrumb on the left, nothing on the right. The team count and the `/team` entry point live in the right panel, not in the top bar, which keeps the top bar quiet.
- **Team panel** (right context pane). 280px column with 16px right padding so the card sits inset from the viewport edge. A single `neutral.0` card with `border.card`, `radius.lg`, 20px interior padding. Header is `Your team` (head font, 16px / 800) + a count pill (`accent.50` background, `accent.600` text, tabular numerals like `2 / 5`). Roster rows below use the compact `TeamMemberRow`: 36px circular avatar, `size.sm` / 700 name, transparent 24px `x` button that turns `semantic.error-bg` + `semantic.error` text on hover. The CTA at the bottom is contextual: solid navy "Manage team" on `/` and `/characters/[id]`, outline "+ Add characters" on `/team` (where you already are, so the CTA points back to the character list).
- **Breakpoints.** Viewport ≥ 1100px shows the team panel inline (above). Below 1100px the panel hides and the sidebar's team icon opens it as a right-side `Drawer`. Below 720px the left nav also collapses to a hamburger.

## Screens

### `/`: Character list

```text
+----+--------------------------------------------+-------------------+
| NN | Characters                                 |                   |
| AA +--------------------------------------------+                   |
| VV |                                            |  TEAM PANEL       |
|    | H1  Star Wars characters                   |  Your team [2/5]  |
|    | Lead: "Pick five for your team."           |  Luke   [x]       |
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

- **Page header.** H1 `Star Wars characters` (40px, head font, navy) + lead "Pick five characters for your team. Evil characters can't join." (16px, `neutral.600`, max-width 720px). The breadcrumb (just `Characters`, no separator on the home page) sits in the top bar, not here.
- **Grid.** `repeat(4, 1fr)` at ≥1240px, 3 cols ≥980px, 2 cols ≥560px, 1 col below. Gap `24px`.
- **Card.** `neutral.0`, `radius.lg` (16px), `border.card` (1px `neutral.200`), `overflow: hidden`. Two regions split by a 1px `neutral.200` rule: square media (aspect 1/1, `neutral.100` placeholder, `object-fit: cover`) on top, body below with 16px padding holding the character name (`size.body` 16px, head font, 800, `letter-spacing: -0.01em`). No height/mass/affiliations preview. The spec puts those on the detail page. On hover the card border flips from `neutral.200` to `accent.500`; nothing moves.
- **Badges.** Top-left chip on the media, `radius.pill`, 4×12 padding, `size.xs` (12px) / 700 / uppercase with `0.04em` tracking: `On team` (`accent.500` solid, white text) or `Dark side` (`semantic.error` solid, white text). Solid background only, no blur.
- **Component.** `<CharacterCard name image onClick badge?>` from `packages/components`.
- **Data.** `useListCharactersQuery()` from the single `api` slice (hits `/api/characters`, server-proxied from `starwars-api`), joined with `useGetTeamQuery()` for the "On team" badge.
- **States.** Loading → `<StatePanel variant="loading">`. Error → `<StatePanel variant="error" action={retry}>` (proxy maps any upstream non-200 to `404 NOT_FOUND`; transport failures surface as the same error state). Empty (guard only; the `starwars-api` always has data) → `<StatePanel variant="empty">`.
- The filter chip row from earlier mockups is dropped: the app doesn't show one and the spec doesn't ask for it.

### `/characters/[id]`: Character detail

```text
+----+--------------------------------------------+-------------------+
| NN | Characters / Darth Vader                   |                   |
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

- **Detail card.** One `neutral.0` card with `border.card`, `radius.lg`, 24px padding, containing a two-column grid: hero on the left (`280–360px`), info on the right. Collapses to a single column below 760px.
- **Pager.** Two outline pills (`radius.pill`, 1.5px `neutral.200` border on `neutral.0`) with the adjacent character's name in the label (`Prev (R2-D2)`, `Next (Leia Organa)`). Hover flips the border to `accent.500` and the text to `accent.600`. Position counter on the right reads `N of 87` with a bold `accent` `neutral.900` numerator and `neutral.400` "of 87" trailing.
- **Hero card.** 4:5 image, `radius.md` (12px), `neutral.900` background while the image loads. Top-left chip: red `Dark side` (`semantic.error` solid) or pink `On team` (`accent.500` solid), `size.xs` (12px) uppercase, `0.04em` letter-spacing.
- **Info column.** H1 (`size.h1`, 40px, head font, navy) + two stat cards in a `repeat(2, minmax(0, 180px))` grid (each card is `neutral.0`, `border.card`, `radius.md`, 12×16 padding; label `size.xs` uppercase `neutral.400`; value 24px in the head font with a small unit suffix in `neutral.400`). Then a `size.xs` uppercase `AFFILIATIONS` eyebrow, then affiliation chips: each is a `neutral.100` pill with a leading dot, Sith/Darth ones tinted with `semantic.error-bg` background + `semantic.error` text. The spec's five required fields (name, image, height, mass, affiliations) all land here and nothing else.
- **Action bar.** For evil characters, the CTA sits in a red-tinted box (`semantic.error-bg` background with a `#FCA5A5` border, 16px padding, `radius.md`): a 32px white circle with `semantic.error` warning glyph on the left, a two-line copy block (`On the dark side` title in `semantic.error`, description in `#7F1D1D`) in the middle, and the disabled `Add to team` button on the right. On the non-evil path the banner is gone. The pink Add button stands alone under the affiliation chips.
- `<ActionButton>` **states.** Default pink (`accent.500`); hover `accent.600`; pressed `accent.700`; disabled `neutral.200` bg + `neutral.400` text + `disabledReason` tooltip on hover / `focus-within`. Already-on-team flips to outlined navy "Remove from team".
- **Prev/Next.** Wrap around: first character's `Prev` jumps to the last; last character's `Next` jumps to the first. Always enabled.
- **Data.** `useGetCharacterQuery(id)` hero; `useListCharactersQuery()` for prev/next ordering (`masters` arrives as `string[]` from the source API, no id resolution needed); `useGetTeamQuery()` for membership.

### `/team`: Team management

```text
+----+--------------------------------------------+-------------------+
| NN | Team                                       |                   |
| AA +--------------------------------------------+                   |
| VV |                                            |  TEAM PANEL       |
|    | H1  Your team       [ 2 / 5  • • · · · ]   |  Your team [2/5]  |
|    |                                            |  Luke   [x]       |
|    |                                            |  Leia   [x]       |
|    | +-----------------------------------+      |                   |
|    | | [avatar]  Luke Skywalker  [Remove]|      |  [ + Add          |
|    | +-----------------------------------+      |    characters ]   |
|    | +-----------------------------------+      |                   |
|    | | [avatar]  Leia Organa     [Remove]|      |                   |
|    | +-----------------------------------+      |                   |
|    |                                            |                   |
|    | (empty team -> StatePanel variant=empty)   |                   |
+----+--------------------------------------------+-------------------+
```

- **Page header.** H1 `Your team` (head font, 40px) on the left, no lead copy. Progress pill on the right: a `neutral.0` pill with `border.card`, `radius.pill`, 8×16 padding, containing a bold tabular `N / 5` label and five 8px dots (filled `accent.500` for taken, `neutral.200` for open). Breadcrumb (`Team`) sits in the top bar, not here.
- **Member rows.** Full-width `neutral.0` cards with `border.card` + `radius.lg`, 16px padding, laid out `72px | minmax(0, 1fr) | auto`. The 72px avatar uses `radius.md` (12px, soft-square, not a circle) and `object-fit: cover`. Name is an `<h2>` element styled at 20px (intentional override of the default `size.h2` to keep the row compact), head font, 800. Remove control is a pill button with a 1.5px `neutral.200` border, 8×16 padding, label `Remove` + an `✕` glyph. On hover the border, bg, and text all flip to the `semantic.error` family (`bg` to `semantic.error-bg`). No affiliations, no invented "role" eyebrow. The spec only requires identifying members and a remove control. Card border flips to `accent.500` on hover. Below 640px the row collapses: avatar/name on the top row, Remove stretches across the full width below.
- **Empty team.** When `team.length === 0`, the member list is replaced by `<StatePanel variant="empty" title="No team yet" description="Add characters from a detail page." action={...}>`. The empty-slot CTA cards from earlier mockups are dropped (not in spec, the app uses StatePanel for empty states).
- **Component.** `<TeamMemberRow avatar name meta onRemove>`. The team panel reuses a compact variant (smaller avatar, single-line name, no meta chips).
- **Data.** `useGetTeamQuery()` joined locally with `useListCharactersQuery()` for name/image/affiliations (the team API stores `characterId` only).

## Component inventory

`packages/components/src/` is organised by feature. There are no per-feature barrels. The single top-level `src/index.ts` is the package entry, and consumers can also deep-import a component by its file path.

| Component              | Folder        | Notes                                                      |
| ---------------------- | ------------- | ---------------------------------------------------------- |
| `AppShell`             | `shell/`      | Top bar + sidebar + content slots                          |
| `TopBar`               | `shell/`      | App name + team link                                       |
| `CharacterCard`        | `characters/` | List grid card; props include optional `badge`             |
| `CharacterList`        | `characters/` | Data-aware grid wrapper                                    |
| `CharacterDetail`      | `characters/` | Detail page body, Add/Remove wiring; banner + Add/Remove button are inline here (no separate `ActionBar` export) |
| `TeamSidebar`          | `team/`       | Presentational; compact team rows passed as children       |
| `TeamSidebarContainer` | `team/`       | Joins team rows to character data                          |
| `TeamMemberRow`        | `team/`       | Two variants: `compact` (sidebar) and `full` (`/team`)     |
| `StatePanel`           | `common/`     | Loading / empty / error variants                           |
| `ActionButton`         | `common/`     | Loading + `disabledReason` (tooltip) patterns              |

> The patterns below are not exported components. They render inline inside their host component using MUI primitives, so they don't need a slot in `packages/components`.
>
> - **Pill / Chip**, affiliation chips, meta chips: use MUI `<Chip variant="outlined">` directly wherever needed.
> - **Pager**, Prev/Next + position counter on the detail page: two `<ActionButton>`s plus a `<Typography>` counter laid out inline inside `<CharacterDetail>`.
> - **ProgressDots**, `n / 5` dots on the team sidebar / team page: render inline (`Array.from({ length: 5 }).map(...)`) inside `<TeamSidebar>` / `<TeamMemberRow>`.
> - **Tooltip**, wraps disabled controls: use MUI `<Tooltip>` directly. `<ActionButton>` already integrates it for the `disabledReason` pattern.

All UI components live in `packages/components` from day one; `apps/platform/src/components` is reserved for app-level wiring that isn't a reusable component (route layouts, providers).

