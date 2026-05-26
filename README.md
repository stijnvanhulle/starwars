<div align="center">

  <h1>Template</h1>

  <p>
    A modern TypeScript monorepo template — pnpm workspaces, Turborepo, oxlint, oxfmt, tsdown, Vitest and Changesets.
  </p>

  <h4>
    <a href="https://github.com/stijnvanhulle/template/issues/">Report Bug</a>
    <span> · </span>
    <a href="https://github.com/stijnvanhulle/template/issues/">Request Feature</a>
  </h4>
</div>

<br />

## About

A drop-in monorepo starter. Fork it, rename a few fields, and you have a
production-ready repository with build, test, lint, format, release and CI
already wired up.

## Exercise log

Time spent on the Whale Star Wars team-builder exercise, by phase.

| Phase | Output | Time  |
|---|---|-------|
| Planning | `plans/starwars-team-builder/plan.md`, `plans/starwars-team-builder/spec.md`, `plans/starwars-team-builder/research.md`, `plans/starwars-team-builder/contracts/*.yaml`, six slice files | TBD   |
| Implementation | Slices 001 to 005 (Next.js + MUI shell, Postgres + Drizzle, `/api/team`, Kubb-generated clients, features) | _TBD_ |
| Testing | Slice 006 (Vitest unit + integration, Playwright e2e, CI Postgres service) | _TBD_ |

## What's inside

