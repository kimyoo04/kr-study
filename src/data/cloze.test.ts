import { describe, expect, it } from 'vitest'
import { CLOZE, CLOZE_ROWS, CLOZE_CATS } from './cloze'
import { clozePrompt } from '../lib/quiz'

// Cloze quizzes blank the answer word out of the sentence, so each answer must
// be present exactly once (otherwise the blank is ambiguous or absent).
describe('cloze deck', () => {
  it('has one category label per row', () => {
    expect(CLOZE_CATS).toHaveLength(CLOZE_ROWS.length)
  })

  for (const item of CLOZE) {
    describe(item.hangul, () => {
      it('carries an answer word', () => {
        expect(item.answer, `${item.hangul}: missing answer`).toBeTruthy()
      })

      it('answer appears exactly once in the sentence', () => {
        const answer = item.answer ?? ''
        const first = item.hangul.indexOf(answer)
        expect(first, `${item.hangul}: answer "${answer}" not found`).toBeGreaterThanOrEqual(0)
        expect(
          item.hangul.indexOf(answer, first + 1),
          `${item.hangul}: answer "${answer}" appears more than once`,
        ).toBe(-1)
      })

      it('blanks the answer in the prompt', () => {
        const prompt = clozePrompt(item)
        expect(prompt).toContain('____')
        expect(prompt).not.toContain(item.answer ?? '')
      })
    })
  }

  it('answer words are unique within a row (distractors stay distinct)', () => {
    for (const row of CLOZE_ROWS) {
      const answers = row.map((k) => k.answer)
      const dupes = answers.filter((a, i) => answers.indexOf(a) !== i)
      expect(dupes, `dupe answers: ${dupes.join(', ')}`).toHaveLength(0)
    }
  })
})
