import { and, asc, count, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { teamMembers, type TeamMember } from '@/db/schema'

type ByTeam = Pick<ByTeamAndCharacterId, 'teamId'>
type ByTeamAndCharacterId = { teamId: string; characterId: number }

const activeFilter = ({ teamId }: ByTeam) => and(eq(teamMembers.teamId, teamId), isNull(teamMembers.deletedAt))

/**
 * Data access for `team_members`. Reads filter `deletedAt IS NULL`; deletes stamp `deletedAt`.
 */
export const teamMemberRepository = {
  async insert({ teamId, characterId }: ByTeamAndCharacterId): Promise<TeamMember> {
    const [row] = await db.insert(teamMembers).values({ teamId, characterId }).returning()

    if (!row) {
      throw new Error('Insert returned no row')
    }
    return row
  },

  async findAllByTeam({ teamId }: ByTeam): Promise<Array<TeamMember>> {
    return db.select().from(teamMembers).where(activeFilter({ teamId })).orderBy(asc(teamMembers.addedAt))
  },

  async findByTeamAndCharacterId({ teamId, characterId }: ByTeamAndCharacterId): Promise<TeamMember | undefined> {
    return db.query.teamMembers.findFirst({
      where: and(activeFilter({ teamId }), eq(teamMembers.characterId, characterId)),
    })
  },

  async deleteByTeamAndCharacterId({ teamId, characterId }: ByTeamAndCharacterId): Promise<boolean> {
    const result = await db
      .update(teamMembers)
      .set({ deletedAt: sql`now()` })
      .where(and(activeFilter({ teamId }), eq(teamMembers.characterId, characterId)))
      .returning()

    return result.length > 0
  },
  async findTombstones({ teamId, characterId }: ByTeamAndCharacterId): Promise<Array<TeamMember>> {
    return db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.characterId, characterId), isNotNull(teamMembers.deletedAt)))
  },

  async countByTeam({ teamId }: ByTeam): Promise<number> {
    const [row] = await db.select({ value: count() }).from(teamMembers).where(activeFilter({ teamId }))

    return row?.value ?? 0
  },
} as const
