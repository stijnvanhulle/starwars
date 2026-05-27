import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teamMembers } from '@/db/schema'
import { teamRepository } from './teamRepository'
import { teamMemberRepository } from './teamMemberRepository'

describe('teamMemberRepository', () => {
  let teamId: string

  beforeAll(async () => {
    teamId = (await teamRepository.findDefault()).id
  })

  it('findAllByTeam on an empty table returns []', async () => {
    expect(await teamMemberRepository.findAllByTeam({ teamId })).toEqual([])
  })

  it('insert returns a TeamMember with deletedAt null', async () => {
    const row = await teamMemberRepository.insert({ teamId, characterId: 42 })

    expect(row).toMatchInlineSnapshot(
      { id: expect.stringMatching(/^[0-9a-f-]{36}$/), teamId: expect.any(String), addedAt: expect.any(Date) },
      `
      {
        "addedAt": Any<Date>,
        "characterId": 42,
        "deletedAt": null,
        "id": StringMatching /\\^\\[0-9a-f-\\]\\{36\\}\\$/,
        "teamId": Any<String>,
      }
    `,
    )
    expect(row.teamId).toBe(teamId)
  })

  it('insert twice without removing rejects with unique violation (23505)', async () => {
    await teamMemberRepository.insert({ teamId, characterId: 42 })

    await expect(teamMemberRepository.insert({ teamId, characterId: 42 })).rejects.toMatchObject({
      cause: { code: '23505' },
    })
  })

  it('findByTeamAndCharacterId returns the row or undefined', async () => {
    await teamMemberRepository.insert({ teamId, characterId: 42 })

    expect(await teamMemberRepository.findByTeamAndCharacterId({ teamId, characterId: 42 })).toBeDefined()
    expect(await teamMemberRepository.findByTeamAndCharacterId({ teamId, characterId: 999 })).toBeUndefined()
  })

  it('deleteByTeamAndCharacterId returns true once then false', async () => {
    await teamMemberRepository.insert({ teamId, characterId: 42 })

    expect(await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 42 })).toBe(true)
    expect(await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 42 })).toBe(false)
  })

  it('deleted rows are hidden from reads but remain in the table', async () => {
    const inserted = await teamMemberRepository.insert({ teamId, characterId: 42 })
    await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 42 })

    expect(await teamMemberRepository.findByTeamAndCharacterId({ teamId, characterId: 42 })).toBeUndefined()
    expect(await teamMemberRepository.findAllByTeam({ teamId })).toEqual([])

    const [persisted] = await db.select().from(teamMembers).where(eq(teamMembers.id, inserted.id))

    expect(persisted).toBeDefined()
    expect(persisted?.deletedAt).not.toBeNull()
  })

  it('re-adding after delete creates a new row', async () => {
    const first = await teamMemberRepository.insert({ teamId, characterId: 42 })
    await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 42 })
    const second = await teamMemberRepository.insert({ teamId, characterId: 42 })

    expect(second.id).not.toBe(first.id)
  })

  it('findAllByTeam orders by addedAt asc over active rows only', async () => {
    const base = new Date('2026-01-01T00:00:00Z').getTime()
    await db.insert(teamMembers).values([
      { teamId, characterId: 1, addedAt: new Date(base) },
      { teamId, characterId: 2, addedAt: new Date(base + 1_000) },
      { teamId, characterId: 3, addedAt: new Date(base + 2_000) },
    ])

    await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 2 })

    const rows = await teamMemberRepository.findAllByTeam({ teamId })
    expect(rows.map((row) => row.characterId)).toMatchInlineSnapshot(`
      [
        1,
        3,
      ]
    `)
  })

  it('countByTeam reflects active rows only', async () => {
    await teamMemberRepository.insert({ teamId, characterId: 10 })
    await teamMemberRepository.insert({ teamId, characterId: 11 })
    await teamMemberRepository.deleteByTeamAndCharacterId({ teamId, characterId: 10 })

    expect(await teamMemberRepository.countByTeam({ teamId })).toBe(1)
  })
})
