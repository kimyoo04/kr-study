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

export interface Hangul {
  hangul: string
  romaji: string
  meaning?: string // present for word/sentence decks; absent for hangul letters
  note?: string // grammar pattern / situation label (sentence decks)
}

// 基本: 母音 10 + 平音 9 子音 × 母音 10 = 100 音節 (반절표)
export const BASIC_ROWS: Hangul[][] = [
  [
    { hangul: '아', romaji: 'a' },
    { hangul: '야', romaji: 'ya' },
    { hangul: '어', romaji: 'eo' },
    { hangul: '여', romaji: 'yeo' },
    { hangul: '오', romaji: 'o' },
    { hangul: '요', romaji: 'yo' },
    { hangul: '우', romaji: 'u' },
    { hangul: '유', romaji: 'yu' },
    { hangul: '으', romaji: 'eu' },
    { hangul: '이', romaji: 'i' },
  ],
  [
    { hangul: '가', romaji: 'ga' },
    { hangul: '갸', romaji: 'gya' },
    { hangul: '거', romaji: 'geo' },
    { hangul: '겨', romaji: 'gyeo' },
    { hangul: '고', romaji: 'go' },
    { hangul: '교', romaji: 'gyo' },
    { hangul: '구', romaji: 'gu' },
    { hangul: '규', romaji: 'gyu' },
    { hangul: '그', romaji: 'geu' },
    { hangul: '기', romaji: 'gi' },
  ],
  [
    { hangul: '나', romaji: 'na' },
    { hangul: '냐', romaji: 'nya' },
    { hangul: '너', romaji: 'neo' },
    { hangul: '녀', romaji: 'nyeo' },
    { hangul: '노', romaji: 'no' },
    { hangul: '뇨', romaji: 'nyo' },
    { hangul: '누', romaji: 'nu' },
    { hangul: '뉴', romaji: 'nyu' },
    { hangul: '느', romaji: 'neu' },
    { hangul: '니', romaji: 'ni' },
  ],
  [
    { hangul: '다', romaji: 'da' },
    { hangul: '댜', romaji: 'dya' },
    { hangul: '더', romaji: 'deo' },
    { hangul: '뎌', romaji: 'dyeo' },
    { hangul: '도', romaji: 'do' },
    { hangul: '됴', romaji: 'dyo' },
    { hangul: '두', romaji: 'du' },
    { hangul: '듀', romaji: 'dyu' },
    { hangul: '드', romaji: 'deu' },
    { hangul: '디', romaji: 'di' },
  ],
  [
    { hangul: '라', romaji: 'ra' },
    { hangul: '랴', romaji: 'rya' },
    { hangul: '러', romaji: 'reo' },
    { hangul: '려', romaji: 'ryeo' },
    { hangul: '로', romaji: 'ro' },
    { hangul: '료', romaji: 'ryo' },
    { hangul: '루', romaji: 'ru' },
    { hangul: '류', romaji: 'ryu' },
    { hangul: '르', romaji: 'reu' },
    { hangul: '리', romaji: 'ri' },
  ],
  [
    { hangul: '마', romaji: 'ma' },
    { hangul: '먀', romaji: 'mya' },
    { hangul: '머', romaji: 'meo' },
    { hangul: '며', romaji: 'myeo' },
    { hangul: '모', romaji: 'mo' },
    { hangul: '묘', romaji: 'myo' },
    { hangul: '무', romaji: 'mu' },
    { hangul: '뮤', romaji: 'myu' },
    { hangul: '므', romaji: 'meu' },
    { hangul: '미', romaji: 'mi' },
  ],
  [
    { hangul: '바', romaji: 'ba' },
    { hangul: '뱌', romaji: 'bya' },
    { hangul: '버', romaji: 'beo' },
    { hangul: '벼', romaji: 'byeo' },
    { hangul: '보', romaji: 'bo' },
    { hangul: '뵤', romaji: 'byo' },
    { hangul: '부', romaji: 'bu' },
    { hangul: '뷰', romaji: 'byu' },
    { hangul: '브', romaji: 'beu' },
    { hangul: '비', romaji: 'bi' },
  ],
  [
    { hangul: '사', romaji: 'sa' },
    { hangul: '샤', romaji: 'sya' },
    { hangul: '서', romaji: 'seo' },
    { hangul: '셔', romaji: 'syeo' },
    { hangul: '소', romaji: 'so' },
    { hangul: '쇼', romaji: 'syo' },
    { hangul: '수', romaji: 'su' },
    { hangul: '슈', romaji: 'syu' },
    { hangul: '스', romaji: 'seu' },
    { hangul: '시', romaji: 'si' },
  ],
  [
    { hangul: '자', romaji: 'ja' },
    { hangul: '쟈', romaji: 'jya' },
    { hangul: '저', romaji: 'jeo' },
    { hangul: '져', romaji: 'jyeo' },
    { hangul: '조', romaji: 'jo' },
    { hangul: '죠', romaji: 'jyo' },
    { hangul: '주', romaji: 'ju' },
    { hangul: '쥬', romaji: 'jyu' },
    { hangul: '즈', romaji: 'jeu' },
    { hangul: '지', romaji: 'ji' },
  ],
  [
    { hangul: '하', romaji: 'ha' },
    { hangul: '햐', romaji: 'hya' },
    { hangul: '허', romaji: 'heo' },
    { hangul: '혀', romaji: 'hyeo' },
    { hangul: '호', romaji: 'ho' },
    { hangul: '효', romaji: 'hyo' },
    { hangul: '후', romaji: 'hu' },
    { hangul: '휴', romaji: 'hyu' },
    { hangul: '흐', romaji: 'heu' },
    { hangul: '히', romaji: 'hi' },
  ],
]

