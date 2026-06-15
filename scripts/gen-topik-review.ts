// Generates the native-speaker review checklist of every TOPIK question, ready
// to hand to a Korean teacher / native speaker, in two formats:
//   docs/topik-review.md   — readable checklist with per-item 검수 의견 line
//   docs/topik-review.csv   — spreadsheet (Excel/Sheets) with blank review cols
//
// Each item shows the Korean text, choices (✅ on the keyed answer), and the
// (Japanese, learner-facing) rationale. Run: pnpm gen:topik-review

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOPIK_POOL } from '../src/data/topik'
import {
  TOPIK_LEVEL_LABEL,
  TOPIK_PART_KO,
  type ReadingKind,
  type TopikLevel,
  type TopikPart,
} from '../src/data/topik/types'

const CIRCLED = ['①', '②', '③', '④', '⑤']
const LEVELS: TopikLevel[] = ['TOPIK1', 'TOPIK2']
const PARTS: TopikPart[] = ['listening', 'reading']

const READING_KIND_KO: Record<ReadingKind, string> = {
  cloze: '빈칸 채우기',
  topic: '화제 고르기',
  detail: '내용/주제',
  passage: '지문 세트',
}

interface Entry {
  level: TopikLevel
  part: TopikPart
  sectionN: number // 1-based within its section
  tag: string
  id: string
  context: string // script or passage ('' when none)
  contextLabel: string // 스크립트 / 지문 / ''
  prompt: string
  choices: string[]
  answer: number // 0-based
  explain: string
}

function buildEntries(): Entry[] {
  const entries: Entry[] = []
  for (const level of LEVELS) {
    for (const part of PARTS) {
      let n = 0
      for (const q of TOPIK_POOL.filter((x) => x.level === level && x.part === part)) {
        if (q.part === 'listening') {
          n += 1
          entries.push({
            level, part, sectionN: n, tag: '듣기', id: q.id,
            context: q.script, contextLabel: '스크립트',
            prompt: q.prompt, choices: q.choices, answer: q.answer, explain: q.explain ?? '',
          })
        } else if (q.kind === 'passage') {
          q.questions.forEach((sub, i) => {
            n += 1
            entries.push({
              level, part, sectionN: n, tag: READING_KIND_KO.passage, id: `${q.id}-${i + 1}`,
              context: q.passage, contextLabel: '지문',
              prompt: sub.prompt, choices: sub.choices, answer: sub.answer, explain: sub.explain ?? '',
            })
          })
        } else {
          n += 1
          entries.push({
            level, part, sectionN: n, tag: READING_KIND_KO[q.kind], id: q.id,
            context: '', contextLabel: '',
            prompt: q.prompt, choices: q.choices, answer: q.answer, explain: q.explain ?? '',
          })
        }
      }
    }
  }
  return entries
}

