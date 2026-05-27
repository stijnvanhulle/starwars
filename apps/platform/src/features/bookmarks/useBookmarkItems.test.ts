import { describe, expect, it } from 'vitest'
import { buildBookmarkItems } from './useBookmarkItems'

const character = (id: number, name: string) => ({ id, name, image: `${name.toLowerCase()}.png` })
const member = (characterId: number) => ({ id: `m${characterId}`, teamId: 't', characterId, addedAt: '2026-05-22T10:15:30.000Z' })

describe('buildBookmarkItems', () => {
  it('returns characters in bookmark order and skips ids that are not in the list', () => {
    const items = buildBookmarkItems({
      bookmarks: [2, 99, 1],
      characters: [character(1, 'Luke'), character(2, 'Leia')],
      team: [],
    })

    expect(items.map((item) => item.name)).toEqual(['Leia', 'Luke'])
  })

  it('marks bookmarked characters that are already on the team with the on-team chip', () => {
    const [item] = buildBookmarkItems({
      bookmarks: [1],
      characters: [character(1, 'Luke')],
      team: [member(1)],
    })

    expect(item?.chip).toBe('on-team')
  })

  it('returns an empty array when there are no bookmarks', () => {
    expect(buildBookmarkItems({ bookmarks: [], characters: [], team: [] })).toEqual([])
  })
})