// 発展: 激音 / 濃音 / 合成母音 / パッチム。基本 100 音節の後に学ぶ。
export const ADVANCED_ROWS: Hangul[][] = [
  // 激音 (息を強く出す音)
  [
    { hangul: '카', romaji: 'ka' },
    { hangul: '캬', romaji: 'kya' },
    { hangul: '커', romaji: 'keo' },
    { hangul: '켜', romaji: 'kyeo' },
    { hangul: '코', romaji: 'ko' },
    { hangul: '쿄', romaji: 'kyo' },
    { hangul: '쿠', romaji: 'ku' },
    { hangul: '큐', romaji: 'kyu' },
    { hangul: '크', romaji: 'keu' },
    { hangul: '키', romaji: 'ki' },
  ],
  [
    { hangul: '타', romaji: 'ta' },
    { hangul: '탸', romaji: 'tya' },
    { hangul: '터', romaji: 'teo' },
    { hangul: '텨', romaji: 'tyeo' },
    { hangul: '토', romaji: 'to' },
    { hangul: '툐', romaji: 'tyo' },
    { hangul: '투', romaji: 'tu' },
    { hangul: '튜', romaji: 'tyu' },
    { hangul: '트', romaji: 'teu' },
    { hangul: '티', romaji: 'ti' },
  ],
  [
    { hangul: '파', romaji: 'pa' },
    { hangul: '퍄', romaji: 'pya' },
    { hangul: '퍼', romaji: 'peo' },
    { hangul: '펴', romaji: 'pyeo' },
    { hangul: '포', romaji: 'po' },
    { hangul: '표', romaji: 'pyo' },
    { hangul: '푸', romaji: 'pu' },
    { hangul: '퓨', romaji: 'pyu' },
    { hangul: '프', romaji: 'peu' },
    { hangul: '피', romaji: 'pi' },
  ],
  [
    { hangul: '차', romaji: 'cha' },
    { hangul: '챠', romaji: 'chya' },
    { hangul: '처', romaji: 'cheo' },
    { hangul: '쳐', romaji: 'chyeo' },
    { hangul: '초', romaji: 'cho' },
    { hangul: '쵸', romaji: 'chyo' },
    { hangul: '추', romaji: 'chu' },
    { hangul: '츄', romaji: 'chyu' },
    { hangul: '츠', romaji: 'cheu' },
    { hangul: '치', romaji: 'chi' },
  ],
  // 濃音 (喉を締める音)
  [
    { hangul: '까', romaji: 'kka' },
    { hangul: '꺼', romaji: 'kkeo' },
    { hangul: '꼬', romaji: 'kko' },
    { hangul: '꾸', romaji: 'kku' },
    { hangul: '끄', romaji: 'kkeu' },
    { hangul: '끼', romaji: 'kki' },
  ],
  [
    { hangul: '따', romaji: 'tta' },
    { hangul: '떠', romaji: 'tteo' },
    { hangul: '또', romaji: 'tto' },
    { hangul: '뚜', romaji: 'ttu' },
    { hangul: '뜨', romaji: 'tteu' },
    { hangul: '띠', romaji: 'tti' },
  ],
  [
    { hangul: '빠', romaji: 'ppa' },
    { hangul: '뻐', romaji: 'ppeo' },
    { hangul: '뽀', romaji: 'ppo' },
    { hangul: '뿌', romaji: 'ppu' },
    { hangul: '쁘', romaji: 'ppeu' },
    { hangul: '삐', romaji: 'ppi' },
  ],
  [
    { hangul: '싸', romaji: 'ssa' },
    { hangul: '써', romaji: 'sseo' },
    { hangul: '쏘', romaji: 'sso' },
    { hangul: '쑤', romaji: 'ssu' },
    { hangul: '쓰', romaji: 'sseu' },
    { hangul: '씨', romaji: 'ssi' },
  ],
  [
    { hangul: '짜', romaji: 'jja' },
    { hangul: '쩌', romaji: 'jjeo' },
    { hangul: '쪼', romaji: 'jjo' },
    { hangul: '쭈', romaji: 'jju' },
    { hangul: '쯔', romaji: 'jjeu' },
    { hangul: '찌', romaji: 'jji' },
  ],
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
  [
    { hangul: '앗', romaji: 'at' },
    { hangul: '옷', romaji: 'ot' },
    { hangul: '맛', romaji: 'mat' },
    { hangul: '곳', romaji: 'got' },
    { hangul: '빗', romaji: 'bit' },
    { hangul: '꽃', romaji: 'kkot' },
  ],
]