// ── Markdown ────────────────────────────────────────────────────────────────
function renderMarkdown(entries: Entry[]): string {
  const perLevel = (lv: TopikLevel) => entries.filter((e) => e.level === lv).length
  const total = entries.length

  const header = `# TOPIK 문항 원어민 검수 체크리스트

> 자동 생성 문서입니다 (\`pnpm gen:topik-review\`). 내용 수정은 \`src/data/topik/*.ts\`에서 하고 다시 생성하세요.
> 스프레드시트로 점검하려면 같은 폴더의 \`topik-review.csv\`를 엑셀/구글시트에서 여세요.

## 검수자 안내 (한국어 교사·원어민용)

이 앱은 **일본어 사용자**를 위한 한국어 TOPIK 모의고사입니다. 문항은 실제 TOPIK 출제 유형을 본떠 자작한 것으로(기출 원문 아님), 아래 세 가지를 봐 주시면 됩니다.

1. **정답 정확성** — 각 문항의 ✅ 표시가 정말 정답인지. (오답이면 \`검수 의견\`에 올바른 번호와 이유)
2. **한국어 자연스러움** — 스크립트·지문·보기의 표현이 자연스러운지. 어색하면 수정안을 적어 주세요.
3. **난이도 적정성** — TOPIK I = 1〜2급(초급), TOPIK II = 3〜4급 중심(중급). 수준에 안 맞으면 표시해 주세요.

**표시 방법**: 문제없으면 체크박스 \`[x]\`로 표시, 문제가 있으면 그 문항의 \`검수 의견\`에 메모. \`참고(일본어 해설)\`은 학습자에게 보여 주는 일본어 설명이라 검수 대상이 아니라 의도 파악용입니다.

> **표기 안내**: TOPIK II의 쓰기(작문)는 주관식이라 자동 채점이 불가하여 듣기·읽기만 다룹니다.

**합계 ${total}문항** (TOPIK I ${perLevel('TOPIK1')}문항 / TOPIK II ${perLevel('TOPIK2')}문항)

---
`

  const parts: string[] = [header]
  for (const level of LEVELS) {
    parts.push(`\n## ${TOPIK_LEVEL_LABEL[level]} — 計 ${perLevel(level)}문항\n`)
    for (const part of PARTS) {
      const inSec = entries.filter((e) => e.level === level && e.part === part)
      if (inSec.length === 0) continue
      parts.push(`### ${TOPIK_PART_KO[part]} (${part}) — ${inSec.length}문항\n`)
      for (const e of inSec) {
        const lines = [`- [ ] **${e.sectionN}. [${e.tag}]** \`${e.id}\``]
        if (e.context) lines.push(`  - ${e.contextLabel}: ${e.context}`)
        lines.push(`  - 문제: ${e.prompt}`)
        lines.push(
          `  - 보기: ${e.choices.map((c, i) => `${CIRCLED[i]} ${c}${i === e.answer ? ' ✅' : ''}`).join('　')}`,
        )
        lines.push(`  - 정답: ${CIRCLED[e.answer]}　|　참고(일본어 해설): ${e.explain || '(없음)'}`)
        lines.push(`  - 검수 의견: `)
        parts.push(lines.join('\n') + '\n')
      }
    }
  }

  parts.push(`
---

## 검수 요약 (문제 발견 시 기록)

| 문항 id | 구분 | 문제 유형(정답오류/표현/난이도) | 내용 및 수정안 |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

- 전반 의견:
- 검수자 / 날짜:
`)
  return parts.join('\n')
}

// ── CSV ─────────────────────────────────────────────────────────────────────
function csvCell(v: string): string {
  return '"' + (v ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""') + '"'
}

function renderCsv(entries: Entry[]): string {
  const cols = [
    '번호', '레벨', '섹션', '유형', 'id', '스크립트/지문', '문제',
    '보기1', '보기2', '보기3', '보기4',
    '정답번호', '정답내용', '참고(일본어해설)', '정답OK(Y/N)', '검수의견',
  ]
  const rows = [cols.map(csvCell).join(',')]
  entries.forEach((e, i) => {
    const ch = [0, 1, 2, 3].map((j) => e.choices[j] ?? '')
    rows.push(
      [
        String(i + 1),
        TOPIK_LEVEL_LABEL[e.level],
        TOPIK_PART_KO[e.part],
        e.tag,
        e.id,
        e.context,
        e.prompt,
        ...ch,
        String(e.answer + 1),
        e.choices[e.answer] ?? '',
        e.explain,
        '', // 정답OK — reviewer fills
        '', // 검수의견 — reviewer fills
      ].map(csvCell).join(','),
    )
  })
  // BOM so Excel reads UTF-8 (Korean/Japanese) correctly.
  return '﻿' + rows.join('\r\n') + '\r\n'
}

// ── write ───────────────────────────────────────────────────────────────────
const entries = buildEntries()
const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(__dirname, '../docs')
mkdirSync(docsDir, { recursive: true })
writeFileSync(resolve(docsDir, 'topik-review.md'), renderMarkdown(entries), 'utf8')
writeFileSync(resolve(docsDir, 'topik-review.csv'), renderCsv(entries), 'utf8')
console.log(`wrote docs/topik-review.md and docs/topik-review.csv (${entries.length} items)`)
