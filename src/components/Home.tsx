import { DECKS, type Category, type Deck, type Hangul } from '../data/hangul'
import { learnedCount, learnedCountFor, type Progress } from '../lib/srs'

const TOTAL_ALL = DECKS.reduce((n, d) => n + d.items.length, 0)

interface Props {
  progress: Progress
  persistent: boolean
  deck: Deck
  onSelectDeck: (d: Deck) => void
  categories: Category[]
  categoryName: string | null
  onSelectCategory: (name: string | null) => void
  scopeItems: Hangul[]
  weakCount: number
  onReviewWeak: () => void
  sfx: boolean
  onToggleSfx: () => void
  listen: boolean
  onToggleListen: () => void
  listenAvailable: boolean
  updateReady: boolean
  onApplyUpdate: () => void
  onSearch: () => void
  onTopik: () => void
  onStart: () => void
  onListen: () => void
}

export function Home({
  progress,
  persistent,
  deck,
  onSelectDeck,
  categories,
  categoryName,
  onSelectCategory,
  scopeItems,
  weakCount,
  onReviewWeak,
  sfx,
  onToggleSfx,
  listen,
  onToggleListen,
  listenAvailable,
  updateReady,
  onApplyUpdate,
  onSearch,
  onTopik,
  onStart,
  onListen,
}: Props) {
  const total = scopeItems.length
  const learned = learnedCountFor(progress, scopeItems, deck.id)
  const pct = Math.round((learned / total) * 100)
  const learnedAll = learnedCount(progress)
  const scopeLabel = categoryName ?? deck.label

  return (
    <main className="screen home" tabIndex={-1}>
      <header className="home-head">
        <button className="search-btn" onClick={onSearch} aria-label="検索">
          🔍
        </button>
        <button
          className="sfx-toggle"
          onClick={onToggleSfx}
          aria-pressed={sfx}
          aria-label={sfx ? '効果音をオフ' : '効果音をオン'}
        >
          {sfx ? '🔊' : '🔇'}
        </button>
        <h1 className="logo">かんこくご Pocket</h1>
        <p className="tagline">ハングルから、片手で</p>
        <p className="overall">
          全体 <strong>{learnedAll}</strong> / {TOTAL_ALL} 習得
        </p>
      </header>

      {!persistent && (
        <div className="banner" role="status">
          ⚠️ このブラウザでは進捗が保存されません (プライベートモードかもしれません)
        </div>
      )}

      {updateReady && (
        <button className="banner update" onClick={onApplyUpdate}>
          ✨ 新しいバージョンがあります — タップして更新
        </button>
      )}

      {/* Plain toggle buttons — ARIA tabs would promise arrow-key navigation
          and tabpanel semantics this switcher doesn't implement. */}
      <div className="deck-switch" role="group" aria-label="デッキ選択">
        {DECKS.map((d) => (
          <button
            key={d.id}
            aria-pressed={d.id === deck.id}
            className={d.id === deck.id ? 'deck-tab active' : 'deck-tab'}
            onClick={() => onSelectDeck(d)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <label className="cat-select">
        <span className="cat-select-label">カテゴリー</span>
        <select
          value={categoryName ?? ''}
          onChange={(e) => onSelectCategory(e.target.value || null)}
        >
          <option value="">全体 ({deck.items.length})</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.items.length})
            </option>
          ))}
        </select>
      </label>

      <section className="progress-card">
        <div className="progress-label">
          <span>{scopeLabel}</span>
          <span>
            {learned} / {total}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-sub">
          {progress.lessonsDone > 0 ? `レッスン ${progress.lessonsDone}回 完了` : 'まだ始める前'}
        </div>
      </section>

      <button
        className={listen ? 'mode-toggle on' : 'mode-toggle'}
        onClick={onToggleListen}
        disabled={!listenAvailable}
        aria-pressed={listen}
      >
        <span className="mode-toggle-text">
          🎧 聞いて解く
          {!listenAvailable && <small> (この端末は音声非対応)</small>}
        </span>
        <span className="mode-toggle-state">{listen ? 'オン' : 'オフ'}</span>
      </button>

      <button className="btn-primary" onClick={onStart}>
        {learned > 0 ? '今日のレッスン' : 'はじめる'}
      </button>
      <button className="btn-ghost" onClick={onListen} disabled={!listenAvailable}>
        🎧 流し聞き ({total})
      </button>
      {weakCount > 0 && (
        <button className="btn-ghost" onClick={onReviewWeak}>
          苦手だけ復習 ({weakCount})
        </button>
      )}

      <button className="topik-entry" onClick={onTopik}>
        📝 TOPIK 模擬試験
        <small>聞き取り・読解のミニ模試で実力チェック</small>
      </button>
    </main>
  )
}
