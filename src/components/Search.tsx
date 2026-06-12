import { useMemo, useState } from 'react'
import { searchItems } from '../lib/search'
import { primeSpeech, speakItem } from '../lib/speak'

interface Props {
  onExit: () => void
}

export function Search({ onExit }: Props) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchItems(query), [query])
  const trimmed = query.trim()

  return (
    <main className="screen search">
      <div className="search-top">
        <button className="link" onClick={onExit} aria-label="閉じる">
          ✕
        </button>
        <input
          className="search-input"
          type="search"
          inputMode="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ハングル · ローマ字 · 意味で検索"
          aria-label="検索"
        />
      </div>

      {trimmed === '' ? (
        <p className="search-hint">
          ハングル・単語・表現をまとめて検索できます。
          <br />
          例: <code>고양이</code>, <code>goyangi</code>, <code>ねこ</code>, <code>약속</code>
        </p>
      ) : results.length === 0 ? (
        <p className="search-hint">「{trimmed}」の結果はありません。</p>
      ) : (
        <>
          <p className="search-count">{results.length}件の結果</p>
          <ul className="search-results">
            {results.map((r, i) => (
              <li key={`${r.deckId}-${r.hangul.hangul}-${i}`} className="search-row">
                <div className="search-row-main">
                  <span className="search-kana">{r.hangul.hangul}</span>
                  <span className="search-romaji">{r.hangul.romaji}</span>
                  {r.hangul.meaning && <span className="search-meaning">{r.hangul.meaning}</span>}
                </div>
                <div className="search-row-side">
                  <span className="search-badge">{r.deckLabel}</span>
                  <button
                    className="search-speak"
                    aria-label="発音を聞く"
                    onClick={() => {
                      primeSpeech()
                      speakItem(r.hangul)
                    }}
                  >
                    🔊
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
