import { useMemo, useState } from 'react'
import type { Deck, DeckKind, Hangul } from '../data/hangul'
import type { LessonItem, LessonMode } from '../lib/srs'
import { buildQuestion, isCorrect, optionText, pickQType, type Question } from '../lib/quiz'
import { hasKoVoice, primeSpeech, speakItem } from '../lib/speak'
import { hangulToKata } from '../lib/kata'
import { playCorrect, playWrong } from '../lib/sound'

export interface LessonResult {
  hangul: Hangul
  mode: LessonMode
  correct: boolean
}

interface Props {
  items: LessonItem[]
  pool: Hangul[] // distractor pool for the active deck
  deck: Deck
  listenMode: boolean // user toggle: audio-prompt every quiz
  onComplete: (results: LessonResult[]) => void
  onExit: () => void
}

interface Step {
  item: LessonItem
  question?: Question
}

function glyphClassFor(kind: DeckKind): string {
  if (kind === 'sentence') return 'glyph sentence'
  if (kind === 'words') return 'glyph word'
  return 'glyph big'
}

const INTRO_LABEL: Record<DeckKind, string> = {
  hangul: '新しい文字',
  words: '新しい単語',
  sentence: '例文',
}

export function Lesson({ items, pool, deck, listenMode, onComplete, onExit }: Props) {
  // Assign question types up front. Listen mode forces audio prompts on every
  // deck; otherwise word decks quiz on meaning and hangul decks round-robin
  // read/listen (dropping listen when no voice is available).
  const steps = useMemo<Step[]>(() => {
    const voice = hasKoVoice()
    let quizN = 0
    return items.map((item) => {
      if (item.mode === 'intro') return { item }
      const qtype = pickQType(deck.kind, listenMode, voice, quizN++)
      return { item, question: buildQuestion(item.hangul, qtype, deck.kind, pool, deck.rowOf) }
    })
  }, [items, pool, deck, listenMode])

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer')
  const [picked, setPicked] = useState<Hangul | null>(null)
  const [results, setResults] = useState<LessonResult[]>([])
  const [confirmExit, setConfirmExit] = useState(false)

  const step = steps[index]
  const progressPct = Math.round((index / steps.length) * 100)

  function record(correct: boolean): LessonResult[] {
    return [...results, { hangul: step.item.hangul, mode: step.item.mode, correct }]
  }

  function advance(next: LessonResult[]) {
    if (index + 1 >= steps.length) {
      onComplete(next)
      return
    }
    setResults(next)
    setIndex(index + 1)
    setPhase('answer')
    setPicked(null)
  }

  function sayCurrent() {
    speakItem(step.item.hangul)
  }

  function onIntroNext() {
    primeSpeech()
    sayCurrent()
    advance(record(true))
  }

  function onPick(option: Hangul) {
    if (phase === 'feedback') return
    primeSpeech()
    const correct = isCorrect(step.question!, option)
    setPicked(option)
    setPhase('feedback')
    if (correct) playCorrect()
    else playWrong()
    sayCurrent()
  }

  function onContinue() {
    advance(record(isCorrect(step.question!, picked!)))
  }

  function onExitClick() {
    // Confirm once the user has made any progress (answered or advanced).
    if (index > 0 || phase === 'feedback' || results.length > 0) setConfirmExit(true)
    else onExit()
  }

  return (
    <main className="screen lesson" tabIndex={-1}>
      <div className="lesson-top">
        <button className="link" onClick={onExitClick} aria-label="閉じる">
          ✕
        </button>
        <div className="progress-bar slim">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="counter">
          {index + 1}/{steps.length}
        </span>
      </div>

      {step.item.mode === 'intro' ? (
        <IntroCard
          hangul={step.item.hangul}
          deck={deck}
          onSpeak={sayCurrent}
          onNext={onIntroNext}
        />
      ) : (
        <Quiz
          question={step.question!}
          deckKind={deck.kind}
          kataReading={!!deck.kataReading}
          phase={phase}
          picked={picked}
          onReplay={sayCurrent}
          onPick={onPick}
          onContinue={onContinue}
        />
      )}

      {confirmExit && <ExitConfirm onStay={() => setConfirmExit(false)} onLeave={onExit} />}
    </main>
  )
}

function IntroCard({
  hangul,
  deck,
  onSpeak,
  onNext,
}: {
  hangul: Hangul
  deck: Deck
  onSpeak: () => void
  onNext: () => void
}) {
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

function ExitConfirm({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onStay()
      }}
    >
      <div className="modal">
        <p className="modal-title">レッスンをやめますか?</p>
        <p className="modal-body">やめると今回のレッスンの進捗は消えます。</p>
        <button className="btn-primary" onClick={onStay} autoFocus>
          レッスンに戻る
        </button>
        <button className="btn-ghost" onClick={onLeave}>
          やめる
        </button>
      </div>
    </div>
  )
}

function Quiz({
  question,
  deckKind,
  kataReading,
  phase,
  picked,
  onReplay,
  onPick,
  onContinue,
}: {
  question: Question
  deckKind: DeckKind
  kataReading: boolean
  phase: 'answer' | 'feedback'
  picked: Hangul | null
  onReplay: () => void
  onPick: (k: Hangul) => void
  onContinue: () => void
}) {
  const { qtype } = question
  // In listen mode hangul decks still pick the glyph; word/sentence decks
  // pick the Japanese meaning (you only have the sound to go on).
  const label =
    qtype === 'listen'
      ? deckKind === 'hangul'
        ? '音を聞いて文字を選んでください'
        : '音を聞いて意味を選んでください'
      : qtype === 'meaning'
        ? deckKind === 'sentence'
          ? 'この文の意味は?'
          : 'この単語の意味は?'
        : 'この文字の読みは?'

  return (
    <section className="card quiz">
      {qtype === 'listen' ? (
        <>
          <p className="prompt-label">{label}</p>
          <button className="btn-ghost big-audio" onClick={onReplay} aria-label="もう一度聞く">
            🔊
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

      <div className="options">
        {question.options.map((opt) => {
          const isAnswer = opt.hangul === question.answer.hangul
          const isPicked = picked?.hangul === opt.hangul
          const cls =
            phase === 'feedback'
              ? isAnswer
                ? 'opt correct'
                : isPicked
                  ? 'opt wrong'
                  : 'opt dim'
              : 'opt'
          const text = optionText(opt, qtype, deckKind)
          // Listen-mode hangul options render Korean glyphs; tag the language
          // so screen readers don't read them with the Japanese synthesizer.
          const optLang = qtype === 'listen' && deckKind === 'hangul' ? 'ko' : undefined
          const mark =
            phase === 'feedback' && isAnswer
              ? '✓'
              : phase === 'feedback' && isPicked
                ? '✗'
                : null
          return (
            <button
              key={opt.hangul}
              className={cls}
              data-correct={isAnswer || undefined}
              disabled={phase === 'feedback'}
              onClick={() => onPick(opt)}
            >
              <span className="opt-text" lang={optLang}>
                {text}
              </span>
              {mark && (
                <span className="opt-mark" aria-hidden="true">
                  {mark}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="sr-only" role="status">
        {phase === 'feedback' &&
          (picked?.hangul === question.answer.hangul ? (
            '正解'
          ) : (
            <>
              不正解。正解は{' '}
              <span lang={qtype === 'listen' && deckKind === 'hangul' ? 'ko' : undefined}>
                {optionText(question.answer, qtype, deckKind)}
              </span>
            </>
          ))}
      </p>

      {phase === 'feedback' && (
        <button className="btn-primary" onClick={onContinue}>
          続ける
        </button>
      )}
    </section>
  )
}
