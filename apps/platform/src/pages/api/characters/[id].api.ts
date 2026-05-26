import type { NextApiRequest, NextApiResponse } from 'next'
import { ERRORS } from '@/server/constants'
import { characterIdSchema } from '@/server/schemas'
import { createCharacterFetcher } from '@/server/starwars-api'
import { createError, mapError, toCharacter } from '@/server/utils'

/**
 * `GET /api/characters/{id}`. Fetches one character from the upstream `starwars-api`
 * and returns the contract `Character` shape (`getCharacter` in `api.openapi.yaml`).
 * Missing ids, non-positive-integer ids, and upstream failures all map to `404
 * NOT_FOUND` so the contract's error enum stays closed.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ message: 'Method Not Allowed' })

    return
  }
  try {
    const parsed = characterIdSchema.safeParse(req.query.id)

    if (!parsed.success) {
      throw createError({
        ...ERRORS.NOT_FOUND,
        message: `Character ${String(req.query.id)} does not exist.`,
        data: { characterId: req.query.id },
      })
    }
    const character = await createCharacterFetcher().byId(parsed.data)

    if (character === null) {
      throw createError({
        ...ERRORS.NOT_FOUND,
        message: `Character ${parsed.data} does not exist.`,
        data: { characterId: parsed.data },
      })
    }
    res.status(200).json(toCharacter(character))
  } catch (error) {
    const { status, body } = mapError({ error, upstreamAsNotFound: true })
    res.status(status).json(body)
  }
}
