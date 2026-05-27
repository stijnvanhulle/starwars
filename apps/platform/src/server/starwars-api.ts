import { readFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { type Character as StarwarsApiCharacter, characterSchema } from '@/gen/starwars'
import { starwarsApi } from '@/constants'

export type { Character as StarwarsApiCharacter } from '@/gen/starwars'

const fixtureSchema = z.array(characterSchema).min(1)

export type CharacterFetcher = {
  all: () => Promise<Array<StarwarsApiCharacter>>
  byId: (id: number) => Promise<StarwarsApiCharacter | null>
}

let cachedFixtures: ReadonlyArray<StarwarsApiCharacter> | undefined

function loadFixtures(): ReadonlyArray<StarwarsApiCharacter> {
  if (cachedFixtures !== undefined) return cachedFixtures
  const file = path.resolve(process.cwd(), starwarsApi.fixturePath)
  const parsed = fixtureSchema.safeParse(JSON.parse(readFileSync(file, 'utf-8')))
  if (!parsed.success) {
    throw new Error(`E2E fixtures at ${starwarsApi.fixturePath} are invalid: ${parsed.error.message}`)
  }
  cachedFixtures = parsed.data as ReadonlyArray<StarwarsApiCharacter>
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
  if (process.env[starwarsApi.fixtureFlag] === '1') return createFixtureFetcher()

  const byIdCache = new Map<number, Promise<StarwarsApiCharacter | null>>()

  const fetchById = async (id: number): Promise<StarwarsApiCharacter | null> => {
    const res = await fetch(`${starwarsApi.source}/id/${id}.json`)
    if (res.status === 404) return null
    if (!res.ok) {
      throw new Error(`starwars-api id ${id} failed: ${res.status}`)
    }
    return (await res.json()) as StarwarsApiCharacter
  }

  return {
    async all() {
      const res = await fetch(`${starwarsApi.source}/all.json`)
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
