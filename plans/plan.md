# Implementation Plan: Whale Star Wars Team Builder

## Summary

Transform the current `TypeScript` library monorepo into a `Next.js` app that browses Star Wars characters from `akabab` and lets the user assemble a max-5 team while excluding evil characters. Characters are fetched directly from `akabab` via `RTK Query`. Only the team persists, in `Postgres` via `Drizzle`, served by our own `Next.js` route handlers behind a `Repository` → `Service` → handler layering.

`Kubb` generates types and `Zod` schemas for both APIs from hand-written `OpenAPI` specs. Work ships across seven independently runnable phase files in `/plans/`.

## Phase Map

- **Planning Phases (0 / 1 / 2)** — produce docs in `plans/` (`spec.md`, `research.md`, `data-model.md`, `contracts/*.yaml`, `quickstart.md`, and the seven slice files). No code.
- **Execution Slices (001 – 007)** — produce code. Each boots from a fresh `pnpm install` and ends in a demoable state.
- Headings are prefixed `Planning Phase N` vs `Slice 00X` throughout so the two tracks never collide.
- Status tags used in Progress Tracking: `todo` · `in-progress` · `blocked` · `done`.

## Technical Context

| Field            | Value                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Language/Version | `TypeScript` `^6.0.3`, Node 22, ESM-only                                                       |
| Frontend         | `Next.js` `16.2.6` (App Router), `React` (Next-bundled), `MUI v9` (`9.0.1`) with `AppRouterCacheProvider` |
| State / Data     | `@reduxjs/toolkit` `^2.12.0`, `react-redux` `^9.3.0`, `RTK Query` (bundled with RTK)            |
| Codegen          | `Kubb` `5.0.0-beta.23` (`adapter-oas`, `plugin-ts`, `plugin-client`, `plugin-zod`)              |
| Storage          | `Postgres 17` via `drizzle-orm` `^0.45.2` + `drizzle-kit` `^0.31.10`, `pg` `^8.21.0` driver (`@types/pg` `^8.20.0`) |
| Testing          | `Vitest` `^4.1.6` (unit + integration), `@playwright/test` `^1.60.0` (e2e), `Testing Library` (components)  |
| Tooling          | `pnpm` `11.1.3`, `turbo` `^2.9.14`, `tsdown` `^0.22.0`, `oxlint` `^1.66.0`, `oxfmt` `^0.47.0`, `@changesets/cli` `^2.31.0` |
| Project Type     | Web — monorepo with `apps/platform` + shared `packages/`                                       |

## Constitution Check

- **Layered architecture** — Route handler → `Service` → `Repository` → `Drizzle`. Each layer has exactly one concern. The `Repository` is the **only** place `Drizzle` is imported.
- **Contract-first** — `OpenAPI 3.1` specs for both our team API and `akabab` precede generated code; `Kubb` is the source of truth for types and `Zod`.
- **Test-first where it pays** — Service rules (cap of 5, evil guard) and the `isDarkSide` util get unit/integration tests **before** UI work in their phase. Pure presentational components do not block on tests.
- **Independent phases** — Each `plans/00X-*.md` boots from a fresh `pnpm install` and ends in a runnable, demoable state.
- **No premature abstraction** — Components live in `packages/components` only once a second consumer exists or they're explicitly part of the design system shell (sidebar, card). Otherwise they stay in `apps/platform`.

## Data flow

```mermaid
flowchart LR
  subgraph browser["Browser — apps/platform"]
    ui["React + MUI components"]
    sw["starwarsApi (RTK Query)"]
    team["teamApi (RTK Query → Kubb fetch client)"]
    ui --> sw
    ui --> team
  end

  akabab[("akabab Star Wars API<br/>static JSON")]

  subgraph nextapi["Next.js route handlers — /api/team"]
    route["route.ts (thin: parse + map errors)"]
    service["TeamService — cap of 5, evil guard"]
    repo["TeamMemberRepository — Drizzle"]
    route --> service --> repo
  end

  pg[("Postgres<br/>team_members")]

  sw -- "GET /all.json<br/>GET /id/{id}.json" --> akabab
  team -- "GET/POST/DELETE /api/team" --> route
  service -- "GET /id/{id}.json<br/>(server-side, for isDarkSide)" --> akabab
  repo -- "SQL" --> pg
```

## Project Structure

