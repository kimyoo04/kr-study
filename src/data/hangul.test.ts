import { describe, expect, it } from 'vitest'
import {
  ADVANCED,
  ADVANCED_ROWS,
  BASIC,
  BASIC_ROWS,
  DECKS,
  deckCategories,
  rowLookup,
} from './hangul'

describe('hangul data', () => {
  it('basic chart is 10 rows x 10 syllables (vowels + 9 plain consonants)', () => {
    expect(BASIC_ROWS).toHaveLength(10)
    for (const row of BASIC_ROWS) expect(row).toHaveLength(10)
    expect(BASIC).toHaveLength(100)
  })

  it('teaches vowels first, then consonant rows', () => {
    expect(BASIC[0].hangul).toBe('아')
    expect(BASIC[10].hangul).toBe('가') // first consonant row
  })

  it('advanced deck covers aspirated/tense/compound-vowel/batchim rows', () => {
    expect(ADVANCED_ROWS.length).toBeGreaterThanOrEqual(15)
    expect(ADVANCED[0].hangul).toBe('카') // aspirated first
    expect(ADVANCED.length).toBeGreaterThanOrEqual(120)
  })

  it('every letter maps to its own row via rowLookup', () => {
    const basicRowOf = rowLookup(BASIC_ROWS)
    const advancedRowOf = rowLookup(ADVANCED_ROWS)
    for (const [items, rowOf] of [
      [BASIC, basicRowOf],
      [ADVANCED, advancedRowOf],
    ] as const) {
      for (const k of items) {
        const row = rowOf[k.hangul]
        expect(row, `missing row for ${k.hangul}`).toBeDefined()
        expect(row.some((r) => r.hangul === k.hangul)).toBe(true)
      }
    }
  })

  it('has no duplicate syllables across basic + advanced', () => {
    const chars = [...BASIC, ...ADVANCED].map((k) => k.hangul)
    expect(new Set(chars).size).toBe(chars.length)
  })

  it('letters have no meaning field (quizzed on reading, not meaning)', () => {
    for (const k of [...BASIC, ...ADVANCED]) expect(k.meaning).toBeUndefined()
  })

  it('registers ten decks', () => {
    expect(DECKS).toHaveLength(10)
    expect(new Set(DECKS.map((d) => d.id)).size).toBe(10)
  })

  it('every deck: items is rows flattened, and catLabels (if present) is 1:1 with rows', () => {
    for (const d of DECKS) {
      expect(d.items, d.id).toHaveLength(d.rows.flat().length)
      if (d.catLabels) expect(d.catLabels, d.id).toHaveLength(d.rows.length)
    }
  })

  it('deckCategories: hangul decks get one category per row, sentence decks group by note', () => {
    const basic = DECKS.find((d) => d.id === 'basic')!
    const cats = deckCategories(basic)
    expect(cats).toHaveLength(BASIC_ROWS.length)
    expect(cats[0].items).toHaveLength(10)

    const grammar = DECKS.find((d) => d.id === 'grammar')!
    const gcats = deckCategories(grammar)
    // every category is non-empty and names are unique
    expect(gcats.length).toBeGreaterThan(0)
    expect(new Set(gcats.map((c) => c.name)).size).toBe(gcats.length)
    for (const c of gcats) expect(c.items.length).toBeGreaterThan(0)
  })

  it('category names within a deck are unique (collisions get numbered)', () => {
    for (const d of DECKS) {
      const names = deckCategories(d).map((c) => c.name)
      expect(new Set(names).size, d.id).toBe(names.length)
    }
  })
})
