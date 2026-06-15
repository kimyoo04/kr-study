// TOPIK mode entry. Lists levels (only those with content are playable; the
// rest show 「準備中」). Offers resume when an in-progress exam exists.

import type { TopikLevel } from '../data/topik/types'
import { TOPIK_LEVEL_LABEL } from '../data/topik/types'
import { TOPIK_LEVELS, TOPIK_POOL } from '../data/topik'
import { hasContent, loadProgress } from '../lib/topik'

interface Props {
  voiceReady: boolean
  onStart: (level: TopikLevel) => void
  onResume: () => void
  onExit: () => void
}

export function TopikHome({ voiceReady, onStart, onResume, onExit }: Props) {
  const inProgress = loadProgress()

  return (
    <main className="screen" tabIndex={-1}>
      <div className="lesson-top">
        <button className="link" onClick={onExit} aria-label="戻る">
          ✕
        </button>
        <span className="counter">TOPIK 模擬試験</span>
      </div>

      <p className="prompt-label">レベルを選んでください</p>

      {!voiceReady && (
        <p className="banner" role="status">
          この端末は韓国語音声がないため、聞き取りはスクリプト(テキスト)で進みます。
        </p>
      )}

      <div className="topik-levels">
        {TOPIK_LEVELS.map((level) => {
          const ready = hasContent(level, TOPIK_POOL)
          const resumable = ready && inProgress?.level === level
          return (
            <div className="card topik-level" key={level}>
              <div className="topik-level-head">
                <span className="topik-level-name">{TOPIK_LEVEL_LABEL[level]}</span>
                {!ready && <span className="topik-level-soon">準備中</span>}
              </div>
              {ready ? (
                resumable ? (
                  <div className="topik-level-actions">
                    <button className="btn-primary" onClick={onResume}>
                      続きから ({inProgress.idx + 1}/{inProgress.items.length})
                    </button>
                    <button className="btn-ghost" onClick={() => onStart(level)}>
                      最初から
                    </button>
                  </div>
                ) : (
                  <button className="btn-primary" onClick={() => onStart(level)}>
                    ミニ模擬試験を始める
                  </button>
                )
              ) : (
                <button className="btn-ghost" disabled>
                  もうすぐ追加されます
                </button>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
