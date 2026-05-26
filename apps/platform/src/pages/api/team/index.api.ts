import type { NextApiRequest, NextApiResponse } from 'next'
import { isDarkSide } from '@/lib/darkSide'
import { mapError } from '@/server/utils'
import { teamMemberRepository } from '@/server/repositories/teamMemberRepository'
import { teamRepository } from '@/server/repositories/teamRepository'
import { addTeamMemberBodySchema } from '@/server/schemas'
import { addTeamMember, listTeamMembers } from '@/server/services/teamService'
import { fetchCharacter } from '@/server/starwars-api'

/**
 * `GET /api/team`
 * Returns the default team's active members (`getTeam`). `POST
 * /api/team` validates the body with `addTeamMemberBodySchema` and adds the character
 * via `addTeamMember`. Service errors come back as the documented `404`, `409`, and
 * `422` envelopes from `api.openapi.yaml`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'GET') {
    try {
      const team = await teamRepository.findDefault()
      const members = await listTeamMembers({ memberRepo: teamMemberRepository, teamId: team.id })
      res.status(200).json(members)
    } catch (error) {
      const { status, body } = mapError({ error })
      res.status(status).json(body)
    }
    return
  }
  if (req.method === 'POST') {
    const parsed = addTeamMemberBodySchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request body' })
      return
    }
    try {
      const team = await teamRepository.findDefault()
      const member = await addTeamMember({
        memberRepo: teamMemberRepository,
        fetchCharacter,
        isDarkSide,
        teamId: team.id,
        characterId: parsed.data.characterId,
      })

      res.status(201).json(member)
    } catch (error) {
      const { status, body } = mapError({ error })
      res.status(status).json(body)
    }
    return
  }
  res.setHeader('Allow', 'GET, POST')
  res.status(405).json({ message: 'Method Not Allowed' })
}
