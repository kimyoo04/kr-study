// localStorage wrapper shared by the persistence hooks. Safari private mode /
// quota errors must degrade to in-memory state instead of crashing, so every
// access is wrapped; callers learn about failures from the return value only.

/** Parsed JSON for `key`, or null if missing/corrupt/unavailable. */
export function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/**
 * Probe that storage actually accepts writes. Safari private mode lets reads
 * succeed but throws on setItem, so reading alone can't detect it.
 */
export function storageAvailable(): boolean {
  try {
    const probe = 'kr-study:probe'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/** Persist `value` as JSON. Returns false when storage is unavailable. */
export function saveJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
