import { expect, test } from '@playwright/test'
import { Client } from 'pg'
import { resetTeam } from './setup'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://platform:platform@localhost:5432/platform'

async function activeMemberCount(): Promise<number> {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query<{ count: string }>('select count(*)::text as count from team_members where deleted_at is null')
    return Number(res.rows[0]!.count)
  } finally {
    await client.end()
  }
}

test.beforeEach(async () => {
  await resetTeam()
})

test('a sixth add is refused with TEAM_FULL and the cap holds', async ({ page, request }) => {
  for (const characterId of [1, 2, 3, 4, 5]) {
    const res = await request.post('/api/team', { data: { characterId } })
    expect(res.status(), `seed add for ${characterId}`).toBe(201)
  }
  expect(await activeMemberCount()).toBe(5)

  await page.goto('/characters/6')
  await expect(page.getByRole('button', { name: 'Add to team' })).toBeEnabled()

  const sixthAdd = page.waitForResponse((res) => res.url().endsWith('/api/team') && res.request().method() === 'POST')
  await page.getByRole('button', { name: 'Add to team' }).click()
  const response = await sixthAdd
  expect(response.status()).toBe(422)

  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /5 members|team is full|TEAM_FULL/i })
      .first(),
  ).toBeVisible()
  expect(await activeMemberCount()).toBe(5)

  const direct = await request.post('/api/team', { data: { characterId: 6 } })
  expect(direct.status()).toBe(422)
  expect(await direct.json()).toMatchObject({ code: 'TEAM_FULL' })
})
