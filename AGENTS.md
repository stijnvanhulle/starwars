# AGENTS.md

A Star Wars team-builder app built as a Next.js monorepo (pnpm workspaces, Turborepo, oxlint, oxfmt, tsdown, Vitest, Playwright, and Changesets).

## Repository setup

| Aspect | Choice |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Module system | ESM-only (`type: "module"`) |
| Node version | 22 |
| Package manager | pnpm 11+ |
| Linter | oxlint |
| Formatter | oxfmt |
| Bundler | tsdown |
| Tests | Vitest (unit + integration), Playwright (e2e) |
| Versioning | Changesets |
| CI/CD | GitHub Actions |

## Workspace layout

| Path | Purpose |
| --- | --- |
| `apps/platform` | Next.js 16 app (App Router, MUI v9, RTK Query, Drizzle + Postgres) |
| `packages/components` | Shared React component library used by `apps/platform` |
| `configs/` | Shared tooling configs (TypeScript, Vitest, etc.) |

`packages/core` and `packages/demo` were removed in slice 001 and are gone.

## Commands

```bash
pnpm install                                           # Install dependencies
pnpm dev                                               # Start the Next.js dev server at localhost:3000
pnpm build                                             # Build all packages
pnpm test                                              # Run Vitest unit + integration tests
pnpm typecheck                                         # Type-check all packages
pnpm lint                                              # Lint with oxlint
pnpm format                                            # Format with oxfmt
pnpm changeset                                         # Add a changelog entry

# Workspace tasks routed through Turbo
turbo run db:migrate                                   # Apply Drizzle migrations (requires Docker Postgres)
turbo run db:generate                                  # Generate a new Drizzle migration from schema changes
turbo run db:studio                                    # Open Drizzle Studio
turbo run gen                                          # Re-run Kubb codegen (both api + starwars pipelines)
turbo run test:e2e --filter=@whale/platform            # Run Playwright e2e tests (requires built app + Postgres)
```

## Architecture notes

### Drizzle stays in repositories

`drizzle-orm` imports are only allowed inside `apps/platform/src/db/**` (schema + client) and
`apps/platform/src/server/repositories/**`. Services, route handlers, components, and tests
never import Drizzle directly. They go through the repository layer.

### Kubb codegen

`turbo run gen` runs two pipelines defined in `apps/platform/kubb.config.ts`:

- `openapi/api.yaml` (frontend contract) → `src/gen/api/` (types + client + Zod). This is the
  only source the browser and RTK Query use.
- `openapi/starwars.yaml` (server-only) → `src/gen/starwars/` (types + Zod, no client). Used
  only by the server-side proxy fetcher.

After any change to either `openapi/*.yaml`, re-run `turbo run gen` before typechecking.

## Commits and PRs

Use [Conventional Commits](https://www.conventionalcommits.org/). Before a PR, run
`pnpm format && pnpm lint && pnpm typecheck && pnpm test`, and add a changeset
(`pnpm changeset`) for any published-package change.

## How agents read this repo

`AGENTS.md` is the canonical instruction file. Local skills live in `.agents/skills/` (open
`SKILL.md` format, cross-provider). Shared skills, convention rules, `/create-pr`,
`/create-changeset`, `/create-branch`, `/create-issue`, the `code-reviewer` subagent, and the
`house` output style come from the `agents` plugin
([stijnvanhulle/agents](https://github.com/stijnvanhulle/agents)). Claude Code loads it from
this repo's `.claude/settings.json`. Install `agents@stijnvanhulle` for Cursor and Codex.
Repo-specific `/spec`, `/plan`, `/implement`, and `/verify` commands stay here.

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [next-best-practices](.agents/skills/next-best-practices/SKILL.md) - Next.js best practices, file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling.
- [spec-driven](.agents/skills/spec-driven/SKILL.md) - Drive a spec-driven workflow for a larger feature: specify requirements and acceptance criteria, research decisions, plan numbered slices, implement, then verify. Use for multi-step features that need a reviewable paper trail. Skip it for small, obvious changes.
</skills>
