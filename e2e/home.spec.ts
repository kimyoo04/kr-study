import { expect, test } from '@playwright/test'

// Guards the home top-bar markup refactor: search + sfx buttons moved out of
// .home-head into the .home-topbar row. If either button is dropped during a
// future edit, this fails. Safe-area top clearance itself is device-specific
// (env(safe-area-inset-top) = 0 in headless) and is verified by manual QA.
test('home renders search and sfx toggle in the top bar', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')

  await expect(page.getByRole('heading', { name: 'かんこくご Pocket' })).toBeVisible()
  await expect(page.getByRole('button', { name: '検索' })).toBeVisible()
  // sfx toggle label flips with state (オフ/オン) — match either.
  await expect(page.getByRole('button', { name: /効果音/ })).toBeVisible()
})
