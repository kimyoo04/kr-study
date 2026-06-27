import { useEffect, useMemo, useState } from 'react'
import { DECKS, deckCategories, type Deck, type Hangul } from '../data/hangul'
import { useProgress } from '../hooks/useProgress'
import { useSettings } from '../hooks/useSettings'
import { useTopikExam } from '../hooks/useTopikExam'
import { today } from '../lib/date'
import { hasJaVoice, hasKoVoice, loadVoices } from '../lib/speak'
import { swApplyUpdate, swOnUpdate } from '../lib/sw'
import {
  applyAnswer,
  cardKey,
  introducedCard,
  newCard,
  selectLessonItems,
  weakItems,
  type LessonItem,
} from '../lib/srs'
import { Home } from './Home'
import { ListenPlayer } from './ListenPlayer'
import { Lesson, type LessonResult } from './Lesson'
import { Complete } from './Complete'
import { Search } from './Search'
import { TopikHome } from './TopikHome'
import { TopikExam } from './TopikExam'
import { TopikReport } from './TopikReport'
import { TopikReview } from './TopikReview'
import { TopikHistory } from './TopikHistory'
type Screen =
  | 'home'
  | 'lesson'
  | 'listen-play'
  | 'complete'
  | 'search'
  | 'topik-home'
  | 'topik-exam'
  | 'topik-report'
  | 'topik-review'
  | 'topik-history'

