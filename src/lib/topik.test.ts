import { beforeEach, describe, expect, it } from 'vitest'
import type { TopikQuestion, ScoredItem } from '../data/topik/types'
import {
  appendResult,
  buildExam,
  clearProgress,
  flatten,
  gradeFromPercent,
  hasContent,
  loadProgress,
  loadResults,
  sampleExam,
  saveProgress,
  scoreExam,
} from './topik'
import { seeded } from './rng'

const POOL: TopikQuestion[] = [
  {
    id: 'l1',
    level: 'TOPIK1',
    part: 'listening',
    script: '가: 안녕? 나: 안녕!',
    prompt: 'Q',
    choices: ['a', 'b', 'c', 'd'],
    answer: 0,
  },
  {
    id: 'l2',
    level: 'TOPIK1',
    part: 'listening',
    script: '가: 뭐? 나: 책.',
    prompt: 'Q',
    choices: ['a', 'b', 'c', 'd'],
    answer: 1,
  },
  {
    id: 'r1',
    level: 'TOPIK1',
    part: 'reading',
    kind: 'cloze',
    prompt: '___',
    choices: ['a', 'b', 'c', 'd'],
    answer: 2,
  },
  {
    id: 'rset',
    level: 'TOPIK1',
    part: 'reading',
    kind: 'passage',
    passage: '지문입니다.',
    questions: [
      { prompt: 'Q1', choices: ['a', 'b', 'c', 'd'], answer: 0 },
      { prompt: 'Q2', choices: ['a', 'b', 'c', 'd'], answer: 1 },
    ],
  },
  // A TOPIK2 item to prove level filtering.
  {
    id: 'l-t2',
    level: 'TOPIK2',
    part: 'listening',
    script: '...',
    prompt: 'Q',
    choices: ['a', 'b', 'c', 'd'],
    answer: 0,
  },
]

describe('flatten', () => {
  it('fans a passage set into one item per sub-question and keeps the passage', () => {
    const items = flatten(POOL.filter((q) => q.id === 'rset'))
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('rset-0')
    expect(items[1].id).toBe('rset-1')
    expect(items.every((it) => it.passage === '지문입니다.')).toBe(true)
  })

  it('keeps the script on listening items and leaves passage undefined', () => {
    const [it] = flatten(POOL.filter((q) => q.id === 'l1'))
    expect(it.script).toBe('가: 안녕? 나: 안녕!')
    expect(it.passage).toBeUndefined()
  })

  it('TOPIK1 flattens to 2 listening + 3 reading (1 single + 2 passage sub-q)', () => {
    const items = flatten(POOL.filter((q) => q.level === 'TOPIK1'))
    expect(items.filter((i) => i.part === 'listening')).toHaveLength(2)
    expect(items.filter((i) => i.part === 'reading')).toHaveLength(3)
  })
})

describe('buildExam', () => {
  it('groups items by section in PART_ORDER (listening before reading)', () => {
    const exam = buildExam('TOPIK1', POOL, seeded(1))
    const firstReading = exam.findIndex((i) => i.part === 'reading')
    const lastListening = exam.map((i) => i.part).lastIndexOf('listening')
    expect(lastListening).toBeLessThan(firstReading)
  })

  it('only includes the requested level', () => {
    const exam = buildExam('TOPIK1', POOL, seeded(1))
    expect(exam.some((i) => i.id === 'l-t2')).toBe(false)
    expect(exam).toHaveLength(5) // 2 listening + 3 reading items
  })

  it('is deterministic for a fixed seed', () => {
    const a = buildExam('TOPIK1', POOL, seeded(42)).map((i) => i.id)
    const b = buildExam('TOPIK1', POOL, seeded(42)).map((i) => i.id)
    expect(a).toEqual(b)
  })

  it('preserves the correct answer through choice shuffling', () => {
    const exam = buildExam('TOPIK1', POOL, seeded(7))
    for (const it of exam) {
      // The shuffled answer index must still point at a real choice.
      expect(it.choices[it.answer]).toBeDefined()
    }
  })
})

