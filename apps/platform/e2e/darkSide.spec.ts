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

    const addButton = page.getByRole('button', { name: 'Add to team' })
    await expect(addButton).toBeDisabled()

    // The button is disabled and wrapped in a span that intercepts pointer events;
    // hovering must be forced to surface the MUI Tooltip anchored to the wrapper.
    await addButton.hover({ force: true })
    const tooltip = page.getByRole('tooltip')
    await tooltip.waitFor()
    await expect(tooltip).toContainText(/evil/i)

    const res = await request.post('/api/team', { data: { characterId: id } })
    expect(res.status()).toBe(422)
    expect(await res.json()).toMatchObject({ code: 'EVIL_FORBIDDEN' })
  })
}
