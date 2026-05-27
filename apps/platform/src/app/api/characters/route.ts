import { createCharacterFetcher } from '@/server/starwars-api'
import { mapError, toCharacter } from '@/server/utils'

/**
 * Lists every upstream character, narrowed to the contract `Character` shape.
 * Any non-200 from upstream maps to 404 NOT_FOUND so the browser sees a closed enum.
 */
export async function GET(): Promise<Response> {
  try {
    const list = await createCharacterFetcher().all()

    return Response.json(list.map(toCharacter))
  } catch (error) {
    const { status, body } = mapError({ error, upstreamAsNotFound: true })

    return Response.json(body, { status })
  }
}
