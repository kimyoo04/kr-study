// TOPIK content registry. Adding a level = import its bank and spread it here.
// Everything downstream (exam builder, home screen) reads from TOPIK_POOL.

import type { TopikLevel, TopikQuestion } from './types'
import { TOPIK1_QUESTIONS } from './topik1'

export const TOPIK_POOL: TopikQuestion[] = [...TOPIK1_QUESTIONS]

// Order shown on the TOPIK home screen (easiest first). TOPIK2 has no content
// yet, so it renders as 「準備中」.
export const TOPIK_LEVELS: TopikLevel[] = ['TOPIK1', 'TOPIK2']

export * from './types'
