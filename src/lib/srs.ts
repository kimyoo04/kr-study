// Pure SRS (spaced repetition) logic — no React, no localStorage, no side effects.
// Scheduling is measured in LESSON COUNT, not wall-clock time (fits a static app
// and keeps every function trivially unit-testable).
//
//   box:  1 ───correct──▶ 2 ───correct──▶ 3 ─▶ 4 ─▶ 5  (interval grows)
//          ▲──────────────wrong──────────────────────┘  (reset to 1)
//
import type { Hangul } from '../data/hangul'

export interface Card {
  box: number // Leitner box 1..5
  dueLesson: number // becomes due when lessonsDone >= this
  seen: number
  correct: number
}

export interface Progress {
  version: number
  items: Record<string, Card> // keyed by hangul text
  lessonsDone: number
  lastPlayed: string // YYYY-MM-DD
}

export const PROGRESS_VERSION = 1
export const LESSON_SIZE = 6
/** "Learned" for the progress bar = box at or above this. */
export const LEARNED_BOX = 3

/** box -> how many lessons until the card is due again. */
export const INTERVALS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 }

export function emptyProgress(): Progress {
  return { version: PROGRESS_VERSION, items: {}, lessonsDone: 0, lastPlayed: '' }
}

export function newCard(lessonsDone: number): Card {
  return { box: 1, dueLesson: lessonsDone, seen: 0, correct: 0 }
}

/**
 * Card state after an item is shown for the first time (intro card, not graded).
 * Box stays 1; scheduled to come back next lesson. `base` is the lesson count
 * AFTER the current lesson completes.
 */
export function introducedCard(base: number): Card {
  return { box: 1, dueLesson: base + intervalFor(1), seen: 1, correct: 0 }
}

export function nextBox(box: number, correct: boolean): number {
  if (!correct) return 1
  return Math.min(box + 1, 5)
}

export function intervalFor(box: number): number {
  return INTERVALS[Math.min(Math.max(box, 1), 5)]
}

export function isDue(card: Card, lessonsDone: number): boolean {
  return card.dueLesson <= lessonsDone
}

/** Returns an updated card after one answer. Pure — does not mutate input. */
export function applyAnswer(card: Card, correct: boolean, lessonsDone: number): Card {
  const box = nextBox(card.box, correct)
  return {
    box,
    dueLesson: lessonsDone + intervalFor(box),
    seen: card.seen + 1,
    correct: card.correct + (correct ? 1 : 0),
  }
}

export function learnedCount(progress: Progress): number {
  return Object.values(progress.items).filter((c) => c.box >= LEARNED_BOX).length
}

/** Learned count restricted to a single deck's item set. */
export function learnedCountFor(progress: Progress, deckItems: Hangul[]): number {
  return deckItems.filter((k) => (progress.items[k.hangul]?.box ?? 0) >= LEARNED_BOX).length
}

/**
 * Weakest items in a deck: seen at least once but not yet learned (box < 3),
 * worst first (lowest box, then most misses). Used by the Home "review weak" button.
 */
export function weakItems(progress: Progress, deckItems: Hangul[], limit = LESSON_SIZE): Hangul[] {
  return deckItems
    .filter((k) => {
      const c = progress.items[k.hangul]
      return c && c.seen > 0 && c.box < LEARNED_BOX
    })
    .sort((a, b) => {
      const ca = progress.items[a.hangul]
      const cb = progress.items[b.hangul]
      if (ca.box !== cb.box) return ca.box - cb.box
      return cb.seen - cb.correct - (ca.seen - ca.correct)
    })
    .slice(0, limit)
}

export type LessonMode = 'intro' | 'quiz'
export interface LessonItem {
  hangul: Hangul
  mode: LessonMode
}

/**
 * Pick the items for the next lesson, in this priority:
 *   1. due review cards (already introduced), earliest dueLesson first  -> 'quiz'
 *   2. brand-new items in teaching order                                 -> 'intro'
 *   3. fallback: if nothing due and nothing new, review lowest-box cards  -> 'quiz'
 * Cold start (no progress) => all 'intro'. Never returns an empty lesson
 * unless there is genuinely no content.
 */
export function selectLessonItems(
  progress: Progress,
  order: Hangul[],
  size: number = LESSON_SIZE,
): LessonItem[] {
  const introduced = (k: Hangul) => progress.items[k.hangul] !== undefined
  const items: LessonItem[] = []

  // Selection happens BEFORE this lesson completes, so the lesson being built is
  // numbered lessonsDone + 1. A card is due if scheduled at or before that lesson.
  const upcoming = progress.lessonsDone + 1

  const due = order
    .filter((k) => introduced(k) && isDue(progress.items[k.hangul], upcoming))
    .sort((a, b) => progress.items[a.hangul].dueLesson - progress.items[b.hangul].dueLesson)
  for (const k of due) {
    if (items.length >= size) break
    items.push({ hangul: k, mode: 'quiz' })
  }

  for (const k of order) {
    if (items.length >= size) break
    if (!introduced(k)) items.push({ hangul: k, mode: 'intro' })
  }

  if (items.length === 0) {
    const byBox = order
      .filter(introduced)
      .sort((a, b) => progress.items[a.hangul].box - progress.items[b.hangul].box)
    for (const k of byBox) {
      if (items.length >= size) break
      items.push({ hangul: k, mode: 'quiz' })
    }
  }

  return items
}
