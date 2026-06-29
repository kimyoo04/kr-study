// Tiny per-button keyboard-shortcut badge. Hidden on touch devices (no physical
// keyboard) via CSS and aria-hidden; shown inline on desktop so each action's
// key is discoverable right on the button it triggers.
export function KeyHint({ k }: { k: string }) {
  return (
    <kbd className="key-hint" aria-hidden="true">
      {k}
    </kbd>
  )
}
