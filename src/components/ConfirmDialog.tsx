// Shared confirmation modal. The primary (autofocused) button is the safe /
// stay-put action; the ghost button is the one that proceeds with the
// consequence (leave, submit). `onEscape` is optional so callers that want
// Escape-to-dismiss can opt in without changing the others.
import type { ReactNode } from 'react'

interface Props {
  title: string
  body: ReactNode
  /** Safe action label (autofocused), e.g. "戻る" / "続ける". */
  primaryLabel: string
  /** Proceed action label (ghost), e.g. "やめる" / "提出". */
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onEscape?: () => void
}

export function ConfirmDialog({
  title,
  body,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onEscape,
}: Props) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onKeyDown={onEscape ? (e) => e.key === 'Escape' && onEscape() : undefined}
    >
      <div className="modal">
        <p className="modal-title">{title}</p>
        <p className="modal-body">{body}</p>
        <button className="btn-primary" onClick={onPrimary} autoFocus>
          {primaryLabel}
        </button>
        <button className="btn-ghost" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      </div>
    </div>
  )
}
