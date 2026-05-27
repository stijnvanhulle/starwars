import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import { GET } from './route'

describe('GET /api/characters', () => {
  it('should proxy the upstream list and narrow each row to the contract Character shape', async () => {
    const luke = createStarwarsApiCharacter({
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      formerAffiliations: ['Rebel Alliance'],
      masters: ['Obi-Wan Kenobi'],
    })
    server.use(http.get(`${STARWARS_API}/all.json`, () => HttpResponse.json([luke])))

    const res = await GET()

    expect(res.status).toBe(200)

    const body = await res.json()

    expect(body).toHaveLength(1)
    expect(body[0]).toMatchObject({
      id: 1,
      name: 'Luke Skywalker',
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      masters: ['Obi-Wan Kenobi'],
    })
    expect(body[0]).not.toHaveProperty('formerAffiliations')
  })
})
