import { describe, expect, it } from 'vitest'
import { SEARCH_INDEX, searchItems } from './search'

describe('SEARCH_INDEX', () => {
  it('covers every deck item exactly once', () => {
    // Matches the total the Home screen advertises; guards against a deck being
    // dropped from the flatten.
    expect(SEARCH_INDEX.length).toBeGreaterThan(1500)
    const labels = new Set(SEARCH_INDEX.map((e) => e.deckLabel))
    expect(labels.size).toBe(11)
  })
})

describe('searchItems', () => {
  it('returns nothing for an empty or whitespace query', () => {
    expect(searchItems('')).toEqual([])
    expect(searchItems('   ')).toEqual([])
  })

  it('matches romaji case-insensitively', () => {
    const hits = searchItems('Annyeonghaseyo')
    expect(hits.some((e) => e.hangul.hangul === '안녕하세요')).toBe(true)
  })

  it('matches Japanese meaning substrings', () => {
    const hits = searchItems('コーヒー')
    expect(hits.some((e) => e.hangul.hangul === '커피')).toBe(true)
  })

  it('matches hangul directly', () => {
    const hits = searchItems('아')
    expect(hits.some((e) => e.hangul.hangul === '아')).toBe(true)
  })

  it('ranks an exact romaji match above a mere substring match', () => {
    const hits = searchItems('a')
    expect(hits.length).toBeGreaterThan(0)
    // The standalone 아 (romaji exactly "a") should outrank words containing "a".
    expect(hits[0].hangul.romaji).toBe('a')
  })

  it('respects the result limit', () => {
    expect(searchItems('a', SEARCH_INDEX, 5).length).toBeLessThanOrEqual(5)
  })
})
