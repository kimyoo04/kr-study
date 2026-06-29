import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DECKS } from '../data/hangul'
import type { LessonItem } from '../lib/srs'
import { Lesson, type LessonResult } from './Lesson'

// Lesson reaches into the speech/audio APIs which jsdom doesn't provide; stub
// them so the component renders. hasKoVoice=false keeps quiz types on 'meaning'.
vi.mock('../lib/speak', () => ({
  hasKoVoice: () => false,
  primeSpeech: () => {},
  speakItem: () => {},
}))
vi.mock('../lib/sound', () => ({ playCorrect: () => {}, playWrong: () => {} }))

const deck = DECKS.find((d) => d.id === 'words')!
const items: LessonItem[] = deck.items.slice(0, 3).map((hangul) => ({ hangul, mode: 'quiz' }))

afterEach(() => {
  cleanup()
})

function setup() {
  const onComplete = vi.fn<(r: LessonResult[]) => void>()
  const onExit = vi.fn()
  render(
    <Lesson
      items={items}
      pool={deck.items}
      deck={deck}
      listenMode={false}
      onComplete={onComplete}
      onExit={onExit}
    />,
  )
  return { onComplete, onExit }
}

describe('Lesson skip / back navigation', () => {
  it('skips an item as neutral (recorded skipped, not graded)', () => {
    const { onComplete } = setup()
    expect(screen.getByText('1/3')).toBeInTheDocument()

    // Skip all three questions.
    fireEvent.click(screen.getByText('スキップ'))
    expect(screen.getByText('2/3')).toBeInTheDocument()
    fireEvent.click(screen.getByText('スキップ'))
    fireEvent.click(screen.getByText('スキップ'))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const results = onComplete.mock.calls[0][0]
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.skipped === true && r.correct === false)).toBe(true)
  })

  it('lets the learner go back to a previous item read-only', () => {
    setup()
    // Answer Q1 by its (unique) Japanese meaning, then continue to Q2.
    const meaning = items[0].hangul.meaning!
    fireEvent.click(screen.getByText(meaning))
    fireEvent.click(screen.getByText('続ける'))
    expect(screen.getByText('2/3')).toBeInTheDocument()

    // Go back to Q1.
    fireEvent.click(screen.getByLabelText('前の問題へ戻る'))
    expect(screen.getByText('1/3')).toBeInTheDocument()

    // Read-only: options are disabled and skipping is no longer offered.
    expect(screen.getByText(meaning).closest('button')).toBeDisabled()
    expect(screen.queryByText('スキップ')).toBeNull()
  })

  it('disables the back button on the first item', () => {
    setup()
    expect(screen.getByLabelText('前の問題へ戻る')).toBeDisabled()
  })
})

describe('Lesson keyboard control', () => {
  it('number keys 1–4 pick the matching answer', () => {
    setup()
    const opts = Array.from(document.querySelectorAll('.options .opt'))
    const correctIdx = opts.findIndex((b) => b.hasAttribute('data-correct'))
    // Press the digit for the correct option -> grades and reveals feedback.
    fireEvent.keyDown(window, { key: String(correctIdx + 1) })
    expect(screen.getByText('続ける')).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('← steps back, → / Enter advance from feedback', () => {
    setup()
    // Answer Q1 (click the correct meaning) -> feedback, then → advances to Q2.
    fireEvent.click(screen.getByText(items[0].hangul.meaning!))
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2/3')).toBeInTheDocument()
    // ← returns to Q1 (read-only feedback for the answered item).
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1/3')).toBeInTheDocument()
    // Enter advances again from feedback.
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('Esc opens the exit confirmation after progress', () => {
    setup()
    // No progress yet on Q1 -> Esc would exit straight away; make progress first.
    fireEvent.click(screen.getByText(items[0].hangul.meaning!))
    fireEvent.keyDown(window, { key: 'Enter' }) // -> Q2
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByText('やめると今回のレッスンの進捗は消えます。')).toBeInTheDocument()
  })
})
