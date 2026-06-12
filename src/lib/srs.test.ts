import { describe, expect, it } from 'vitest'
import { BASIC } from '../data/hangul'
import {
  applyAnswer,
  emptyProgress,
  intervalFor,
  introducedCard,
  isDue,
  learnedCount,
  learnedCountFor,
  weakItems,
  newCard,
  nextBox,
  selectLessonItems,
  type Progress,
} from './srs'

describe('nextBox', () => {
  it('advances on correct, capped at 5', () => {
    expect(nextBox(1, true)).toBe(2)
    expect(nextBox(4, true)).toBe(5)
    expect(nextBox(5, true)).toBe(5)
  })
  it('resets to 1 on wrong', () => {
    expect(nextBox(4, false)).toBe(1)
    expect(nextBox(1, false)).toBe(1)
  })
})

describe('intervalFor', () => {
  it('maps boxes 1..5 to 1/2/4/8/16', () => {
    expect([1, 2, 3, 4, 5].map(intervalFor)).toEqual([1, 2, 4, 8, 16])
  })
  it('clamps out-of-range boxes', () => {
    expect(intervalFor(0)).toBe(1)
    expect(intervalFor(9)).toBe(16)
  })
})

describe('isDue', () => {
  it('is due when dueLesson <= lessonsDone', () => {
    expect(isDue({ box: 1, dueLesson: 3, seen: 1, correct: 0 }, 3)).toBe(true)
    expect(isDue({ box: 1, dueLesson: 4, seen: 1, correct: 0 }, 3)).toBe(false)
  })
})

describe('applyAnswer', () => {
  it('on correct: bumps box, schedules by new interval, counts seen+correct', () => {
    const card = newCard(0)
    const next = applyAnswer(card, true, 1) // base = 1, box 1->2, interval 2
    expect(next).toEqual({ box: 2, dueLesson: 3, seen: 1, correct: 1 })
  })
  it('on wrong: resets box to 1, due next lesson, seen++ but not correct', () => {
    const card = { box: 4, dueLesson: 10, seen: 5, correct: 4 }
    const next = applyAnswer(card, false, 7) // box->1, interval 1
    expect(next).toEqual({ box: 1, dueLesson: 8, seen: 6, correct: 4 })
  })
  it('does not mutate the input card', () => {
    const card = newCard(0)
    applyAnswer(card, true, 1)
    expect(card).toEqual({ box: 1, dueLesson: 0, seen: 0, correct: 0 })
  })
})

describe('introducedCard', () => {
  it('keeps box 1 and schedules for next lesson', () => {
    expect(introducedCard(2)).toEqual({ box: 1, dueLesson: 3, seen: 1, correct: 0 })
  })
})

describe('learnedCount', () => {
  it('counts only cards at box >= 3', () => {
    const p = emptyProgress()
    p.items = {
      아: { box: 3, dueLesson: 0, seen: 4, correct: 3 },
      야: { box: 5, dueLesson: 0, seen: 9, correct: 9 },
      어: { box: 2, dueLesson: 0, seen: 2, correct: 1 },
    }
    expect(learnedCount(p)).toBe(2)
  })

  it('weakItems returns seen-but-not-learned, worst first', () => {
    const p = emptyProgress()
    p.items = {
      아: { box: 3, dueLesson: 0, seen: 5, correct: 5 }, // learned -> excluded
      야: { box: 2, dueLesson: 0, seen: 4, correct: 3 }, // weak
      어: { box: 1, dueLesson: 0, seen: 4, correct: 1 }, // weaker (lower box)
      여: { box: 1, dueLesson: 0, seen: 0, correct: 0 }, // never seen -> excluded
    }
    const deck = [
      { hangul: '아', romaji: 'a' },
      { hangul: '야', romaji: 'ya' },
      { hangul: '어', romaji: 'eo' },
      { hangul: '여', romaji: 'yeo' },
    ]
    const weak = weakItems(p, deck)
    expect(weak.map((k) => k.hangul)).toEqual(['어', '야']) // lowest box first
  })

  it('learnedCountFor restricts to the given deck', () => {
    const p = emptyProgress()
    p.items = {
      아: { box: 3, dueLesson: 0, seen: 4, correct: 3 }, // basic, learned
      카: { box: 4, dueLesson: 0, seen: 5, correct: 5 }, // advanced, learned
      타: { box: 1, dueLesson: 0, seen: 1, correct: 0 }, // advanced, not yet
    }
    expect(learnedCountFor(p, [{ hangul: '아', romaji: 'a' }])).toBe(1)
    expect(
      learnedCountFor(p, [
        { hangul: '카', romaji: 'ka' },
        { hangul: '타', romaji: 'ta' },
      ]),
    ).toBe(1)
  })
})

describe('selectLessonItems', () => {
  it('cold start: all intro, in teaching order, capped at size', () => {
    const items = selectLessonItems(emptyProgress(), BASIC, 6)
    expect(items).toHaveLength(6)
    expect(items.every((i) => i.mode === 'intro')).toBe(true)
    expect(items.map((i) => i.hangul.hangul)).toEqual(['아', '야', '어', '여', '오', '요'])
  })

  it('prioritizes due review cards (quiz) before new items (intro)', () => {
    const p: Progress = {
      ...emptyProgress(),
      lessonsDone: 5,
      items: {
        아: { box: 2, dueLesson: 4, seen: 2, correct: 2 }, // due (4 <= 5)
        야: { box: 3, dueLesson: 99, seen: 3, correct: 3 }, // not due
      },
    }
    const items = selectLessonItems(p, BASIC, 6)
    expect(items[0]).toEqual({ hangul: { hangul: '아', romaji: 'a' }, mode: 'quiz' })
    // remaining filled with new items (skipping 아/야 which are introduced)
    const newOnes = items.slice(1)
    expect(newOnes.every((i) => i.mode === 'intro')).toBe(true)
    expect(newOnes.map((i) => i.hangul.hangul)).toEqual(['어', '여', '오', '요', '우'])
  })

  it('REGRESSION: an item introduced last lesson is due (quiz) the very next lesson', () => {
    // Lesson 1 introduced 아 via introducedCard(base=1); lessonsDone is now 1.
    const p: Progress = {
      ...emptyProgress(),
      lessonsDone: 1,
      items: { 아: introducedCard(1) }, // dueLesson = 1 + interval(1) = 2
    }
    const items = selectLessonItems(p, BASIC, 6)
    // Upcoming lesson is #2, so 아 (dueLesson 2) must appear as a quiz, not be skipped.
    expect(items[0]).toEqual({ hangul: { hangul: '아', romaji: 'a' }, mode: 'quiz' })
  })

  it('fallback: nothing due and nothing new -> review lowest box first', () => {
    // Introduce ALL items, none due.
    const cards: Progress['items'] = {}
    for (const k of BASIC) cards[k.hangul] = { box: 3, dueLesson: 999, seen: 5, correct: 5 }
    cards['히'] = { box: 1, dueLesson: 999, seen: 1, correct: 0 } // lowest box
    const p: Progress = { ...emptyProgress(), lessonsDone: 10, items: cards }
    const items = selectLessonItems(p, BASIC, 6)
    expect(items).toHaveLength(6)
    expect(items[0].hangul.hangul).toBe('히')
    expect(items.every((i) => i.mode === 'quiz')).toBe(true)
  })
})
