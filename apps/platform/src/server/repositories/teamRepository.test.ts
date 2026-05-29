import { describe, expect, it, vi } from 'vitest'
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
    using _ = vi.spyOn(teamRepository, 'findBySlug').mockResolvedValueOnce(undefined)

    await expect(teamRepository.findDefault()).rejects.toThrow(/Default team is missing/)
  })
})
