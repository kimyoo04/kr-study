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

function koVoice(): SpeechSynthesisVoice | undefined {
  return voicesCache.find((v) => v.lang.toLowerCase().startsWith('ko'))
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
