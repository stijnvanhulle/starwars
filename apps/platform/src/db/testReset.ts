import { db } from './client'
import { teamMembers } from './schema'

/**
 * Test-only helper. Hard-deletes every row from `team_members` (active and tombstoned).
 * Keeps tests isolated and order-independent; soft-delete behavior is still exercised by
 * the dedicated repository tests.
 */
export async function resetTeamMembers(): Promise<void> {
  await db.delete(teamMembers)
}
