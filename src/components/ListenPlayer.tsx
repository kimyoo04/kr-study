import { useEffect, useRef, useState } from 'react'
import type { Deck, DeckKind, Hangul } from '../data/hangul'
import { hangulToKata } from '../lib/kata'
import { primeSpeech, speakSequence, stopSpeech, type SpeechPart } from '../lib/speak'

interface Props {
  items: Hangul[]
  deck: Deck
  jaReady: boolean // a ja-JP voice exists → Japanese reading/meaning can be spoken
  onExit: () => void
}

// Pauses between repeats and between cards (ms). onend chaining handles speech
// timing; these are deliberate breathing room so you can shadow the audio.
const REPEAT_GAP = 500
const CARD_GAP = 700

const RATES = [0.8, 1.0, 1.2] as const

function glyphClassFor(kind: DeckKind): string {
  if (kind === 'sentence') return 'glyph sentence'
  if (kind === 'words') return 'glyph word'
  return 'glyph big'
}

// What gets read for one card: Korean first, then the Japanese side.
// Hangul (letter) decks have no meaning, so the Japanese side is the phonetic reading.
function partsFor(item: Hangul, kind: DeckKind, readJa: boolean): SpeechPart[] {
  const parts: SpeechPart[] = [{ text: item.hangul, lang: 'ko-KR' }]
  if (readJa) {
    if (kind === 'hangul') parts.push({ text: hangulToKata(item.hangul), lang: 'ja-JP' })
    else if (item.meaning) parts.push({ text: item.meaning, lang: 'ja-JP' })
  }
  return parts
}