describe('sampleExam', () => {
  it('takes up to N per section and keeps listening before reading', () => {
    const exam = sampleExam('TOPIK1', POOL, { listening: 1, reading: 2 }, seeded(3))
    expect(exam.filter((i) => i.part === 'listening')).toHaveLength(1)
    expect(exam.filter((i) => i.part === 'reading')).toHaveLength(2)
    const firstReading = exam.findIndex((i) => i.part === 'reading')
    const lastListening = exam.map((i) => i.part).lastIndexOf('listening')
    expect(lastListening).toBeLessThan(firstReading)
  })

  it('falls back to all items in a section when the bank has fewer', () => {
    // POOL has 2 listening, 3 reading scored items.
    const exam = sampleExam('TOPIK1', POOL, { listening: 99, reading: 99 }, seeded(1))
    expect(exam.filter((i) => i.part === 'listening')).toHaveLength(2)
    expect(exam.filter((i) => i.part === 'reading')).toHaveLength(3)
  })

  it('is deterministic per seed but varies across seeds (fresh questions on retake)', () => {
    const a = sampleExam('TOPIK1', POOL, { listening: 1, reading: 1 }, seeded(1)).map((i) => i.id)
    const b = sampleExam('TOPIK1', POOL, { listening: 1, reading: 1 }, seeded(1)).map((i) => i.id)
    expect(a).toEqual(b)
    // Across a spread of seeds, the sampled reading id should not always be the same.
    const readingIds = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(
        (s) => sampleExam('TOPIK1', POOL, { reading: 1 }, seeded(s)).find((i) => i.part === 'reading')!.id,
      ),
    )
    expect(readingIds.size).toBeGreaterThan(1)
  })

  it('only samples the requested level', () => {
    const exam = sampleExam('TOPIK1', POOL, { listening: 99, reading: 99 }, seeded(1))
    expect(exam.some((i) => i.id === 'l-t2')).toBe(false)
  })
})

describe('hasContent', () => {
  it('is true for TOPIK1, true for TOPIK2 here (pool has one), false otherwise', () => {
    expect(hasContent('TOPIK1', POOL)).toBe(true)
    expect(hasContent('TOPIK2', POOL)).toBe(true)
    expect(hasContent('TOPIK2', POOL.filter((q) => q.level === 'TOPIK1'))).toBe(false)
  })
})

describe('gradeFromPercent', () => {
  it('maps to TOPIK I bands (≥70% → 2級, ≥40% → 1級, else 0)', () => {
    expect(gradeFromPercent(0.9)).toBe(2)
    expect(gradeFromPercent(0.7)).toBe(2)
    expect(gradeFromPercent(0.55)).toBe(1)
    expect(gradeFromPercent(0.4)).toBe(1)
    expect(gradeFromPercent(0.3)).toBe(0)
  })
})

describe('scoreExam', () => {
  const items: ScoredItem[] = [
    { id: 'a', part: 'listening', prompt: 'Q', choices: ['x', 'y'], answer: 0 },
    { id: 'b', part: 'listening', prompt: 'Q', choices: ['x', 'y'], answer: 0 },
    { id: 'c', part: 'reading', prompt: 'Q', choices: ['x', 'y'], answer: 0 },
    { id: 'd', part: 'reading', prompt: 'Q', choices: ['x', 'y'], answer: 0 },
  ]

  it('counts per section and unanswered (null) as wrong', () => {
    const r = scoreExam(items, [0, 0, 1, null])
    expect(r.partScores.listening).toEqual({ correct: 2, total: 2 })
    expect(r.partScores.reading).toEqual({ correct: 0, total: 2 })
    expect(r.total).toEqual({ correct: 2, total: 4 })
  })

  it('flags the weaker section when it is at least one question worse', () => {
    const r = scoreExam(items, [0, 0, 1, 1]) // listening 2/2, reading 0/2
    expect(r.weakestPart).toBe('reading')
    expect(r.inconclusive).toBe(false)
  })

  it('is inconclusive when sections are within a question of each other', () => {
    const r = scoreExam(items, [0, 1, 0, 1]) // listening 1/2, reading 1/2
    expect(r.inconclusive).toBe(true)
    expect(r.weakestPart).toBeNull()
  })

  it('assigns the estimated 級 from the overall percentage', () => {
    expect(scoreExam(items, [0, 0, 0, 0]).grade).toBe(2) // 100%
    expect(scoreExam(items, [0, 0, 1, 1]).grade).toBe(1) // 50%
    expect(scoreExam(items, [1, 1, 1, 1]).grade).toBe(0) // 0%
  })
})

describe('persistence', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips in-progress state and clears it', () => {
    const items: ScoredItem[] = [
      { id: 'a', part: 'listening', prompt: 'Q', choices: ['x', 'y'], answer: 0 },
    ]
    saveProgress({ level: 'TOPIK1', items, answers: [null], idx: 0 })
    expect(loadProgress()?.level).toBe('TOPIK1')
    clearProgress()
    expect(loadProgress()).toBeNull()
  })

  it('appends results newest-last', () => {
    appendResult({
      level: 'TOPIK1',
      takenAt: '2026-06-15',
      partScores: { listening: { correct: 2, total: 2 }, reading: { correct: 1, total: 2 } },
      grade: 1,
      weakestPart: 'reading',
    })
    const all = loadResults()
    expect(all).toHaveLength(1)
    expect(all[0].grade).toBe(1)
  })
})
