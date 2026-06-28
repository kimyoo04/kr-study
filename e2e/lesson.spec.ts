import { expect, test } from '@playwright/test'

// Core loop: Home -> first (cold-start) lesson is all intro cards ->
// finish -> Complete -> Home shows progress.
test('complete a cold-start lesson and persist progress', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')

  await expect(page.getByRole('heading', { name: 'かんこくご Pocket' })).toBeVisible()
  await page.getByRole('button', { name: 'はじめる' }).click()

  // 6 intro cards -> click 次へ six times.
  for (let i = 0; i < 6; i++) {
    await expect(page.getByText('新しい文字')).toBeVisible()
    await page.getByRole('button', { name: '次へ' }).click()
  }

  await expect(page.getByRole('heading', { name: 'レッスン完了!' })).toBeVisible()
  await page.getByRole('button', { name: 'ホームへ' }).click()

  await expect(page.getByText('レッスン 1回 完了')).toBeVisible()
})

test('sound toggle flips state and persists across reload', async ({ page }) => {
  // Fresh Playwright context already starts with empty storage; no clear needed
  // (clearing on every load would also wipe state on reload and break this test).
  await page.goto('./')

  const toggle = page.getByRole('button', { name: '効果音をオフ' }) // on by default
  await expect(toggle).toBeVisible()
  await toggle.click()

  // Now off -> label flips to オン.
  const toggleOff = page.getByRole('button', { name: '効果音をオン' })
  await expect(toggleOff).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: '効果音をオン' })).toBeVisible()
})

test('listen-mode toggle is present on Home', async ({ page }) => {
  // The toggle gates on a Korean TTS voice. Headless Chromium ships none, so
  // here it renders disabled — assert it exists either way. The qtype logic it
  // drives is covered by the pickQType unit tests.
  await page.goto('./')
  await expect(page.getByRole('button', { name: /聞いて解く/ })).toBeVisible()
})

test('search finds items across decks by romaji, meaning, and hangul', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '検索' }).click()

  const input = page.getByRole('searchbox', { name: '検索' })
  await expect(input).toBeVisible()

  // Romaji match.
  await input.fill('annyeonghaseyo')
  await expect(page.locator('.search-row', { hasText: '안녕하세요' }).first()).toBeVisible()

  // Japanese meaning match (a different deck).
  await input.fill('コーヒー')
  await expect(page.locator('.search-row', { hasText: '커피' }).first()).toBeVisible()

  // Hangul match.
  await input.fill('아')
  await expect(page.locator('.search-row').first()).toBeVisible()

  // No-results state.
  await input.fill('zzzzz')
  await expect(page.getByText(/の結果はありません/)).toBeVisible()

  // Close returns Home.
  await page.getByRole('button', { name: '閉じる' }).click()
  await expect(page.getByRole('heading', { name: 'かんこくご Pocket' })).toBeVisible()
})

test('advanced deck teaches aspirated consonants', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'ハングル発展' }).click()
  await expect(page.getByRole('button', { name: 'ハングル発展' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: 'はじめる' }).click()

  // First advanced intro card should show 카 (not 아).
  await expect(page.getByText('新しい文字')).toBeVisible()
  await expect(page.locator('.glyph.big')).toHaveText('카')
})

test('words deck teaches words with meanings', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '単語', exact: true }).click()
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.getByText('新しい単語')).toBeVisible()
  await expect(page.locator('.glyph.word')).not.toBeEmpty()
  await expect(page.locator('.meaning')).not.toBeEmpty()
})

test('loanwords deck teaches Korean loanwords', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '外来語' }).click()
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.getByText('新しい単語')).toBeVisible()
  await expect(page.locator('.glyph.word')).not.toBeEmpty()
})

test('grammar deck teaches example sentences with a pattern', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '文法' }).click()
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.getByText('例文')).toBeVisible()
  await expect(page.locator('.pattern')).not.toBeEmpty()
  await expect(page.locator('.glyph.sentence')).not.toBeEmpty()
})

test('category selection scopes the deck to one row', async ({ page }) => {
  await page.goto('./')
  // Whole basic deck first: 100 syllables.
  await expect(page.locator('.progress-label')).toContainText('/ 100')
  // Pick the ㄱ row (平音 ㄱ行, 10 syllables).
  await page.locator('.cat-select select').selectOption('平音 ㄱ行')
  await expect(page.locator('.progress-label')).toContainText('/ 10')
  // Lessons are now drawn from that category only (starts at 가).
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.locator('.glyph.big')).toHaveText('가')
})

