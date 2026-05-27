import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teams } from '@/db/schema'
import { teamRepository } from './teamRepository'

describe('teamRepository', () => {
  it('findBySlug returns the seeded default team', async () => {
    const team = await teamRepository.findBySlug('default')

    expect(team).toMatchObject({ name: 'Default team', slug: 'default' })
    expect(typeof team?.id).toBe('string')
    expect(team?.createdAt).toBeInstanceOf(Date)
  })

  it('findBySlug returns undefined when the slug is unknown', async () => {
    const team = await teamRepository.findBySlug('missing-team')

    expect(team).toBeUndefined()
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
