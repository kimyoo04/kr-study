import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ScoredItem } from '../data/topik/types'
import { TopikReview } from './TopikReview'

const ITEMS: ScoredItem[] = [
  {
    id: 'a',
    part: 'reading',
    prompt: 'Q-correct',
    choices: ['正', '誤1', '誤2', '誤3'],
    answer: 0,
    explain: '解説A',
  },
  {
    id: 'b',
    part: 'listening',
    prompt: 'Q-wrong',
    choices: ['正', '誤1', '誤2', '誤3'],
    answer: 0,
    script: '가: 안녕',
    explain: '解説B',
  },
  {
    id: 'c',
    part: 'reading',
    prompt: 'Q-blank',
    choices: ['正', '誤1', '誤2', '誤3'],
    answer: 0,
    explain: '解説C',
  },
]
// answers: a correct, b wrong (picked 1), c unanswered
const ANSWERS = [0, 1, null]

afterEach(cleanup)

function setup() {
  const onClose = vi.fn()
  render(<TopikReview items={ITEMS} answers={ANSWERS} onClose={onClose} />)
  return { onClose }
}

describe('TopikReview', () => {
  it('shows 正解/不正解/未回答 status per item with explanations', () => {
    setup()
    expect(screen.getByText('正解')).toBeInTheDocument()
    expect(screen.getByText('不正解')).toBeInTheDocument()
    expect(screen.getByText('未回答')).toBeInTheDocument()
    expect(screen.getByText('💡 解説A')).toBeInTheDocument()
    expect(screen.getByText('💡 解説B')).toBeInTheDocument()
  })

  it('marks the correct answer ✓ and a wrong pick ✗', () => {
    setup()
    // The wrong item shows both a ✓ (on the correct option) and a ✗ (on the pick).
    expect(screen.getAllByText('✓').length).toBeGreaterThanOrEqual(3) // one per item
    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('filters to mistakes only (wrong + unanswered count as not-correct)', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /間違いだけ/ }))
    // Correct item hidden; wrong + unanswered remain.
    expect(screen.queryByText('Q-correct')).not.toBeInTheDocument()
    expect(screen.getByText('Q-wrong')).toBeInTheDocument()
    expect(screen.getByText('Q-blank')).toBeInTheDocument()
  })

  it('closes back to the report', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByRole('button', { name: '結果に戻る' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
