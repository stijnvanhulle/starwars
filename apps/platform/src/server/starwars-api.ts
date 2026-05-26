import type { Character as StarwarsApiCharacter } from '@/gen/starwars'

export type { Character as StarwarsApiCharacter } from '@/gen/starwars'

const SOURCE = 'https://akabab.github.io/starwars-api/api'

export async function fetchAllCharacters(): Promise<Array<StarwarsApiCharacter>> {
  const res = await fetch(`${SOURCE}/all.json`)

  if (!res.ok) {
    throw new Error(`starwars-api list failed: ${res.status}`)
  }

  return (await res.json()) as Array<StarwarsApiCharacter>
}

export async function fetchCharacter(id: number): Promise<StarwarsApiCharacter | null> {
  const res = await fetch(`${SOURCE}/id/${id}.json`)

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`starwars-api id ${id} failed: ${res.status}`)
  }

  return (await res.json()) as StarwarsApiCharacter
}
