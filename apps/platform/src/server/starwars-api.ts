import type { Character as StarwarsApiCharacter } from '@/gen/starwars'

export type { Character as StarwarsApiCharacter } from '@/gen/starwars'

const SOURCE = 'https://akabab.github.io/starwars-api/api'

export type CharacterFetcher = {
  all: () => Promise<Array<StarwarsApiCharacter>>
  byId: (id: number) => Promise<StarwarsApiCharacter | null>
}

/**
 * Per-request fetcher with an internal id cache. A single request that touches
 * the same character twice (list + detail; service then route handler) only
 * issues one network call.
 */
export function createCharacterFetcher(): CharacterFetcher {
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
