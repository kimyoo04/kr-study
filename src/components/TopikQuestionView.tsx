// Renders one TOPIK scored item in answer mode (no grading — the exam reveals
// results only at the report). Listening plays the script via ko-KR TTS with a
// text fallback when no Korean voice; reading shows the passage when present.

import type { ScoredItem } from '../data/topik/types'
import { primeSpeech, speak } from '../lib/speak'
import { ChoiceGrid } from './ChoiceGrid'

interface Props {
  item: ScoredItem
  selected: number | null
  voiceReady: boolean
  onPick: (index: number) => void
}

export function TopikQuestionView({ item, selected, voiceReady, onPick }: Props) {
  // Choices are Korean — tag the language so screen readers don't read them
  // with the Japanese synthesizer.
  const choices = item.choices.map((text, i) => ({ key: String(i), text, lang: 'ko' }))
  const grid = (
    <ChoiceGrid
      options={choices}
      mode="answer"
      selectedKey={selected === null ? null : String(selected)}
      onPick={(key) => onPick(Number(key))}
    />
  )

  if (item.part === 'listening') {
    return (
      <section className="card quiz">
        <p className="prompt-label">{item.prompt}</p>
        <button
          className="btn-ghost big-audio"
          onClick={() => {
            primeSpeech()
            if (item.script) speak(item.script)
          }}
          aria-label="聞く"
        >
          🔊
        </button>
        {!voiceReady && item.script && (
          // No Korean voice on this device: show the script as text so the item
          // is still answerable.
          <p className="topik-script-fallback" lang="ko">
            {item.script}
          </p>
        )}
        {grid}
      </section>
    )
  }

  // reading (cloze | topic | detail | passage sub-question)
  return (
    <section className="card quiz">
      {item.passage && (
        <p className="topik-passage" lang="ko">
          {item.passage}
        </p>
      )}
      <p className="topik-prompt" lang="ko">
        {item.prompt}
      </p>
      {grid}
    </section>
  )
}
