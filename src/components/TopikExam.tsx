// TOPIK exam runner. One item at a time, no feedback until the report. Answers
// autosave to localStorage every pick so a refresh or app kill can resume.
// Shows the current section, warns on unanswered items before submit.

import { useState } from 'react'
import type { TopikLevel, ScoredItem } from '../data/topik/types'
import { TOPIK_LEVEL_LABEL, TOPIK_PART_KO, TOPIK_PART_LABEL } from '../data/topik/types'
import { saveProgress } from '../lib/topik'
import { TopikQuestionView } from './TopikQuestionView'
import { ProgressHeader } from './ProgressHeader'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  level: TopikLevel
  items: ScoredItem[]
  initialAnswers: (number | null)[]
  initialIdx: number
  voiceReady: boolean
  onComplete: (items: ScoredItem[], answers: (number | null)[]) => void
  onExit: () => void
}

export function TopikExam({
  level,
  items,
  initialAnswers,
  initialIdx,
  voiceReady,
  onComplete,
  onExit,
}: Props) {
  const [idx, setIdx] = useState(initialIdx)
  const [answers, setAnswers] = useState<(number | null)[]>(initialAnswers)
  const [confirmExit, setConfirmExit] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const item = items[idx]
  const isLast = idx === items.length - 1
  const unanswered = answers.filter((a) => a === null).length

  function persist(next: (number | null)[], nextIdx: number) {
    saveProgress({ level, items, answers: next, idx: nextIdx })
  }

  function pick(choice: number) {
    const next = answers.slice()
    next[idx] = choice
    setAnswers(next)
    persist(next, idx)
  }

  function go(nextIdx: number) {
    setIdx(nextIdx)
    persist(answers, nextIdx)
  }

  function submit() {
    if (unanswered > 0 && !confirmSubmit) {
      setConfirmSubmit(true)
      return
    }
    onComplete(items, answers)
  }

  return (
    <main className="screen lesson" tabIndex={-1}>
      <ProgressHeader index={idx} total={items.length} onExit={() => setConfirmExit(true)} />

      <p className="topik-part-tag">
        {TOPIK_PART_LABEL[item.part]} ({TOPIK_PART_KO[item.part]}) · {TOPIK_LEVEL_LABEL[level]}
      </p>

      <TopikQuestionView item={item} selected={answers[idx]} voiceReady={voiceReady} onPick={pick} />

      <div className="topik-nav">
        <button className="btn-ghost" onClick={() => go(idx - 1)} disabled={idx === 0}>
          前へ
        </button>
        {isLast ? (
          <button className="btn-primary" onClick={submit}>
            提出
          </button>
        ) : (
          <button className="btn-primary" onClick={() => go(idx + 1)}>
            次へ
          </button>
        )}
      </div>

      {confirmExit && (
        <ConfirmDialog
          title="やめますか?"
          body="進捗は保存されます。あとで続きから解けます。"
          primaryLabel="続ける"
          secondaryLabel="やめる"
          onPrimary={() => setConfirmExit(false)}
          onSecondary={onExit}
        />
      )}

      {confirmSubmit && (
        <ConfirmDialog
          title="提出しますか?"
          body={`未回答が ${unanswered} 問あります。未回答は不正解になります。`}
          primaryLabel="もう少し解く"
          secondaryLabel="提出"
          onPrimary={() => setConfirmSubmit(false)}
          onSecondary={() => onComplete(items, answers)}
        />
      )}
    </main>
  )
}
