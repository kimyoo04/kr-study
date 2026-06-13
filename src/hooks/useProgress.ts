// Persistence only — domain logic lives in lib/srs.ts. Storage failures degrade
// to in-memory state; `persistent` drives the Home-screen warning banner.
import { useCallback, useState } from 'react'
import { DECKS } from '../data/hangul'
import { cardKey, emptyProgress, PROGRESS_VERSION, type Progress } from '../lib/srs'
import { loadJson, saveJson, storageAvailable } from '../lib/storage'

const KEY = 'kr-study:progress:v1'

// A corrupt-but-parseable record (items: null / an array) must not pass —
// typeof null === 'object' would crash the first Home render later.
function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * v1 keyed cards by raw hangul text, which made decks share one card whenever
 * texts collided (the syllable 이 vs the word 이 "二"). Copy each old card into
 * every deck that teaches that text — over-crediting a few colliding items once
 * beats wiping the user's progress.
 */
export function migrateV1(old: Progress): Progress {
  const items: Progress['items'] = {}
  for (const d of DECKS) {
    for (const k of d.items) {
      const card = old.items[k.hangul]
      if (card) items[cardKey(d.id, k.hangul)] = card
    }
  }
  return { ...old, version: PROGRESS_VERSION, items }
}

export function loadProgress(): { progress: Progress; persistent: boolean } {
  const persistent = storageAvailable()
  const parsed = loadJson<Progress>(KEY)
  if (parsed != null && isRecord(parsed.items) && typeof parsed.lessonsDone === 'number') {
    if (parsed.version === PROGRESS_VERSION) return { progress: parsed, persistent }
    if (parsed.version === 1) {
      const migrated = migrateV1(parsed)
      saveJson(KEY, migrated)
      return { progress: migrated, persistent }
    }
  }
  return { progress: emptyProgress(), persistent }
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
