import { describe, expect, it } from 'vitest'
import { hangulToKata } from './kata'

describe('hangulToKata', () => {
  it('transcribes plain syllables', () => {
    expect(hangulToKata('네')).toBe('ネ')
    expect(hangulToKata('나라')).toBe('ナラ')
  })

  it('applies word-internal voicing of ㄱ/ㄷ/ㅂ/ㅈ', () => {
    expect(hangulToKata('고기')).toBe('コギ')
    expect(hangulToKata('바다')).toBe('パダ')
    expect(hangulToKata('아주')).toBe('アジュ')
  })

  it('does not voice after an unvoiced batchim, but does after ㄴ/ㅁ/ㅇ/ㄹ', () => {
    expect(hangulToKata('한국')).toBe('ハングク')
    expect(hangulToKata('갈비')).toBe('カルビ')
  })

  it('maps batchim to ン/ム/ル/ク/プ/ッ', () => {
    expect(hangulToKata('안녕하세요')).toBe('アンニョンハセヨ')
    expect(hangulToKata('밥')).toBe('パプ')
    expect(hangulToKata('맛')).toBe('マッ')
    expect(hangulToKata('김')).toBe('キム')
    expect(hangulToKata('물')).toBe('ムル')
  })

  it('geminates stops before a same-class consonant', () => {
    expect(hangulToKata('학교')).toBe('ハッキョ')
  })

  it('nasalizes stops before ㄴ/ㅁ', () => {
    expect(hangulToKata('감사합니다')).toBe('カムサハムニダ')
  })

  it('applies liaison across ㅇ-initial syllables', () => {
    expect(hangulToKata('맛있어요')).toBe('マシッソヨ')
    expect(hangulToKata('한국어')).toBe('ハングゴ')
  })

  it('drops weak ㅎ between vowels', () => {
    expect(hangulToKata('좋아요')).toBe('チョアヨ')
  })

  it('handles y- and w-vowels', () => {
    expect(hangulToKata('여유')).toBe('ヨユ')
    expect(hangulToKata('와요')).toBe('ワヨ')
    expect(hangulToKata('워')).toBe('ウォ')
    expect(hangulToKata('의사')).toBe('ウィサ')
    expect(hangulToKata('교과서')).toBe('キョグァソ')
  })

  it('handles aspirated and tense consonants', () => {
    expect(hangulToKata('커피')).toBe('コピ')
    expect(hangulToKata('치즈')).toBe('チジュ')
  })

  it('marks word-internal tense consonants with ッ, but not word-initially', () => {
    expect(hangulToKata('아빠')).toBe('アッパ')
    expect(hangulToKata('오빠')).toBe('オッパ')
    expect(hangulToKata('짜요')).toBe('チャヨ')
    // already-geminated batchim does not double the ッ
    expect(hangulToKata('맛있어요')).toBe('マシッソヨ')
  })

  it('aspirates stops before/after ㅎ', () => {
    expect(hangulToKata('축하해요')).toBe('チュカヘヨ')
    expect(hangulToKata('입학')).toBe('イパク')
    expect(hangulToKata('못해요')).toBe('モテヨ')
    expect(hangulToKata('어떻게')).toBe('オットケ')
    expect(hangulToKata('괜찮다')).toBe('クェンチャンタ')
    expect(hangulToKata('싫다')).toBe('シルタ')
  })

  it('applies liquid assimilation (ㄴ/ㄹ → ㄹㄹ)', () => {
    expect(hangulToKata('연락')).toBe('ヨルラク')
    expect(hangulToKata('설날')).toBe('ソルラル')
    expect(hangulToKata('한류')).toBe('ハルリュ')
  })

  it('nasalizes ㄹ after ㅁ/ㅇ and after stops', () => {
    expect(hangulToKata('음료수')).toBe('ウムニョス')
    expect(hangulToKata('정류장')).toBe('チョンニュジャン')
    expect(hangulToKata('협력')).toBe('ヒョムニョク')
  })

  it('palatalizes ㄷ/ㅌ before 이', () => {
    expect(hangulToKata('같이')).toBe('カチ')
    expect(hangulToKata('굳이')).toBe('クジ')
  })

  it('passes through non-hangul characters and converts sentence punctuation', () => {
    expect(hangulToKata('네!')).toBe('ネ!')
    expect(hangulToKata('어디예요?')).toBe('オディイェヨ?')
    expect(hangulToKata('네. 맞아요')).toBe('ネ。 マジャヨ')
  })

  it('keeps spaces between words', () => {
    expect(hangulToKata('저는 학생입니다')).toBe('チョヌン ハクセンイムニダ')
  })
})
