import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ScoredItem } from '../data/topik/types'
import { TopikExam } from './TopikExam'

const ITEMS: ScoredItem[] = [
  { id: 'a', part: 'listening', prompt: 'Q-one', choices: ['ア', 'イ', 'ウ', 'エ'], answer: 0, script: '가: 안녕' },
  { id: 'b', part: 'reading', prompt: 'Q-two', choices: ['ア', 'イ', 'ウ', 'エ'], answer: 1 },
]

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function setup(overrides: Partial<Parameters<typeof TopikExam>[0]> = {}) {
  const onComplete = vi.fn()
  const onExit = vi.fn()
  render(
    <TopikExam
      level="TOPIK1"
      items={ITEMS}
      initialAnswers={[null, null]}
      initialIdx={0}
      voiceReady={true}
      onComplete={onComplete}
      onExit={onExit}
      {...overrides}
    />,
  )
  return { onComplete, onExit }
}

describe('TopikExam flow', () => {
  it('shows the section tag and current prompt', () => {
    setup()
    expect(screen.getByText(/聞き取り/)).toBeInTheDocument()
    expect(screen.getByText('Q-one')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('advances to the next item and persists progress', () => {
    setup()
    // First (listening) item: 🔊 button then choices. Pick a choice, go next.
    fireEvent.click(screen.getAllByText('ア')[0])
    fireEvent.click(screen.getByText('次へ'))
    expect(screen.getByText('Q-two')).toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(localStorage.getItem('kr-study:topik-inprogress')).toBeTruthy()
  })

  it('warns before submitting with unanswered items, then completes', () => {
    const { onComplete } = setup()
    fireEvent.click(screen.getByText('次へ')) // skip item 1
    fireEvent.click(screen.getByText('提出'))
    expect(screen.getByText(/未回答/)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('提出', { selector: '.btn-ghost' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('exit asks for confirmation and keeps progress on leave', () => {
    const { onExit } = setup()
    fireEvent.click(screen.getByLabelText('閉じる'))
    expect(screen.getByText('やめますか?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('やめる'))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
