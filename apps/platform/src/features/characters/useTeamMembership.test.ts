import { describe, expect, it } from 'vitest'
import { computeTeamMembership } from './useTeamMembership'

const luke = { id: 1, name: 'Luke Skywalker' }
const vader = { id: 5, name: 'Darth Vader' }
const member = (characterId: number) => ({
  id: `m${characterId}`,
  teamId: 't',
  characterId,
  addedAt: '2026-05-22T10:15:30.000Z',
})

describe('computeTeamMembership', () => {
  it('returns all-false when no character is loaded', () => {
    expect(computeTeamMembership({ character: undefined, team: [], mutating: false })).toEqual({ onTeam: false, evil: false, canToggleTeam: false })
  })

  it('allows adding a non-evil character that is not yet on the team', () => {
    expect(computeTeamMembership({ character: luke, team: [], mutating: false })).toMatchObject({ onTeam: false, evil: false, canToggleTeam: true })
  })

  it('blocks adding an evil character that is not on the team', () => {
    expect(computeTeamMembership({ character: vader, team: [], mutating: false })).toMatchObject({ evil: true, onTeam: false, canToggleTeam: false })
  })

  it('still allows removing an evil character already on the team', () => {
    expect(computeTeamMembership({ character: vader, team: [member(5)], mutating: false })).toMatchObject({ evil: true, onTeam: true, canToggleTeam: true })
  })

  it('disables the toggle while a mutation is in flight', () => {
    expect(computeTeamMembership({ character: luke, team: [], mutating: true }).canToggleTeam).toBe(false)
  })
})
