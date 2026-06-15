import { expect, test } from '@playwright/test'

// TOPIK mock-exam happy path: Home -> TOPIK home -> start TOPIK I -> answer
// every item -> submit -> report shows an estimated 級.
test('runs a TOPIK I mini mock exam and shows a graded report', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')

  await page.getByRole('button', { name: /TOPIK 模擬試験/ }).click()
  await expect(page.getByText('レベルを選んでください')).toBeVisible()

  await page.getByRole('button', { name: 'ミニ模擬試験を始める' }).click()

  // First item is a listening item — the section tag proves 듣기 runs first.
  await expect(page.getByText(/聞き取り/)).toBeVisible()

  // Answer every item by picking the first option, then advance. The counter
  // reads "n/total"; loop until we've submitted.
  for (let i = 0; i < 40; i++) {
    await page.locator('.opt').first().click()
    const next = page.getByRole('button', { name: '次へ' })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
    } else {
      await page.getByRole('button', { name: '提出' }).click()
      break
    }
  }

  // Report: every item answered, so no unanswered warning — go straight to result.
  await expect(page.getByText(/判定結果/)).toBeVisible()
  // Hero shows the estimated 級 (or 不合格ライン when below 1級).
  await expect(page.locator('.topik-hero-grade')).toBeVisible()
  await expect(page.locator('.topik-hero-grade')).toHaveText(/級|不合格/)

  // Answer review: every answered item shows a correct mark and an explanation.
  await page.getByRole('button', { name: '答えを見直す' }).click()
  await expect(page.getByText('答え合わせ')).toBeVisible()
  await expect(page.locator('.topik-explain').first()).toBeVisible()
  await expect(page.locator('.topik-review-item').first()).toBeVisible()
  // Filter to mistakes only, then return to the report.
  await page.getByRole('button', { name: /間違いだけ/ }).click()
  await page.getByRole('button', { name: '結果に戻る' }).click()
  await expect(page.getByText(/判定結果/)).toBeVisible()

  // Back home.
  await page.getByRole('button', { name: 'ホームへ' }).click()
  await expect(page.getByRole('heading', { name: 'かんこくご Pocket' })).toBeVisible()
})

test('TOPIK II is shown but not yet playable', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /TOPIK 模擬試験/ }).click()
  await expect(page.getByText('準備中')).toBeVisible()
})
