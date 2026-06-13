import { beforeEach, describe, expect, it } from 'vitest'
import { loadProgress, migrateV1 } from './useProgress'
import { cardKey, PROGRESS_VERSION, type Progress } from '../lib/srs'

const KEY = 'kr-study:progress:v1'

describe('loadProgress robustness', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty progress when nothing is stored', () => {
    expect(loadProgress().progress.items).toEqual({})
  })

  it('rejects corrupt records that would crash later (items: null / array)', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: PROGRESS_VERSION, items: null, lessonsDone: 0 }))
    expect(loadProgress().progress.items).toEqual({})

    localStorage.setItem(KEY, JSON.stringify({ version: PROGRESS_VERSION, items: [], lessonsDone: 0 }))
    expect(loadProgress().progress.items).toEqual({})
  })

  it('rejects records with a non-numeric lessonsDone', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: PROGRESS_VERSION, items: {}, lessonsDone: 'x' }))
    expect(loadProgress().progress.items).toEqual({})
  })

  it('ignores unparseable JSON', () => {
    localStorage.setItem(KEY, '{not json')
    expect(loadProgress().progress.items).toEqual({})
  })

  it('loads a current-version record verbatim', () => {
    const p: Progress = {
      version: PROGRESS_VERSION,
      items: { [cardKey('basic', '아')]: { box: 2, dueLesson: 3, seen: 1, correct: 1 } },
      lessonsDone: 4,
      lastPlayed: '2026-06-13',
    }
    localStorage.setItem(KEY, JSON.stringify(p))
    expect(loadProgress().progress).toEqual(p)
  })

  it('migrates a v1 record by namespacing card keys per deck', () => {
    // v1 stored 아 keyed by raw text; it lives in the basic chart.
    const v1 = { version: 1, items: { 아: { box: 4, dueLesson: 9, seen: 5, correct: 5 } }, lessonsDone: 9, lastPlayed: '' }
    localStorage.setItem(KEY, JSON.stringify(v1))
    const { progress } = loadProgress()
    expect(progress.version).toBe(PROGRESS_VERSION)
    expect(progress.items[cardKey('basic', '아')]).toEqual({ box: 4, dueLesson: 9, seen: 5, correct: 5 })
    expect(progress.items['아']).toBeUndefined()
    // and it persists the migrated shape
    expect(JSON.parse(localStorage.getItem(KEY)!).version).toBe(PROGRESS_VERSION)
  })

  it('wipes an unknown future version rather than crashing', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 999, items: {}, lessonsDone: 0 }))
    expect(loadProgress().progress.version).toBe(PROGRESS_VERSION)
    expect(loadProgress().progress.items).toEqual({})
  })
})

describe('migrateV1', () => {
  it('copies a colliding text into every deck that teaches it', () => {
    // 이 is in both the basic chart and the words deck.
    const v1: Progress = {
      version: 1,
      items: { 이: { box: 3, dueLesson: 5, seen: 4, correct: 3 } },
      lessonsDone: 5,
      lastPlayed: '',
    }
    const out = migrateV1(v1)
    expect(out.items[cardKey('basic', '이')]).toBeDefined()
    expect(out.items[cardKey('words', '이')]).toBeDefined()
  })

  it('drops keys that match no deck item', () => {
    const v1: Progress = {
      version: 1,
      items: { 존재하지않는단어: { box: 1, dueLesson: 0, seen: 1, correct: 0 } },
      lessonsDone: 1,
      lastPlayed: '',
    }
    expect(Object.keys(migrateV1(v1).items)).toHaveLength(0)
  })
})
