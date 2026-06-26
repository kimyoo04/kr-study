import { useMemo, useState } from 'react'
import type { Deck, DeckKind, Hangul } from '../data/hangul'
import type { LessonItem, LessonMode } from '../lib/srs'
import {
  buildQuestion,
  clozePrompt,
  isCorrect,
  optionText,
  pickQType,
  type Question,
} from '../lib/quiz'
import { hasKoVoice, primeSpeech, speakItem } from '../lib/speak'
import { hangulToKata } from '../lib/kata'
import { playCorrect, playWrong } from '../lib/sound'

export interface LessonResult {
  hangul: Hangul
  mode: LessonMode
  correct: boolean
  // Skipped items are neutral: excluded from scoring and left untouched in the
  // SRS schedule (the card stays due, so the item naturally reappears later).
  skipped?: boolean
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
  if (kind === 'sentence' || kind === 'cloze') return 'glyph sentence'
  if (kind === 'words') return 'glyph word'
  return 'glyph big'
}

const INTRO_LABEL: Record<DeckKind, string> = {
  hangul: '新しい文字',
  words: '新しい単語',
  sentence: '例文',
  cloze: '例文',
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

  // Results and picks are indexed by step position (not append-only) so the
  // learner can move back to review earlier items and forward again without
  // losing answers. A null entry means "not yet answered/skipped".
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<(LessonResult | null)[]>(() => steps.map(() => null))
  const [picks, setPicks] = useState<(Hangul | null)[]>(() => steps.map(() => null))
  const [confirmExit, setConfirmExit] = useState(false)

  const step = steps[index]
  const result = results[index]
  const answered = result != null
  // Revisiting an already-answered/skipped step shows it read-only (feedback).
  const phase: 'answer' | 'feedback' = answered ? 'feedback' : 'answer'
  const picked = picks[index]
  const progressPct = Math.round((index / steps.length) * 100)

  const withAt = <T,>(arr: T[], i: number, v: T): T[] => {
    const copy = arr.slice()
    copy[i] = v
    return copy
  }

  // Move on from the current step; complete the lesson if it was the last one.
  // `merged` carries the just-committed results so completion sees them despite
  // React state batching.
  function advanceFrom(merged: (LessonResult | null)[]) {
    if (index + 1 >= steps.length) {
      onComplete(merged.filter((r): r is LessonResult => r != null))
    } else {
      setIndex(index + 1)
    }
  }

  function sayCurrent() {
    speakItem(step.item.hangul)
  }

  function onIntroNext() {
    primeSpeech()
    sayCurrent()
    if (answered) {
      advanceFrom(results)
      return
    }
    const merged = withAt(results, index, {
      hangul: step.item.hangul,
      mode: step.item.mode,
      correct: true,
    })
    setResults(merged)
    advanceFrom(merged)
  }

  function onPick(option: Hangul) {
    if (answered) return // read-only when revisiting
    primeSpeech()
    const correct = isCorrect(step.question!, option)
    setResults(withAt(results, index, { hangul: step.item.hangul, mode: step.item.mode, correct }))
    setPicks(withAt(picks, index, option))
    if (correct) playCorrect()
    else playWrong()
    sayCurrent()
  }

  function onContinue() {
    advanceFrom(results)
  }

  function onSkip() {
    if (answered) return
    const merged = withAt(results, index, {
      hangul: step.item.hangul,
      mode: step.item.mode,
      correct: false,
      skipped: true,
    })
    setResults(merged)
    advanceFrom(merged)
  }

  function onBack() {
    if (index > 0) setIndex(index - 1)
  }

  function onExitClick() {
    // Confirm once the user has made any progress (moved on or answered).
    if (index > 0 || results.some((r) => r != null)) setConfirmExit(true)
    else onExit()
  }

  return (
    <main className="screen lesson" tabIndex={-1}>
      <div className="lesson-top">
        <button className="link" onClick={onExitClick} aria-label="閉じる">
          ✕
        </button>
        <button
          className="link"
          onClick={onBack}
          disabled={index === 0}
          aria-label="前の問題へ戻る"
        >
          ←
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
          skipped={!!result?.skipped}
          onReplay={sayCurrent}
          onPick={onPick}
          onContinue={onContinue}
          onSkip={onSkip}
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
  skipped,
  onReplay,
  onPick,
  onContinue,
  onSkip,
}: {
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
}) {
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
          // Korean-glyph options (cloze words, or listen-mode hangul) get a lang
          // tag so screen readers don't read them with the Japanese synthesizer.
          const optLang =
            qtype === 'cloze' || (qtype === 'listen' && deckKind === 'hangul') ? 'ko' : undefined
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
              <span lang={qtype === 'cloze' || (qtype === 'listen' && deckKind === 'hangul') ? 'ko' : undefined}>
                {optionText(question.answer, qtype, deckKind)}
              </span>
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
          続ける
        </button>
      )}
    </section>
  )
}
