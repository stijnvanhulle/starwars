import type { Character } from '@/gen/api'
import { useListCharactersQuery } from '@/store/api'

export type Neighbors = {
  index: number
  prev: Character | undefined
  next: Character | undefined
  position: { index: number; total: number } | undefined
}

/**
 * Picks the previous and next character relative to `id`, wrapping around the list edges. The
 * navigation walks the full cached list, never a paginated slice.
 */
export function getNeighbors({ id, characters }: { id: number; characters: ReadonlyArray<Character> }): Neighbors {
  const index = characters.findIndex((candidate) => candidate.id === id)
  if (characters.length === 0 || index === -1) {
    return { index, prev: undefined, next: undefined, position: undefined }
  }
  const total = characters.length

  return {
    index,
    prev: characters[(index - 1 + total) % total],
    next: characters[(index + 1) % total],
    position: { index: index + 1, total },
  }
}

/**
 * Fetches the full character list and computes the neighbors around `id`.
 */
export function useCharacterNavigation({ id }: { id: number }) {
  const list = useListCharactersQuery()
  const characters = list.data ?? []

  return { ...getNeighbors({ id, characters }), characters }
}
