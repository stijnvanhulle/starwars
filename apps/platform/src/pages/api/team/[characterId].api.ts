import type { NextApiRequest, NextApiResponse } from 'next'
import { mapError } from '@/server/utils'
import { teamMemberRepository } from '@/server/repositories/teamMemberRepository'
import { teamRepository } from '@/server/repositories/teamRepository'
import { characterIdSchema } from '@/server/schemas'
import { removeTeamMember } from '@/server/services/teamService'

/**
 * `DELETE /api/team/{characterId}`.
 * Soft-deletes a character from the default team
 * (`removeTeamMember`). Idempotent. Returns `204` whether the row existed or not, and
 * an unparseable `characterId` is treated as a no-op.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    res.status(405).json({ message: 'Method Not Allowed' })

    return
  }
  try {
    const parsed = characterIdSchema.safeParse(req.query.characterId)

    if (!parsed.success) {
      res.status(204).end()
      return
    }
    const team = await teamRepository.findDefault()

    await removeTeamMember({ memberRepo: teamMemberRepository, teamId: team.id, characterId: parsed.data })

    res.status(204).end()
  } catch (error) {
    const { status, body } = mapError({ error })
    res.status(status).json(body)
  }
}