export function App() {
  const { progress, persistent, update } = useProgress()
  const { settings, toggleSfx, toggleListen } = useSettings()
  const [deck, setDeck] = useState<Deck>(DECKS[0])
  const [categoryName, setCategoryName] = useState<string | null>(null) // null = 全体
  const [screen, setScreen] = useState<Screen>('home')
  const [items, setItems] = useState<LessonItem[]>([])
  const [results, setResults] = useState<LessonResult[]>([])
  // Review lessons (間違いだけ/苦手だけ) must not advance the SRS lesson clock.
  const [isReview, setIsReview] = useState(false)

  // TOPIK mock-exam — own pool, persistence, and scoring (see useTopikExam).
  const topik = useTopikExam({
    toExam: () => setScreen('topik-exam'),
    toReport: () => setScreen('topik-report'),
  })

  // Listen mode needs a Korean TTS voice. Voices load asynchronously and some
  // devices fire voiceschanged late, so keep listening instead of probing once.
  const [voiceReady, setVoiceReady] = useState(false)
  // Passive listen can also read the Japanese (native) side — needs a ja voice.
  const [jaReady, setJaReady] = useState(false)
  useEffect(() => {
    let active = true
    const refresh = () => {
      void loadVoices().then(() => {
        if (!active) return
        setVoiceReady(hasKoVoice())
        setJaReady(hasJaVoice())
      })
    }
    refresh()
    const synth =
      typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
    synth?.addEventListener('voiceschanged', refresh)
    return () => {
      active = false
      synth?.removeEventListener('voiceschanged', refresh)
    }
  }, [])
  const listenMode = settings.listen && voiceReady

  // A new deploy waits until the user is back on Home (no mid-lesson reloads).
  const [updateReady, setUpdateReady] = useState(false)
  useEffect(() => swOnUpdate(setUpdateReady), [])

  // Screen switches unmount the focused button; move focus to the new screen
  // root so keyboard users aren't dropped to <body> and SRs announce the change.
  useEffect(() => {
    document.querySelector<HTMLElement>('main.screen')?.focus()
  }, [screen])

  const categories = useMemo(() => deckCategories(deck), [deck])
  // The items the lesson/progress is scoped to: the chosen category, or the whole deck.
  const scopeItems = useMemo(() => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat ? cat.items : deck.items
  }, [categories, categoryName, deck])

  function selectDeck(d: Deck) {
    setDeck(d)
    setCategoryName(null) // reset category when switching decks
  }

  function startLesson() {
    const next = selectLessonItems(progress, scopeItems, deck.id)
    if (next.length === 0) return
    setItems(next)
    setIsReview(false)
    setScreen('lesson')
  }

  // Passive listen: auto-play the current scope (no quizzing, no progress change).
  function startListen() {
    if (scopeItems.length === 0) return
    setScreen('listen-play')
  }

  // Review only the given items (e.g. the ones missed last lesson), all as quizzes.
  function startReview(hangul: Hangul[]) {
    if (hangul.length === 0) return
    setItems(hangul.map((k) => ({ hangul: k, mode: 'quiz' })))
    setIsReview(true)
    setScreen('lesson')
  }

  function finishLesson(lessonResults: LessonResult[]) {
    const cards = { ...progress.items }
    // Reviews keep the lesson clock unchanged — otherwise every quick review
    // tick would bring ALL cards closer to due and shrink the SRS intervals.
    const base = isReview ? progress.lessonsDone : progress.lessonsDone + 1
    for (const r of lessonResults) {
      // Skipped items are neutral — leave their SRS card untouched so they stay
      // due and resurface in a later lesson.
      if (r.skipped) continue
      const key = cardKey(deck.id, r.hangul.hangul)
      if (r.mode === 'intro') {
        cards[key] = introducedCard(base)
      } else {
        const card = cards[key] ?? newCard(progress.lessonsDone)
        cards[key] = applyAnswer(card, r.correct, base)
      }
    }
    update({
      ...progress,
      items: cards,
      lessonsDone: base,
      lastPlayed: today(),
    })
    setResults(lessonResults)
    setScreen('complete')
  }

  const wrong = results
    .filter((r) => r.mode === 'quiz' && !r.correct && !r.skipped)
    .map((r) => r.hangul)
  const weak = weakItems(progress, scopeItems, deck.id)

  return (
    <div className="app">
      {screen === 'home' && (
        <Home
          progress={progress}
          persistent={persistent}
          deck={deck}
          onSelectDeck={selectDeck}
          categories={categories}
          categoryName={categoryName}
          onSelectCategory={setCategoryName}
          scopeItems={scopeItems}
          weakCount={weak.length}
          onReviewWeak={() => startReview(weak)}
          sfx={settings.sfx}
          onToggleSfx={toggleSfx}
          listen={settings.listen}
          onToggleListen={toggleListen}
          listenAvailable={voiceReady}
          updateReady={updateReady}
          onApplyUpdate={swApplyUpdate}
          onSearch={() => setScreen('search')}
          onTopik={() => setScreen('topik-home')}
          onStart={startLesson}
          onListen={startListen}
        />
      )}
      {screen === 'listen-play' && (
        <ListenPlayer
          items={scopeItems}
          deck={deck}
          jaReady={jaReady}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'lesson' && (
        <Lesson
          items={items}
          // Distractors draw from the whole deck even when a category is
          // selected — tiny categories would otherwise yield 2-option quizzes.
          pool={deck.items}
          deck={deck}
          listenMode={listenMode}
          onExit={() => setScreen('home')}
          onComplete={finishLesson}
        />
      )}
      {screen === 'complete' && (
        <Complete
          results={results}
          wrong={wrong}
          onReview={() => startReview(wrong)}
          onAgain={startLesson}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'search' && <Search onExit={() => setScreen('home')} />}
      {screen === 'topik-home' && (
        <TopikHome
          voiceReady={voiceReady}
          onStart={topik.start}
          onResume={topik.resume}
          onHistory={() => setScreen('topik-history')}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'topik-history' && (
        <TopikHistory onClose={() => setScreen('topik-home')} />
      )}
      {screen === 'topik-exam' && (
        <TopikExam
          level={topik.level}
          items={topik.items}
          initialAnswers={topik.answers}
          initialIdx={topik.idx}
          voiceReady={voiceReady}
          onComplete={topik.complete}
          onExit={() => setScreen('topik-home')}
        />
      )}
      {screen === 'topik-report' && topik.result && (
        <TopikReport
          level={topik.level}
          result={topik.result}
          onReview={() => setScreen('topik-review')}
          onRetake={() => topik.start(topik.level)}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'topik-review' && (
        <TopikReview
          items={topik.items}
          answers={topik.answers}
          onClose={() => setScreen('topik-report')}
        />
      )}
    </div>
  )
}
