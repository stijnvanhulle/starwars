import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teams } from '@/db/schema'
import { teamRepository } from './teamRepository'

describe('teamRepository', () => {
  it('findBySlug returns the seeded default team', async () => {
    const team = await teamRepository.findBySlug('default')

    expect(team).toMatchInlineSnapshot(
      { id: expect.any(String), createdAt: expect.any(Date) },
      `
      {
        "createdAt": Any<Date>,
        "id": Any<String>,
        "name": "Default team",
        "slug": "default",
      }
    `,
    )
  })

  it('findBySlug returns undefined when the slug is unknown', async () => {
    const team = await teamRepository.findBySlug('missing-team')

    expect(team).toBeUndefined()
  })

  it('findDefault returns the seeded default team', async () => {
    const team = await teamRepository.findDefault()

    expect(team.slug).toBe('default')
  })

  it('findDefault throws when the seed row is missing', async () => {
    const team = await teamRepository.findDefault()
    await db.delete(teams).where(eq(teams.slug, 'default'))

    try {
      await expect(teamRepository.findDefault()).rejects.toThrow(/Default team is missing/)
    } finally {
      await db.insert(teams).values(team)
    }
  })
})
