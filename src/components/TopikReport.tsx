// TOPIK diagnostic report. Leads with the estimated 級 (scaled to the real /200
// band) and where to focus next (or an honest "inconclusive" when the two
// sections are within a question of each other), then a per-section breakdown.
// Weakness is shown by text + number, never color alone.

import type { TopikLevel } from '../data/topik/types'
import { TOPIK_LEVEL_LABEL, TOPIK_PART_KO, TOPIK_PART_LABEL } from '../data/topik/types'
import { PART_ORDER, type ExamResult } from '../lib/topik'

interface Props {
  level: TopikLevel
  result: ExamResult
  onReview: () => void
  onRetake: () => void
  onHome: () => void
}

export function TopikReport({ level, result, onReview, onRetake, onHome }: Props) {
  const { partScores, total, grade, weakestPart, inconclusive } = result
  const pct = total.total > 0 ? Math.round((total.correct / total.total) * 100) : 0

  return (
    <main className="screen complete" tabIndex={-1}>
      <p className="prompt-label">{TOPIK_LEVEL_LABEL[level]} 判定結果</p>
      <div className="score">
        {total.correct} / {total.total} <span className="topik-score-pct">({pct}%)</span>
      </div>

      <div className="card topik-hero">
        <p className="topik-hero-grade">
          {grade === 0 ? '級なし (不合格ライン)' : `${grade}級 相当`}
        </p>
        {inconclusive ? (
          <p className="topik-hero-sub">
            セクション間の得点が近く、弱点はまだ絞れていません。もう少し解くと、どちらが弱いか
            はっきりします。
          </p>
        ) : (
          <p className="topik-hero-sub">
            次に強化するなら {TOPIK_PART_LABEL[weakestPart!]} ({TOPIK_PART_KO[weakestPart!]})
            。正答率が一番低いセクションです。
          </p>
        )}
      </div>

      <div className="topik-bars">
        {PART_ORDER.filter((p) => partScores[p].total > 0).map((p) => {
          const s = partScores[p]
          const partPct = Math.round((s.correct / s.total) * 100)
          const weak = !inconclusive && p === weakestPart
          return (
            <div className="topik-bar-row" key={p}>
              <span className="topik-bar-label">
                {TOPIK_PART_LABEL[p]} ({TOPIK_PART_KO[p]})
                {weak && <span className="topik-bar-weak"> · 弱点</span>}
              </span>
              <div className="progress-bar slim">
                <div
                  className={`progress-fill${weak ? ' weak' : ''}`}
                  style={{ width: `${partPct}%` }}
                />
              </div>
              <span className="topik-bar-val">
                {s.correct}/{s.total}
              </span>
            </div>
          )
        })}
      </div>

      <div className="complete-actions">
        <button className="btn-primary" onClick={onReview}>
          答えを見直す
        </button>
        <button className="btn-ghost" onClick={onRetake}>
          もう一度
        </button>
        <button className="btn-ghost" onClick={onHome}>
          ホームへ
        </button>
      </div>
    </main>
  )
}
