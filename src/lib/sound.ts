// Sound effects via Web Audio (synthesized blips) — no mp3 files needed for the
// scaffold, and instant (<100ms) since there's nothing to fetch. Gated behind the
// first user gesture by lazily creating the AudioContext.
let ctx: AudioContext | null = null
let enabled = true

/** Toggle all sound effects on/off (TTS pronunciation is unaffected). */
export function setSfxEnabled(on: boolean): void {
  enabled = on
}

function audio(): AudioContext | null {
  if (!enabled) return null
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(freq: number, when: number, dur: number, type: OscillatorType = 'sine') {
  const a = audio()
  if (!a) return
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, a.currentTime + when)
  gain.gain.exponentialRampToValueAtTime(0.25, a.currentTime + when + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + when + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(a.currentTime + when)
  osc.stop(a.currentTime + when + dur + 0.02)
}

export function playCorrect(): void {
  blip(660, 0, 0.12)
  blip(990, 0.09, 0.14)
}

export function playWrong(): void {
  blip(200, 0, 0.18, 'square')
}

export function playComplete(): void {
  blip(523, 0, 0.12)
  blip(659, 0.1, 0.12)
  blip(784, 0.2, 0.18)
}