// 発展デッキの行ラベル (1:1 with ADVANCED_ROWS)
const ADVANCED_CATS = [
  '激音 ㅋ行', '激音 ㅌ行', '激音 ㅍ行', '激音 ㅊ行',
  '濃音 ㄲ行', '濃音 ㄸ行', '濃音 ㅃ行', '濃音 ㅆ行', '濃音 ㅉ行',
  '合成母音 1', '合成母音 2', '合成母音 + 子音',
  'パッチム ㄴ', 'パッチム ㅇ', 'パッチム ㅁ', 'パッチム ㄹ',
  'パッチム ㄱ', 'パッチム ㅂ', 'パッチム ㅅ',
]

/** 基本デッキの全行 (教える順)。 */
export const BASIC: Hangul[] = BASIC_ROWS.flat()

/** 発展デッキの全行 (教える順)。 */
export const ADVANCED: Hangul[] = ADVANCED_ROWS.flat()

/** Row lookup for a given item text (all decks) — used by distractor selection. */
export const ROW_OF: Record<string, Hangul[]> = (() => {
  const map: Record<string, Hangul[]> = {}
  for (const row of [
    ...BASIC_ROWS,
    ...ADVANCED_ROWS,
    ...WORD_ROWS,
    ...LOANWORD_ROWS,
    ...COUNTER_ROWS,
    ...MIMETIC_ROWS,
    ...KEIGO_ROWS,
    ...GRAMMAR_ROWS,
    ...PHRASE_ROWS,
    ...HANJA_ROWS,
  ])
    for (const k of row) map[k.hangul] = row
  return map
})()

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
// 'hangul' -> quiz reads romaji; 'words'/'sentence' -> quiz reads meaning.
// 'sentence' renders smaller + shows the pattern/situation label.
export type DeckKind = 'hangul' | 'words' | 'sentence'

export interface Deck {
  id: DeckId
  label: string
  kind: DeckKind
  rows: Hangul[][]
  items: Hangul[] // teaching order; also the distractor pool for this deck
  catLabels?: string[] // category name per row (row-based decks); 1:1 with rows
  kataReading?: boolean // レッスンで韓国語の下にカタカナ読みを表示するか
}

export interface Category {
  name: string
  items: Hangul[]
}

export const DECKS: Deck[] = [
  { id: 'basic', label: 'ハングル基本', kind: 'hangul', rows: BASIC_ROWS, items: BASIC },
  { id: 'advanced', label: 'ハングル発展', kind: 'hangul', rows: ADVANCED_ROWS, items: ADVANCED, catLabels: ADVANCED_CATS },
  { id: 'words', label: '単語', kind: 'words', rows: WORD_ROWS, items: WORDS, catLabels: WORD_CATS },
  { id: 'loanwords', label: '外来語', kind: 'words', rows: LOANWORD_ROWS, items: LOANWORDS, catLabels: LOANWORD_CATS },
  { id: 'counters', label: '助数詞', kind: 'words', rows: COUNTER_ROWS, items: COUNTERS, catLabels: COUNTER_CATS },
  { id: 'mimetic', label: '擬態語', kind: 'words', rows: MIMETIC_ROWS, items: MIMETICS, catLabels: MIMETIC_CATS },
  { id: 'grammar', label: '文法', kind: 'sentence', rows: GRAMMAR_ROWS, items: GRAMMAR },
  { id: 'phrases', label: '会話', kind: 'sentence', rows: PHRASE_ROWS, items: PHRASES, kataReading: true },
  { id: 'keigo', label: '敬語', kind: 'sentence', rows: KEIGO_ROWS, items: KEIGO, kataReading: true },
  { id: 'hanja', label: '漢字語', kind: 'words', rows: HANJA_ROWS, items: HANJA, catLabels: HANJA_CATS },
]

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
