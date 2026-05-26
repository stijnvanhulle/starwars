import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAllCharacters } from '@/server/starwars-api'
import { mapError, toCharacter } from '@/server/utils'

/**
 * `GET /api/characters`.
 * Lists every character from the upstream `starwars-api` and
 * narrows each entry to the contract `Character` shape (`listCharacters` in
 * `api.openapi.yaml`). Any non-200 from upstream maps to `404 NOT_FOUND` so the
 * browser sees a closed error enum.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ message: 'Method Not Allowed' })

    return
  }
  try {
    const list = await fetchAllCharacters()
    res.status(200).json(list.map(toCharacter))
  } catch (error) {
    const { status, body } = mapError({ error, upstreamAsNotFound: true })
    res.status(status).json(body)
  }
}
