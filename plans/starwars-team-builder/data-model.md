# Data model: Whale Star Wars Team Builder

## Overview

```mermaid
erDiagram
  TEAM {
    uuid id PK "gen_random_uuid()"
    string slug UK "stable handle, e.g. 'default'"
    string name "human label"
    timestamptz createdAt "default now()"
  }
  TEAM_MEMBER {
    uuid id PK "gen_random_uuid()"
    uuid teamId FK "references TEAM.id"
    integer characterId "starwars-api Character.id"
    timestamptz addedAt "default now()"
  }
  CHARACTER {
    integer id PK "from starwars-api"
    string name
    string image
    number height
    number mass
    string_array affiliations
    string_array masters "names; may include parenthetical role suffix"
  }
  TEAM ||--o{ TEAM_MEMBER : "contains"
  TEAM_MEMBER }o..|| CHARACTER : "references by id (no FK; lives in starwars-api)"
```

The dotted line is the soft reference: `team_members.characterId` points at a `starwars-api` character, but there is no database foreign key because the character row lives outside our database. The service validates existence by fetching `/id/{id}.json` before insert.

For now the app operates against a single seeded **default team** (`slug = 'default'`). The `Team` table exists so the multi-team case is a future addition, not a schema migration. The service factory resolves the default team id during service construction (once per request) and threads it through. `(teamId, characterId)` is unique, so the same character can never appear twice in the same team. The five-member cap is per-team.

## `Team`

Persisted in Postgres via Drizzle. Defined in `apps/platform/src/db/schema.ts`.

| Column      | Type          | Default               | Notes                                                                          |
| ----------- | ------------- | --------------------- | ------------------------------------------------------------------------------ |
| `id`        | `uuid`        | `gen_random_uuid()`   | Primary key.                                                                   |
| `slug`      | `text`        | (none)                | Unique stable handle. The seed migration inserts `slug = 'default'`.           |
| `name`      | `text`        | (none)                | Human label, e.g. `"Default team"`.                                            |
| `createdAt` | `timestamptz` | `now()`               | Bookkeeping.                                                                   |

Indexes:

- `teams_slug_unique` on `slug`.

The Drizzle table name is `teams`. A single seed row (`slug = 'default'`) is inserted as part of the initial migration so the app always has somewhere to put members.

## `TeamMember`

Persisted in Postgres via Drizzle. Defined in `apps/platform/src/db/schema.ts`, the only file that imports `drizzle-orm/pg-core`.

| Column        | Type          | Default             | Notes                                                                              |
| ------------- | ------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | Primary key. App never reads this in business logic, but the API exposes it.        |
| `teamId`      | `uuid`        | (none)              | FK to `teams.id` with `ON DELETE CASCADE`. Always the default team for now.        |
| `characterId` | `integer`     | (none)              | Matches `starwars-api` `Character.id`. No FK (character lives outside our DB).            |
| `addedAt`     | `timestamptz` | `now()`             | Used for stable sort in `GET /api/team` (oldest first).                            |
| `deletedAt`   | `timestamptz` | `null`              | Soft-delete marker. `null` means active; a timestamp means the member was removed. Every read filters `deletedAt IS NULL`. |

Indexes:

- `team_members_team_id_character_id_active_unique` on `(teamId, characterId)` as a **partial unique index** with predicate `WHERE deleted_at IS NULL` (enforces the dedupe rule that surfaces as `409 ALREADY_MEMBER` only for active rows, so a previously-removed member can be re-added).
- `team_members_team_id_idx` on `teamId` (every list query filters by it).

`DELETE /api/team/{characterId}` is a soft delete: the row stays in the table with `deletedAt` set to `now()`. The API still returns `204` and the row is hidden from every read path. Re-adding the same character after removal is allowed; it inserts a new row rather than reviving the old one, so `addedAt` reflects the latest add.

The Drizzle table name is `team_members` (snake_case in SQL, camelCase in TS via the column mapping).

