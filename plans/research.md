# Research: Whale Star Wars Team Builder

The decisions we made during Phase 0, and the follow-ups that surfaced once Phase 1's OpenAPI contracts were drafted.

## Open questions

A few small calls still need to be made before slices 003 and 004 run. None block Phase 1 sign-off.

1. **Which `akabab` origin do we hit?** [plans/contracts/starwars.openapi.yaml](plans/contracts/starwars.openapi.yaml) lists two: GitHub Pages (`akabab.github.io/starwars-api/api`) and a pinned CDN mirror (`rawcdn.githack.com/akabab/starwars-api/0.2.1/api`). Pages is the source of truth but slower; the mirror is faster but pinned. Pick one for `RTK Query` `baseUrl` in slice 004.
2. **Optional fields in `Character`.** Only `id` and `name` are required; `image`, `height`, `mass`, `affiliations`, `masters` are all optional. The UI needs a sensible fallback for each (placeholder image, "Unknown" for stats, hide the affiliations list when empty). Tracked for slice 005.
3. **`isDarkSide` when fields are missing.** If `affiliations` or `masters` are absent, the rule short-circuits to "not evil". Confirm that's acceptable in slice 005 when wiring `src/lib/darkSide.ts`.

## Decisions (Phase 0)

The original six-row table from `plan.md` moves here verbatim.

| Question | Decision | Why |
| --- | --- | --- |
| Where does character data live? | Direct `akabab` calls from `RTK Query`. | The prompt doesn't ask us to own character data, and proxying it through Next would just add latency for no win. |
| Where does the team live? | `Postgres` via `Drizzle`. Single shared team, no auth. | This is a coding test, and one team is enough to exercise the `Repository` → `Service` layering the prompt explicitly wants. |
| What does `Kubb` generate? | Both APIs. `team.yaml` → types + client + Zod. `starwars.yaml` → types + Zod (no client). | The prompt mandates Kubb. We skip Kubb's client for `starwars` because `RTK Query` is already doing the fetching there. |
| Which Next.js router? | App Router. | It's the current default, and it's what `AppRouterCacheProvider` needs for MUI v7. |
| Where does the app live? | `apps/platform`, with shared bits in `packages/components`. | Spelled out in the prompt. |
| What about the template scaffolding? | Delete `packages/core` and `packages/demo`. | They're stand-ins from the monorepo starter and we're not using them. |

## Decisions (Phase 1, captured while writing the contracts)

These came out of authoring [plans/contracts/team.openapi.yaml](plans/contracts/team.openapi.yaml) and [plans/contracts/starwars.openapi.yaml](plans/contracts/starwars.openapi.yaml).

| Question | Decision | Why |
| --- | --- | --- |
| What's the error shape on `/api/team`? | `{ code, message }` envelope with `code` enum `NOT_FOUND` / `ALREADY_MEMBER` / `TEAM_FULL` / `EVIL_FORBIDDEN`. HTTP status narrows the set. | Machine-readable codes let `RTK Query` surface the right UI message; the enum gives Zod a clean discriminated union and keeps the service exhaustive. |
| What HTTP status does each rule fail with? | `404` upstream miss, `409` already-member, `422` team-full / evil. | `409` matches the "conflict with existing resource state" pattern; `422` matches "well-formed but violates a business rule". Distinct codes mean the UI can branch without parsing the message. |
| Is `DELETE /api/team/{characterId}` idempotent? | Yes. Returns `204` whether or not the row existed. | Removes a race where two tabs both remove the same member; the second one should not error. The service treats "not present" as success. |
| What identifier does the delete path use? | The upstream `characterId`, not the internal `TeamMember.id` UUID. | The client already has the character id from the detail page; making it the URL key avoids a round-trip to look up the row's UUID. |
| How do we treat `akabab` non-200 responses? | Treat any non-200 as "not found" / unavailable. | The GitHub Pages origin returns its default HTML 404 page on missing ids, so we cannot rely on a JSON error body. The service's "character exists" check just looks at the status code. |
| Which fields does `isDarkSide` read on the server? | `name`, current `affiliations`, and `masters`. `formerAffiliations` is read but ignored. | Matches the prompt's three-rule definition exactly, and means the service can fetch `GET /id/{id}.json` once and reuse the payload for both the existence check and the evil check. |
| Where does the `Character` schema live for the UI? | Generated from `starwars.openapi.yaml` by Kubb. | Single source of truth. Hand-written types would drift from the upstream payload, and Zod gives us runtime parsing for the `RTK Query` `transformResponse`. |

## What this means for the later slices

- **001** scaffolds `apps/platform` (Next.js + MUI v7 + App Router), removes the stub packages, drops in a `packages/components` placeholder, and whitelists `akabab`'s image host in `next.config.ts`.
- **002** brings up Postgres 17 + Drizzle with the `pg` driver. `team_members` is the only table; everything else lives in `akabab`.
- **003** keeps the route handlers thin. The cap of five and the evil guard belong in `TeamService`. `Drizzle` only gets imported inside `TeamMemberRepository`; that's the rule. The handler maps service errors to the four `code` values above, and the `DELETE` handler always returns 204.
- **004** runs two Kubb pipelines off `plans/contracts/*.yaml`. `RTK Query` does the HTTP for both APIs, picking one `akabab` origin (see open question 1). The team API client is the Kubb-generated one; the starwars side uses Kubb only for types + Zod.
- **005** wires `src/lib/darkSide.ts` from a single source. UI components import it for the `Add`-disabled tooltip, and the service imports the same function for the server-side guard, so they cannot drift. Optional-field fallbacks (open questions 2 and 3) get implemented here.
