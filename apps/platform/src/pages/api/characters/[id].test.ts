import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { startApiServer } from '@/test/apiServer'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import handler from './[id].api'

describe('GET /api/characters/{id}', () => {
  it('200 returns the narrow Character', async () => {
    const luke = createStarwarsApiCharacter({
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      formerAffiliations: ['Rebel Alliance'],
      masters: ['Obi-Wan Kenobi'],
    })

    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(luke)))
    await using api = await startApiServer(handler)

    const res = await fetch(`${api.baseUrl}?id=1`)

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchInlineSnapshot(`
      {
        "affiliations": [
          "Jedi Order",
        ],
        "id": 1,
        "image": "luke.jpg",
        "masters": [
          "Obi-Wan Kenobi",
        ],
        "name": "Luke Skywalker",
      }
    `)
  })

  it('404 NOT_FOUND when upstream returns 404', async () => {
    server.use(http.get(`${STARWARS_API}/id/9999.json`, () => new HttpResponse(null, { status: 404 })))

    await using api = await startApiServer(handler)
    const res = await fetch(`${api.baseUrl}?id=9999`)

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchInlineSnapshot(`
      {
        "code": "NOT_FOUND",
        "message": "Character 9999 does not exist.",
      }
    `)
  })

  it('404 NOT_FOUND when upstream returns 500 (collapse keeps the error enum closed)', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => new HttpResponse(null, { status: 500 })))

    await using api = await startApiServer(handler)
    const res = await fetch(`${api.baseUrl}?id=1`)

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' })
  })
})
