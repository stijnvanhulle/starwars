import { expect, test } from '@playwright/test'
import { activeMemberCount, resetTeam } from './setup'

test.describe('Team cap', () => {
  test.beforeEach(async () => {
    await resetTeam()
  })

  test('the sixth add is refused with TEAM_FULL, the inline alert surfaces, and the active member count stays at five', async ({
    page,
    request,
  }) => {
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
  })
})
