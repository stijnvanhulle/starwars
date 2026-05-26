# Verification: Whale Star Wars Team Builder

End-to-end walkthrough used at closeout to confirm the app meets the acceptance checklist in `spec.md`. Each numbered scenario maps to one or more `AC-N` rows. Speckit conventionally names this file `quickstart.md`; we renamed it to match the role it actually plays here.

## Prerequisites

- Node 22, pnpm 11+
- Docker (for the Postgres container)
- Playwright browsers installed (`pnpm --filter platform exec playwright install`)

Boot the app once before walking the scenarios:

```bash
pnpm install
docker compose up -d postgres
pnpm --filter platform db:migrate
pnpm --filter platform gen
pnpm dev
```

The app is at `http://localhost:3000`.

## Scenario 1: list loads at `/`

Covers **AC-1**.

1. Open `http://localhost:3000/`.
2. The page shows a grid of Star Wars characters. Each card has a name and an image.
3. Network panel confirms one request to `/api/characters` and **zero** requests to `akabab.github.io` or any other `starwars-api` host. The character data is proxied server-side.

Pass when: the list is non-empty and every visible card has a name + image.

## Scenario 2: detail page shows name, image, height, mass, affiliations

Covers **AC-2** and **AC-3**.

1. From `/`, click any character (e.g. Luke Skywalker).
2. URL becomes `/characters/[id]`.
3. The page renders, in this order: name, image, height, mass, affiliations (as a list of chips or comma-separated text, the exact widget is up to Slice 006).

Pass when: all five fields are visible and match the values returned by `GET /api/characters/{id}` for that character. The browser does not call the `starwars-api` `/id/{id}.json` directly.

## Scenario 3: prev and next navigate the list

Covers **AC-4**.

1. From `/`, open the third character in the list.
2. Click `Next`. URL changes to the fourth character; page rerenders without a full reload to `/`.
3. Click `Prev` twice. URL ends up on the second character.
4. `Prev` on the first character and `Next` on the last are either disabled or wrap; the choice is up to Slice 006 as long as it's consistent.

Pass when: prev/next walk the same order as the list on `/`, and the browser history holds one entry per character (back button works).

## Scenario 4: add and remove from the detail page

Covers **AC-5**.

1. On a non-evil character's detail page (e.g. Luke), click `Add to team`.
2. A `POST /api/team` is sent; the button flips to `Remove from team`.
3. The sidebar (Scenario 5) now contains Luke.
4. Click `Remove from team`. A `DELETE /api/team/{characterId}` is sent; the button flips back to `Add to team`.

Pass when: the team in the DB matches the UI after each click (verify with `psql` or via `GET /api/team`).

## Scenario 5: sidebar reflects the team on every page; `/team` lists and removes

Covers **AC-6** and **AC-7**.

1. Add two characters via Scenario 4.
2. Navigate to `/` and then to several detail pages. The sidebar shows the same two members on every page.
3. Open `/team`. Both members are listed with a remove control.
4. Remove one from `/team`. The sidebar updates immediately (RTK Query tag invalidation), and the detail page for that character shows `Add to team` again.

Pass when: sidebar and `/team` are always in sync after any add or remove, on any page.

## Scenario 6: a sixth add is refused; Vader's Add button is disabled with a tooltip

Covers **AC-8** and **AC-9**.

1. Reset the team (`DELETE` each member, or truncate `team_members`).
2. Add five non-evil characters.
3. Open a sixth non-evil character's detail page. Click `Add to team`. The request returns `422 TEAM_FULL`; the UI shows a clear error message (toast, inline, whatever Slice 006 picks) and the team stays at five.
4. Open Darth Vader's detail page. The `Add to team` button is disabled. Hovering it shows a tooltip explaining the character is evil.
5. Force the request anyway via devtools (`POST /api/team` with Vader's id). The server returns `422 EVIL_FORBIDDEN`.

Pass when: both the cap and the evil ban are enforced server-side (errors visible in the network panel) and reflected in the UI (disabled button + tooltip for Vader, error message for the sixth add).
