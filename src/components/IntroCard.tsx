// Teaching card shown before an item is first quizzed: the glyph, its reading,
// and (for non-hangul decks) its meaning, with a "play sound" and "next" button.
import type { Deck, DeckKind, Hangul } from '../data/hangul'
import { hangulToKata } from '../lib/kata'
import { primeSpeech } from '../lib/speak'
import { glyphClassFor } from './glyph'

const INTRO_LABEL: Record<DeckKind, string> = {
  hangul: '新しい文字',
  words: '新しい単語',
  sentence: '例文',
  cloze: '例文',
}

interface Props {
  hangul: Hangul
  deck: Deck
  onSpeak: () => void
  onNext: () => void
}

export function IntroCard({ hangul, deck, onSpeak, onNext }: Props) {
  return (
    <section className="card intro">
      {deck.kind === 'sentence' && hangul.note && <div className="pattern">{hangul.note}</div>}
      <p className="prompt-label">{INTRO_LABEL[deck.kind]}</p>
      <div className={glyphClassFor(deck.kind)} lang="ko">
        {hangul.hangul}
      </div>
      {deck.kataReading && <div className="kata-reading">{hangulToKata(hangul.hangul)}</div>}
      <div className="romaji">{hangul.romaji}</div>
      {hangul.meaning && deck.kind !== 'hangul' && <div className="meaning">{hangul.meaning}</div>}
      <button
        className="btn-ghost"
        onClick={() => {
          primeSpeech()
          onSpeak()
        }}
      >
        🔊 発音を聞く
      </button>
      <button className="btn-primary" onClick={onNext}>
        次へ
      </button>
    </section>
  )
}
