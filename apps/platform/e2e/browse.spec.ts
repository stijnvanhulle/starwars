import { expect, test } from '@playwright/test'
import { characterById, characters, resetTeam } from './setup'

test.beforeEach(async () => {
  await resetTeam()
})

test('list, detail, prev and next', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Star Wars characters')
  for (const character of characters) {
    await expect(page.getByText(character.name, { exact: true }).first()).toBeVisible()
  }

  const luke = characterById(1)
  await page.getByText(luke.name, { exact: true }).first().click()
  await expect(page).toHaveURL(/\/characters\/1$/)

  await expect(page.getByRole('heading', { level: 1, name: luke.name })).toBeVisible()
  await expect(page.getByText(`${Math.round(luke.height! * 100)}cm`)).toBeVisible()
  await expect(page.getByText(`${luke.mass!}kg`)).toBeVisible()
  for (const affiliation of luke.affiliations ?? []) {
    await expect(page.getByText(affiliation).first()).toBeVisible()
  }

  await page.getByRole('button', { name: /^Next/ }).click()
  await expect(page).toHaveURL(/\/characters\/2$/)

  await page.getByRole('button', { name: /^Prev/ }).click()
  await expect(page).toHaveURL(/\/characters\/1$/)

  await page.getByRole('button', { name: /^Prev/ }).click()
  await expect(page).toHaveURL(new RegExp(`/characters/${characters[characters.length - 1]!.id}$`))
})
