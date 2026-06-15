// TOPIK question model — a discriminated union, separate from the SRS Hangul
// model. The level tag lives on every question so TOPIK II / future banks are
// pure data additions later.
//
// Faithful to the *real* TOPIK exam, not a relabeled JLPT: TOPIK I has only two
// scored sections, 듣기 (listening) and 읽기 (reading). Vocabulary and grammar
// are not separate sections — they are tested *inside* reading items (the
// `kind` tag records which reading skill an item drills).

export type TopikLevel = 'TOPIK1' | 'TOPIK2'
export type TopikPart = 'listening' | 'reading'

// Which reading skill a 읽기 item drills. Mirrors the real TOPIK I question
// families; purely informational (scoring is per-part, not per-kind).
export type ReadingKind = 'cloze' | 'topic' | 'detail' | 'passage'

// UI chrome is Japanese (kr-study targets JP speakers); keep a Korean label map
// too so the section tag can show both, e.g. "聞き取り (듣기)".
export const TOPIK_PART_LABEL: Record<TopikPart, string> = {
  listening: '聞き取り',
  reading: '読解',
}

export const TOPIK_PART_KO: Record<TopikPart, string> = {
  listening: '듣기',
  reading: '읽기',
}

export const TOPIK_LEVEL_LABEL: Record<TopikLevel, string> = {
  TOPIK1: 'TOPIK I (1〜2級)',
  TOPIK2: 'TOPIK II (3〜6級)',
}

interface Base {
  id: string
  level: TopikLevel
  part: TopikPart
}

// 듣기: a script read aloud via ko-KR TTS, with a text fallback when no Korean
// voice is available on the device.
export interface ListeningQ extends Base {
  part: 'listening'
  script: string // the spoken dialogue/monologue
  prompt: string // the question (Japanese)
  choices: string[] // 4 options
  answer: number // index into choices
  explain?: string // Japanese explanation shown on the answer-review screen
}

// 읽기 single item: one prompt + 4 choices (어휘/문법 빈칸, 주제 고르기, 세부내용).
export interface ReadingSingleQ extends Base {
  part: 'reading'
  kind: Exclude<ReadingKind, 'passage'>
  prompt: string // sentence with a ( ) blank, or a short text + question
  choices: string[]
  answer: number
  explain?: string // Japanese explanation shown on the answer-review screen
}

// 읽기 passage set: one passage, one or more sub-questions. Each sub-question
// becomes its own scored item (so the progress bar and scoring stay aligned).
export interface ReadingSetQ extends Base {
  part: 'reading'
  kind: 'passage'
  passage: string
  questions: { prompt: string; choices: string[]; answer: number; explain?: string }[]
}

export type ReadingQ = ReadingSingleQ | ReadingSetQ
export type TopikQuestion = ListeningQ | ReadingQ

// Flattened unit the exam runner, scorer, and progress bar all operate on.
// One ScoredItem == one graded question (passage sub-questions become separate
// items).
export interface ScoredItem {
  id: string // unique per scored item
  part: TopikPart
  prompt: string
  choices: string[]
  answer: number // index into choices
  passage?: string // present for reading passage items
  script?: string // present for listening items
  explain?: string // Japanese explanation for the answer-review screen
}
