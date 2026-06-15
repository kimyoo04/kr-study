// TOPIK exam engine: flatten questions into scored items, assemble an exam,
// score it into per-section results + an estimated 級, and persist in-progress
// + history to localStorage. Pure/deterministic where it matters (rng injected
// for tests). Adapted from jp-study's JLPT engine, but faithful to TOPIK's real
// two-section structure (듣기 / 읽기).

import type { TopikLevel, TopikPart, TopikQuestion, ScoredItem } from '../data/topik/types'
import { shuffle, type Rng } from './rng'
import { loadJson, saveJson } from './storage'

// Canonical section order — the real TOPIK I runs 듣기 first, then 읽기.
export const PART_ORDER: TopikPart[] = ['listening', 'reading']

/**
 * Expand questions into one ScoredItem per graded question. Reading passage
 * sets fan out into one item per sub-question (each sub-question is scored);
 * everything else is one item. Without this, "question index" and "scored item"
 * drift apart and the progress bar / scoring break.
 */
export function flatten(questions: TopikQuestion[]): ScoredItem[] {
  const items: ScoredItem[] = []
  for (const q of questions) {
    if (q.part === 'listening') {
      items.push({
        id: q.id,
        part: 'listening',
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
        script: q.script,
      })
    } else if (q.kind === 'passage') {
      q.questions.forEach((sub, i) => {
        items.push({
          id: `${q.id}-${i}`,
          part: 'reading',
          prompt: sub.prompt,
          choices: sub.choices,
          answer: sub.answer,
          passage: q.passage,
        })
      })
    } else {
      // reading single (cloze | topic | detail)
      items.push({
        id: q.id,
        part: 'reading',
        prompt: q.prompt,
        choices: q.choices,
        answer: q.answer,
      })
    }
  }
  return items
}

/** Shuffle one item's choices, remapping the answer index to the new position. */
function shuffleChoices(item: ScoredItem, rng: Rng): ScoredItem {
  const order = shuffle(
    item.choices.map((_, i) => i),
    rng,
  )
  const choices = order.map((i) => item.choices[i])
  const answer = order.indexOf(item.answer)
  return { ...item, choices, answer }
}

/**
 * Build an exam for `level`: keep items grouped in PART_ORDER (so the section
 * label is meaningful), shuffle item order *within* each section, and shuffle
 * each item's choices so retakes don't test answer-position memory.
 */
export function buildExam(
  level: TopikLevel,
  pool: TopikQuestion[],
  rng: Rng = Math.random,
): ScoredItem[] {
  const forLevel = pool.filter((q) => q.level === level)
  const all = flatten(forLevel)
  const out: ScoredItem[] = []
  for (const part of PART_ORDER) {
    const inPart = shuffle(
      all.filter((it) => it.part === part),
      rng,
    )
    for (const it of inPart) out.push(shuffleChoices(it, rng))
  }
  return out
}

/** Whether `level` has any content yet (drives the "準備中" disabled state). */
export function hasContent(level: TopikLevel, pool: TopikQuestion[]): boolean {
  return pool.some((q) => q.level === level)
}

export type PartScore = { correct: number; total: number }

// 0 = below level 1 (불합격), else the estimated TOPIK 級 (1 or 2 for TOPIK I).
export type TopikGrade = 0 | 1 | 2

export interface ExamResult {
  partScores: Record<TopikPart, PartScore>
  total: PartScore
  /** Estimated 級 from the score scaled to the real /200 band. */
  grade: TopikGrade
  /** null when the weakest section can't be told apart from the next. */
  weakestPart: TopikPart | null
  inconclusive: boolean
}

/**
 * Map a percentage to a TOPIK I 級. Real TOPIK I is scored out of 200, with the
 * cut lines at 80 (1級) and 140 (2級). We scale the mini-exam percentage to that
 * band: ≥70% → 2級, ≥40% → 1級, else below 1級 (불합격).
 */
export function gradeFromPercent(pct: number): TopikGrade {
  if (pct >= 0.7) return 2
  if (pct >= 0.4) return 1
  return 0
}

/**
 * Score answers (null = unanswered = wrong). Per-section percent decides the
 * weak area. If the two sections are within one question's worth of each other,
 * the weakness is inconclusive — better than a confidently wrong label.
 */
export function scoreExam(items: ScoredItem[], answers: (number | null)[]): ExamResult {
  const partScores = {} as Record<TopikPart, PartScore>
  for (const part of PART_ORDER) partScores[part] = { correct: 0, total: 0 }

  items.forEach((item, i) => {
    const s = partScores[item.part]
    s.total += 1
    if (answers[i] === item.answer) s.correct += 1
  })

  const total: PartScore = { correct: 0, total: 0 }
  for (const part of PART_ORDER) {
    total.correct += partScores[part].correct
    total.total += partScores[part].total
  }

  const pct = total.total > 0 ? total.correct / total.total : 0
  const grade = gradeFromPercent(pct)

  // Rank sections that actually have questions by percent (asc), tie-break by
  // fewer raw correct.
  const ranked = PART_ORDER.filter((p) => partScores[p].total > 0)
    .map((p) => ({
      part: p,
      pct: partScores[p].correct / partScores[p].total,
      correct: partScores[p].correct,
      one: 1 / partScores[p].total, // one question's worth, on this section's scale
    }))
    .sort((a, b) => a.pct - b.pct || a.correct - b.correct)

  let weakestPart: TopikPart | null = null
  let inconclusive = true
  if (ranked.length === 1) {
    weakestPart = ranked[0].part
    inconclusive = false
  } else if (ranked.length > 1) {
    const [first, second] = ranked
    // Decisive only if the weakest is at least one full question worse.
    if (second.pct - first.pct >= first.one - 1e-9) {
      weakestPart = first.part
      inconclusive = false
    }
  }

  return { partScores, total, grade, weakestPart, inconclusive }
}

// ---- Persistence -----------------------------------------------------------

const RESULTS_KEY = 'kr-study:topik-results'
const PROGRESS_KEY = 'kr-study:topik-inprogress'
const SCHEMA_VERSION = 1

export interface TopikResult {
  version: number
  level: TopikLevel
  takenAt: string // ISO date
  partScores: Record<TopikPart, PartScore>
  grade: TopikGrade
  weakestPart: TopikPart | null
}

export interface InProgress {
  version: number
  level: TopikLevel
  items: ScoredItem[]
  answers: (number | null)[]
  idx: number
}

/** Saved exam history, newest last. Drops records from an older schema. */
export function loadResults(): TopikResult[] {
  const raw = loadJson<TopikResult[]>(RESULTS_KEY)
  if (!raw || !Array.isArray(raw)) return []
  return raw.filter((r) => r.version === SCHEMA_VERSION)
}

export function appendResult(result: Omit<TopikResult, 'version'>): void {
  const all = loadResults()
  all.push({ ...result, version: SCHEMA_VERSION })
  saveJson(RESULTS_KEY, all)
}

export function saveProgress(p: Omit<InProgress, 'version'>): void {
  saveJson(PROGRESS_KEY, { ...p, version: SCHEMA_VERSION })
}

/** Resume an in-progress exam, or null if none / stale schema / corrupt. */
export function loadProgress(): InProgress | null {
  const raw = loadJson<InProgress>(PROGRESS_KEY)
  if (!raw || raw.version !== SCHEMA_VERSION) return null
  if (!Array.isArray(raw.items) || !Array.isArray(raw.answers)) return null
  return raw
}

export function clearProgress(): void {
  saveJson(PROGRESS_KEY, null)
}
