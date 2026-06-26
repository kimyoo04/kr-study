// Pure question construction. Distractors come from the same chart row first
// (more confusable -> better practice), then fill from the rest. No side effects;
// randomness is injected so tests are deterministic.
import type { DeckKind, Hangul } from '../data/hangul'
import { BASIC, BASIC_ROWS, rowLookup } from '../data/hangul'

// Default row lookup for callers that quiz the basic chart (also the test default).
const BASIC_ROW_OF = rowLookup(BASIC_ROWS)

export type QType = 'read' | 'listen' | 'meaning' | 'cloze'

/** The sentence with its answer word replaced by a blank (cloze prompt). */
export function clozePrompt(item: Hangul): string {
  const answer = item.answer ?? ''
  return answer ? item.hangul.replace(answer, '____') : item.hangul
}

/**
 * Decide a quiz step's type. Cloze decks always quiz by filling the blank.
 * Listen mode (user toggle) forces audio prompts on every other deck when a
 * voice exists. Otherwise word decks quiz on meaning and hangul decks
 * round-robin read/listen, dropping listen when no voice is available.
 */
export function pickQType(
  deckKind: DeckKind,
  listenMode: boolean,
  hasVoice: boolean,
  quizIndex: number,
): QType {
  if (deckKind === 'cloze') return 'cloze'
  if (listenMode && hasVoice) return 'listen'
  if (deckKind !== 'hangul') return 'meaning'
  if (!hasVoice) return 'read'
  return quizIndex % 2 === 0 ? 'read' : 'listen'
}

export interface Question {
  qtype: QType
  answer: Hangul
  options: Hangul[] // includes the answer; render via optionText()
}

/**
 * The text an option renders for this question type. Also the identity used to
 * keep options apart: two items can share a romaji (어/오 rows overlap in kana
 * readings) or a Japanese meaning (먹다/들다 -> 食べる), and showing the same
 * text twice makes one "correct-looking" option silently wrong.
 */
export function optionText(opt: Hangul, qtype: QType, deckKind: DeckKind): string {
  if (qtype === 'read') return opt.romaji
  if (qtype === 'cloze') return opt.answer ?? opt.hangul
  if (qtype === 'meaning') return opt.meaning ?? ''
  // listen: hangul decks pick the glyph; other decks pick the meaning.
  return deckKind === 'hangul' ? opt.hangul : (opt.meaning ?? '')
}

type Rng = () => number

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick `count` distractors for `answer`: same row first, then global fill.
 * `textOf` is the displayed text — candidates that would render identically to
 * the answer (or to an already-picked distractor) are skipped. `rowOf` is the
 * active deck's row lookup (rows from other decks must not leak into options).
 */
export function pickDistractors(
  answer: Hangul,
  count: number,
  pool: Hangul[] = BASIC,
  rng: Rng = Math.random,
  textOf: (k: Hangul) => string = (k) => k.hangul,
  rowOf: Record<string, Hangul[]> = BASIC_ROW_OF,
): Hangul[] {
  const sameRow = (rowOf[answer.hangul] ?? []).filter((k) => k.hangul !== answer.hangul)
  const others = pool.filter(
    (k) => k.hangul !== answer.hangul && !sameRow.some((s) => s.hangul === k.hangul),
  )
  const ordered = [...shuffle(sameRow, rng), ...shuffle(others, rng)]

  const seenTexts = new Set([textOf(answer)])
  const picked: Hangul[] = []
  for (const k of ordered) {
    if (picked.length >= count) break
    const text = textOf(k)
    if (seenTexts.has(text)) continue
    seenTexts.add(text)
    picked.push(k)
  }
  return picked
}

export function buildQuestion(
  answer: Hangul,
  qtype: QType,
  deckKind: DeckKind = 'hangul',
  pool: Hangul[] = BASIC,
  rowOf: Record<string, Hangul[]> = BASIC_ROW_OF,
  rng: Rng = Math.random,
  optionCount = 4,
): Question {
  const textOf = (k: Hangul) => optionText(k, qtype, deckKind)
  const distractors = pickDistractors(answer, optionCount - 1, pool, rng, textOf, rowOf)
  const options = shuffle([answer, ...distractors], rng)
  return { qtype, answer, options }
}

export function isCorrect(q: Question, picked: Hangul): boolean {
  return picked.hangul === q.answer.hangul
}
