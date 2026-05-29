<div align="center">

  <h1>Star Wars Team Builder</h1>

  <p>
    A Next.js app to assemble a team of up to five Star Wars characters, with no dark-side members allowed.
  </p>
</div>

<br />

## How it works

A character counts as evil when their name contains "Darth" or "Sith", when any
non-former affiliation mentions "Darth" or "Sith", or when any master is named
"Darth".

Character data comes from the public Star Wars API at
https://akabab.github.io/starwars-api/. The browser never calls it directly. The
Next.js server proxies it (see
[apps/platform/src/server/starwars-api.ts](apps/platform/src/server/starwars-api.ts)).

A visitor lands on the character grid, paginated 24 per page. They open a detail
page, walk the roster with prev and next, and add or remove characters through
the team sidebar that appears on every page. The team caps at five active
members and refuses a sixth with an inline error. Evil characters are blocked at
the server, and the UI disables their add button with a tooltip that explains
why.

## Features

Each feature maps to where it lives in the code.

| Feature | Where it is met |
| --- | --- |
| List of characters | Grid route [app/characters/page.tsx](apps/platform/src/app/characters/page.tsx) with [CharacterList](apps/platform/src/features/characters/CharacterList.tsx) |
| Detail page per character | [app/characters/[id]/page.tsx](apps/platform/src/app/characters/%5Bid%5D/page.tsx) with [CharacterDetail](apps/platform/src/features/characters/CharacterDetail.tsx) |
| Basic info (name, image, height, mass, affiliations) | [CharacterDetail.tsx](apps/platform/src/features/characters/CharacterDetail.tsx) |
| Prev and next navigation on detail | [useCharacterNavigation.ts](apps/platform/src/features/characters/useCharacterNavigation.ts) |
| Add and remove from the detail page | [useTeamMembership.ts](apps/platform/src/features/characters/useTeamMembership.ts) |
| Team page with remove controls | [app/team/page.tsx](apps/platform/src/app/team/page.tsx) with [TeamContainer](apps/platform/src/features/team/TeamContainer.tsx) |
| See and manage the team from every page | [TeamSidebar](apps/platform/src/features/team/TeamSidebar.tsx), mounted in the app shell |
| Maximum of five members | `TEAM_CAP` in [constants.ts](apps/platform/src/constants.ts), enforced in [teamService.ts](apps/platform/src/server/services/teamService.ts) (returns 422 `TEAM_FULL`) |
| No evil members | [darkSide.ts](apps/platform/src/lib/darkSide.ts), enforced in [teamService.ts](apps/platform/src/server/services/teamService.ts) (returns 422 `EVIL_FORBIDDEN`) |

Additional features:

| Feature | Where it is met |
| --- | --- |
| Pagination for the main list | [useCharacterListPagination.ts](apps/platform/src/features/characters/useCharacterListPagination.ts) |
| Tests for components and business logic | Vitest unit and integration specs across `src/**`, plus Playwright e2e in [apps/platform/e2e](apps/platform/e2e) |
| MaterialUI theming | MUI v9 theme wired through [app/providers.tsx](apps/platform/src/app/providers.tsx) |
| Linting and formatting | oxlint and oxfmt, run via `pnpm lint` and `pnpm format` |

## Tech stack

- TypeScript on Node 22, ESM only.
- Next.js 16 App Router, React 19, MUI v9 for the UI.
- Redux Toolkit with one RTK Query slice for fetching, plus a bookmarks slice persisted to `localStorage`.
- Kubb for OpenAPI to types, client, and Zod (two pipelines: `api` for the browser, `starwars` for the server).
- Postgres 17 via `drizzle-orm` with the `pg` driver, and `drizzle-kit` for schema and migrations.
- Vitest for unit and integration (pglite, no Docker), Playwright for e2e against a built app.
- pnpm workspaces, Turborepo, oxlint and oxfmt.

## Getting started

You need Node.js 22 or newer, pnpm 11 or newer, and Docker for Postgres. The
test suite uses pglite in-process, so it needs no Docker.

1. Install dependencies.

   ```bash
   pnpm install
   ```

2. Start Postgres in the background. This runs Postgres 17 on `localhost:5432`
   with the credentials in [docker-compose.yml](docker-compose.yml).

   ```bash
   docker compose up -d postgres
   ```

3. Apply migrations.

   ```bash
   turbo run db:migrate
   ```

4. Generate the API clients. The platform's `prebuild` hook runs this before
   `pnpm build`, but `pnpm dev` does not, so run it once after a fresh clone or
   whenever `openapi/*.yaml` changes.

   ```bash
   pnpm gen
   ```

5. Start the dev server and open http://localhost:3000.

   ```bash
   pnpm dev
   ```

To browse the database, open Drizzle Studio with `turbo run db:studio`.

Run the checks with `pnpm test`, `pnpm typecheck`, `pnpm lint`, and
`pnpm format`. For the full feature walk-through and acceptance scenarios see
[plans/starwars-team-builder/verification.md](plans/starwars-team-builder/verification.md).

## Project structure

```text
apps/platform/
  src/
    app/                  # App Router pages and api/**/route.ts handlers
    features/             # characters, team, bookmarks, shell (container + presenter pairs)
    store/                # Redux: RTK Query api slice, bookmarks slice, Providers
    server/
      repositories/       # Drizzle reads and writes
      services/           # team rules: cap of five, evil guard
      starwars-api.ts     # upstream proxy fetcher
    db/                   # schema, client, migrations
    gen/                  # Kubb output (gitignored, run pnpm gen)
    lib/                  # darkSide, pagination, apiError
  e2e/                    # Playwright specs and fixtures
packages/components/      # Shared MUI components, built with tsdown
plans/starwars-team-builder/  # prompt, spec, plan, slices, verification
```

## Development log

| Phase                                     | Time |
|-------------------------------------------|------|
| Planning (through advanced planning mode) | 3h   |
| Implementation (single agent)             | 3h   |
| Testing (automated and manual)            | 1h   |

## License

[MIT](./LICENSE) © Stijn Van Hulle
