import { describe, expect, it } from 'vitest'
import { DECKS } from './hangul'

// Generic integrity checks over every content deck — agents and humans both
// edit these files, so the invariants the app relies on are enforced here.
describe('deck content integrity', () => {
  for (const d of DECKS) {
    describe(d.id, () => {
      it('every item has hangul and romaji', () => {
        for (const k of d.items) {
          expect(k.hangul.length, `${d.id}: empty hangul`).toBeGreaterThan(0)
          expect(k.romaji.length, `${d.id}: ${k.hangul} missing romaji`).toBeGreaterThan(0)
        }
      })

      if (d.kind !== 'hangul') {
        it('every item has a Japanese meaning', () => {
          for (const k of d.items) {
            expect(k.meaning, `${d.id}: ${k.hangul} missing meaning`).toBeTruthy()
          }
        })
      }

      if (d.kind === 'sentence') {
        it('every sentence carries a pattern/situation note', () => {
          for (const k of d.items) {
            expect(k.note, `${d.id}: ${k.hangul} missing note`).toBeTruthy()
          }
        })
      }

      it('has no duplicate items within the deck', () => {
        const texts = d.items.map((k) => k.hangul)
        const dupes = texts.filter((t, i) => texts.indexOf(t) !== i)
        expect(dupes, `${d.id} dupes: ${[...new Set(dupes)].join(', ')}`).toHaveLength(0)
      })

      it('romaji is lowercase ascii-ish (Revised Romanization)', () => {
        for (const k of d.items) {
          expect(k.romaji, `${d.id}: ${k.hangul} romaji "${k.romaji}"`).toMatch(
            /^[a-z0-9 .,!?'-]+$/,
          )
        }
      })

      it('registers every row in the deck rowOf for distractor grouping', () => {
        for (const row of d.rows) {
          for (const k of row) {
            expect(d.rowOf[k.hangul], `${d.id}: ${k.hangul} not in rowOf`).toBeDefined()
          }
        }
      })

      it('rows are reasonably sized for lessons (2..16 items)', () => {
        for (const row of d.rows) {
          expect(row.length, `${d.id} row size ${row.length}`).toBeGreaterThanOrEqual(2)
          expect(row.length, `${d.id} row size ${row.length}`).toBeLessThanOrEqual(16)
        }
      })
    })
  }

  it('has no duplicate items ACROSS content decks (hangul text is the progress key)', () => {
    // Letter decks legitimately collide with words (밤 the syllable vs 밤 "夜"),
    // same as jp-study's に (kana) vs に (the word "2"). Content decks must not.
    const seen = new Map<string, string>()
    const dupes: string[] = []
    for (const d of DECKS) {
      if (d.kind === 'hangul') continue
      for (const k of d.items) {
        const owner = seen.get(k.hangul)
        if (owner && owner !== d.id) dupes.push(`${k.hangul} (${owner} + ${d.id})`)
        seen.set(k.hangul, d.id)
      }
    }
    expect(dupes, dupes.slice(0, 10).join(', ')).toHaveLength(0)
  })

  it('has a substantial total volume across all decks', () => {
    const total = DECKS.reduce((n, d) => n + d.items.length, 0)
    expect(total).toBeGreaterThanOrEqual(1500)
  })
})
