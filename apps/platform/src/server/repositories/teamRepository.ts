import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { teams, type Team } from '@/db/schema'

export const teamRepository = {
  async findBySlug(slug: string): Promise<Team | undefined> {
    return db.query.teams.findFirst({ where: eq(teams.slug, slug) })
  },

  async findDefault(): Promise<Team> {
    const row = await this.findBySlug('default')

    if (!row) {
      throw new Error('Default team is missing. Did the 0001 seed migration run?')
    }
    return row
  },
} as const
