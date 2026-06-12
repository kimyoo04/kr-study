// Persistence only — domain logic lives in lib/srs.ts. Storage failures degrade
// to in-memory state; `persistent` drives the Home-screen warning banner.
import { useCallback, useState } from 'react'
import { emptyProgress, PROGRESS_VERSION, type Progress } from '../lib/srs'
import { loadJson, saveJson, storageAvailable } from '../lib/storage'

const KEY = 'kr-study:progress:v1'

export function loadProgress(): { progress: Progress; persistent: boolean } {
  const parsed = loadJson<Progress>(KEY)
  const valid =
    parsed != null && parsed.version === PROGRESS_VERSION && typeof parsed.items === 'object'
  return { progress: valid ? parsed : emptyProgress(), persistent: storageAvailable() }
}

export function useProgress() {
  const [{ progress, persistent }, setState] = useState(loadProgress)

  const update = useCallback((next: Progress) => {
    const ok = saveJson(KEY, next)
    setState((prev) => ({ progress: next, persistent: prev.persistent && ok }))
  }, [])

  const reset = useCallback(() => {
    const fresh = emptyProgress()
    saveJson(KEY, fresh)
    setState({ progress: fresh, persistent: true })
  }, [])

  return { progress, persistent, update, reset }
}
