import { and, asc, count, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { teamMembers, type TeamMember } from '@/db/schema'

const activeFilter = (teamId: string) => and(eq(teamMembers.teamId, teamId), isNull(teamMembers.deletedAt))

export const teamMemberRepository = {
  async insert(teamId: string, characterId: number): Promise<TeamMember> {
    const [row] = await db.insert(teamMembers).values({ teamId, characterId }).returning()
    if (!row) {
      throw new Error('Insert returned no row')
    }
    return row
  },

  async findAllByTeam(teamId: string): Promise<Array<TeamMember>> {
    return db.select().from(teamMembers).where(activeFilter(teamId)).orderBy(asc(teamMembers.addedAt))
  },

  async findByTeamAndCharacterId(teamId: string, characterId: number): Promise<TeamMember | undefined> {
    return db.query.teamMembers.findFirst({
      where: and(activeFilter(teamId), eq(teamMembers.characterId, characterId)),
    })
  },

  async softDeleteByTeamAndCharacterId(teamId: string, characterId: number): Promise<boolean> {
    const result = await db
      .update(teamMembers)
      .set({ deletedAt: sql`now()` })
      .where(and(activeFilter(teamId), eq(teamMembers.characterId, characterId)))
      .returning({ id: teamMembers.id })
    return result.length > 0
  },

  async countByTeam(teamId: string): Promise<number> {
    const [row] = await db.select({ value: count() }).from(teamMembers).where(activeFilter(teamId))
    return row?.value ?? 0
  },
} as const
