import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Character as StarwarsApiCharacter } from '@/gen/starwars'

export type { Character as StarwarsApiCharacter } from '@/gen/starwars'

const SOURCE = 'https://akabab.github.io/starwars-api/api'
const FIXTURE_FLAG = 'E2E_FIXTURES'
const FIXTURE_PATH = 'e2e/fixtures/characters.json'

export type CharacterFetcher = {
  all: () => Promise<Array<StarwarsApiCharacter>>
  byId: (id: number) => Promise<StarwarsApiCharacter | null>
}

let cachedFixtures: ReadonlyArray<StarwarsApiCharacter> | undefined

function loadFixtures(): ReadonlyArray<StarwarsApiCharacter> {
  if (cachedFixtures !== undefined) return cachedFixtures
  const file = path.resolve(process.cwd(), FIXTURE_PATH)
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf-8'))
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`E2E fixtures at ${FIXTURE_PATH} are missing or empty`)
  }
  for (const row of parsed) {
    if (typeof row?.id !== 'number' || typeof row?.name !== 'string') {
      throw new Error(`E2E fixture row missing required id/name: ${JSON.stringify(row)}`)
    }
    if (row.affiliations !== undefined && !Array.isArray(row.affiliations)) {
      throw new Error(`E2E fixture row ${row.id} has non-array affiliations: ${JSON.stringify(row.affiliations)}`)
    }
    if (row.masters !== undefined && !Array.isArray(row.masters)) {
      throw new Error(`E2E fixture row ${row.id} has non-array masters: ${JSON.stringify(row.masters)}`)
    }
  }
  cachedFixtures = parsed as ReadonlyArray<StarwarsApiCharacter>
  return cachedFixtures
}

function createFixtureFetcher(): CharacterFetcher {
  return {
    async all() {
      return Array.from(loadFixtures())
    },
    async byId(id) {
      return loadFixtures().find((c) => c.id === id) ?? null
    },
  }
}

/**
 * Per-request fetcher with an internal id cache. A single request that touches
 * the same character twice (list + detail; service then route handler) only
 * issues one network call. When `E2E_FIXTURES=1` is set, the upstream fetch is
 * replaced with a disk read of `e2e/fixtures/characters.json` so Playwright
 * specs never reach the real network.
 */
export function createCharacterFetcher(): CharacterFetcher {
  if (process.env[FIXTURE_FLAG] === '1') return createFixtureFetcher()

  const byIdCache = new Map<number, Promise<StarwarsApiCharacter | null>>()

  const fetchById = async (id: number): Promise<StarwarsApiCharacter | null> => {
    const res = await fetch(`${SOURCE}/id/${id}.json`)
    if (res.status === 404) return null
    if (!res.ok) {
      throw new Error(`starwars-api id ${id} failed: ${res.status}`)
    }
    return (await res.json()) as StarwarsApiCharacter
  }

  return {
    async all() {
      const res = await fetch(`${SOURCE}/all.json`)
      if (!res.ok) {
        throw new Error(`starwars-api list failed: ${res.status}`)
      }
      return (await res.json()) as Array<StarwarsApiCharacter>
    },
    byId(id) {
      const cached = byIdCache.get(id)
      if (cached !== undefined) return cached
      const pending = fetchById(id)
      byIdCache.set(id, pending)
      return pending
    },
  }
}
