# Specification: Whale Star Wars Team Builder

This is the Phase 0 spec. It captures what we're building before any code lands, so the slice files can stay focused on the "how".

## What it does

You land on the home page and see a list of Star Wars characters pulled live from `akabab`. Click one and you're on its detail page (name, image, height, mass, affiliations) with `Prev` and `Next` to walk through the roster without going back to the list.

From any detail page you can add the character to your team or kick them out. The team is shared (no auth, single team), persists in Postgres, and is visible everywhere through a sidebar. There's also a `/team` page if you'd rather manage it from one screen.

Two rules the team has to obey: max five members, and nobody evil. Both are enforced on the server in `TeamService`, and the UI reflects them. The `Add` button is disabled (with a tooltip) for evil characters, and a sixth add gets a clear error back.

## User scenarios

1. **Browse characters**. A visitor lands on `/` and sees a list of Star Wars characters fetched from `akabab`. Each item shows enough to identify the character (name + image) and links to a detail page.
2. **View a character**. From the list, the visitor opens `/characters/[id]`. The page shows `name`, `image`, `height`, `mass`, and `affiliations`.
3. **Navigate between characters**. On the detail page, `Prev` and `Next` buttons move to the adjacent character in the list without going back to `/`.
4. **Add or remove from the team**. On the detail page, the visitor adds the character to the team or removes them. Evil characters cannot be added; the `Add` button is disabled with a tooltip explaining why.
5. **See the team from anywhere**. A persistent `<TeamSidebar />` shows the current team on every page. Each entry has a remove control.
6. **Manage the team at `/team`**. The team page lists the current team members and lets the visitor remove any of them.
7. **Team cap of 5**. Attempting to add a sixth member is refused with a clear error.

## Functional requirements

One per requirement bullet from `prompt.md`. Each one is something we can write a test for.

- **FR-1** The home page (`/`) lists characters from `akabab`'s `GET /all.json`.
- **FR-2** Every character has its own detail page at `/characters/[id]`.
- **FR-3** That detail page shows the character's name, image, height, mass, and affiliations.
- **FR-4** `Prev` and `Next` on the detail page move along the list order, with no detour through `/`.
- **FR-5** The detail page can add the character to the team or remove them. Both go through `/api/team` and persist in Postgres.
- **FR-6** `/team` lists the team and lets you remove members. The `<TeamSidebar />` shows the same on every page.
- **FR-7** Five-member cap and the evil ban. "Evil" follows the three rules in `src/lib/darkSide.ts`. Both rules live in `TeamService` on the server, with the UI mirroring them (`Add` disabled with a tooltip, sixth-add rejected).

## Key entities

- **`Character`**: comes from `akabab`, read-only. The UI uses `id`, `name`, `image`, `height`, `mass`, `affiliations`. The server's `isDarkSide` also looks at `masters` (and deliberately ignores `formerAffiliations`).
- **`TeamMember`**: ours, writable. `id uuid pk`, `characterId int unique`, `addedAt timestamptz default now`. Invariant: at most five rows, enforced in the service (not as a DB check, since the message needs to surface as a typed API error).

## Acceptance checklist

One row per requirement bullet in `prompt.md`. Each maps to a numbered scenario in `quickstart.md`.

- [ ] **AC-1** `/` renders the character list from `akabab`. → quickstart §1
- [ ] **AC-2** Every character has a reachable detail page at `/characters/[id]`. → quickstart §2
- [ ] **AC-3** The detail page shows name, image, height, mass, and affiliations. → quickstart §2
- [ ] **AC-4** `Prev` / `Next` on the detail page walk the list order. → quickstart §3
- [ ] **AC-5** Add and remove from the detail page hit `/api/team` and stick. → quickstart §4
- [ ] **AC-6** `/team` lists the team and lets you remove members. → quickstart §5
- [ ] **AC-7** The team is visible and manageable from every page (sidebar). → quickstart §5
- [ ] **AC-8** Sixth add is refused. Server returns `422 TEAM_FULL`, UI shows the error. → quickstart §6
- [ ] **AC-9** Evil characters can't be added; their `Add` is disabled with a tooltip (Vader is the obvious test). → quickstart §6
