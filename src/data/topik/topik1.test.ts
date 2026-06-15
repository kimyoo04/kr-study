import { describe, expect, it } from 'vitest'
import { TOPIK_POOL } from './index'
import type { ReadingSetQ } from './types'

// Integrity checks over the TOPIK bank — content is hand-authored and agent-
// editable, so the invariants the exam engine relies on are enforced here.
describe('TOPIK content integrity', () => {
  it('has both sections populated for TOPIK1', () => {
    const t1 = TOPIK_POOL.filter((q) => q.level === 'TOPIK1')
    expect(t1.some((q) => q.part === 'listening')).toBe(true)
    expect(t1.some((q) => q.part === 'reading')).toBe(true)
  })

  it('has a bank big enough that sampling gives varied exams', () => {
    // sampleExam draws 10 듣기 + 14 읽기; the bank must comfortably exceed that.
    const listening = TOPIK_POOL.filter((q) => q.part === 'listening')
    const reading = TOPIK_POOL.filter((q) => q.part === 'reading')
    expect(listening.length).toBeGreaterThanOrEqual(24)
    expect(reading.length).toBeGreaterThanOrEqual(24)
  })

  it('every listening item has a script, 4 choices, and an in-range answer', () => {
    for (const q of TOPIK_POOL) {
      if (q.part !== 'listening') continue
      expect(q.script.length, `${q.id} empty script`).toBeGreaterThan(0)
      expect(q.choices, `${q.id} not 4 choices`).toHaveLength(4)
      expect(q.answer, `${q.id} answer out of range`).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.choices.length)
    }
  })

  it('every reading item (single or passage sub-q) has 4 choices and a valid answer', () => {
    for (const q of TOPIK_POOL) {
      if (q.part !== 'reading') continue
      if (q.kind === 'passage') {
        const set = q as ReadingSetQ
        expect(set.passage.length, `${q.id} empty passage`).toBeGreaterThan(0)
        expect(set.questions.length, `${q.id} empty passage set`).toBeGreaterThan(0)
        for (const sub of set.questions) {
          expect(sub.choices, `${q.id} sub not 4 choices`).toHaveLength(4)
          expect(sub.answer).toBeGreaterThanOrEqual(0)
          expect(sub.answer).toBeLessThan(sub.choices.length)
        }
      } else {
        expect(q.prompt.length, `${q.id} empty prompt`).toBeGreaterThan(0)
        expect(q.choices, `${q.id} not 4 choices`).toHaveLength(4)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(q.choices.length)
      }
    }
  })

  it('every item (and passage sub-question) has a Japanese explanation', () => {
    for (const q of TOPIK_POOL) {
      if (q.part === 'reading' && q.kind === 'passage') {
        for (const sub of (q as ReadingSetQ).questions) {
          expect(sub.explain, `${q.id} sub missing explain`).toBeTruthy()
        }
      } else {
        expect(q.explain, `${q.id} missing explain`).toBeTruthy()
      }
    }
  })

  it('has no duplicate question ids', () => {
    const ids = TOPIK_POOL.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('reading choices have no duplicate options within an item', () => {
    for (const q of TOPIK_POOL) {
      if (q.part === 'reading' && q.kind !== 'passage') {
        expect(new Set(q.choices).size, `${q.id} dup choice`).toBe(q.choices.length)
      }
    }
  })
})
