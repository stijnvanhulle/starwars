import { sql } from 'drizzle-orm'
import { db } from './client'
import { teamMembers } from './schema'

export async function softResetTeamMembers(): Promise<void> {
  await db
    .update(teamMembers)
    .set({ deletedAt: sql`now()` })
    .where(sql`${teamMembers.deletedAt} is null`)
}
