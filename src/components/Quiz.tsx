// Multiple-choice quiz card for one lesson step. Renders the prompt by quiz type
// (cloze blank / listen audio / glyph) and defers the option grid to ChoiceGrid.
// Stateless: the parent owns phase, pick, and skip state.
import type { DeckKind, Hangul } from '../data/hangul'
import { clozePrompt, optionText, type Question } from '../lib/quiz'
import { hangulToKata } from '../lib/kata'
import { ChoiceGrid, type Choice } from './ChoiceGrid'
import { KeyHint } from './KeyHint'
import { glyphClassFor } from './glyph'

interface Props {
  question: Question
  deckKind: DeckKind
  kataReading: boolean
  phase: 'answer' | 'feedback'
  picked: Hangul | null
  skipped: boolean
  onReplay: () => void
  onPick: (k: Hangul) => void
  onContinue: () => void
  onSkip: () => void
}

export function Quiz({
  question,
  deckKind,
  kataReading,
  phase,
  picked,
  skipped,
  onReplay,
  onPick,
  onContinue,
  onSkip,
}: Props) {
  const { qtype } = question
  // In listen mode hangul decks still pick the glyph; word/sentence decks
  // pick the Japanese meaning (you only have the sound to go on).
  const label =
    qtype === 'cloze'
      ? '空欄に入る言葉を選んでください'
      : qtype === 'listen'
        ? deckKind === 'hangul'
          ? '音を聞いて文字を選んでください'
          : '音を聞いて意味を選んでください'
        : qtype === 'meaning'
          ? deckKind === 'sentence'
            ? 'この文の意味は?'
            : 'この単語の意味は?'
          : 'この文字の読みは?'

  // Korean-glyph options (cloze words, or listen-mode hangul) get a lang tag so
  // screen readers don't read them with the Japanese synthesizer.
  const koOptionLang =
    qtype === 'cloze' || (qtype === 'listen' && deckKind === 'hangul') ? 'ko' : undefined
  // Options are keyed by position so equal display texts can't collide. Pass the
  // answer key even in the answer phase: it stays unselectable, but tags the
  // correct option (data-correct) for our e2e hooks, matching prior markup.
  const choices: Choice[] = question.options.map((opt, i) => ({
    key: String(i),
    text: optionText(opt, qtype, deckKind),
    lang: koOptionLang,
  }))
  const answerKey = String(question.options.findIndex((o) => o.hangul === question.answer.hangul))
  const pickedKey =
    picked != null ? String(question.options.findIndex((o) => o.hangul === picked.hangul)) : null

  return (
    <section className="card quiz">
      {qtype === 'cloze' ? (
        <>
          <p className="prompt-label">{label}</p>
          {/* Answer-phase shows the blank; feedback reveals the full sentence. */}
          <div className="glyph sentence cloze-prompt" lang="ko">
            {phase === 'feedback' ? question.answer.hangul : clozePrompt(question.answer)}
          </div>
          {question.answer.meaning && <div className="meaning cloze-hint">{question.answer.meaning}</div>}
        </>
      ) : qtype === 'listen' ? (
        <>
          <p className="prompt-label">{label}</p>
          <button className="btn-ghost big-audio" onClick={onReplay} aria-label="もう一度聞く">
            🔊<KeyHint k="R" />
          </button>
          {phase === 'feedback' && (
            // Reveal what was heard so the sound gets tied to its glyph.
            <div className={glyphClassFor(deckKind)} lang="ko">
              {question.answer.hangul}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="prompt-label">{label}</p>
          <div className={glyphClassFor(deckKind)} lang="ko">
            {question.answer.hangul}
          </div>
          {kataReading && (
            <div className="kata-reading">{hangulToKata(question.answer.hangul)}</div>
          )}
        </>
      )}

      <ChoiceGrid
        options={choices}
        mode={phase}
        selectedKey={phase === 'feedback' ? pickedKey : null}
        correctKey={answerKey}
        pressable={false}
        keyHints
        onPick={(key) => onPick(question.options[Number(key)])}
      />

      <p className="sr-only" role="status">
        {phase === 'feedback' &&
          (picked?.hangul === question.answer.hangul ? (
            '正解'
          ) : (
            <>
              不正解。正解は{' '}
              <span lang={koOptionLang}>{optionText(question.answer, qtype, deckKind)}</span>
            </>
          ))}
      </p>

      {phase === 'feedback' && skipped && (
        <p className="skip-note" role="status">
          スキップしました(採点に含まれません)
        </p>
      )}

      {phase === 'answer' && (
        <button className="btn-ghost skip" onClick={onSkip}>
          スキップ
        </button>
      )}

      {phase === 'feedback' && (
        <button className="btn-primary" onClick={onContinue}>
          続ける<KeyHint k="Enter" />
        </button>
      )}
    </section>
  )
}
