import { and, eq, isNotNull } from 'drizzle-orm'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { teamMembers } from '@/db/schema'
import { createStarwarsApiCharacter } from '@/test/fixtures'
import { server, STARWARS_API } from '@/test/msw'
import { GET as getTeam, POST as postTeam } from '../route'
import { DELETE } from './route'

async function postCharacter(characterId: number) {
  server.use(http.get(`${STARWARS_API}/id/${characterId}.json`, () => HttpResponse.json(createStarwarsApiCharacter({ id: characterId }))))

  return postTeam(
    new Request('http://test/api/team', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ characterId }),
    }),
  )
}

function deleteCharacter(characterId: string) {
  return DELETE(new Request(`http://test/api/team/${characterId}`, { method: 'DELETE' }), { params: Promise.resolve({ characterId }) })
}

describe('DELETE /api/team/{characterId}', () => {
  it('should soft-delete the member, hide it from GET, and keep a tombstone row in the table', async () => {
    expect((await postCharacter(1)).status).toBe(201)

    const del = await deleteCharacter('1')

    expect(del.status).toBe(204)

    const list = await getTeam()

    expect(await list.json()).toEqual([])

    const tombstones = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.characterId, 1), isNotNull(teamMembers.deletedAt)))

    expect(tombstones).toHaveLength(1)
  })

  it('should respond 204 when deleting a character that is not on the team (idempotent)', async () => {
    const res = await deleteCharacter('9999')

    expect(res.status).toBe(204)
  })

  it('should allow re-adding a soft-deleted character with 201 and create a fresh row', async () => {
    expect((await postCharacter(1)).status).toBe(201)
    expect((await deleteCharacter('1')).status).toBe(204)
    expect((await postCharacter(1)).status).toBe(201)
  })
})
