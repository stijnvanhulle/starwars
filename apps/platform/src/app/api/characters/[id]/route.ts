import { errors } from '@/constants'
import { characterIdSchema } from '@/server/schemas'
import { createCharacterFetcher } from '@/server/starwars-api'
import { createError, mapError, toCharacter } from '@/server/utils'

/**
 * Fetches one upstream character by id. Missing ids, non-positive integers, and
 * upstream failures all collapse to 404 NOT_FOUND.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await ctx.params
  try {
    const parsed = characterIdSchema.safeParse(id)

    if (!parsed.success) {
      throw createError({
        ...errors.notFound,
        message: `Character ${id} does not exist.`,
        data: { characterId: id },
      })
    }
    const character = await createCharacterFetcher().byId(parsed.data)

    if (character === null) {
      throw createError({
        ...errors.notFound,
        message: `Character ${parsed.data} does not exist.`,
        data: { characterId: parsed.data },
      })
    }

    return Response.json(toCharacter(character))
  } catch (error) {
    const { status, body } = mapError({ error, upstreamAsNotFound: true })

    return Response.json(body, { status })
  }
}
