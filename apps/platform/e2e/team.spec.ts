import { expect, test } from '@playwright/test'
import { characterById, resetTeam } from './setup'

test.beforeEach(async () => {
  await resetTeam()
})

test('add and remove from the team, sidebar follows', async ({ page }) => {
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
