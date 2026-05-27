import { expect, test } from '@playwright/test'
import { resetTeam } from './setup'

const EVIL_IDS = [
  { id: 7, rule: 'rule 1, name contains "darth"' },
  { id: 8, rule: 'rule 2, affiliations contain "Sith"' },
  { id: 9, rule: 'rule 3, masters contain a "Darth ..." entry' },
]

test.beforeEach(async () => {
  await resetTeam()
})

for (const { id, rule } of EVIL_IDS) {
  test(`evil character ${id} (${rule}) cannot be added`, async ({ page, request }) => {
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
