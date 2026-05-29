import { teamMemberRepository } from '@/server/repositories/teamMemberRepository'
import { teamRepository } from '@/server/repositories/teamRepository'
import { characterIdSchema } from '@/server/schemas'
import { removeTeamMember } from '@/server/services/teamService'
import { mapError } from '@/server/utils'

/**
 * Soft-deletes a character from the default team. Returns 204 whether the row existed
 * or not; an unparseable id is treated as a no-op.
 */
export async function DELETE(_request: Request, ctx: { params: Promise<{ characterId: string }> }): Promise<Response> {
  try {
    const { characterId } = await ctx.params
    const parsed = characterIdSchema.safeParse(characterId)

    if (!parsed.success) return new Response(null, { status: 204 })
    const team = await teamRepository.findDefault()

    await removeTeamMember({ memberRepo: teamMemberRepository, teamId: team.id, characterId: parsed.data })

    return new Response(null, { status: 204 })
  } catch (error) {
    const { status, body } = mapError({ error })

    return Response.json(body, { status })
  }
}
