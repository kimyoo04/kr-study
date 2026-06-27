import type { DeckKind } from '../data/hangul'

/** CSS class for the prompt glyph, sized by deck kind (shared by the lesson cards). */
export function glyphClassFor(kind: DeckKind): string {
  if (kind === 'sentence' || kind === 'cloze') return 'glyph sentence'
  if (kind === 'words') return 'glyph word'
  return 'glyph big'
}
