// TOPIK mock-exam lifecycle: sampling, resume-from-storage, autosave-backed
// progress, and scoring. Kept out of App so the screen router only wires the
// domain to navigation. The hook owns the exam state; callers supply where to
// go when an exam starts (toExam) and when it's graded (toReport).
import { useState } from 'react'
import type { ScoredItem, TopikLevel } from '../data/topik/types'
import { TOPIK_POOL } from '../data/topik'
import {
  appendResult,
  clearProgress,
  loadProgress,
  sampleExam,
  scoreExam,
  type ExamResult,
} from '../lib/topik'
import { today } from '../lib/date'

// Mini mock-exam size per level, sampled fresh from the bank each run.
// (TOPIK II reading passages run longer, so it takes slightly fewer.)
const TOPIK_EXAM_COUNTS: Record<TopikLevel, { listening: number; reading: number }> = {
  TOPIK1: { listening: 12, reading: 16 },
  TOPIK2: { listening: 12, reading: 14 },
}

interface Nav {
  toExam: () => void
  toReport: () => void
}

export interface TopikExamState {
  level: TopikLevel
  items: ScoredItem[]
  answers: (number | null)[]
  idx: number
  result: ExamResult | null
  /** Sample a fresh exam for `level` and open the runner. No-op if the bank is empty. */
  start: (level: TopikLevel) => void
  /** Resume a saved-in-progress exam. No-op if nothing is saved. */
  resume: () => void
  /** Grade the given answers, persist the result, and open the report. */
  complete: (items: ScoredItem[], answers: (number | null)[]) => void
}

export function useTopikExam({ toExam, toReport }: Nav): TopikExamState {
  const [level, setLevel] = useState<TopikLevel>('TOPIK1')
  const [items, setItems] = useState<ScoredItem[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [idx, setIdx] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)

  function start(next: TopikLevel) {
    const exam = sampleExam(next, TOPIK_POOL, TOPIK_EXAM_COUNTS[next])
    if (exam.length === 0) return
    setLevel(next)
    setItems(exam)
    setAnswers(new Array(exam.length).fill(null))
    setIdx(0)
    toExam()
  }

  function resume() {
    const saved = loadProgress()
    if (!saved) return
    setLevel(saved.level)
    setItems(saved.items)
    setAnswers(saved.answers)
    setIdx(saved.idx)
    toExam()
  }

  function complete(examItems: ScoredItem[], examAnswers: (number | null)[]) {
    const scored = scoreExam(examItems, examAnswers, level)
    clearProgress()
    appendResult({
      level,
      takenAt: today(),
      partScores: scored.partScores,
      grade: scored.grade,
      weakestPart: scored.weakestPart,
    })
    // Keep the graded items + answers so the review screen can show them.
    setItems(examItems)
    setAnswers(examAnswers)
    setResult(scored)
    toReport()
  }

  return { level, items, answers, idx, result, start, resume, complete }
}
