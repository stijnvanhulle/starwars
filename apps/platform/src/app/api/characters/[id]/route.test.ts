import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import { GET } from './route'

function getCharacter(id: string) {
  return GET(new Request(`http://test/api/characters/${id}`), { params: Promise.resolve({ id }) })
}

describe('GET /api/characters/{id}', () => {
  it('should return the narrowed Character with 200 when the upstream serves the row', async () => {
    const luke = createStarwarsApiCharacter({
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      formerAffiliations: ['Rebel Alliance'],
      masters: ['Obi-Wan Kenobi'],
    })
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(luke)))

    const res = await getCharacter('1')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      id: 1,
      name: 'Luke Skywalker',
      image: 'luke.jpg',
      affiliations: ['Jedi Order'],
      masters: ['Obi-Wan Kenobi'],
    })
  })

  it('should respond 404 NOT_FOUND when the upstream returns 404 for the id', async () => {
    server.use(http.get(`${STARWARS_API}/id/9999.json`, () => new HttpResponse(null, { status: 404 })))

    const res = await getCharacter('9999')

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({
      code: 'NOT_FOUND',
      message: expect.stringContaining('9999'),
    })
  })

  it('should collapse a 500 from the upstream into 404 NOT_FOUND to keep the error enum closed', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => new HttpResponse(null, { status: 500 })))

    const res = await getCharacter('1')

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' })
  })
})
