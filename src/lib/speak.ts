// Web Speech API helper. The most device-flaky part of the app, so it's treated
// as an enhancement: detect ko voice, prime on first gesture, fail silently.
let voicesCache: SpeechSynthesisVoice[] = []
let primed = false

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null
}

/** Load voices once. Chrome returns [] until the voiceschanged event fires. */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const s = synth()
  if (!s) return Promise.resolve([])
  const now = s.getVoices()
  if (now.length) {
    voicesCache = now
    return Promise.resolve(now)
  }
  return new Promise((resolve) => {
    const done = () => {
      voicesCache = s.getVoices()
      resolve(voicesCache)
    }
    s.addEventListener('voiceschanged', done, { once: true })
    // Safety timeout: some browsers never fire the event.
    setTimeout(done, 1000)
  })
}

export function hasKoVoice(): boolean {
  return voicesCache.some((v) => v.lang.toLowerCase().startsWith('ko'))
}

/** A Japanese voice (learner's native language) — needed to read meanings aloud. */
export function hasJaVoice(): boolean {
  return voicesCache.some((v) => v.lang.toLowerCase().startsWith('ja'))
}

function koVoice(): SpeechSynthesisVoice | undefined {
  return voicesCache.find((v) => v.lang.toLowerCase().startsWith('ko'))
}

function jaVoice(): SpeechSynthesisVoice | undefined {
  return voicesCache.find((v) => v.lang.toLowerCase().startsWith('ja'))
}

/** Call once from the first user tap to satisfy mobile autoplay gating. */
export function primeSpeech(): void {
  const s = synth()
  if (!s || primed) return
  primed = true
  try {
    const u = new SpeechSynthesisUtterance('')
    u.volume = 0
    s.speak(u)
  } catch {
    /* ignore */
  }
}

/** Speak a study item — every deck stores speakable Korean in `hangul`. */
export function speakItem(item: { hangul: string }): void {
  speak(item.hangul)
}

// Held at module scope: Chrome historically GC'd in-flight utterances created
// as locals, cutting longer sentences off mid-speech.
let current: SpeechSynthesisUtterance | null = null

export function speak(text: string): void {
  const s = synth()
  if (!s) return
  try {
    const wasSpeaking = s.speaking
    s.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    const v = koVoice()
    if (v) u.voice = v
    u.rate = 0.9
    current = u
    const go = () => {
      // A newer speak() call may have superseded this one during the delay.
      if (current === u) s.speak(u)
    }
    // iOS Safari drops an utterance queued in the same tick as cancel().
    if (wasSpeaking) setTimeout(go, 60)
    else go()
  } catch {
    /* ignore — pronunciation is best-effort */
  }
}

/** Stop any ongoing speech (including a running sequence). */
export function stopSpeech(): void {
  const s = synth()
  if (s) s.cancel()
}

export interface SpeechPart {
  text: string
  lang: 'ko-KR' | 'ja-JP'
}

/**
 * Speak parts back-to-back, chaining on each utterance's `onend` so timing
 * adapts to device speed (fixed timers drift). Used by the passive listen
 * player to read Korean then the Japanese reading/meaning per card.
 * Returns a cancel function; call it to abort mid-sequence.
 */
export function speakSequence(
  parts: SpeechPart[],
  opts: { rate?: number; onPart?: (i: number) => void; onDone?: () => void } = {},
): () => void {
  const s = synth()
  if (!s || parts.length === 0) {
    opts.onDone?.()
    return () => {}
  }
  let cancelled = false
  let i = 0
  const next = () => {
    if (cancelled) return
    if (i >= parts.length) {
      opts.onDone?.()
      return
    }
    const part = parts[i]
    const u = new SpeechSynthesisUtterance(part.text)
    u.lang = part.lang
    const v = part.lang === 'ja-JP' ? jaVoice() : koVoice()
    if (v) u.voice = v
    u.rate = opts.rate ?? 0.9
    u.onend = () => {
      i++
      next()
    }
    // Treat an utterance error like a finished one so the sequence never stalls.
    u.onerror = () => {
      i++
      next()
    }
    opts.onPart?.(i)
    s.speak(u)
  }
  try {
    s.cancel()
    next()
  } catch {
    opts.onDone?.()
  }
  return () => {
    cancelled = true
    try {
      s.cancel()
    } catch {
      /* ignore */
    }
  }
}