```
apps/platform/
  src/
    app/                          # App Router pages + /api/team handlers
    store/                        # Redux store, starwarsApi, teamApi
    server/
      repositories/               # Drizzle only
      services/                   # rules: cap of 5, evil guard
    db/                           # schema, client, migrations
    gen/                          # Kubb output: team/ + starwars/ (gitignored)
    lib/                          # evil rules, helpers
  tests/                          # Vitest
  e2e/                            # Playwright
  kubb.config.ts
  openapi/
    team.yaml
    starwars.yaml
  drizzle.config.ts
packages/components/              # MUI building blocks
internals/utils/                  # already present
configs/                          # already present
```

`packages/core` and `packages/demo` are deleted in Phase 2/001.

## Planning Phase 0: Outline & Research

**Output**: [`plans/spec.md`](./spec.md), [`plans/research.md`](./research.md).

See those files for the resolved questions, scenarios, functional requirements, and acceptance checklist.

## Planning Phase 1: Design & Contracts

**Output**: [`plans/data-model.md`](./data-model.md), [`plans/contracts/team.openapi.yaml`](./contracts/team.openapi.yaml), [`plans/contracts/starwars.openapi.yaml`](./contracts/starwars.openapi.yaml), [`plans/quickstart.md`](./quickstart.md).

The contract specs are checked into `plans/contracts/` and copied to `apps/platform/openapi/` when Slices 004 (team) and 005 (starwars) run.

## Planning Phase 2: Task split into Execution Slices

The slice files in `plans/00X-*.md` are this feature's `tasks.md` equivalent, split so each one boots independently per the prompt. They share a skeleton defined once in [`plans/template.md`](./template.md).

### Task ordering and parallelism

- **001 → 002** is sequential (the app must exist before DB wiring).
- **002 and Planning Phase 1 contracts** can be authored in parallel `[P]`.
- **003 (design)** depends on 001 (it builds on the `MUI` theme wired in 001) and can run alongside 002 `[P]` since it does not touch the DB.
- **004 (api)** depends on 002 and the team contract.
- **005 (client+kubb)** depends on 004 (it consumes `team.yaml`) and 003 (it consumes the design system primitives) and can land alongside Planning Phase 1's `starwars.yaml` `[P]` for the second `Kubb` pipeline.
- **006 (features)** depends on 005 (it consumes the generated types) and 003 (it consumes the screen sketches and components).
- **007 (testing)** depends on 006 (e2e drives real flows).

### Execution Slices (one file each)

