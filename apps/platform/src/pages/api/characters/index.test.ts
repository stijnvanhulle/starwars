import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { startApiServer } from '@/test/apiServer'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import handler from './index.api'

describe('GET /api/characters', () => {
  it('200 returns the proxied list narrowed to the contract Character shape', async () => {
    const luke = createStarwarsApiCharacter({
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      formerAffiliations: ['Rebel Alliance'],
      masters: ['Obi-Wan Kenobi'],
    })
    server.use(http.get(`${STARWARS_API}/all.json`, () => HttpResponse.json([luke])))

    await using api = await startApiServer(handler)
    const res = await fetch(api.baseUrl)

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

  it('405 on a non-GET method with Allow header', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(api.baseUrl, { method: 'POST' })

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET')
  })
})
