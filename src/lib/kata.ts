// ハングル → カタカナ読み変換。会話・敬語デッキで韓国語の文の下に
// カタカナで読み方を表示するために使う。
// 表記ルール(日本の韓国語教材の慣例、発音変化を反映):
//   連音化(リエゾン): パッチム + ㅇ → 次の音節へ移動 (맛있어요 → マシッソヨ)
//   ㅎ弱化: ㅎパッチム + ㅇ → 脱落 (좋아요 → チョアヨ)
//   鼻音化: 閉鎖音パッチム + ㄴ/ㅁ → 鼻音 (합니다 → ハムニダ)
//   有声音化: 語中の ㄱ/ㄷ/ㅂ/ㅈ → ガ/ダ/バ/ジャ行 (고기 → コギ)
//   パッチム: ㄴ/ㅇ → ン、ㅁ → ム、ㄹ → ル、ㄱ → ク(カ行の前は ッ)、
//             ㅂ → プ(パ/バ行の前は ッ)、ㄷ/ㅅ/ㅈ/ㅊ/ㅌ/ㅎ → ッ

const HANGUL_BASE = 0xac00
const CHO_COUNT = 19
const JUNG_COUNT = 21
const JONG_COUNT = 28

// 初声 (cho) のインデックス: ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ
const CHO_G = 0
const CHO_GG = 1
const CHO_N = 2
const CHO_D = 3
const CHO_R = 5
const CHO_M = 6
const CHO_B = 7
const CHO_BB = 8
const CHO_S = 9
const CHO_SS = 10
const CHO_NG = 11 // ㅇ (無音)
const CHO_J = 12
const CHO_CH = 14
const CHO_K = 15
const CHO_T = 16
const CHO_P = 17

// 終声 (jong) のインデックス (0 = なし)
const JONG_NONE = 0
const JONG_G = 1
const JONG_GG = 2
const JONG_GS = 3
const JONG_N = 4
const JONG_NJ = 5
const JONG_NH = 6
const JONG_D = 7
const JONG_L = 8
const JONG_LG = 9
const JONG_LM = 10
const JONG_LB = 11
const JONG_LS = 12
const JONG_LT = 13
const JONG_LP = 14
const JONG_LH = 15
const JONG_M = 16
const JONG_B = 17
const JONG_BS = 18
const JONG_S = 19
const JONG_SS = 20
const JONG_NG = 21
const JONG_J = 22
const JONG_CH = 23
const JONG_K = 24
const JONG_T = 25
const JONG_P = 26
const JONG_H = 27

interface Syl {
  cho: number
  jung: number
  jong: number
}

function decompose(ch: string): Syl | null {
  const code = ch.charCodeAt(0) - HANGUL_BASE
  if (code < 0 || code >= CHO_COUNT * JUNG_COUNT * JONG_COUNT) return null
  return {
    cho: Math.floor(code / (JUNG_COUNT * JONG_COUNT)),
    jung: Math.floor((code % (JUNG_COUNT * JONG_COUNT)) / JONG_COUNT),
    jong: code % JONG_COUNT,
  }
}

// 母音 → 五十音の列 (a/i/u/e/o) + 拗音の小書き文字。
// y系・w系は キャ/クァ のように i/u 列 + 小書きで表す。
interface Vowel {
  col: 'a' | 'i' | 'u' | 'e' | 'o'
  small?: string
}
// 中声順: ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ
const VOWELS: Vowel[] = [
  { col: 'a' }, // ㅏ
  { col: 'e' }, // ㅐ
  { col: 'i', small: 'ャ' }, // ㅑ
  { col: 'i', small: 'ェ' }, // ㅒ
  { col: 'o' }, // ㅓ
  { col: 'e' }, // ㅔ
  { col: 'i', small: 'ョ' }, // ㅕ
  { col: 'i', small: 'ェ' }, // ㅖ
  { col: 'o' }, // ㅗ
  { col: 'u', small: 'ァ' }, // ㅘ
  { col: 'u', small: 'ェ' }, // ㅙ
  { col: 'u', small: 'ェ' }, // ㅚ
  { col: 'i', small: 'ョ' }, // ㅛ
  { col: 'u' }, // ㅜ
  { col: 'u', small: 'ォ' }, // ㅝ
  { col: 'u', small: 'ェ' }, // ㅞ
  { col: 'u', small: 'ィ' }, // ㅟ
  { col: 'i', small: 'ュ' }, // ㅠ
  { col: 'u' }, // ㅡ
  { col: 'u', small: 'ィ' }, // ㅢ
  { col: 'i' }, // ㅣ
]

type Row = Record<'a' | 'i' | 'u' | 'e' | 'o', string>