| Slice file                 | Depends on                              | Demoable outcome                                                                                                                                                                                  |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plans/001-setup.md`       | —                                       | `pnpm dev` serves an `MUI`-themed `Next.js` page at `localhost:3000`. `pnpm typecheck`/`lint`/`test` green. `packages/core` and `packages/demo` removed.                                          |
| `plans/002-database.md`    | 001                                     | `docker compose up -d postgres && pnpm --filter platform db:migrate` creates `team_members`. Repository CRUD covered by `Vitest` integration tests against a real `Postgres`.                     |
| `plans/003-design.md`      | 001                                     | Design tokens land in the `MUI` theme (palette, typography, spacing, radius). `packages/components` exports the layout shell (`<AppShell />`, `<TeamSidebar />` placeholder, `<CharacterCard />`, `<StatePanel />` for loading/empty/error). Storybook-style preview route `/design` renders every component in each state. Screen sketches for `/`, `/characters/[id]`, `/team` checked into `plans/design.md`. |
| `plans/004-api.md`         | 002 + Planning Phase 1 `team.yaml`      | `/api/team` route handlers wired through `Service` + `Repository`. `isDarkSide` stub returns `false` with a `TODO(006)`. Duplicate POST → 409. Sixth POST → 422 `TEAM_FULL`. Integration tests green. |
| `plans/005-client-kubb.md` | 003 + 004 + Planning Phase 1 `starwars.yaml`  | `pnpm --filter platform gen` produces `src/gen/team/` (types + client + `Zod`) and `src/gen/starwars/` (types + `Zod`). `store.ts` wires `starwarsApi` and `teamApi` into `<Providers>`.          |
| `plans/006-features.md`    | 005                                     | All UI requirements live: list, detail with prev/next, persistent `<TeamSidebar />`, `/team`, real `isDarkSide`, evil-Add disabled. Screens built from the 003 components. `Vitest` covers `isDarkSide` and key components. |
| `plans/007-testing.md`     | 006                                     | `Playwright` specs cover browse/team/cap/evil. CI runs `Postgres` service container, migrations, unit + integration + e2e. One `Changesets` entry.                                                |

## Complexity Tracking

| Item                                         | Justification                                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two `OpenAPI` specs instead of one           | The prompt mandates `Kubb`; without a spec for `akabab`, hand-written types would diverge from the generated team types. Cost: one extra `yaml` file. |
| `Drizzle` + `Postgres` for a single team row | The prompt explicitly requires the `DB` → `Repository` → `Service` → API layering. A simpler in-memory store would not satisfy that.                  |
| `packages/components` from day one           | The prompt asks for it. Initial cost is one placeholder export; real components arrive in Slice 006.                                                  |

## Progress Tracking

### Planning Phase 0 — Outline & Research

- [x] `plans/spec.md` — _done_ — user scenarios + FR-1..FR-7 + acceptance checklist
- [x] `plans/research.md` — _done_ — 6-row decisions table moved out of `plan.md`

### Planning Phase 1 — Design & Contracts

- [x] `plans/data-model.md` — _done_ — `TeamMember` columns + `Character` fields + invariants + `isDarkSide` rules
- [x] `plans/contracts/team.openapi.yaml` — _done_ — our team API spec (paths, error codes, and `TeamMember` schema from plan.md)
- [x] `plans/contracts/starwars.openapi.yaml` — _done_ — `akabab` spec inferred from samples (`/all.json`, `/id/{id}.json`, full `Character` schema)
- [x] `plans/quickstart.md` — _done_ — 6 user-flow scenarios mapped to AC-1..AC-9

### Planning Phase 2 — Slice files authored

- [x] `plans/001-setup.md` — _done_
- [x] `plans/002-database.md` — _done_
- [x] `plans/003-design.md` — _done_
- [ ] `plans/004-api.md` — _todo_
- [ ] `plans/005-client-kubb.md` — _todo_
- [ ] `plans/006-features.md` — _todo_
- [ ] `plans/007-testing.md` — _todo_

### Execution Slices (each ends in a demoable state)

- [ ] **001-setup** — _todo_ — depends on: — — `pnpm dev` boots MUI Next.js page; templates removed
- [ ] **002-database** — _todo_ — depends on: 001 — `db:migrate` creates `team_members`; repo CRUD integration-tested
- [ ] **003-design** — _todo_ — depends on: 001 — MUI theme tokens; `packages/components` shell (`<AppShell />`, `<TeamSidebar />` placeholder, `<CharacterCard />`, `<StatePanel />`); `/design` preview route
- [ ] **004-api** — _todo_ — depends on: 002, Planning Phase 1 team contract — `/api/team` handlers + Service + Repository; 409/422 paths green
- [ ] **005-client-kubb** — _todo_ — depends on: 003, 004, Planning Phase 1 starwars contract — `pnpm gen` emits `src/gen/`; RTK Query wired
- [ ] **006-features** — _todo_ — depends on: 005 — list, detail (prev/next), `<TeamSidebar />`, `/team`, real `isDarkSide`
- [ ] **007-testing** — _todo_ — depends on: 006 — Playwright e2e; CI runs Postgres + migrations + unit + integration + e2e

### Closeout

- [ ] Global verification — _todo_ — `quickstart.md` walked end-to-end against a clean checkout
- [ ] `Changesets` entry — _todo_
- [ ] `README.md` updated — _todo_ — tech stack, use cases, folder structure

## Evil rule (referenced from Planning Phase 1's `data-model.md` and Slice 006)

A character is evil if any of:

1. `name` contains "Darth" or "Sith" (case-insensitive).
2. A current `affiliation` mentions "Darth" or "Sith". `formerAffiliations` are ignored.
3. A `master` resolves to a name containing "Darth".

`src/lib/darkSide.ts` is the single implementation, imported by both the service guard and the UI.

## Open items to confirm during execution

- `akabab` images come from an external CDN; Slice 001 allows them via `next.config.ts` `images.remotePatterns`.
- `openapi/starwars.yaml` is inferred from sample `akabab` payloads. If reality diverges, the spec gets a follow-up and `pnpm gen` re-emits types.
- "Single shared team" means concurrent users overwrite each other. Last write wins; `RTK Query` tags drive invalidation.
