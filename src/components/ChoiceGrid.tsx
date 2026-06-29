// Shared 4-choice option grid. Used by the TOPIK exam (answer-only, no grading
// until the report). Presentational and string-keyed so callers stay decoupled
// from their own item types. Mirrors the markup the SRS Lesson already uses
// (.options / .opt / .opt-text / .opt-mark) so styling is shared.
import { KeyHint } from './KeyHint'

export interface Choice {
  key: string // stable identity (stringified index)
  text: string // what the button shows
  lang?: string // optional lang attr (e.g. "ko" for Korean glyphs)
}

interface Props {
  options: Choice[]
  /** 'answer': selectable, no grading. 'feedback': graded, disabled. */
  mode: 'answer' | 'feedback'
  selectedKey?: string | null
  /** Required in feedback mode: which option is correct. */
  correctKey?: string
  onPick: (key: string) => void
  /**
   * Expose answer-phase selection as aria-pressed — fits select-then-submit
   * flows (TOPIK exam). Off for grade-on-click flows (SRS lesson), where a tap
   * commits the answer immediately and "pressed" state would mislead. Default on.
   */
  pressable?: boolean
  /**
   * Show a 1-based number badge on each option (desktop-only) for callers that
   * bind digit keys to the choices, e.g. the SRS lesson. Off by default.
   */
  keyHints?: boolean
}

export function ChoiceGrid({
  options,
  mode,
  selectedKey,
  correctKey,
  onPick,
  pressable = true,
  keyHints = false,
}: Props) {
  const feedback = mode === 'feedback'
  return (
    <div className="options">
      {options.map((opt, i) => {
        const isSelected = selectedKey === opt.key
        const isAnswer = correctKey === opt.key
        const cls = feedback
          ? isAnswer
            ? 'opt correct'
            : isSelected
              ? 'opt wrong'
              : 'opt dim'
          : isSelected
            ? 'opt selected'
            : 'opt'
        const mark = feedback && isAnswer ? '✓' : feedback && isSelected ? '✗' : null
        return (
          <button
            key={opt.key}
            className={cls}
            data-correct={correctKey !== undefined && isAnswer ? true : undefined}
            aria-pressed={pressable && !feedback ? isSelected : undefined}
            disabled={feedback}
            onClick={() => onPick(opt.key)}
          >
            {keyHints && !feedback && <KeyHint k={String(i + 1)} />}
            <span className="opt-text" lang={opt.lang}>
              {opt.text}
            </span>
            {mark && (
              <span className="opt-mark" aria-hidden="true">
                {mark}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
