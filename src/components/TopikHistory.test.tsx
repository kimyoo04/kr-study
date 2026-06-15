import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { appendResult, loadResults } from '../lib/topik'
import { TopikHistory } from './TopikHistory'

function seedTwo() {
  appendResult({
    level: 'TOPIK1',
    takenAt: '2026-06-10',
    partScores: { listening: { correct: 4, total: 10 }, reading: { correct: 6, total: 14 } },
    grade: 1,
    weakestPart: 'listening',
  })
  appendResult({
    level: 'TOPIK1',
    takenAt: '2026-06-15',
    partScores: { listening: { correct: 9, total: 10 }, reading: { correct: 12, total: 14 } },
    grade: 2,
    weakestPart: 'reading',
  })
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('TopikHistory', () => {
  it('shows the empty state when there are no results', () => {
    render(<TopikHistory onClose={vi.fn()} />)
    expect(screen.getByText(/まだ受験記録がありません/)).toBeInTheDocument()
  })

  it('lists attempts newest-first with grade, total, and section scores', () => {
    seedTwo()
    render(<TopikHistory onClose={vi.fn()} />)
    // Two attempts → two grade headers (2級 newest, 1級 older).
    expect(screen.getByText('2級 相当')).toBeInTheDocument()
    expect(screen.getByText('1級 相当')).toBeInTheDocument()
    // Newest total 21/24.
    expect(screen.getByText(/21 \/ 24/)).toBeInTheDocument()
    // The newest attempt (top of the list) is the 2級 one.
    const heads = screen.getAllByText(/相当/)
    expect(heads[0]).toHaveTextContent('2級')
  })

  it('renders the grade trend (oldest → newest) when there are 2+ results', () => {
    seedTwo()
    render(<TopikHistory onClose={vi.fn()} />)
    expect(screen.getByLabelText('級の推移')).toBeInTheDocument()
    const chips = screen.getByLabelText('級の推移').querySelectorAll('.topik-trend-chip')
    // Oldest-first: 1級 then 2級.
    expect(chips[0]).toHaveTextContent('1級')
    expect(chips[1]).toHaveTextContent('2級')
  })

  it('clears history after confirmation', () => {
    seedTwo()
    render(<TopikHistory onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '履歴を削除' }))
    fireEvent.click(screen.getByRole('button', { name: '削除する' }))
    expect(screen.getByText(/まだ受験記録がありません/)).toBeInTheDocument()
    expect(loadResults()).toHaveLength(0)
  })
})