| Tool | Purpose |
|---|---|
| [pnpm](https://pnpm.io/) | Workspaces + dependency catalog |
| [Turborepo](https://turbo.build/) | Monorepo task runner |
| [tsdown](https://github.com/sxzz/tsdown) | Bundler + `.d.ts` generation |
| [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Linter (Rust-based) |
| [oxfmt](https://github.com/oxc-project/oxfmt) | Formatter (Rust-based) |
| [Vitest](https://vitest.dev/) | Test runner |
| [Kubb](https://kubb.dev/) | OpenAPI → TypeScript types, RTK-ready client, and Zod schemas |
| [Redux Toolkit + RTK Query](https://redux-toolkit.js.org/usage/nextjs) | Single per-request store, [App Router pattern](https://redux-toolkit.js.org/usage/nextjs) |
| [CSpell](https://cspell.org/) | Spell checker |
| [Changesets](https://github.com/changesets/changesets) | Versioning + changelogs |
| [GitHub Actions](https://github.com/features/actions) | CI/CD |
| [taze](https://github.com/antfu-collective/taze) | Dependency upgrades |

## Layout

```
.
├── .changeset/             # Changeset configuration
├── .claude/                # Claude Code workspace config
├── .github/
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   ├── setup/              # Reusable setup composite action
│   └── workflows/          # pr.yml, release.yml, etc.
├── .agents/skills/         # Cross-provider skills (humanizer, jsdoc, pr...)
├── apps/
│   └── platform/           # Next.js 16 + MUI v9 app (Star Wars team builder)
│       ├── kubb.config.ts  # Two pipelines: api/ (frontend) + starwars/ (server-only)
│       ├── openapi/        # Mirrored OpenAPI contracts (do not edit, sync from plans/)
│       └── src/
│           ├── gen/        # Kubb output (gitignored) + fetchClient.ts seam (checked in)
│           └── store/      # Redux store: makeStore, api slice, Providers
├── configs/                # Shared TS bases + vitest config
├── internals/utils/        # Internal, non-published helpers
├── packages/
│   └── components/         # Shared UI components, built with tsdown
├── plans/starwars-team-builder/  # Spec, plan, slices, verification
├── docker-compose.yml      # Postgres 17 for local dev + tests
├── oxfmt.config.ts
├── oxlint.config.ts
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── turbo.json
```

## Prerequisites

- Node.js `>= 22`
- pnpm `>= 11`
- Docker (only for the dev/prod database; `pnpm test` runs against pglite in-process)

## Commands

```bash
pnpm install         # Install dependencies
pnpm gen             # Regenerate Kubb clients (types + RTK-ready fns + Zod) into apps/platform/src/gen/
pnpm dev             # Start the Next.js dev server (apps/platform)
pnpm build           # Build all workspaces (auto-runs `pnpm gen` via the platform's prebuild hook)
pnpm start           # Run the built apps/platform (next start)
pnpm test            # Run tests (uses pglite in-memory; no Docker needed)
pnpm test:watch      # Vitest watch mode (root config)
pnpm test:bench      # Run benchmarks
pnpm test:e2e        # Playwright (apps/platform; specs land in slice 007)
pnpm lint            # Lint with oxlint
pnpm lint:fix        # Lint + auto-fix
pnpm lint:spell      # Spell check
pnpm format          # Format with oxfmt
pnpm typecheck       # Type-check all workspaces
pnpm changeset       # Create a changeset
pnpm clean           # Clean build artifacts
pnpm upgrade         # Bump dependencies to latest (via taze)
```

Postgres-backed commands live in `apps/platform`:

```bash
docker compose up -d postgres                                  # Start Postgres on :5432
pnpm --filter @stijnvanhulle/platform run db:migrate           # Apply migrations
pnpm --filter @stijnvanhulle/platform run db:generate          # Generate a new migration from schema.ts
pnpm --filter @stijnvanhulle/platform run db:studio            # Drizzle Studio
```

## Codegen (Kubb)

Two pipelines, configured in [apps/platform/kubb.config.ts](apps/platform/kubb.config.ts):

- **api** reads `apps/platform/openapi/api.yaml` and emits types + a Kubb client + Zod into `apps/platform/src/gen/api/`. This is the only generated bundle the browser imports; the RTK Query slice in `apps/platform/src/store/api.ts` is built on top of it.
- **starwars** reads `apps/platform/openapi/starwars.yaml` and emits types + Zod into `apps/platform/src/gen/starwars/`. Server-only: an oxlint rule forbids importing `@/gen/starwars` outside `src/server/**` and `src/lib/darkSide.ts`.

Both generated directories are gitignored and rebuilt by `pnpm gen`. The platform's `prebuild` hook runs `pnpm gen` automatically, so CI builds never read stale generated code. The fetch seam at [apps/platform/src/gen/fetchClient.ts](apps/platform/src/gen/fetchClient.ts) is checked in (the generated clients import it) and is the place to add tracing, retries, or auth without re-generating.

## State (Redux Toolkit + RTK Query)

One store, one slice, one cache. Everything lives under [apps/platform/src/store/](apps/platform/src/store/).

### Files

- [api.ts](apps/platform/src/store/api.ts) defines the single RTK Query slice (`reducerPath: 'api'`, `baseUrl: '/api'`). Each endpoint uses generated types from `@/gen/api` (`Character`, `TeamMember`, `AddTeamMemberRequest`, `RemoveTeamMemberPathCharacterId`). The `team` tag is the only cache key: `getTeam` provides it, `addTeamMember` and `removeTeamMember` invalidate it, so the sidebar refetches automatically after a mutation. The slice exports the generated React hooks (`useListCharactersQuery`, `useGetCharacterQuery`, `useGetTeamQuery`, `useAddTeamMemberMutation`, `useRemoveTeamMemberMutation`) and those are the only Redux entry points UI code uses.
- [store.ts](apps/platform/src/store/store.ts) exports a `makeStore` factory (not a singleton) that wires the `api` reducer and middleware, plus derived `AppStore` / `RootState` / `AppDispatch` types. Typed `useAppDispatch` / `useAppSelector` are intentionally not exported; add them when a second slice needs them.
- [Providers.tsx](apps/platform/src/store/Providers.tsx) is the `'use client'` boundary. It calls `makeStore()` once per render tree behind a `useRef`, then wraps `children` in `<ReduxProvider store={storeRef.current}>`. The factory + ref pattern follows the App Router guide at https://redux-toolkit.js.org/usage/nextjs so the server never shares a store across requests.
- [app/providers.tsx](apps/platform/src/app/providers.tsx) nests the chain used by the root layout: `<AppRouterCacheProvider>` → `<ThemeProvider>` → `<CssBaseline />` → `<StoreProviders>` → `{children}`.

### Request flow

A component calls a generated hook, the slice issues a `fetch` against `/api/*`, the Next.js route handler talks to Postgres or the proxied starwars-api, and the response lands in the RTK Query cache. Cache reads are deduped per key; mutations invalidate the `team` tag, which schedules a `getTeam` refetch for any mounted subscriber.

### Why this shape

One slice means one `reducerPath`, one middleware, one cache. The generated types in `@/gen/api` are the single source of truth for request and response shapes, so a contract change surfaces as a typecheck failure rather than a runtime bug. The per-request store means a server render that bootstraps state for one user never leaks it into the next request.

## Releasing

This template uses [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset             # Add a changeset entry describing the change
git commit -am "feat: ..."
git push
```

The `release.yml` workflow opens a "Version Packages" PR on `main`. Merging
that PR publishes the affected packages to npm with provenance.

For pre-release tags (canary/alpha/beta/rc) see `pnpm version:canary` and
`pnpm release:canary`.

## Upgrading dependencies

```bash
pnpm upgrade && pnpm install
```

The `upgrade` script runs [taze](https://github.com/antfu-collective/taze)
with `--maturity-period 3` so new releases need at least 3 days of soak
time before being adopted.

## License

[MIT](./LICENSE) © Stijn Van Hulle
