import { describe, expect, it, vi } from 'vitest'
import { createStarwarsApiCharacter, createTeamMember } from '@/test/fixtures'
import { addTeamMember, removeTeamMember } from './teamService'

const TEAM_ID = createTeamMember().teamId
const luke = createStarwarsApiCharacter()
const member = createTeamMember()

describe('teamService', () => {
  it('addTeamMember throws NOT_FOUND when starwars-api has no such id', async () => {
    const findByTeamAndCharacterId = vi.fn()
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId,
      countByTeam: vi.fn(),
      insert: vi.fn(),
      deleteByTeamAndCharacterId: vi.fn(),
    }
    await expect(
      addTeamMember({
        memberRepo: repo as never,
        fetchCharacter: () => Promise.resolve(null),
        isDarkSide: () => false,
        teamId: TEAM_ID,
        characterId: 9999,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })

    expect(findByTeamAndCharacterId).not.toHaveBeenCalled()
  })

  it('addTeamMember throws EVIL_FORBIDDEN before any repo call when isDarkSide returns true', async () => {
    const findByTeamAndCharacterId = vi.fn()
    const countByTeam = vi.fn()
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId,
      countByTeam,
      insert: vi.fn(),
      deleteByTeamAndCharacterId: vi.fn(),
    }
    await expect(
      addTeamMember({
        memberRepo: repo as never,
        fetchCharacter: () => Promise.resolve(luke),
        isDarkSide: () => true,
        teamId: TEAM_ID,
        characterId: 1,
      }),
    ).rejects.toMatchObject({ code: 'EVIL_FORBIDDEN' })

    expect(findByTeamAndCharacterId).not.toHaveBeenCalled()
    expect(countByTeam).not.toHaveBeenCalled()
  })

  it('addTeamMember throws ALREADY_MEMBER when the duplicate check hits', async () => {
    const findByTeamAndCharacterId = vi.fn(() => Promise.resolve(member))
    const countByTeam = vi.fn()
    const insert = vi.fn()
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId,
      countByTeam,
      insert,
      deleteByTeamAndCharacterId: vi.fn(),
    }
    await expect(
      addTeamMember({
        memberRepo: repo as never,
        fetchCharacter: () => Promise.resolve(luke),
        isDarkSide: () => false,
        teamId: TEAM_ID,
        characterId: 1,
      }),
    ).rejects.toMatchObject({ code: 'ALREADY_MEMBER' })

    expect(findByTeamAndCharacterId).toHaveBeenCalledWith({ teamId: TEAM_ID, characterId: 1 })
    expect(countByTeam).not.toHaveBeenCalled()
    expect(insert).not.toHaveBeenCalled()
  })

  it('addTeamMember throws TEAM_FULL when the cap check hits', async () => {
    const countByTeam = vi.fn(() => Promise.resolve(5))
    const insert = vi.fn()
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId: vi.fn(() => Promise.resolve(undefined)),
      countByTeam,
      insert,
      deleteByTeamAndCharacterId: vi.fn(),
    }
    await expect(
      addTeamMember({
        memberRepo: repo as never,
        fetchCharacter: () => Promise.resolve(luke),
        isDarkSide: () => false,
        teamId: TEAM_ID,
        characterId: 6,
      }),
    ).rejects.toMatchObject({ code: 'TEAM_FULL' })

    expect(countByTeam).toHaveBeenCalledWith({ teamId: TEAM_ID })
    expect(insert).not.toHaveBeenCalled()
  })

  it('addTeamMember inserts when every rule passes', async () => {
    const insert = vi.fn(() => Promise.resolve(member))
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId: vi.fn(() => Promise.resolve(undefined)),
      countByTeam: vi.fn(() => Promise.resolve(0)),
      insert,
      deleteByTeamAndCharacterId: vi.fn(),
    }
    const row = await addTeamMember({
      memberRepo: repo as never,
      fetchCharacter: () => Promise.resolve(luke),
      isDarkSide: () => false,
      teamId: TEAM_ID,
      characterId: 1,
    })

    expect(row.characterId).toBe(1)
    expect(insert).toHaveBeenCalledWith({ teamId: TEAM_ID, characterId: 1 })
  })

  it('removeTeamMember delegates to deleteByTeamAndCharacterId and ignores the boolean result', async () => {
    const deleteByTeamAndCharacterId = vi.fn(() => Promise.resolve(false))
    const repo = {
      findAllByTeam: vi.fn(),
      findByTeamAndCharacterId: vi.fn(),
      countByTeam: vi.fn(),
      insert: vi.fn(),
      deleteByTeamAndCharacterId,
    }
    await removeTeamMember({ memberRepo: repo as never, teamId: TEAM_ID, characterId: 1 })

    expect(deleteByTeamAndCharacterId).toHaveBeenCalledWith({ teamId: TEAM_ID, characterId: 1 })
  })
})
