import { describe, expect, it } from 'vitest'
import { getNeighbors } from './useCharacterNavigation'

const character = (id: number) => ({ id, name: `c${id}` })

describe('getNeighbors', () => {
  it('returns undefined neighbors for an empty list', () => {
    expect(getNeighbors({ id: 1, characters: [] })).toMatchObject({ prev: undefined, next: undefined, position: undefined })
  })

  it('returns undefined neighbors when the id is not in the list', () => {
    expect(getNeighbors({ id: 99, characters: [character(1), character(2)] })).toMatchObject({ prev: undefined, next: undefined, position: undefined })
  })

  it('wraps around the start of the list', () => {
    const result = getNeighbors({ id: 1, characters: [character(1), character(2), character(3)] })

    expect(result.prev?.id).toBe(3)
    expect(result.next?.id).toBe(2)
    expect(result.position).toEqual({ index: 1, total: 3 })
  })

  it('wraps around the end of the list', () => {
    const result = getNeighbors({ id: 3, characters: [character(1), character(2), character(3)] })

    expect(result.prev?.id).toBe(2)
    expect(result.next?.id).toBe(1)
    expect(result.position).toEqual({ index: 3, total: 3 })
  })
})