## `Character`

Read-only. The browser fetches characters from our own `/api/characters` and `/api/characters/{id}`; behind those routes the server proxies `starwars-api` (`/all.json`, `/id/{id}.json`) and reuses the same response for the server-side evil check.

Two Kubb-generated types, one per side of the proxy:

On the frontend, `Character` is generated from `plans/starwars-team-builder/contracts/api.openapi.yaml` alongside the documented `listCharacters` and `getCharacter` operations. Every browser-side component and the generated RTK Query endpoints import it from there.

On the server, the source-API shape is generated from `plans/starwars-team-builder/contracts/starwars.openapi.yaml`. Only the proxy fetcher touches it. The route handlers downconvert it to the frontend `Character` before responding.

Fields the app actually reads (identical on both sides of the proxy, the `starwars-api` just carries extra ones we drop):

| Field                | Type        | Used by                       |
| -------------------- | ----------- | ----------------------------- |
| `id`                 | `number`    | routing, `TeamMember.characterId`, list prev/next |
| `name`               | `string`    | list, detail header, `isDarkSide` rule 1 |
| `image`              | `string`    | list thumbnail, detail hero   |
| `height`             | `number`    | detail page                   |
| `mass`               | `number`    | detail page                   |
| `affiliations`       | `string[]`  | detail page, `isDarkSide` rule 2  |
| `masters`            | `string[]`  | `isDarkSide` rule 3. Names already (may carry a parenthetical role like `"Darth Sidious (Sith Master)"`); substring check still works. |

Other `starwars-api` fields are present on the server-side generated type but are stripped by the proxy before the response leaves the server. The UI does not invent fields the contract doesn't list.

## Invariants

| Invariant                                          | Enforced in                                | Surfaces as            |
| -------------------------------------------------- | ------------------------------------------ | ---------------------- |
| `count(team_members where teamId = :default and deletedAt is null) <= 5` | `TeamService.add()` wraps dup-check, cap-check, and `insert` in a single `db.transaction(...)` so two concurrent adds cannot both observe count = 4. Soft-deleted rows do not count. | `422 TEAM_FULL`        |
| `(teamId, characterId)` unique across active `team_members` | DB partial unique index `WHERE deleted_at IS NULL`, double-checked by service inside the same transaction. Soft-deleted rows are ignored so a removed character can be re-added. | `409 ALREADY_MEMBER`   |
| Default team row exists                            | Seeded by the initial migration; resolved by the service factory during construction (once per request) | request error if missing |
| Evil characters cannot be added                    | `TeamService.add()` calls `isDarkSide()` after fetching the character from `starwars-api` | `422 EVIL_FORBIDDEN`  |
| Character must exist in `starwars-api`                   | `TeamService.add()` fetches `/id/{id}.json` before the evil check | `404 NOT_FOUND` if `fetchCharacter` returns `null` (any non-200 from upstream) |

The five-member cap lives in the service, not as a DB check, so the failure surfaces as a typed API error rather than a generic constraint violation.

## Derived predicate: `isDarkSide(character)`

Single implementation at `apps/platform/src/lib/darkSide.ts`, imported by both `TeamService` (server guard) and the UI (Add button disable + tooltip). Pure, synchronous, no fetching inside.

Signature:

```ts
isDarkSide(character: Character): boolean
```

`character.masters` is already `string[]` on the source API (sometimes with a parenthetical role suffix like `"Darth Sidious (Sith Master)"`), so no id-to-name resolution is needed.

Three rules, OR'd together:

1. `character.name` contains `"Darth"` or `"Sith"` (case-insensitive).
2. Any entry in `character.affiliations` contains `"Darth"` or `"Sith"` (case-insensitive). The frontend `Character` does not carry `formerAffiliations` (stripped by the proxy), so a character who left the Sith is not currently evil.
3. Any entry in `character.masters` contains `"Darth"` (case-insensitive).
