import { describe, expect, it } from 'vitest'
import { buildTeamRows } from './useTeamRows'

const character = (id: number, name: string, image?: string) => ({ id, name, image })
const member = (id: string, characterId: number) => ({
  id,
  teamId: 't',
  characterId,
  addedAt: '2026-05-22T10:15:30.000Z',
})

describe('buildTeamRows', () => {
  it('joins members with their character entry', () => {
    const rows = buildTeamRows({
      team: [member('m1', 1)],
      characters: [character(1, 'Luke', 'luke.png')],
    })
    expect(rows).toMatchInlineSnapshot(`
      [
        {
          "characterId": 1,
          "image": "luke.png",
          "key": "m1",
          "name": "Luke",
        },
      ]
    `)
  })

  it('falls back to a placeholder name when the character is missing from the list', () => {
    const rows = buildTeamRows({
      team: [member('m2', 42)],
      characters: [character(1, 'Luke')],
    })
    expect(rows[0]).toMatchObject({ name: 'Character 42', image: undefined })
  })

  it('returns an empty array for an empty team', () => {
    expect(buildTeamRows({ team: [], characters: [] })).toEqual([])
  })
})
