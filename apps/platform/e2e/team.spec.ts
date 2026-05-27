import { expect, test } from '@playwright/test'
import { characterById, resetTeam } from './setup'

test.describe('Team', () => {
  test.beforeEach(async () => {
    await resetTeam()
  })

  test('adding a character updates the detail page, show it on the team page, and removing it from the team page will allow extra team members', async ({
    page,
  }) => {
    const luke = characterById(1)

    await page.goto('/characters/1')
    await expect(page.getByRole('button', { name: 'Add to team' })).toBeEnabled()
    await page.getByRole('button', { name: 'Add to team' }).click()
    await expect(page.getByRole('button', { name: 'Remove from team' })).toBeVisible()

    await page.goto('/')
    await expect(page.getByText(luke.name).first()).toBeVisible()

    await page.goto('/team')
    await expect(page.getByRole('heading', { level: 1, name: 'Your team' })).toBeVisible()
    await expect(page.getByText(luke.name).first()).toBeVisible()

    await page
      .getByRole('main')
      .getByRole('button', { name: new RegExp(`remove ${luke.name}`, 'i') })
      .click()
    await expect(page.getByRole('heading', { name: 'Your team is empty' })).toBeVisible()

    await page.goto('/characters/1')
    await expect(page.getByRole('button', { name: 'Add to team' })).toBeVisible()
  })
})
