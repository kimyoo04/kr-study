// Generates docs/topik-review.md — a native-speaker review checklist of every
// TOPIK question, ready to hand to a Korean teacher / native speaker. Each item
// shows the Korean text, choices (✅ on the keyed answer), the (Japanese,
// learner-facing) rationale, and a blank line for the reviewer's note.
//
// Run: pnpm gen:topik-review   (vite-node compiles the TS imports)

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
  type TopikQuestion,
} from '../src/data/topik/types'

const CIRCLED = ['①', '②', '③', '④', '⑤']

const READING_KIND_KO: Record<ReadingKind, string> = {
  cloze: '빈칸 채우기',
  topic: '화제 고르기',
  detail: '내용/주제',
  passage: '지문 세트',
}

// One reviewable block: choices with ✅ on the key, the JP rationale, and a
// blank "검수 의견" line for the reviewer to fill in.
function block(opts: {
  n: number
  id: string
  tag: string
  context?: string // script or passage
  contextLabel?: string
  prompt: string
  choices: string[]
  answer: number
  explain?: string
}): string {
  const lines: string[] = []
  lines.push(`- [ ] **${opts.n}. [${opts.tag}]** \`${opts.id}\``)
  if (opts.context) lines.push(`  - ${opts.contextLabel}: ${opts.context}`)
  lines.push(`  - 문제: ${opts.prompt}`)
  const choiceStr = opts.choices
    .map((c, i) => `${CIRCLED[i]} ${c}${i === opts.answer ? ' ✅' : ''}`)
    .join('　')
  lines.push(`  - 보기: ${choiceStr}`)
  lines.push(`  - 정답: ${CIRCLED[opts.answer]}　|　참고(일본어 해설): ${opts.explain ?? '(없음)'}`)
  lines.push(`  - 검수 의견: `)
  return lines.join('\n')
}

// Returns the section markdown + the number of scored items it covers.
function section(questions: TopikQuestion[], part: TopikPart): { md: string; count: number } {
  const inPart = questions.filter((q) => q.part === part)
  if (inPart.length === 0) return { md: '', count: 0 }

  const blocks: string[] = []
  let n = 0
  for (const q of inPart) {
    if (q.part === 'listening') {
      n += 1
      blocks.push(
        block({
          n,
          id: q.id,
          tag: '듣기',
          context: q.script,
          contextLabel: '스크립트',
          prompt: q.prompt,
          choices: q.choices,
          answer: q.answer,
          explain: q.explain,
        }),
      )
    } else if (q.kind === 'passage') {
      q.questions.forEach((sub, i) => {
        n += 1
        blocks.push(
          block({
            n,
            id: `${q.id}-${i + 1}`,
            tag: READING_KIND_KO.passage,
            context: q.passage,
            contextLabel: '지문',
            prompt: sub.prompt,
            choices: sub.choices,
            answer: sub.answer,
            explain: sub.explain,
          }),
        )
      })
    } else {
      n += 1
      blocks.push(
        block({
          n,
          id: q.id,
          tag: READING_KIND_KO[q.kind],
          prompt: q.prompt,
          choices: q.choices,
          answer: q.answer,
          explain: q.explain,
        }),
      )
    }
  }
  const md = `### ${TOPIK_PART_KO[part]} (${part}) — ${n}문항\n\n${blocks.join('\n\n')}\n`
  return { md, count: n }
}

const levels: TopikLevel[] = ['TOPIK1', 'TOPIK2']
const body: string[] = []
const perLevelCount: Record<string, number> = {}
let total = 0
for (const level of levels) {
  const qs = TOPIK_POOL.filter((q) => q.level === level)
  const listening = section(qs, 'listening')
  const reading = section(qs, 'reading')
  const count = listening.count + reading.count
  perLevelCount[level] = count
  total += count
  body.push(`## ${TOPIK_LEVEL_LABEL[level]} — 計 ${count}문항\n`)
  body.push(listening.md)
  body.push(reading.md)
}

const header = `# TOPIK 문항 원어민 검수 체크리스트

> 자동 생성 문서입니다 (\`pnpm gen:topik-review\`). 내용 수정은 \`src/data/topik/*.ts\`에서 하고 다시 생성하세요.

## 검수자 안내 (한국어 교사·원어민용)

이 앱은 **일본어 사용자**를 위한 한국어 TOPIK 모의고사입니다. 문항은 실제 TOPIK 출제 유형을 본떠 자작한 것으로(기출 원문 아님), 아래 세 가지를 봐 주시면 됩니다.

1. **정답 정확성** — 각 문항의 ✅ 표시가 정말 정답인지. (오답이면 \`검수 의견\`에 올바른 번호와 이유)
2. **한국어 자연스러움** — 스크립트·지문·보기의 표현이 자연스러운지. 어색하면 수정안을 적어 주세요.
3. **난이도 적정성** — TOPIK I = 1〜2급(초급), TOPIK II = 3〜4급 중심(중급). 수준에 안 맞으면 표시해 주세요.

**표시 방법**: 문제없으면 체크박스 \`[x]\`로 표시, 문제가 있으면 그 문항의 \`검수 의견\`에 메모. \`참고(일본어 해설)\`은 학습자에게 보여 주는 일본어 설명이라 검수 대상이 아니라 의도 파악용입니다.

> **표기 안내**: TOPIK II의 쓰기(작문)는 주관식이라 자동 채점이 불가하여 듣기·읽기만 다룹니다.

**합계 ${total}문항** (TOPIK I ${perLevelCount.TOPIK1}문항 / TOPIK II ${perLevelCount.TOPIK2}문항)

---
`

const summary = `
---

## 검수 요약 (문제 발견 시 기록)

| 문항 id | 구분 | 문제 유형(정답오류/표현/난이도) | 내용 및 수정안 |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

- 전반 의견:
- 검수자 / 날짜:
`

const out = `${header}\n${body.join('\n')}${summary}`

const __dirname = dirname(fileURLToPath(import.meta.url))
const target = resolve(__dirname, '../docs/topik-review.md')
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, out, 'utf8')
console.log(`wrote ${target} (${total} items)`)
