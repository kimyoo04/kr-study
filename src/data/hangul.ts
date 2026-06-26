// ハングル — 反切表(가나다表)の順。内側の配列が 1 行(行 = 子音段)で、
// レッスンの並びと distractor 選択(同じ行を優先)の両方に再利用される。
import { WORD_ROWS, WORD_CATS, WORDS } from './words'
import { LOANWORD_ROWS, LOANWORD_CATS, LOANWORDS } from './loanwords'
import { COUNTER_ROWS, COUNTER_CATS, COUNTERS } from './counters'
import { MIMETIC_ROWS, MIMETIC_CATS, MIMETICS } from './mimetic'
import { KEIGO_ROWS, KEIGO } from './keigo'
import { GRAMMAR_ROWS, GRAMMAR } from './grammar'
import { PHRASE_ROWS, PHRASES } from './phrases'
import { HANJA_ROWS, HANJA_CATS, HANJA } from './hanja'
import { CLOZE_ROWS, CLOZE_CATS, CLOZE } from './cloze'

export interface Hangul {
  hangul: string
  romaji: string
  meaning?: string // present for word/sentence decks; absent for hangul letters
  note?: string // grammar pattern / situation label (sentence decks)
  answer?: string // cloze decks: the word filling the blank (a substring of hangul)
}

// 完成形ハングルは字母 (자모) の合成で機械的に作れる:
//   コード = 0xAC00 + 初声インデックス×(21×28) + 中声インデックス×28 (+ 終声)
// 反切表 (基本/激音/濃音の行) はこの合成 + RR ローマ字の規則性から生成する —
// 240 音節を手書きせず、子音と母音の対応表だけを単一ソースに保つ。
const CHO = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ']
const JUNG = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ']

function syllable(cho: string, jung: string): string {
  return String.fromCharCode(0xac00 + CHO.indexOf(cho) * 21 * 28 + JUNG.indexOf(jung) * 28)
}

// 基本母音 10 (반절표の列) と RR ローマ字。
const BASIC_VOWELS: [string, string][] = [
  ['ㅏ', 'a'], ['ㅑ', 'ya'], ['ㅓ', 'eo'], ['ㅕ', 'yeo'], ['ㅗ', 'o'],
  ['ㅛ', 'yo'], ['ㅜ', 'u'], ['ㅠ', 'yu'], ['ㅡ', 'eu'], ['ㅣ', 'i'],
]
// 濃音は y 系を除いた 6 母音だけ教える (꺄/뗘 のような稀な音節を避ける)。
const TENSE_VOWELS = BASIC_VOWELS.filter(([jung]) => 'ㅏㅓㅗㅜㅡㅣ'.includes(jung))

/** 1 子音段 (初声 × 母音列)。romaja は RR の頭子音表記 (ㅇ は空文字)。 */
function consonantRow(cho: string, romaja: string, vowels = BASIC_VOWELS): Hangul[] {
  return vowels.map(([jung, vr]) => ({ hangul: syllable(cho, jung), romaji: romaja + vr }))
}

// 基本: 母音 10 + 平音 9 子音 × 母音 10 = 100 音節 (반절표)
export const BASIC_ROWS: Hangul[][] = [
  consonantRow('ㅇ', ''),
  consonantRow('ㄱ', 'g'),
  consonantRow('ㄴ', 'n'),
  consonantRow('ㄷ', 'd'),
  consonantRow('ㄹ', 'r'),
  consonantRow('ㅁ', 'm'),
  consonantRow('ㅂ', 'b'),
  consonantRow('ㅅ', 's'),
  consonantRow('ㅈ', 'j'),
  consonantRow('ㅎ', 'h'),
]

