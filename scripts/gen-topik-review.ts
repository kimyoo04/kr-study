// Generates docs/topik-review.md — a native-speaker review checklist of every
// TOPIK question: prompt, choices (✓ on the keyed answer), and the Japanese
// rationale. A Korean teacher / native checks answer keys and naturalness.
//
// Run: pnpm gen:topik-review   (vite-node compiles the TS imports)

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOPIK_POOL } from '../src/data/topik'
import { TOPIK_LEVEL_LABEL, TOPIK_PART_KO } from '../src/data/topik/types'
import type { ScoredItem, TopikLevel, TopikPart } from '../src/data/topik/types'
import { flatten } from '../src/lib/topik'

const CIRCLED = ['①', '②', '③', '④', '⑤']

function renderItem(n: number, it: ScoredItem): string {
  const lines: string[] = []
  lines.push(`- [ ] **${n}.** \`${it.id}\``)
  if (it.script) lines.push(`  - 스크립트: ${it.script}`)
  if (it.passage) lines.push(`  - 지문: ${it.passage}`)
  lines.push(`  - 문제: ${it.prompt}`)
  const opts = it.choices
    .map((c, i) => `${CIRCLED[i]} ${c}${i === it.answer ? ' ✅' : ''}`)
    .join('　')
  lines.push(`  - 보기: ${opts}`)
  lines.push(`  - 정답: ${CIRCLED[it.answer]}　/ 해설: ${it.explain ?? '(なし)'}`)
  return lines.join('\n')
}

function section(items: ScoredItem[], part: TopikPart): string {
  const inPart = items.filter((it) => it.part === part)
  if (inPart.length === 0) return ''
  const head = `### ${TOPIK_PART_KO[part]} (${part}) — ${inPart.length}問\n`
  const body = inPart.map((it, i) => renderItem(i + 1, it)).join('\n\n')
  return `${head}\n${body}\n`
}

const out: string[] = [
  '# TOPIK 問題 検収チェックリスト',
  '',
  '> 自動生成 (`pnpm gen:topik-review`)。編集は `src/data/topik/*.ts` 側で行い、再生成してください。',
  '> 各問の ✅ がデータ上の正解キー。韓国語の自然さ・正答の妥当性・難易度をネイティブが確認するための一覧です。',
  '',
]

const levels: TopikLevel[] = ['TOPIK1', 'TOPIK2']
let total = 0
for (const level of levels) {
  const items = flatten(TOPIK_POOL.filter((q) => q.level === level))
  total += items.length
  out.push(`## ${TOPIK_LEVEL_LABEL[level]} — 計 ${items.length} 採点項目\n`)
  out.push(section(items, 'listening'))
  out.push(section(items, 'reading'))
}

out.splice(4, 0, '', `**合計 ${total} 採点項目**`)

const __dirname = dirname(fileURLToPath(import.meta.url))
const target = resolve(__dirname, '../docs/topik-review.md')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, out.join('\n'), 'utf8')
console.log(`wrote ${target} (${total} items)`)