export function ListenPlayer({ items, deck, jaReady, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [part, setPart] = useState<'ko' | 'ja' | null>(null)
  const [rate, setRate] = useState<number>(1.0)
  const [repeatEach, setRepeatEach] = useState(1)
  const [readJa, setReadJa] = useState(jaReady)
  const [loop, setLoop] = useState(false)

  // The playback loop runs imperatively (speech callbacks fire outside React),
  // so it reads live values from refs to avoid stale closures.
  const idxRef = useRef(0)
  const playingRef = useRef(false)
  const cancelRef = useRef<() => void>(() => {})
  const timerRef = useRef<number | null>(null)
  const cfg = useRef({ rate, repeatEach, readJa, loop })
  useEffect(() => {
    cfg.current = { rate, repeatEach, readJa, loop }
  }, [rate, repeatEach, readJa, loop])

  const step = items[index]

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function stopAll() {
    cancelRef.current()
    clearTimer()
    stopSpeech()
  }

  function playFrom(i: number, repeatsLeft: number) {
    idxRef.current = i
    setIndex(i)
    const parts = partsFor(items[i], deck.kind, cfg.current.readJa)
    cancelRef.current()
    cancelRef.current = speakSequence(parts, {
      rate: cfg.current.rate,
      onPart: (pi) => setPart(parts[pi].lang === 'ja-JP' ? 'ja' : 'ko'),
      onDone: () => {
        setPart(null)
        if (!playingRef.current) return
        if (repeatsLeft > 1) {
          timerRef.current = window.setTimeout(() => playFrom(i, repeatsLeft - 1), REPEAT_GAP)
          return
        }
        const nextIdx = i + 1
        if (nextIdx < items.length) {
          timerRef.current = window.setTimeout(
            () => playFrom(nextIdx, cfg.current.repeatEach),
            CARD_GAP,
          )
        } else if (cfg.current.loop) {
          timerRef.current = window.setTimeout(() => playFrom(0, cfg.current.repeatEach), CARD_GAP)
        } else {
          playingRef.current = false
          setPlaying(false)
        }
      },
    })
  }

  function play() {
    primeSpeech()
    playingRef.current = true
    setPlaying(true)
    playFrom(idxRef.current, cfg.current.repeatEach)
  }

  function pause() {
    playingRef.current = false
    setPlaying(false)
    stopAll()
    setPart(null)
  }

  function goTo(target: number) {
    const i = Math.max(0, Math.min(items.length - 1, target))
    stopAll()
    idxRef.current = i
    setIndex(i)
    if (playingRef.current) {
      playFrom(i, cfg.current.repeatEach)
    } else {
      // Paused nav: speak the card once for feedback, no auto-advance.
      const parts = partsFor(items[i], deck.kind, cfg.current.readJa)
      primeSpeech()
      cancelRef.current = speakSequence(parts, {
        rate: cfg.current.rate,
        onPart: (pi) => setPart(parts[pi].lang === 'ja-JP' ? 'ja' : 'ko'),
        onDone: () => setPart(null),
      })
    }
  }

  // Auto-play on entry (entry is a tap, so speech is unlocked) and keep the
  // screen awake while playing. Cleanup stops speech on unmount.
  useEffect(() => {
    play()
    let lock: WakeLockSentinel | null = null
    const requestLock = () => {
      navigator.wakeLock
        ?.request('screen')
        .then((l) => (lock = l))
        .catch(() => {})
    }
    requestLock()
    const onVisible = () => {
      if (document.visibilityState === 'visible') requestLock()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopAll()
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progressPct = Math.round(((index + 1) / items.length) * 100)
  const jaText = deck.kind === 'hangul' ? hangulToKata(step.hangul) : (step.meaning ?? '')

  return (
    <main className="screen listen-play">
      <div className="lesson-top">
        <button className="link" onClick={onExit} aria-label="閉じる">
          ✕
        </button>
        <div className="progress-bar slim">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="counter">
          {index + 1}/{items.length}
        </span>
      </div>

      <section className="card listen-card">
        {deck.kind === 'sentence' && step.note && <div className="pattern">{step.note}</div>}
        <div className={glyphClassFor(deck.kind) + (part === 'ko' ? ' speaking' : '')}>
          {step.hangul}
        </div>
        <div className="romaji">{step.romaji}</div>
        {readJa && jaText && (
          <div className={'meaning' + (part === 'ja' ? ' speaking' : '')}>{jaText}</div>
        )}
        <div className="listen-status" role="status">
          {part === 'ko' ? '🔊 韓国語' : part === 'ja' ? '🔊 日本語' : playing ? '…' : '一時停止中'}
        </div>
      </section>

      <div className="listen-controls">
        <button className="link nav-arrow" onClick={() => goTo(index - 1)} aria-label="前へ">
          ‹
        </button>
        <button
          className="btn-primary listen-play-btn"
          onClick={() => (playing ? pause() : play())}
        >
          {playing ? '⏸ 一時停止' : '▶ 再生'}
        </button>
        <button className="link nav-arrow" onClick={() => goTo(index + 1)} aria-label="次へ">
          ›
        </button>
      </div>

      <div className="listen-options">
        <div className="listen-opt">
          <span>速度</span>
          <div className="seg">
            {RATES.map((r) => (
              <button
                key={r}
                className={r === rate ? 'seg-item on' : 'seg-item'}
                onClick={() => setRate(r)}
              >
                {r.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="listen-opt">
          <span>繰り返し</span>
          <div className="seg">
            {[1, 2].map((n) => (
              <button
                key={n}
                className={n === repeatEach ? 'seg-item on' : 'seg-item'}
                onClick={() => setRepeatEach(n)}
              >
                {n}回
              </button>
            ))}
          </div>
        </div>
        <button
          className={readJa ? 'listen-chip on' : 'listen-chip'}
          onClick={() => setReadJa((v) => !v)}
          disabled={!jaReady}
          aria-pressed={readJa}
        >
          日本語読み {readJa ? 'オン' : 'オフ'}
          {!jaReady && <small> (音声なし)</small>}
        </button>
        <button
          className={loop ? 'listen-chip on' : 'listen-chip'}
          onClick={() => setLoop((v) => !v)}
          aria-pressed={loop}
        >
          ↻ リピート再生 {loop ? 'オン' : 'オフ'}
        </button>
      </div>
    </main>
  )
}