// 発展: 激音 / 濃音 / 合成母音 / パッチム。基本 100 音節の後に学ぶ。
export const ADVANCED_ROWS: Hangul[][] = [
  // 激音 (息を強く出す音)
  consonantRow('ㅋ', 'k'),
  consonantRow('ㅌ', 't'),
  consonantRow('ㅍ', 'p'),
  consonantRow('ㅊ', 'ch'),
  // 濃音 (喉を締める音)
  consonantRow('ㄲ', 'kk', TENSE_VOWELS),
  consonantRow('ㄸ', 'tt', TENSE_VOWELS),
  consonantRow('ㅃ', 'pp', TENSE_VOWELS),
  consonantRow('ㅆ', 'ss', TENSE_VOWELS),
  consonantRow('ㅉ', 'jj', TENSE_VOWELS),
  // 合成母音
  [
    { hangul: '애', romaji: 'ae' },
    { hangul: '얘', romaji: 'yae' },
    { hangul: '에', romaji: 'e' },
    { hangul: '예', romaji: 'ye' },
    { hangul: '외', romaji: 'oe' },
    { hangul: '위', romaji: 'wi' },
    { hangul: '의', romaji: 'ui' },
  ],
  [
    { hangul: '와', romaji: 'wa' },
    { hangul: '왜', romaji: 'wae' },
    { hangul: '워', romaji: 'wo' },
    { hangul: '웨', romaji: 'we' },
  ],
  [
    { hangul: '개', romaji: 'gae' },
    { hangul: '내', romaji: 'nae' },
    { hangul: '대', romaji: 'dae' },
    { hangul: '매', romaji: 'mae' },
    { hangul: '배', romaji: 'bae' },
    { hangul: '새', romaji: 'sae' },
    { hangul: '해', romaji: 'hae' },
  ],
  // パッチム (終声)
  [
    { hangul: '안', romaji: 'an' },
    { hangul: '언', romaji: 'eon' },
    { hangul: '온', romaji: 'on' },
    { hangul: '운', romaji: 'un' },
    { hangul: '인', romaji: 'in' },
    { hangul: '한', romaji: 'han' },
    { hangul: '산', romaji: 'san' },
    { hangul: '문', romaji: 'mun' },
  ],
  [
    { hangul: '앙', romaji: 'ang' },
    { hangul: '강', romaji: 'gang' },
    { hangul: '방', romaji: 'bang' },
    { hangul: '상', romaji: 'sang' },
    { hangul: '동', romaji: 'dong' },
    { hangul: '중', romaji: 'jung' },
  ],
  [
    { hangul: '암', romaji: 'am' },
    { hangul: '감', romaji: 'gam' },
    { hangul: '김', romaji: 'gim' },
    { hangul: '밤', romaji: 'bam' },
    { hangul: '봄', romaji: 'bom' },
    { hangul: '섬', romaji: 'seom' },
  ],
  [
    { hangul: '알', romaji: 'al' },
    { hangul: '길', romaji: 'gil' },
    { hangul: '말', romaji: 'mal' },
    { hangul: '물', romaji: 'mul' },
    { hangul: '발', romaji: 'bal' },
    { hangul: '술', romaji: 'sul' },
  ],
  [
    { hangul: '악', romaji: 'ak' },
    { hangul: '국', romaji: 'guk' },
    { hangul: '박', romaji: 'bak' },
    { hangul: '약', romaji: 'yak' },
    { hangul: '턱', romaji: 'teok' },
    { hangul: '책', romaji: 'chaek' },
  ],
  [
    { hangul: '압', romaji: 'ap' },
    { hangul: '밥', romaji: 'bap' },
    { hangul: '집', romaji: 'jip' },
    { hangul: '입', romaji: 'ip' },
    { hangul: '톱', romaji: 'top' },
    { hangul: '컵', romaji: 'keop' },
  ],
  // 표준발음법 제8항: 받침소리는 ㄱㄴㄷㄹㅁㅂㅇ の 7 代表音。
  // ㅅ/ㅈ/ㅊ/ㅌ パッチムはすべて [ㄷ] (実際の発音は ッ/t̚) で発音される。
  [
    { hangul: '앗', romaji: 'at' },
    { hangul: '옷', romaji: 'ot' },
    { hangul: '맛', romaji: 'mat' },
    { hangul: '곳', romaji: 'got' },
    { hangul: '낮', romaji: 'nat' },
    { hangul: '꽃', romaji: 'kkot' },
    { hangul: '끝', romaji: 'kkeut' },
    { hangul: '밭', romaji: 'bat' },
  ],
]

// 基本デッキの行ラベル (1:1 with BASIC_ROWS)。
// 日本の韓国語教材の標準的な用語 (基本母音 10 / 平音の子音) に合わせる。
const BASIC_CATS = [
  '基本母音 10',
  '平音 ㄱ行', '平音 ㄴ行', '平音 ㄷ行', '平音 ㄹ行', '平音 ㅁ行',
  '平音 ㅂ行', '平音 ㅅ行', '平音 ㅈ行', '平音 ㅎ行',
]

// 発展デッキの行ラベル (1:1 with ADVANCED_ROWS)。
// 合成母音 11 字 (ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ)、パッチムは 7 代表音 (ㄱㄴㄷㄹㅁㅂㅇ) で分類。
const ADVANCED_CATS = [
  '激音 ㅋ行', '激音 ㅌ行', '激音 ㅍ行', '激音 ㅊ行',
  '濃音 ㄲ行', '濃音 ㄸ行', '濃音 ㅃ行', '濃音 ㅆ行', '濃音 ㅉ行',
  '合成母音 1 (ㅐㅔ系)', '合成母音 2 (ㅘㅝ系)', '合成母音 + 子音',
  'パッチム ㄴ [n]', 'パッチム ㅇ [ng]', 'パッチム ㅁ [m]', 'パッチム ㄹ [l]',
  'パッチム ㄱ [k]', 'パッチム ㅂ [p]', 'パッチム ㄷ (ㅅ/ㅈ/ㅊ/ㅌ) [t]',
]

