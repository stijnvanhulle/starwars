import { addTeamMemberRequestSchema } from '@/gen/api'
import { isDarkSide } from '@/lib/darkSide'
import { teamMemberRepository } from '@/server/repositories/teamMemberRepository'
import { teamRepository } from '@/server/repositories/teamRepository'
import { addTeamMember, listTeamMembers } from '@/server/services/teamService'
import { createCharacterFetcher } from '@/server/starwars-api'
import { mapError } from '@/server/utils'

/**
 * Returns the default team's active members.
 */
export async function GET(): Promise<Response> {
  try {
    const team = await teamRepository.findDefault()
    const members = await listTeamMembers({ memberRepo: teamMemberRepository, teamId: team.id })

    return Response.json(members)
  } catch (error) {
    const { status, body } = mapError({ error })

    return Response.json(body, { status })
  }
}

/**
 * Adds a character to the default team. Maps service errors to the documented 404/409/422 envelopes.
 */
export async function POST(request: Request): Promise<Response> {
  const json = await request.json().catch(() => undefined)
  const parsed = addTeamMemberRequestSchema.safeParse(json)

  if (!parsed.success) {
    return Response.json({ message: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 })
  }
  try {
    const team = await teamRepository.findDefault()
    const fetcher = createCharacterFetcher()
    const member = await addTeamMember({
      memberRepo: teamMemberRepository,
      fetchCharacter: fetcher.byId,
      isDarkSide,
      teamId: team.id,
      characterId: parsed.data.characterId,
    })

    return Response.json(member, { status: 201 })
  } catch (error) {
    const { status, body } = mapError({ error })

    return Response.json(body, { status })
  }
}
