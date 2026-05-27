import { expect, test } from '@playwright/test'
import { resetTeam } from './setup'

const EVIL_IDS = [
  { id: 7, rule: 'name contains "darth"' },
  { id: 8, rule: 'affiliations include "Sith"' },
  { id: 9, rule: 'masters include a "Darth ..." entry' },
]

test.describe('Dark side guard', () => {
  test.beforeEach(async () => {
    await resetTeam()
  })

  for (const { id, rule } of EVIL_IDS) {
    test(`character ${id} is flagged evil by the "${rule}" rule: detail page shows the dark-side alert instead of the Add button, and POST /api/team responds 422 EVIL_FORBIDDEN`, async ({
      page,
      request,
    }) => {
      await page.goto(`/characters/${id}`)

      // Evil characters render the "On the dark side" alert in place of the Add button.
      await expect(page.getByRole('button', { name: 'Add to team' })).toHaveCount(0)
      const banner = page
        .getByRole('alert')
        .filter({ hasText: /on the dark side/i })
        .first()
      await expect(banner).toBeVisible()
      await expect(banner).toContainText(/evil/i)

      const res = await request.post('/api/team', { data: { characterId: id } })

      expect(res.status()).toBe(422)
      expect(await res.json()).toMatchObject({ code: 'EVIL_FORBIDDEN' })
    })
  }
})
