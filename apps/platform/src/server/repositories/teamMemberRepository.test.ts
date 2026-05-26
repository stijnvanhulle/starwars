import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teamMembers } from '@/db/schema'
import { teamRepository } from './teamRepository'
import { teamMemberRepository } from './teamMemberRepository'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('teamMemberRepository', () => {
  let teamId: string

  beforeAll(async () => {
    teamId = (await teamRepository.findDefault()).id
  })

  it('findAllByTeam on an empty table returns []', async () => {
    expect(await teamMemberRepository.findAllByTeam(teamId)).toEqual([])
  })

  it('insert returns a TeamMember with deletedAt null', async () => {
    const row = await teamMemberRepository.insert(teamId, 42)
    expect(row.teamId).toBe(teamId)
    expect(row.characterId).toBe(42)
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(row.addedAt).toBeInstanceOf(Date)
    expect(row.deletedAt).toBeNull()
  })

  it('insert twice without removing rejects with unique violation (23505)', async () => {
    await teamMemberRepository.insert(teamId, 42)
    await expect(teamMemberRepository.insert(teamId, 42)).rejects.toMatchObject({ cause: { code: '23505' } })
  })

  it('findByTeamAndCharacterId returns the row or undefined', async () => {
    await teamMemberRepository.insert(teamId, 42)
    expect(await teamMemberRepository.findByTeamAndCharacterId(teamId, 42)).toBeDefined()
    expect(await teamMemberRepository.findByTeamAndCharacterId(teamId, 999)).toBeUndefined()
  })

  it('softDeleteByTeamAndCharacterId returns true once then false', async () => {
    await teamMemberRepository.insert(teamId, 42)
    expect(await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 42)).toBe(true)
    expect(await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 42)).toBe(false)
  })

  it('soft-deleted rows are hidden from reads but remain in the table', async () => {
    const inserted = await teamMemberRepository.insert(teamId, 42)
    await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 42)

    expect(await teamMemberRepository.findByTeamAndCharacterId(teamId, 42)).toBeUndefined()
    expect(await teamMemberRepository.findAllByTeam(teamId)).toEqual([])

    const [persisted] = await db.select().from(teamMembers).where(eq(teamMembers.id, inserted.id))
    expect(persisted).toBeDefined()
    expect(persisted?.deletedAt).not.toBeNull()
  })

  it('re-adding after soft delete creates a new row', async () => {
    const first = await teamMemberRepository.insert(teamId, 42)
    await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 42)
    await sleep(5)
    const second = await teamMemberRepository.insert(teamId, 42)

    expect(second.id).not.toBe(first.id)
    expect(second.addedAt.getTime()).toBeGreaterThanOrEqual(first.addedAt.getTime())
  })

  it('findAllByTeam orders by addedAt asc over active rows only', async () => {
    await teamMemberRepository.insert(teamId, 1)
    await sleep(5)
    await teamMemberRepository.insert(teamId, 2)
    await sleep(5)
    await teamMemberRepository.insert(teamId, 3)

    await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 2)

    const rows = await teamMemberRepository.findAllByTeam(teamId)
    expect(rows.map((r) => r.characterId)).toEqual([1, 3])
  })

  it('countByTeam reflects active rows only', async () => {
    await teamMemberRepository.insert(teamId, 10)
    await teamMemberRepository.insert(teamId, 11)
    await teamMemberRepository.softDeleteByTeamAndCharacterId(teamId, 10)

    expect(await teamMemberRepository.countByTeam(teamId)).toBe(1)
  })
})
