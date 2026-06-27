# 학습 세션 · 스킵/이동 (개발 문서)

> 한 세션을 "여러 레슨에 걸친 연속 흐름"으로 만들고, 1/5/10 스킵·뒤로가기로 그 안을 자유롭게 넘나드는 기능.
> 관련 커밋: `1dcb418`(스킵 1/5/10 추가) → `0125379`(화면 공통 골격 분리) → `2b7af13`(세션 연속화).

## 1. 한눈에

- **세션 = 한 번 `はじめる`로 시작해 완료/종료까지 이어지는 문제 묶음.** 더 이상 6문제 고정이 아니다.
- 세션 구성(`selectSessionItems`):
  - **복습(due) 카드 = 전부, 무제한** — 밀린 복습이 많을수록 세션이 길어진다.
  - **신규 도입(intro) = 최대 6개로 펜싱** — 콜드스타트가 전체 덱 마라톤이 되지 않게 막는다.
  - 둘 다 없으면 최약체(낮은 box) 복습으로 폴백.
- 세션 안에서 **≫1 / ≫5 / ≫10 스킵**과 **← 뒤로가기**로 단계를 넘나든다. 끝을 넘어가면 세션 완료.

## 2. 왜 이렇게 됐나 (배경)

처음엔 스킵을 "레슨 1개(6문제) 안에서"만 구현했다. 그런데 `LESSON_SIZE = 6`이라 6문제짜리 세션에서 ≫5·≫10은 사실상 "세션 종료"만 시켜 무의미했다.

요구사항을 다시 좁힌 결과(사용자 결정 3건):

1. 스킵은 **레슨 경계를 넘어** 이어가야 한다.
2. 세션은 **소진할 때까지** 이어간다.
3. 단, 신규 학습까지 매 세션 전체 덱(콜드스타트 100자)을 도는 마라톤은 곤란 → **복습은 무한, 신규는 펜싱**.

→ "복습 전부 + 신규 ~6개"를 한 세션으로 묶는 `selectSessionItems`로 귀결.

> 설계 메모: "복습 무한 + 한 항목은 세션 내 1회" 조건에서는 *온디맨드로 다음 배치를 당겨오는 방식*과 *시작 시 전체 큐를 한 번에 잡는 방식*의 동작이 동일하다(SRS 우선순위대로 due→신규, 중복 없이 소진). 후자가 단순하고 중간 비동기 경합이 없어 채택했다.

## 3. 세션 구성: `selectSessionItems`

`src/lib/srs.ts:179`

```ts
selectSessionItems(progress, order, deckId, newCap = LESSON_SIZE): LessonItem[]
```

선택 우선순위:

1. **due 복습 전부** — `isDue(card, lessonsDone+1)`인 카드를 `dueLesson` 빠른 순으로, **개수 제한 없음**. `mode: 'quiz'`.
2. **신규 intro `newCap`개** — 아직 카드가 없는(미도입) 항목을 교육 순서대로 최대 `newCap`(기본 6)개. `mode: 'intro'`.
3. **폴백** — 1·2가 모두 비면(전부 도입·미due) 낮은 box부터 `newCap`개 복습.

따라서:

| 상황 | 세션 구성 | 길이 |
| --- | --- | --- |
| 콜드스타트 | 신규 intro 6 | 6 (기존과 동일 → 간격학습 유지) |
| 복귀(예: due 15) | due 15 + 신규 6 | 21 |
| 전부 학습·미due | 최약체 복습 6 | 6 |

- 기존 `selectLessonItems`(총량을 `size`로 캡)는 **그대로 유지**한다. 단위 테스트가 검증하는 1차 프리미티브이며, 의미가 다르므로(총량 캡 vs 복습 무한) 건드리지 않고 새 함수를 추가했다.
- 호출부는 `App.startLesson`(`src/components/App.tsx:107`) 한 곳. 카테고리를 고르면 `scopeItems`가 그 범위로 좁아져 세션 길이도 자연히 제어된다.

## 4. 세션 안 이동: 스킵 / 뒤로 / 완료

`src/components/Lesson.tsx`

- **단계 인덱싱**: `results`/`picks`는 append가 아니라 단계 위치로 인덱싱된다. 그래서 앞뒤로 오가도 답이 보존되고, 이미 푼 단계는 읽기 전용(피드백)으로 다시 볼 수 있다.
- **스킵 바**(`:155`): 상단에 `≫1 ≫5 ≫10`. 뒤로가기(`←`)와 짝을 이뤄 전후 이동.
- **`skipForward(n)`**(`:121`):
  - 현재 단계가 미응답이면 `skipped: true`(중립 = 채점 제외·SRS 카드 그대로)로 기록.
  - 이미 응답한 단계(복습 중)에서의 전방 스킵은 채점을 바꾸지 않는 순수 이동.
  - `index + n`이 마지막을 넘으면 `onComplete(...)`로 **세션 완료**. 건너뛴 중간 단계는 `null`로 남아 뒤로 가서 풀 수 있다.
