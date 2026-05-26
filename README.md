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
- Docker

## Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start the Next.js dev server (apps/platform)
pnpm build           # Build all workspaces
pnpm start           # Run the built apps/platform (next start)
pnpm test            # Run tests (requires `docker compose up -d postgres`)
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