/** 基本デッキの全行 (教える順)。 */
export const BASIC: Hangul[] = BASIC_ROWS.flat()

/** 発展デッキの全行 (教える順)。 */
export const ADVANCED: Hangul[] = ADVANCED_ROWS.flat()

/**
 * Same-row lookup used by distractor selection, scoped to ONE deck's rows.
 * A global map would let texts shared across decks (이 the syllable vs 이 "二")
 * pull distractors from the wrong deck.
 */
export function rowLookup(rows: Hangul[][]): Record<string, Hangul[]> {
  const map: Record<string, Hangul[]> = {}
  for (const row of rows) for (const k of row) map[k.hangul] = row
  return map
}

// ---- Decks ----------------------------------------------------------------
export type DeckId =
  | 'basic'
  | 'advanced'
  | 'words'
  | 'loanwords'
  | 'counters'
  | 'mimetic'
  | 'grammar'
  | 'phrases'
  | 'keigo'
  | 'hanja'
  | 'cloze'
// 'hangul' -> quiz reads romaji; 'words'/'sentence' -> quiz reads meaning.
// 'sentence' renders smaller + shows the pattern/situation label.
// 'cloze' -> quiz blanks a word in the sentence; options are the answer words.
export type DeckKind = 'hangul' | 'words' | 'sentence' | 'cloze'

export interface Deck {
  id: DeckId
  label: string
  kind: DeckKind
  rows: Hangul[][]
  items: Hangul[] // teaching order; also the distractor pool for this deck
  rowOf: Record<string, Hangul[]> // same-row lookup for distractor selection
  catLabels?: string[] // category name per row (row-based decks); 1:1 with rows
  kataReading?: boolean // レッスンで韓国語の下にカタカナ読みを表示するか
}

export interface Category {
  name: string
  items: Hangul[]
}

const DECK_DEFS: Omit<Deck, 'rowOf'>[] = [
  { id: 'basic', label: 'ハングル基本', kind: 'hangul', rows: BASIC_ROWS, items: BASIC, catLabels: BASIC_CATS },
  { id: 'advanced', label: 'ハングル発展', kind: 'hangul', rows: ADVANCED_ROWS, items: ADVANCED, catLabels: ADVANCED_CATS },
  { id: 'words', label: '単語', kind: 'words', rows: WORD_ROWS, items: WORDS, catLabels: WORD_CATS },
  { id: 'loanwords', label: '外来語', kind: 'words', rows: LOANWORD_ROWS, items: LOANWORDS, catLabels: LOANWORD_CATS },
  { id: 'counters', label: '助数詞', kind: 'words', rows: COUNTER_ROWS, items: COUNTERS, catLabels: COUNTER_CATS },
  { id: 'mimetic', label: 'オノマトペ', kind: 'words', rows: MIMETIC_ROWS, items: MIMETICS, catLabels: MIMETIC_CATS },
  { id: 'grammar', label: '文法', kind: 'sentence', rows: GRAMMAR_ROWS, items: GRAMMAR },
  { id: 'phrases', label: '会話', kind: 'sentence', rows: PHRASE_ROWS, items: PHRASES, kataReading: true },
  { id: 'keigo', label: '敬語', kind: 'sentence', rows: KEIGO_ROWS, items: KEIGO, kataReading: true },
  { id: 'hanja', label: '漢字語', kind: 'words', rows: HANJA_ROWS, items: HANJA, catLabels: HANJA_CATS },
  { id: 'cloze', label: '穴埋め', kind: 'cloze', rows: CLOZE_ROWS, items: CLOZE, catLabels: CLOZE_CATS },
]

export const DECKS: Deck[] = DECK_DEFS.map((d) => ({ ...d, rowOf: rowLookup(d.rows) }))

/**
 * Categories a deck can be filtered to.
 * - sentence decks (grammar/phrases/keigo): grouped by `note` (pattern/situation).
 * - hangul decks: one per chart row, labeled by its first glyph (or catLabels).
 * - words/loanwords/hanja: one per row, labeled by catLabels (deduped on collision).
 */
export function deckCategories(deck: Deck): Category[] {
  if (deck.kind === 'sentence') {
    const order: string[] = []
    const map = new Map<string, Hangul[]>()
    for (const k of deck.items) {
      const note = k.note ?? 'その他'
      if (!map.has(note)) {
        map.set(note, [])
        order.push(note)
      }
      map.get(note)!.push(k)
    }
    return order.map((name) => ({ name, items: map.get(name)! }))
  }
  const seen = new Map<string, number>()
  return deck.rows.map((row, i) => {
    let name =
      deck.catLabels?.[i] ?? (deck.kind === 'hangul' ? `${row[0].hangul}の行` : `${i + 1}`)
    const n = seen.get(name) ?? 0
    seen.set(name, n + 1)
    if (n > 0) name = `${name} (${n + 1})`
    return { name, items: row }
  })
}
