// User settings (sound on/off). Persisted to localStorage with a safe fallback,
// same pattern as useProgress.
import { useCallback, useEffect, useState } from 'react'
import { setSfxEnabled } from '../lib/sound'
import { loadJson, saveJson } from '../lib/storage'

export interface Settings {
  sfx: boolean
  listen: boolean // audio-prompted quizzes (hear -> pick); off by default
}

const KEY = 'kr-study:settings:v1'
const DEFAULTS: Settings = { sfx: true, listen: false }

function load(): Settings {
  const parsed = loadJson<Partial<Settings>>(KEY)
  return {
    sfx: typeof parsed?.sfx === 'boolean' ? parsed.sfx : DEFAULTS.sfx,
    listen: typeof parsed?.listen === 'boolean' ? parsed.listen : DEFAULTS.listen,
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)

  // Keep the sound module in sync with the setting.
  useEffect(() => {
    setSfxEnabled(settings.sfx)
  }, [settings.sfx])

  const toggle = useCallback((key: keyof Settings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveJson(KEY, next) // best-effort; the setting just won't persist on failure
      return next
    })
  }, [])

  const toggleSfx = useCallback(() => toggle('sfx'), [toggle])
  const toggleListen = useCallback(() => toggle('listen'), [toggle])

  return { settings, toggleSfx, toggleListen }
}