const ROW_K: Row = { a: 'カ', i: 'キ', u: 'ク', e: 'ケ', o: 'コ' }
const ROW_G: Row = { a: 'ガ', i: 'ギ', u: 'グ', e: 'ゲ', o: 'ゴ' }
const ROW_N: Row = { a: 'ナ', i: 'ニ', u: 'ヌ', e: 'ネ', o: 'ノ' }
const ROW_T: Row = { a: 'タ', i: 'ティ', u: 'トゥ', e: 'テ', o: 'ト' }
const ROW_D: Row = { a: 'ダ', i: 'ディ', u: 'ドゥ', e: 'デ', o: 'ド' }
const ROW_R: Row = { a: 'ラ', i: 'リ', u: 'ル', e: 'レ', o: 'ロ' }
const ROW_M: Row = { a: 'マ', i: 'ミ', u: 'ム', e: 'メ', o: 'モ' }
const ROW_P: Row = { a: 'パ', i: 'ピ', u: 'プ', e: 'ペ', o: 'ポ' }
const ROW_B: Row = { a: 'バ', i: 'ビ', u: 'ブ', e: 'ベ', o: 'ボ' }
const ROW_S: Row = { a: 'サ', i: 'シ', u: 'ス', e: 'セ', o: 'ソ' }
const ROW_CH: Row = { a: 'チャ', i: 'チ', u: 'チュ', e: 'チェ', o: 'チョ' }
const ROW_J: Row = { a: 'ジャ', i: 'ジ', u: 'ジュ', e: 'ジェ', o: 'ジョ' }
const ROW_H: Row = { a: 'ハ', i: 'ヒ', u: 'フ', e: 'ヘ', o: 'ホ' }
// ㅇ (母音のみ): y系/w系は専用の文字を使う
const ROW_VOWEL: Row = { a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' }

/** 初声 → 行。voiced は語中の有声音化バージョン。 */
const CHO_ROWS: { plain: Row; voiced?: Row }[] = [
  { plain: ROW_K, voiced: ROW_G }, // ㄱ
  { plain: ROW_K }, // ㄲ
  { plain: ROW_N }, // ㄴ
  { plain: ROW_T, voiced: ROW_D }, // ㄷ
  { plain: ROW_T }, // ㄸ
  { plain: ROW_R }, // ㄹ
  { plain: ROW_M }, // ㅁ
  { plain: ROW_P, voiced: ROW_B }, // ㅂ
  { plain: ROW_P }, // ㅃ
  { plain: ROW_S }, // ㅅ
  { plain: ROW_S }, // ㅆ
  { plain: ROW_VOWEL }, // ㅇ
  { plain: ROW_CH, voiced: ROW_J }, // ㅈ
  { plain: ROW_CH }, // ㅉ
  { plain: ROW_CH }, // ㅊ
  { plain: ROW_K }, // ㅋ
  { plain: ROW_T }, // ㅌ
  { plain: ROW_P }, // ㅍ
  { plain: ROW_H }, // ㅎ
]

// ㅇ初声 + y/w系母音は「イャ」ではなく専用文字 (야 → ヤ、와 → ワ)
const NG_SPECIAL: Record<number, string> = {
  2: 'ヤ', // ㅑ
  3: 'イェ', // ㅒ
  6: 'ヨ', // ㅕ
  7: 'イェ', // ㅖ
  9: 'ワ', // ㅘ
  10: 'ウェ', // ㅙ
  11: 'ウェ', // ㅚ
  12: 'ヨ', // ㅛ
  14: 'ウォ', // ㅝ
  15: 'ウェ', // ㅞ
  16: 'ウィ', // ㅟ
  17: 'ユ', // ㅠ
  19: 'ウィ', // ㅢ
}

// パッチムの分類
const JONG_TO_N = new Set([JONG_N, JONG_NJ, JONG_NH, JONG_NG])
const JONG_TO_M = new Set([JONG_M, JONG_LM])
const JONG_TO_L = new Set([JONG_L, JONG_LG, JONG_LB, JONG_LS, JONG_LT, JONG_LP, JONG_LH])
const JONG_TO_K = new Set([JONG_G, JONG_GG, JONG_GS, JONG_K])
const JONG_TO_P = new Set([JONG_B, JONG_BS, JONG_P])
const JONG_TO_TT = new Set([JONG_D, JONG_S, JONG_SS, JONG_J, JONG_CH, JONG_T, JONG_H])

// 連音化でパッチムが次の音節の初声になるときの変換 (単純パッチムのみ)
const JONG_TO_CHO: Record<number, number> = {
  [JONG_G]: CHO_G,
  [JONG_GG]: CHO_GG,
  [JONG_N]: CHO_N,
  [JONG_D]: CHO_D,
  [JONG_L]: CHO_R,
  [JONG_M]: CHO_M,
  [JONG_B]: CHO_B,
  [JONG_S]: CHO_S,
  [JONG_SS]: CHO_SS,
  [JONG_J]: CHO_J,
  [JONG_CH]: CHO_CH,
  [JONG_K]: CHO_K,
  [JONG_T]: CHO_T,
  [JONG_P]: CHO_P,
}
// 複合パッチムの連音化: 前半が残り、後半が次へ移る
const JONG_SPLIT: Record<number, [number, number]> = {
  [JONG_GS]: [JONG_G, CHO_S],
  [JONG_NJ]: [JONG_N, CHO_J],
  [JONG_LG]: [JONG_L, CHO_G],
  [JONG_LM]: [JONG_L, CHO_M],
  [JONG_LB]: [JONG_L, CHO_B],
  [JONG_LS]: [JONG_L, CHO_S],
  [JONG_LP]: [JONG_L, CHO_P],
  [JONG_BS]: [JONG_B, CHO_S],
}

// 鼻音化: 閉鎖音パッチムが ㄴ/ㅁ の前で鼻音になる
function nasalize(jong: number): number {
  if (JONG_TO_K.has(jong)) return JONG_NG // 국물 → 궁물
  if (JONG_TO_P.has(jong)) return JONG_M // 합니다 → 함니다
  if (JONG_TO_TT.has(jong)) return JONG_N // 끝나다 → 끈나다
  return jong
}

/** 一文字分のカタカナ。voiced = 語中の有声音化を適用するか。 */
function sylToKana(syl: Syl, voiced: boolean): string {
  if (syl.cho === CHO_NG && NG_SPECIAL[syl.jung]) return NG_SPECIAL[syl.jung]
  const rows = CHO_ROWS[syl.cho]
  const row = voiced && rows.voiced ? rows.voiced : rows.plain
  const v = VOWELS[syl.jung]
  let out = row[v.col]
  if (v.small) {
    // 拗音: キ + ャ → キャ。ティ/チャ など複数文字のセルは末尾の母音字を置き換える
    if (out.length > 1) out = out.slice(0, -1)
    out += v.small
  }
  return out
}

/** パッチムのカタカナ。next = 次の音節の初声 (なければ undefined)。 */
function jongToKana(jong: number, next: Syl | undefined): string {
  if (JONG_TO_N.has(jong)) return 'ン'
  if (JONG_TO_M.has(jong)) return 'ム'
  if (JONG_TO_L.has(jong)) return 'ル'
  if (JONG_TO_K.has(jong)) {
    // カ行の前では詰まって聞こえる: 학교 → ハッキョ
    return next && (next.cho === CHO_G || next.cho === CHO_GG || next.cho === CHO_K) ? 'ッ' : 'ク'
  }
  if (JONG_TO_P.has(jong)) {
    return next && (next.cho === CHO_B || next.cho === CHO_BB || next.cho === CHO_P) ? 'ッ' : 'プ'
  }
  if (JONG_TO_TT.has(jong)) return 'ッ'
  return ''
}

// 語中の有声音化が起きる環境: 直前の音節のパッチムが なし/ㄴ/ㅁ/ㅇ/ㄹ
function voicingEnv(prev: Syl | undefined): boolean {
  if (!prev) return false
  return (
    prev.jong === JONG_NONE ||
    JONG_TO_N.has(prev.jong) ||
    JONG_TO_M.has(prev.jong) ||
    JONG_TO_L.has(prev.jong)
  )
}

export function hangulToKata(text: string): string {
  // 1) 音節に分解。ハングル以外はそのまま通す。
  const chars = [...text]
  const syls: (Syl | null)[] = chars.map(decompose)

  // 2) 発音変化の前処理 (連音化・ㅎ弱化・鼻音化)
  for (let i = 0; i < syls.length; i++) {
    const cur = syls[i]
    const next = syls[i + 1]
    if (!cur || cur.jong === JONG_NONE) continue
    if (next && next.cho === CHO_NG && !NG_SPECIAL[next.jung]) {
      // 連音化: 맛있어요 → 마싰어요 → マシッソヨ。ㅇパッチムは連音しない。
      if (cur.jong === JONG_H || cur.jong === JONG_NH || cur.jong === JONG_LH) {
        // ㅎ弱化: 좋아요 → チョアヨ
        cur.jong = cur.jong === JONG_NH ? JONG_N : cur.jong === JONG_LH ? JONG_L : JONG_NONE
      } else if (cur.jong !== JONG_NG) {
        const split = JONG_SPLIT[cur.jong]
        if (split) {
          cur.jong = split[0]
          next.cho = split[1]
        } else if (JONG_TO_CHO[cur.jong] !== undefined) {
          next.cho = JONG_TO_CHO[cur.jong]
          // 濃音 (ㅆ/ㄲ) は詰まる音が残る: 있어요 → イッソヨ
          cur.jong = cur.jong === JONG_SS || cur.jong === JONG_GG ? cur.jong : JONG_NONE
        }
      }
    } else if (next && (next.cho === CHO_N || next.cho === CHO_M)) {
      cur.jong = nasalize(cur.jong)
    }
  }

  // 3) カタカナへ
  const out: string[] = []
  let prev: Syl | undefined
  for (let i = 0; i < syls.length; i++) {
    const syl = syls[i]
    if (!syl) {
      const ch = chars[i]
      out.push(ch === '.' ? '。' : ch === ',' ? '、' : ch)
      prev = undefined
      continue
    }
    out.push(sylToKana(syl, voicingEnv(prev)))
    const next = syls[i + 1] ?? undefined
    if (syl.jong !== JONG_NONE) out.push(jongToKana(syl.jong, next))
    prev = syl
  }
  return out.join('')
}
