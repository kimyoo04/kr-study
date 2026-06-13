// Service-worker update channel. With registerType 'prompt' the new SW waits
// instead of reloading the page on its own — an auto-reload mid-lesson would
// silently discard the user's in-memory lesson progress. main.tsx feeds the
// update callback in; the App shows a Home-screen banner and applies it there.
type Listener = (ready: boolean) => void

let apply: ((reload?: boolean) => Promise<void>) | null = null
let pending = false
const listeners = new Set<Listener>()

/** Called by main.tsx when the SW reports a waiting update. */
export function swSetUpdate(fn: (reload?: boolean) => Promise<void>): void {
  apply = fn
  pending = true
  for (const l of listeners) l(true)
}

/** Subscribe to update availability; fires immediately with the current state. */
export function swOnUpdate(l: Listener): () => void {
  listeners.add(l)
  l(pending)
  return () => {
    listeners.delete(l)
  }
}

/** Activate the waiting SW and reload. No-op when no update is pending. */
export function swApplyUpdate(): void {
  void apply?.(true)
}