test('a tiny category still offers 4 quiz options (whole-deck distractor pool)', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')
  await page.getByRole('button', { name: '助数詞' }).click()
  // 着 〜벌 is a 2-item category; intro both, then quiz must still show 4 options.
  await page.locator('.cat-select select').selectOption('着 〜벌')
  await page.getByRole('button', { name: 'はじめる' }).click()
  // Intro cards first (count varies), advance until a quiz appears.
  for (let i = 0; i < 6; i++) {
    const next = page.getByRole('button', { name: '次へ' })
    if (await next.isVisible().catch(() => false)) {
      await next.click()
    } else break
  }
  await page.getByRole('button', { name: 'もう一回' }).click()
  await expect(page.locator('.opt')).toHaveCount(4)
})

test('phrases deck teaches everyday sentences with katakana reading', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '会話' }).click()
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.getByText('例文')).toBeVisible()
  await expect(page.locator('.pattern')).not.toBeEmpty()
  // 会話デッキは韓国語のすぐ下にカタカナの読みを表示する。
  await expect(page.locator('.kata-reading')).not.toBeEmpty()
})

test('hanja deck teaches Sino-Korean vocabulary', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '漢字語' }).click()
  await page.getByRole('button', { name: 'はじめる' }).click()
  await expect(page.getByText('新しい単語')).toBeVisible()
  await expect(page.locator('.glyph.word')).not.toBeEmpty()
})

test('home shows "review weak" after missing items, scoped to seen-not-learned', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'はじめる' }).click()
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: '次へ' }).click()
  await page.getByRole('button', { name: 'もう一回' }).click()
  // Miss the first, get the rest right.
  await page.locator('.opt:not([data-correct])').first().click()
  await page.getByRole('button', { name: '続ける' }).click()
  for (let i = 0; i < 5; i++) {
    await page.locator('button[data-correct="true"]').first().click()
    await page.getByRole('button', { name: '続ける' }).click()
  }
  await page.getByRole('button', { name: 'ホームへ' }).click()
  // The missed item is now weak -> Home offers a weak-review button.
  await expect(page.getByRole('button', { name: /苦手だけ復習/ })).toBeVisible()
})

test('quiz feedback shows check/cross marks and exit asks to confirm', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'はじめる' }).click()
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: '次へ' }).click()
  await page.getByRole('button', { name: 'もう一回' }).click()

  // Pick the correct answer -> it gets a ✓ mark (color + icon, not color alone).
  await page.locator('button[data-correct="true"]').first().click()
  await expect(page.locator('.opt.correct .opt-mark')).toHaveText('✓')

  // Exiting mid-lesson now asks for confirmation. The ✕ has aria-label 閉じる.
  await page.getByRole('button', { name: '閉じる' }).click()
  await expect(page.getByText('やめると今回のレッスンの進捗は消えます。')).toBeVisible()
  await page.getByRole('button', { name: 'レッスンに戻る' }).click()
  await expect(page.getByText('やめると今回のレッスンの進捗は消えます。')).toBeHidden()
})

test('complete screen shows review button after a wrong answer', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'はじめる' }).click()
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: '次へ' }).click()
  // Start lesson 2 from the Complete screen — the 6 are now due as quizzes.
  await page.getByRole('button', { name: 'もう一回' }).click()
  // Answer the first one WRONG, the rest correct.
  await page.locator('.opt:not([data-correct])').first().click()
  await page.getByRole('button', { name: '続ける' }).click()
  for (let i = 0; i < 5; i++) {
    await page.locator('button[data-correct="true"]').first().click()
    await page.getByRole('button', { name: '続ける' }).click()
  }
  // Complete: chips + review button for the 1 miss.
  await expect(page.getByText('レッスン完了!')).toBeVisible()
  const review = page.getByRole('button', { name: /間違いだけ復習/ })
  await expect(review).toBeVisible()
  await review.click()
  // Review lesson contains exactly the missed item.
  await expect(page.locator('.counter')).toHaveText('1/1')
})

test('second lesson quizzes introduced syllables and grades the pick', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('./')
  await page.getByRole('button', { name: 'はじめる' }).click()
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: '次へ' }).click()
  }
  // From Complete, start another lesson — now the 6 are due as quizzes.
  await page.getByRole('button', { name: 'もう一回' }).click()

  await expect(
    page.getByText('この文字の読みは?').or(page.getByText('音を聞いて文字を選んでください')),
  ).toBeVisible()
  // Pick the correct option (marked for test reliability).
  await page.locator('button[data-correct="true"]').first().click()
  await expect(page.getByRole('button', { name: '続ける' })).toBeVisible()
})
