// TOPIK exam history. Surfaces the results already saved on every submit:
// the estimated 級 over time (trend) plus a per-attempt breakdown. Read from
// localStorage; a clear button wipes it.

import { useState } from 'react'
import { TOPIK_LEVEL_LABEL, TOPIK_PART_KO } from '../data/topik/types'
import { clearResults, loadResults, PART_ORDER, type TopikResult } from '../lib/topik'

interface Props {
  onClose: () => void
}

function gradeLabel(grade: number): string {
  return grade === 0 ? '不合格' : `${grade}級`
}

function totals(r: TopikResult): { correct: number; total: number; pct: number } {
  let correct = 0
  let total = 0
  for (const p of PART_ORDER) {
    correct += r.partScores[p].correct
    total += r.partScores[p].total
  }
  return { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 }
}

export function TopikHistory({ onClose }: Props) {
  // Stored oldest-first; keep that order for the trend, reverse for the list.
  const [results, setResults] = useState<TopikResult[]>(() => loadResults())
  const [confirmClear, setConfirmClear] = useState(false)

  const newestFirst = [...results].reverse()

  return (
    <main className="screen" tabIndex={-1}>
      <div className="lesson-top">
        <button className="link" onClick={onClose} aria-label="戻る">
          ✕
        </button>
        <span className="counter">受験履歴</span>
      </div>

      {results.length === 0 ? (
        <p className="prompt-label">まだ受験記録がありません。模擬試験を受けると、ここに残ります。</p>
      ) : (
        <>
          {results.length >= 2 && (
            <div className="topik-trend" aria-label="級の推移">
              <span className="topik-trend-label">級の推移</span>
              <div className="topik-trend-chips">
                {results.map((r, i) => (
                  <span className="topik-trend-chip" key={i}>
                    {gradeLabel(r.grade)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="topik-history-list">
            {newestFirst.map((r, i) => {
              const t = totals(r)
              return (
                <section className="card topik-history-item" key={i}>
                  <div className="topik-history-head">
                    <span className="topik-history-grade">{gradeLabel(r.grade)} 相当</span>
                    <span className="topik-history-meta">
                      {TOPIK_LEVEL_LABEL[r.level]} · {r.takenAt}
                    </span>
                  </div>
                  <div className="topik-history-score">
                    {t.correct} / {t.total}（{t.pct}%）
                  </div>
                  <div className="topik-history-parts">
                    {PART_ORDER.filter((p) => r.partScores[p].total > 0).map((p) => (
                      <span className="topik-history-part" key={p}>
                        {TOPIK_PART_KO[p]} {r.partScores[p].correct}/{r.partScores[p].total}
                      </span>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          {confirmClear ? (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal">
                <p className="modal-title">履歴を削除しますか?</p>
                <p className="modal-body">受験記録がすべて消えます。元に戻せません。</p>
                <button className="btn-primary" onClick={() => setConfirmClear(false)} autoFocus>
                  やめる
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    clearResults()
                    setResults([])
                    setConfirmClear(false)
                  }}
                >
                  削除する
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-ghost" onClick={() => setConfirmClear(true)}>
              履歴を削除
            </button>
          )}
        </>
      )}
    </main>
  )
}
