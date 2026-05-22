# Research: Whale Star Wars Team Builder

The decisions we made during Phase 0, and the follow-ups that surfaced once Phase 1's OpenAPI contracts were drafted.

## Open questions

A few small calls still need to be made before slices 003 and 004 run. None block Phase 1 sign-off.

1. **Which `starwars-api` origin does the proxy hit?** [plans/contracts/starwars.openapi.yaml](plans/contracts/starwars.openapi.yaml) lists two: GitHub Pages (`akabab.github.io/starwars-api/api`) and a pinned CDN mirror (`rawcdn.githack.com/akabab/starwars-api/0.2.1/api`). Pages is the source of truth but slower; the mirror is faster but pinned. Pick one for the **server-side** fetcher's base URL in slice 004. The browser is unaffected.
2. **Optional fields in `Character`.** Only `id` and `name` are required; `image`, `height`, `mass`, `affiliations`, `masters` are all optional. The UI needs a sensible fallback for each (placeholder image, "Unknown" for stats, hide the affiliations list when empty). Tracked for slice 005.
3. **`isDarkSide` when fields are missing.** If `affiliations` or `masters` are absent, the rule short-circuits to "not evil". Confirm that's acceptable in slice 005 when wiring `src/lib/darkSide.ts`.

## Decisions (Phase 0)

The original six-row table from `plan.md` moves here verbatim.

| Question | Decision | Why |
| --- | --- | --- |
| Where does character data live? | `starwars-api` `starwars-api`, fetched server-side and re-served via `/api/characters` and `/api/characters/{id}`. The browser only talks to `/api/*`. | Keeps the frontend on a single contract and client, lets us cache and rate-limit centrally, hides the `starwars-api` URL from the browser, and avoids a second `RTK Query` slice. The small added latency is acceptable for a single shared deployment. |
| Are the proxy routes part of the contract? | Yes. `api.openapi.yaml` documents `/api/characters`, `/api/characters/{id}`, and the team paths. | Documenting the proxy means the frontend gets a fully generated client and Zod for everything it calls, and never needs to import the source-API contract. The cost is that proxy-shape changes are contract changes, which is acceptable for a small, single-owner app. |
| Where does the team live? | `Postgres` via `Drizzle`. Single shared team, no auth. | This is a coding test, and one team is enough to exercise the `Repository` → `Service` layering the prompt explicitly wants. |
| One team or a `teams` table? | Two tables: `teams` (seeded with `slug = 'default'`) and `team_members` (FK → `teams.id`, composite unique on `(teamId, characterId)`). | A dedicated `Team` row costs one extra table and one seed migration, but it means the multi-team case is a future feature, not a schema rewrite. `TeamMember` ownership becomes explicit instead of implicit, and the cap is naturally per-team. |
| What does `Kubb` generate? | Two pipelines. `api.yaml` (the only frontend contract) → types + client + Zod. `starwars.yaml` (server-only) → types + Zod (no client). | The prompt mandates Kubb. The frontend gets one client and one Zod set; the `starwars-api` pipeline exists so the proxy fetcher is typed without hand-rolled interfaces. |
| Which Next.js router? | App Router. | It's the current default, and it's what `AppRouterCacheProvider` needs for MUI v9. |
| Where does the app live? | `apps/platform`, with shared bits in `packages/components`. | Spelled out in the prompt. |
| What about the template scaffolding? | Delete `packages/core` and `packages/demo`. | They're stand-ins from the monorepo starter and we're not using them. |

## Decisions (Phase 1, captured while writing the contracts)

These came out of authoring [plans/contracts/api.openapi.yaml](plans/contracts/api.openapi.yaml) and [plans/contracts/starwars.openapi.yaml](plans/contracts/starwars.openapi.yaml).

| Question | Decision | Why |
| --- | --- | --- |
| What's the error shape on `/api/team`? | `{ code, message }` envelope with `code` enum `NOT_FOUND` / `ALREADY_MEMBER` / `TEAM_FULL` / `EVIL_FORBIDDEN`. HTTP status narrows the set. | Machine-readable codes let `RTK Query` surface the right UI message; the enum gives Zod a clean discriminated union and keeps the service exhaustive. |
| What HTTP status does each rule fail with? | `404` `starwars-api` miss, `409` already-member, `422` team-full / evil. | `409` matches the "conflict with existing resource state" pattern; `422` matches "well-formed but violates a business rule". Distinct codes mean the UI can branch without parsing the message. |
| Is `DELETE /api/team/{characterId}` idempotent? | Yes. Returns `204` whether or not the row existed. | Removes a race where two tabs both remove the same member; the second one should not error. The service treats "not present" as success. |
| What identifier does the delete path use? | The `starwars-api` `characterId`, not the internal `TeamMember.id` UUID. | The client already has the character id from the detail page; making it the URL key avoids a round-trip to look up the row's UUID. |
| How do we treat `starwars-api` non-200 responses? | Treat any non-200 as "not found" / unavailable. | The GitHub Pages origin returns its default HTML 404 page on missing ids, so we cannot rely on a JSON error body. The service's "character exists" check just looks at the status code. |
| Which fields does `isDarkSide` read on the server? | `name`, current `affiliations`, and `masters`. `formerAffiliations` is read but ignored. | Matches the prompt's three-rule definition exactly, and means the service can fetch `GET /id/{id}.json` once and reuse the payload for both the existence check and the evil check. |
| Where does the `Character` schema live for the UI? | Generated from `starwars.openapi.yaml` by Kubb. | Single source of truth. Hand-written types would drift from the `starwars-api` payload, and Zod gives us runtime parsing for the `RTK Query` `transformResponse`. |

## What this means for the later slices

- **001** scaffolds `apps/platform` (Next.js + MUI v9 + App Router), removes the stub packages, drops in a `packages/components` placeholder, and whitelists the `starwars-api` image CDN host in `next.config.ts` (images are still served from the CDN; only data goes through the proxy).
- **002** brings up Postgres 17 + Drizzle with the `pg` driver. `teams` (seeded) and `team_members` are the only tables; character data lives in `starwars-api`.
- **004** lands both API surfaces. `/api/characters` and `/api/characters/{id}` are thin proxies that call the server-only `starwars-api` fetcher (picking one `starwars-api` origin, see open question 1). `/api/team` goes through `TeamService` + repositories. `Drizzle` only gets imported inside the repositories. Handlers map service errors to the contract's `code` values and the team `DELETE` handler always returns 204.
- **005** runs two Kubb pipelines off `plans/contracts/*.yaml`. Frontend pipeline (`api.yaml`) emits types + client + Zod that the single `api` RTK Query slice consumes. Server-only pipeline (`starwars.yaml`) emits types + Zod used by the proxy fetcher and the master-resolution helper.
- **006** wires `src/lib/darkSide.ts` from a single source. UI components import it for the `Add`-disabled tooltip, and the service imports the same function for the server-side guard, so they cannot drift. Optional-field fallbacks (open questions 2 and 3) get implemented here.
