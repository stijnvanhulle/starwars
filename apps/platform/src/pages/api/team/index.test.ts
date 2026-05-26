import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import * as darkSide from '@/lib/darkSide'
import { startApiServer } from '@/test/apiServer'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import handler from './index.api'

async function postCharacter(baseUrl: string, characterId: number) {
  return fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ characterId }),
  })
}

describe('GET /api/team', () => {
  it('200 returns [] on an empty table', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(api.baseUrl)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })
})

describe('POST /api/team', () => {
  it('201 returns the new TeamMember', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: 1 }))))
    await using api = await startApiServer(handler)
    const res = await postCharacter(api.baseUrl, 1)

    expect(res.status).toBe(201)

    const body = (await res.json()) as { characterId: number; teamId: string; id: string }

    expect(body.characterId).toBe(1)
    expect(typeof body.teamId).toBe('string')
    expect(typeof body.id).toBe('string')
  })

  it('409 ALREADY_MEMBER when the same character is added twice', async () => {
    server.use(http.get(`${STARWARS_API}/id/1.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: 1 }))))
    await using api = await startApiServer(handler)

    expect((await postCharacter(api.baseUrl, 1)).status).toBe(201)

    const second = await postCharacter(api.baseUrl, 1)

    expect(second.status).toBe(409)
    expect(await second.json()).toMatchObject({ code: 'ALREADY_MEMBER' })
  })

  it('422 TEAM_FULL when a sixth member is added', async () => {
    server.use(http.get(`${STARWARS_API}/id/:id.json`, ({ params }) => HttpResponse.json(createStarwarsApiCharacter({ id: Number(params.id) }))))
    await using api = await startApiServer(handler)

    for (const id of [1, 2, 3, 4, 5]) {
      expect((await postCharacter(api.baseUrl, id)).status).toBe(201)
    }
    const res = await postCharacter(api.baseUrl, 6)

    expect(res.status).toBe(422)
    expect(await res.json()).toMatchObject({ code: 'TEAM_FULL' })
  })

  it('404 NOT_FOUND when upstream returns 404', async () => {
    server.use(http.get(`${STARWARS_API}/id/9999.json`, () => new HttpResponse(null, { status: 404 })))

    await using api = await startApiServer(handler)
    const res = await postCharacter(api.baseUrl, 9999)

    expect(res.status).toBe(404)
    expect(await res.json()).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('422 EVIL_FORBIDDEN when isDarkSide returns true', async () => {
    server.use(http.get(`${STARWARS_API}/id/4.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: 4, name: 'Darth Vader' }))))

    using _dark = vi.spyOn(darkSide, 'isDarkSide').mockReturnValue(true)
    await using api = await startApiServer(handler)

    const res = await postCharacter(api.baseUrl, 4)

    expect(res.status).toBe(422)
    expect(await res.json()).toMatchObject({ code: 'EVIL_FORBIDDEN' })
  })

  it('400 with plain { message } envelope on a missing characterId', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(api.baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toMatchInlineSnapshot(`
      {
        "message": "Invalid request body",
      }
    `)
  })

  it('405 on an unsupported method with Allow listing GET, POST', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(api.baseUrl, { method: 'PUT' })

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET, POST')
  })
})
