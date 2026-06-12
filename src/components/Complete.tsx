import { useEffect } from 'react'
import type { Hangul } from '../data/hangul'
import { playComplete } from '../lib/sound'
import type { LessonResult } from './Lesson'

interface Props {
  results: LessonResult[]
  wrong: Hangul[]
  onReview: () => void
  onAgain: () => void
  onHome: () => void
}

export function Complete({ results, wrong, onReview, onAgain, onHome }: Props) {
  useEffect(() => {
    playComplete()
  }, [])

  const graded = results.filter((r) => r.mode === 'quiz')
  const correct = graded.filter((r) => r.correct).length
  const total = graded.length
  const allRight = total > 0 && correct === total

  // Unique items touched this lesson, in order.
  const studied: Hangul[] = []
  const seen = new Set<string>()
  for (const r of results) {
    if (!seen.has(r.hangul.hangul)) {
      seen.add(r.hangul.hangul)
      studied.push(r.hangul)
    }
  }
  const wrongSet = new Set(wrong.map((k) => k.hangul))

  return (
    <main className="screen complete">
      <div className="celebrate">{allRight ? '🎉' : '✨'}</div>
      <h2>レッスン完了!</h2>
      {total > 0 ? (
        <p className="score">
          正解 {correct} / {total}
        </p>
      ) : (
        <p className="score">新しい文字を学びました</p>
      )}

      <div className="chips" aria-label="今回学んだ項目">
        {studied.map((k) => (
          <span key={k.hangul} className={wrongSet.has(k.hangul) ? 'chip miss' : 'chip'}>
            {k.hangul}
          </span>
        ))}
      </div>

      <div className="complete-actions">
        {wrong.length > 0 && (
          <button className="btn-primary" onClick={onReview}>
            間違いだけ復習 ({wrong.length})
          </button>
        )}
        <button className={wrong.length > 0 ? 'btn-ghost' : 'btn-primary'} onClick={onAgain}>
          もう一回
        </button>
        <button className="btn-ghost" onClick={onHome}>
          ホームへ
        </button>
      </div>
    </main>
  )
}
