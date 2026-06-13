import { useEffect, useMemo, useState } from 'react'
import { DECKS, deckCategories, type Deck, type Hangul } from '../data/hangul'
import { useProgress } from '../hooks/useProgress'
import { useSettings } from '../hooks/useSettings'
import { hasKoVoice, loadVoices } from '../lib/speak'
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
  // Review lessons (間違いだけ/苦手だけ) must not advance the SRS lesson clock.
  const [isReview, setIsReview] = useState(false)

  // Listen mode needs a Korean TTS voice. Voices load asynchronously and some
  // devices fire voiceschanged late, so keep listening instead of probing once.
  const [voiceReady, setVoiceReady] = useState(false)
  useEffect(() => {
    let active = true
    const refresh = () => {
      void loadVoices().then(() => {
        if (active) setVoiceReady(hasKoVoice())
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
      lastPlayed: new Date().toISOString().slice(0, 10),
    })
    setResults(lessonResults)
    setScreen('complete')
  }

  const wrong = results.filter((r) => r.mode === 'quiz' && !r.correct).map((r) => r.hangul)
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
          onStart={startLesson}
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
    </div>
  )
}
