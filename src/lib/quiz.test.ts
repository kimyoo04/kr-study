import { describe, expect, it } from 'vitest'
import { DECKS, BASIC, BASIC_ROWS, rowLookup } from '../data/hangul'
import { buildQuestion, isCorrect, optionText, pickDistractors, pickQType } from './quiz'

// Deterministic rng for stable assertions.
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

const A = { hangul: '아', romaji: 'a' }
const BASIC_ROW_OF = rowLookup(BASIC_ROWS)

describe('pickDistractors', () => {
  it('never includes the answer and respects count', () => {
    const d = pickDistractors(A, 3, BASIC, seeded(1))
    expect(d).toHaveLength(3)
    expect(d.some((k) => k.hangul === '아')).toBe(false)
    expect(new Set(d.map((k) => k.hangul)).size).toBe(3) // no dups
  })

  it('prefers same-row distractors first', () => {
    // 아 row is [아야어여오요우유으이]; with count 2 both should come from that row.
    const d = pickDistractors(A, 2, BASIC, seeded(7))
    const rowItems = BASIC_ROW_OF['아'].map((k) => k.hangul)
    expect(d.every((k) => rowItems.includes(k.hangul))).toBe(true)
  })

  it('falls back to other rows when same row is exhausted', () => {
    // Row has 9 non-answer members; asking for 12 forces global fill.
    const d = pickDistractors(A, 12, BASIC, seeded(3))
    expect(d).toHaveLength(12)
    const rowItems = BASIC_ROW_OF['아'].map((k) => k.hangul)
    expect(d.some((k) => !rowItems.includes(k.hangul))).toBe(true)
  })

  it('uses the active deck rowOf — rows from other decks must not leak in', () => {
    // 이 exists in both the basic chart and the words deck. With the words
    // deck's rowOf, distractors for 이 must come from that deck's row/pool,
    // never from the basic vowel row.
    const words = DECKS.find((d) => d.id === 'words')!
    const yi = words.items.find((k) => k.hangul === '이')
    if (!yi) return // content may change; the invariant is exercised when present
    const picked = pickDistractors(yi, 3, words.items, seeded(5), (k) => k.hangul, words.rowOf)
    const inWords = new Set(words.items.map((k) => k.hangul))
    expect(picked.every((k) => inWords.has(k.hangul))).toBe(true)
  })
})

describe('buildQuestion', () => {
  it('produces 4 options including the answer', () => {
    const q = buildQuestion(A, 'read', 'hangul', BASIC, BASIC_ROW_OF, seeded(2))
    expect(q.options).toHaveLength(4)
    expect(q.options.some((o) => o.hangul === '아')).toBe(true)
  })

  it('isCorrect matches only the answer', () => {
    const q = buildQuestion(A, 'listen', 'hangul', BASIC, BASIC_ROW_OF, seeded(5))
    expect(isCorrect(q, A)).toBe(true)
    const wrong = q.options.find((o) => o.hangul !== '아')!
    expect(isCorrect(q, wrong)).toBe(false)
  })

  it('never shows two options with the same display text, on any deck item', () => {
    // Two items can share a romaji or a Japanese meaning — rendering both makes
    // a correct-looking option silently wrong.
    for (const d of DECKS) {
      const qtype = d.kind === 'hangul' ? 'read' : 'meaning'
      d.items.forEach((k, i) => {
        const q = buildQuestion(k, qtype, d.kind, d.items, d.rowOf, seeded(i + 1))
        const texts = q.options.map((o) => optionText(o, qtype, d.kind))
        expect(new Set(texts).size, `${d.id}:${k.hangul} -> ${texts.join('|')}`).toBe(
          texts.length,
        )
      })
    }
  })

  it('always offers a full 4 options when the pool is the whole deck', () => {
    // Category-scoped lessons still quiz against the whole-deck pool — tiny
    // categories (e.g. 着 〜벌, 2 items) must not degrade to coin flips.
    for (const d of DECKS) {
      const qtype = d.kind === 'hangul' ? 'read' : 'meaning'
      d.items.forEach((k, i) => {
        const q = buildQuestion(k, qtype, d.kind, d.items, d.rowOf, seeded(i + 7))
        expect(q.options.length, `${d.id}:${k.hangul}`).toBe(4)
      })
    }
  })
})

describe('pickQType', () => {
  it('listen mode forces listen on every deck when a voice exists', () => {
    expect(pickQType('hangul', true, true, 0)).toBe('listen')
    expect(pickQType('words', true, true, 0)).toBe('listen')
    expect(pickQType('sentence', true, true, 1)).toBe('listen')
  })

  it('listen mode falls back to normal types when no voice is available', () => {
    expect(pickQType('hangul', true, false, 0)).toBe('read')
    expect(pickQType('words', true, false, 0)).toBe('meaning')
    expect(pickQType('sentence', true, false, 0)).toBe('meaning')
  })

  it('without listen mode, word decks always quiz on meaning', () => {
    expect(pickQType('words', false, true, 0)).toBe('meaning')
    expect(pickQType('sentence', false, true, 5)).toBe('meaning')
  })

  it('without listen mode, hangul decks round-robin read/listen and drop listen with no voice', () => {
    expect(pickQType('hangul', false, true, 0)).toBe('read')
    expect(pickQType('hangul', false, true, 1)).toBe('listen')
    expect(pickQType('hangul', false, false, 1)).toBe('read')
  })
})
