// Answer-review screen for a finished TOPIK exam. Lists each item with the
// correct answer (✓), the user's pick (✗ when wrong), and a Japanese
// explanation. A filter narrows to mistakes only. Read-only — choices are
// rendered through ChoiceGrid in feedback mode.

import { useState } from 'react'
import type { ScoredItem } from '../data/topik/types'
import { TOPIK_PART_KO, TOPIK_PART_LABEL } from '../data/topik/types'
import { ChoiceGrid } from './ChoiceGrid'

interface Props {
  items: ScoredItem[]
  answers: (number | null)[]
  onClose: () => void
}

export function TopikReview({ items, answers, onClose }: Props) {
  const [onlyWrong, setOnlyWrong] = useState(false)

  const rows = items.map((it, i) => ({ it, picked: answers[i] ?? null, i }))
  const wrongCount = rows.filter((r) => r.picked !== r.it.answer).length
  const shown = onlyWrong ? rows.filter((r) => r.picked !== r.it.answer) : rows

  return (
    <main className="screen" tabIndex={-1}>
      <div className="lesson-top">
        <button className="link" onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        <span className="counter">答え合わせ</span>
      </div>

      <div className="topik-review-filter" role="group" aria-label="表示の絞り込み">
        <button
          className={onlyWrong ? 'btn-ghost' : 'btn-ghost active'}
          aria-pressed={!onlyWrong}
          onClick={() => setOnlyWrong(false)}
        >
          すべて ({rows.length})
        </button>
        <button
          className={onlyWrong ? 'btn-ghost active' : 'btn-ghost'}
          aria-pressed={onlyWrong}
          onClick={() => setOnlyWrong(true)}
        >
          間違いだけ ({wrongCount})
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="prompt-label">全問正解です。間違いはありません。</p>
      ) : (
        <div className="topik-review-list">
          {shown.map(({ it, picked, i }) => {
            const ok = picked === it.answer
            const status = picked === null ? '未回答' : ok ? '正解' : '不正解'
            const choices = it.choices.map((text, j) => ({ key: String(j), text, lang: 'ko' }))
            return (
              <section className="card topik-review-item" key={it.id}>
                <p className="topik-part-tag">
                  {i + 1}. {TOPIK_PART_LABEL[it.part]} ({TOPIK_PART_KO[it.part]}) ·{' '}
                  <span className={ok ? 'topik-rev-ok' : 'topik-rev-ng'}>{status}</span>
                </p>
                {it.script && (
                  <p className="topik-passage" lang="ko">
                    {it.script}
                  </p>
                )}
                {it.passage && (
                  <p className="topik-passage" lang="ko">
                    {it.passage}
                  </p>
                )}
                <p className="topik-prompt" lang="ko">
                  {it.prompt}
                </p>
                <ChoiceGrid
                  options={choices}
                  mode="feedback"
                  selectedKey={picked === null ? null : String(picked)}
                  correctKey={String(it.answer)}
                  onPick={() => {}}
                />
                {it.explain && <p className="topik-explain">💡 {it.explain}</p>}
              </section>
            )
          })}
        </div>
      )}

      <button className="btn-primary" onClick={onClose}>
        結果に戻る
      </button>
    </main>
  )
}
