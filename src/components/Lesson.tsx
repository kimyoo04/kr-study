import { useMemo, useState } from 'react'
import type { Deck, Hangul } from '../data/hangul'
import type { LessonItem, LessonMode } from '../lib/srs'
import { buildQuestion, isCorrect, pickQType, type Question } from '../lib/quiz'
import { hasKoVoice, primeSpeech, speakItem } from '../lib/speak'
import { playCorrect, playWrong } from '../lib/sound'
import { ProgressHeader } from './ProgressHeader'
import { ConfirmDialog } from './ConfirmDialog'
import { IntroCard } from './IntroCard'
import { Quiz } from './Quiz'

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

  // Skip the current (unanswered) step: record it as neutral — excluded from
  // scoring, SRS schedule untouched (see LessonResult) — and move on. The item
  // stays reachable via the back button.
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
      <ProgressHeader index={index} total={steps.length} onExit={onExitClick} onBack={onBack} />

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

      {confirmExit && (
        <ConfirmDialog
          title="レッスンをやめますか?"
          body="やめると今回のレッスンの進捗は消えます。"
          primaryLabel="レッスンに戻る"
          secondaryLabel="やめる"
          onPrimary={() => setConfirmExit(false)}
          onSecondary={onExit}
          onEscape={() => setConfirmExit(false)}
        />
      )}
    </main>
  )
}
