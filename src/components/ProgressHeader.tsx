// Shared top bar for the one-item-at-a-time screens (SRS lesson, TOPIK exam):
// a close (✕) button, an optional back (←) button, a slim progress bar, and a
// "current/total" counter. `index` is 0-based; the bar fills by completed steps.

interface Props {
  index: number
  total: number
  onExit: () => void
  /** When provided, render a back (←) button, disabled on the first item. */
  onBack?: () => void
}

export function ProgressHeader({ index, total, onExit, onBack }: Props) {
  const pct = Math.round((index / total) * 100)
  return (
    <div className="lesson-top">
      <button className="link" onClick={onExit} aria-label="閉じる">
        ✕
      </button>
      {onBack && (
        <button className="link" onClick={onBack} disabled={index === 0} aria-label="前の問題へ戻る">
          ←
        </button>
      )}
      <div className="progress-bar slim">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="counter">
        {index + 1}/{total}
      </span>
    </div>
  )
}
