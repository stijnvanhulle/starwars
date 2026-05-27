import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import { GET, POST } from './route'

function postCharacter(characterId: number) {
  return POST(
    new Request('http://test/api/team', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ characterId }),
    }),
  )
}

describe('GET /api/team', () => {
  it('should return an empty array with 200 when the team has no active members', async () => {
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

describe('POST /api/team', () => {
  it('should return the new TeamMember with 201 when the add succeeds', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: 1 }))))
    const res = await postCharacter(1)

    expect(res.status).toBe(201)

    const body = (await res.json()) as { characterId: number; teamId: string; id: string }

    expect(body.characterId).toBe(1)
    expect(typeof body.teamId).toBe('string')
    expect(typeof body.id).toBe('string')
  })

  it('should respond 409 ALREADY_MEMBER when the same character is added twice', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: 1 }))))

    expect((await postCharacter(1)).status).toBe(201)

    const second = await postCharacter(1)

    expect(second.status).toBe(409)
    expect(await second.json()).toMatchObject({ code: 'ALREADY_MEMBER' })
  })

  it('should respond 422 TEAM_FULL when a sixth member is added on top of a full team', async () => {
    server.use(http.get(`${STARWARS_API}/id/:id.json`, ({ params }) => HttpResponse.json(createStarwarsApiCharacter({ id: Number(params.id) }))))

    for (const id of [1, 2, 3, 4, 5]) {
      expect((await postCharacter(id)).status).toBe(201)
    }
    const res = await postCharacter(6)

    expect(res.status).toBe(422)
    expect(await res.json()).toMatchObject({ code: 'TEAM_FULL' })
  })

  it('should respond 404 NOT_FOUND when the upstream returns 404 for the character', async () => {
    server.use(http.get(`${STARWARS_API}/id/9999.json`, () => new HttpResponse(null, { status: 404 })))

    const res = await postCharacter(9999)

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('should respond 422 EVIL_FORBIDDEN when the character matches the dark-side rules', async () => {
    server.use(
      http.get(`${STARWARS_API}/id/4.json`, () =>
        HttpResponse.json(
          createStarwarsApiCharacter({
            id: 4,
            name: 'Darth Vader',
            masters: ['Darth Sidious (Sith Master)'],
          }),
        ),
      ),
    )

    const res = await postCharacter(4)

    expect(res.status).toBe(422)
    expect(await res.json()).toMatchObject({ code: 'EVIL_FORBIDDEN' })
  })

  it('should respond 400 with a plain { message } envelope when characterId is missing from the body', async () => {
    const res = await POST(
      new Request('http://test/api/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ message: expect.any(String) })
  })
})
