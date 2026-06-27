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

function setup(count = 3) {
  const onComplete = vi.fn<(r: LessonResult[]) => void>()
  const onExit = vi.fn()
  const lessonItems: LessonItem[] =
    count === 3 ? items : deck.items.slice(0, count).map((hangul) => ({ hangul, mode: 'quiz' }))
  render(
    <Lesson
      items={lessonItems}
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

    // Skip all three questions one at a time.
    fireEvent.click(screen.getByLabelText('1問先へスキップ'))
    expect(screen.getByText('2/3')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('1問先へスキップ'))
    fireEvent.click(screen.getByLabelText('1問先へスキップ'))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const results = onComplete.mock.calls[0][0]
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.skipped === true && r.correct === false)).toBe(true)
  })

  it('skip 5 jumps five steps ahead, recording only the current one skipped', () => {
    setup(20)
    expect(screen.getByText('1/20')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('5問先へスキップ'))
    // Landed on step 6; the four leapt-over steps stay reachable, not graded.
    expect(screen.getByText('6/20')).toBeInTheDocument()
  })

  it('skipping past the end finishes the lesson', () => {
    const { onComplete } = setup(20)
    // From step 1, jumping 10 then 10 again lands past the 20th step.
    fireEvent.click(screen.getByLabelText('10問先へスキップ'))
    expect(screen.getByText('11/20')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('10問先へスキップ'))

    expect(onComplete).toHaveBeenCalledTimes(1)
    // Only the two steps we sat on (1 and 11) were recorded skipped; the rest
    // were leapt over and left untouched.
    const results = onComplete.mock.calls[0][0]
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.skipped === true)).toBe(true)
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

    // Read-only: options are disabled.
    expect(screen.getByText(meaning).closest('button')).toBeDisabled()
  })

  it('skipping forward from a reviewed step navigates without regrading it', () => {
    const { onComplete } = setup(20)
    // Answer Q1, continue, then go back to review it (read-only feedback).
    const meaning = items[0].hangul.meaning!
    fireEvent.click(screen.getByText(meaning))
    fireEvent.click(screen.getByText('続ける'))
    fireEvent.click(screen.getByLabelText('前の問題へ戻る'))
    expect(screen.getByText('1/20')).toBeInTheDocument()

    // Skip forward 5 from the answered step: pure navigation, no skip mark added.
    fireEvent.click(screen.getByLabelText('5問先へスキップ'))
    expect(screen.getByText('6/20')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('disables the back button on the first item', () => {
    setup()
    expect(screen.getByLabelText('前の問題へ戻る')).toBeDisabled()
  })
})
