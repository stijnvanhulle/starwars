import { and, eq, isNotNull } from 'drizzle-orm'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teamMembers } from '@/db/schema'
import { startApiServer } from '@/test/apiServer'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import indexHandler from './index.api'
import handler from './[characterId].api'

async function postCharacter(baseUrl: string, characterId: number) {
  server.use(http.get(`${STARWARS_API}/id/${characterId}.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: characterId }))))

  return fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ characterId }),
  })
}

describe('DELETE /api/team/{characterId}', () => {
  it('204 after insert. GET no longer returns the row but the tombstone stays in the table', async () => {
    await using teamApi = await startApiServer(indexHandler)
    await using deleteApi = await startApiServer(handler)

    expect((await postCharacter(teamApi.baseUrl, 1)).status).toBe(201)
    const del = await fetch(`${deleteApi.baseUrl}?characterId=1`, { method: 'DELETE' })

    expect(del.status).toBe(204)
    const list = await fetch(teamApi.baseUrl)

    expect(await list.json()).toEqual([])
    const tombstones = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.characterId, 1), isNotNull(teamMembers.deletedAt)))

    expect(tombstones).toHaveLength(1)
  })

  it('204 on an empty team (delete is idempotent)', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(`${api.baseUrl}?characterId=9999`, { method: 'DELETE' })

    expect(res.status).toBe(204)
  })

  it('re-adding a soft-deleted character returns 201 and creates a new row', async () => {
    await using teamApi = await startApiServer(indexHandler)
    await using deleteApi = await startApiServer(handler)

    expect((await postCharacter(teamApi.baseUrl, 1)).status).toBe(201)
    expect((await fetch(`${deleteApi.baseUrl}?characterId=1`, { method: 'DELETE' })).status).toBe(204)
    expect((await postCharacter(teamApi.baseUrl, 1)).status).toBe(201)
  })

  it('405 on a non-DELETE method', async () => {
    await using api = await startApiServer(handler)
    const res = await fetch(`${api.baseUrl}?characterId=1`)

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('DELETE')
  })
})
