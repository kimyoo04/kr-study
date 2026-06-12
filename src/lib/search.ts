// Cross-deck search. The index is every item from every deck, flattened once at
// module load. Matching is a plain substring scan over hangul / romaji / meaning /
// note — a few thousand entries, so a linear pass per keystroke is well under a
// millisecond.
import { DECKS, type DeckKind, type Hangul } from '../data/hangul'

export interface SearchEntry {
  hangul: Hangul
  deckLabel: string
  deckKind: DeckKind
  deckId: string
}

export const SEARCH_INDEX: SearchEntry[] = DECKS.flatMap((d) =>
  d.items.map((k) => ({ hangul: k, deckLabel: d.label, deckKind: d.kind, deckId: d.id })),
)

/**
 * Rank matches: exact field match first, then prefix, then substring; among
 * equal kinds, earlier fields (hangul > romaji > meaning > note) win. Empty query
 * returns nothing. `limit` caps the list so a one-letter query stays snappy.
 */
export function searchItems(
  query: string,
  index: SearchEntry[] = SEARCH_INDEX,
  limit = 60,
): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored: { entry: SearchEntry; score: number }[] = []
  for (const entry of index) {
    const { hangul, romaji, meaning, note } = entry.hangul
    const fields = [hangul, romaji, meaning ?? '', note ?? '']
    let best = Infinity
    for (let f = 0; f < fields.length; f++) {
      const field = fields[f].toLowerCase()
      if (!field) continue
      const at = field.indexOf(q)
      if (at === -1) continue
      const kind = field === q ? 0 : at === 0 ? 100 : 200
      const score = kind + f
      if (score < best) best = score
    }
    if (best !== Infinity) scored.push({ entry, score: best })
  }

  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map((s) => s.entry)
}
