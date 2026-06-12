import { useEffect, useMemo, useState } from 'react'
import { DECKS, deckCategories, type Deck, type Hangul } from '../data/hangul'
import { useProgress } from '../hooks/useProgress'
import { useSettings } from '../hooks/useSettings'
import { hasKoVoice, loadVoices } from '../lib/speak'
import {
  applyAnswer,
  introducedCard,
  newCard,
  selectLessonItems,
  weakItems,
  type LessonItem,
} from '../lib/srs'
import { Home } from './Home'
import { Lesson, type LessonResult } from './Lesson'
import { Complete } from './Complete'
import { Search } from './Search'

type Screen = 'home' | 'lesson' | 'complete' | 'search'

export function App() {
  const { progress, persistent, update } = useProgress()
  const { settings, toggleSfx, toggleListen } = useSettings()
  const [deck, setDeck] = useState<Deck>(DECKS[0])
  const [categoryName, setCategoryName] = useState<string | null>(null) // null = 全体
  const [screen, setScreen] = useState<Screen>('home')
  const [items, setItems] = useState<LessonItem[]>([])
  const [results, setResults] = useState<LessonResult[]>([])

  // Listen mode needs a Korean TTS voice. Voices load asynchronously (Chrome),
  // so detect once on mount and gate the toggle on the result.
  const [voiceReady, setVoiceReady] = useState(false)
  useEffect(() => {
    void loadVoices().then(() => setVoiceReady(hasKoVoice()))
  }, [])
  const listenMode = settings.listen && voiceReady

  const categories = useMemo(() => deckCategories(deck), [deck])
  // The items the lesson/progress is scoped to: the chosen category, or the whole deck.
  const scopeItems = useMemo(() => {
    const cat = categories.find((c) => c.name === categoryName)
    return cat ? cat.items : deck.items
  }, [categories, categoryName, deck])

  // The lesson count this lesson will produce when finished.
  const base = progress.lessonsDone + 1

  function selectDeck(d: Deck) {
    setDeck(d)
    setCategoryName(null) // reset category when switching decks
  }

  function startLesson() {
    const next = selectLessonItems(progress, scopeItems)
    if (next.length === 0) return
    setItems(next)
    setScreen('lesson')
  }

  // Review only the given items (e.g. the ones missed last lesson), all as quizzes.
  function startReview(hangul: Hangul[]) {
    if (hangul.length === 0) return
    setItems(hangul.map((k) => ({ hangul: k, mode: 'quiz' })))
    setScreen('lesson')
  }

  function finishLesson(lessonResults: LessonResult[]) {
    const cards = { ...progress.items }
    for (const r of lessonResults) {
      const key = r.hangul.hangul
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
      lastPlayed: new Date().toISOString().slice(0, 10),
    })
    setResults(lessonResults)
    setScreen('complete')
  }

  const wrong = results.filter((r) => r.mode === 'quiz' && !r.correct).map((r) => r.hangul)
  const weak = weakItems(progress, scopeItems)

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
          onSearch={() => setScreen('search')}
          onStart={startLesson}
        />
      )}
      {screen === 'lesson' && (
        <Lesson
          items={items}
          pool={scopeItems}
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
    </div>
  )
}