- **`onBack`**(`:140`): `index - 1`. `ProgressHeader`가 `index === 0`에서 자동 비활성화.

> 끝을 넘어가는 모든 경로(정상 완주, ≫스킵 오버슈트)는 `onComplete`로 수렴한다. 6문제 시절과 달리 이제 "끝"은 세션 전체의 끝이라 ≫5·≫10이 의미를 갖는다.

## 5. SRS 반영 (`finishLesson`)

`src/components/App.tsx:128`

- 세션 결과를 한 번에 적용. `base = isReview ? lessonsDone : lessonsDone + 1` → **세션 1회 = lessonsDone +1**.
  - `skipped` 항목: 카드 그대로(여전히 due → 다음 세션 재등장).
  - `intro`: `introducedCard(base)` (box1, 다음 세션 due).
  - `quiz`: `applyAnswer(card, correct, base)`.
- 간격(`INTERVALS`)의 단위는 이제 사실상 "세션"이다. 세션 길이가 가변이라 6문제 고정 시절보다 due가 파도(wave)처럼 몰릴 수 있으나, 세션 간 간격은 유지되어 spaced repetition은 기능한다.
- **복습(`startReview`, `:121`)은 연속화 대상이 아니다.** 틀린/약한 항목만 모은 고정 세트이고 `isReview=true`라 lessonsDone를 올리지 않는다.

## 6. 화면 공통 골격 (참고)

스킵/세션과 같은 시기에 정리한 공유 컴포넌트:

- `ProgressHeader` — ✕ + (옵션)← + 진행바 + 카운터. Lesson·TopikExam 공용.
- `ConfirmDialog` — 확인 모달. Lesson 종료 / TOPIK 종료·제출 공용(`onEscape` 옵션).
- `ChoiceGrid` — 4지선다 그리드. `pressable` 옵션으로 두 인터랙션 모델 구분:
  - 레슨(탭 즉시 채점) → `pressable={false}`, `aria-pressed` 없음 (`Quiz.tsx:106`).
  - TOPIK(선택 후 제출) → 기본값 `true`, `aria-pressed` 유지.

## 7. 튜닝 포인트

- **신규 펜싱 개수**: `selectSessionItems`의 `newCap`(기본 `LESSON_SIZE = 6`). 한 곳만 바꾸면 세션당 신규 도입량이 바뀐다.
- **스킵 폭**: `Lesson.tsx`의 스킵 바 `skipForward(1|5|10)` 호출 3개.
- **세션을 다시 짧게(소량 반복)** 돌리려면 `startLesson`을 `selectSessionItems` → `selectLessonItems`로 되돌리면 된다(프리미티브가 남아 있음).

## 8. 동작 검증 / 함정

- 단위(`pnpm test`): `src/lib/srs.test.ts`의 `selectSessionItems` 4건(콜드스타트=신규6 / due 무제한+신규 펜싱 / 펜싱 캡 / 폴백), `Lesson.test.tsx` 스킵·뒤로 6건.
- e2e(`pnpm test:e2e`): 콜드스타트는 6문제 그대로라 기존 통과. 단, **세션 2 = 복습 + 신규**로 바뀌어, 6문제 완료를 가정하던 e2e 2건(`home shows review weak`, `complete screen shows review button`)은 신규 인트로를 `次へ`로 통과해 완료에 도달하도록 수정했다.
- 실기 확인: due 15건 주입 → 세션 `1/21`, ≫10→`11/21`, ≫5→`16/21`, ←→`15/21`, 콘솔 에러 0.
- ⚠️ **PWA 서비스워커 캐시 함정**: `vite build` 후에도 브라우저가 옛 번들을 캐시해 변경이 안 보일 수 있다(검증 중 `1/6`이 떠서 버그로 오인). SW unregister + `caches` 비우고 재확인할 것.

## 9. 관련 파일

| 파일 | 역할 |
| --- | --- |
| `src/lib/srs.ts` | `selectSessionItems`(신규), `selectLessonItems`(프리미티브), 카드/간격 로직 |
| `src/components/App.tsx` | `startLesson`(세션 시작), `finishLesson`(SRS 반영), `startReview` |
| `src/components/Lesson.tsx` | 세션 진행·스킵 바·`skipForward`·뒤로·완료 |
| `src/components/Quiz.tsx` / `ChoiceGrid.tsx` | 문제 카드·선택지 그리드(`pressable`) |
| `src/components/ProgressHeader.tsx` / `ConfirmDialog.tsx` | 공유 헤더·모달 |
| `src/lib/srs.test.ts` / `Lesson.test.tsx` / `e2e/lesson.spec.ts` | 테스트 |
