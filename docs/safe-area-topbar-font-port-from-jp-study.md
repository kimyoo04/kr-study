# jp-study → kr-study 이식 가이드: safe-area / 상단바 / 로고 폰트

> 출처: jp-study 브랜치 `feature/home-safe-area-topbar` (커밋 3개)
> 대상: kr-study (미러 구조 자매 앱). 아래는 각 커밋 요약 + kr-study 적용 여부/방법.

## 요약 — jp-study에서 무엇을 했나

| 커밋 | 내용 | 파일 |
|------|------|------|
| `a22fbf2` | 홈 상단을 safe-area 대응 네이티브 상단바로 재구성 + 전역 `--screen-top` | styles.css, Home.tsx, e2e/home.spec.ts |
| `5016cf1` | 가로모드 좌우 safe-area (`.screen` 수평 패딩) | styles.css |
| `e64fd31` | 로고 워드마크에 Zen Maru Gothic 디스플레이 서체 | styles.css, assets/fonts |

핵심 원리: 상/하/좌/우 여백은 모두 **`.screen` 한 곳**에서 나오고 11개 화면 전부 `<main className="screen">`를 루트로 쓰므로, `.screen` 규칙만 고치면 전 페이지에 일괄 적용된다.

---

## 1. 상단 safe-area (`--screen-top`)

**jp-study 변경 (버그 수정):**
```css
/* was: --screen-top: 40px;  (env 미포함 → 노치 밑부터 40px, 상태바에 달라붙음) */
--screen-top: max(20px, calc(env(safe-area-inset-top) + 12px));
.screen { padding: var(--screen-top) 20px calc(24px + env(safe-area-inset-bottom)); }
```

**kr-study 적용: 불필요 (이미 다르게 처리 중).**
kr-study는 `styles.css:59`에서 이미 `padding: calc(var(--screen-top) + env(safe-area-inset-top)) ...`로 inset을 더하고 있어 상태바 충돌 버그가 없다. jp-study는 flat 40px 버그가 있어서 고친 것.
- 차이: kr-study = `40px + inset`(노치 87px / 비노치 40px), jp-study = `max(20px, inset+12)`(노치 59px / 비노치 20px).
- 선택: 두 앱의 상단 여백감을 **통일하고 싶으면** kr-study도 jp-study 방식으로 맞출 수 있으나, 기능상 필수는 아님.

## 2. 가로모드 좌우 safe-area

**jp-study 변경:**
```css
.screen {
  padding: var(--screen-top) max(20px, env(safe-area-inset-right))
    calc(24px + env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
}
```

**kr-study 적용: 직접 적용 권장.**
kr-study 수평 패딩도 고정 `20px`라 가로모드 노치에서 콘텐츠가 잘린다. 위와 동일하게 4-value 패딩으로 교체(`top right bottom left`). 세로모드(inset=0)는 20px 그대로라 영향 없음.

## 3. 홈 상단바 재구성 (절대배치 → flex 행)

**jp-study 변경:** 검색·스피커를 `.home-head` 안 `position:absolute`에서 빼내 별도 `.home-topbar` flex 행으로. `.home`은 `justify-content: flex-start`(상단 앵커).

```css
.home { justify-content: flex-start; }
.home-topbar {
  display: flex; align-items: center; justify-content: space-between;
  min-height: 44px;
}
.sfx-toggle, .search-btn {
  background: var(--surface); border: none; border-radius: 50%;
  width: 44px; height: 44px; font-size: 20px; cursor: pointer;
  /* position:absolute + top/left/right 제거 */
}
```
```tsx
// Home.tsx: 두 버튼을 <header className="home-head"> 밖 <div className="home-topbar">로 이동
<div className="home-topbar">
  <button className="search-btn" ...>🔍</button>
  <button className="sfx-toggle" ...>{sfx ? '🔊' : '🔇'}</button>
</div>
<header className="home-head">
  <h1 className="logo">かんこくご Pocket</h1>
  ...
</header>
```

**kr-study 적용: 직접 적용 가능.**
kr-study도 동일하게 `.home-head` 안 `position:absolute` 검색/스피커 버튼(`styles.css:71`)을 쓴다. 구조가 같아 그대로 이식. 단 kr-study 버튼 `top`은 `calc(env(inset-top) + var(--screen-top))`이므로 절대배치 제거 시 그 규칙도 함께 정리.

## 4. 로고 디스플레이 폰트 (Zen Maru Gothic)

**jp-study 변경:** 로고 `にほんご Pocket`만 Zen Maru Gothic 700. `text=` 파라미터로 필요 글리프만 subset한 2.2KB woff2를 self-host. 4KB 미만이라 Vite가 CSS에 base64 인라인 → 추가 요청 0, PWA 오프라인 자동.

```css
@font-face {
  font-family: 'Zen Maru Gothic'; font-style: normal; font-weight: 700;
  font-display: swap;
  src: url('./assets/fonts/zen-maru-gothic-logo.woff2') format('woff2');
}
.logo { font-family: 'Zen Maru Gothic', system-ui, sans-serif; font-weight: 700; ... }
```

**kr-study 적용: 동일 폰트, subset 텍스트만 변경.**
kr-study 로고는 `かんこくご Pocket` (역시 일본어 히라가나 + 라틴) → **같은 Zen Maru Gothic** 사용, subset만 `かんこくご Pocket`로. subset woff2 재생성:

```bash
UA="Mozilla/5.0 ... Chrome/126.0 Safari/537.36"
mkdir -p src/assets/fonts
CSS=$(curl -s -H "User-Agent: $UA" --get \
  "https://fonts.googleapis.com/css2" \
  --data-urlencode "family=Zen Maru Gothic:wght@700" \
  --data-urlencode "text=かんこくご Pocket" \
  --data-urlencode "display=swap")
W2URL=$(echo "$CSS" | sed -n 's/.*src: url(\([^)]*\)).*/\1/p')
curl -s -H "User-Agent: $UA" "$W2URL" -o src/assets/fonts/zen-maru-gothic-logo.woff2
# → 약 2KB. @font-face + .logo 규칙은 jp-study와 동일하게 추가.
```

## 이식 우선순위 (권장)

1. **가로모드 좌우 safe-area** (§2) — 실제 버그(가로모드 잘림), 두 앱 공통 누락. 바로 적용.
2. **홈 상단바 재구성** (§3) — 겹침 해소 + 크로스페이지 헤더 패턴 일관화.
3. **로고 폰트** (§4) — 브랜드 인상, 초경량. subset 텍스트만 바꾸면 됨.
4. **상단 `--screen-top` 통일** (§1) — 선택. 기능 필수 아님, 두 앱 여백감 통일 원할 때만.

## 검증 방법 (jp-study에서 쓴 것)

- 전 페이지 상단 균일성: 브라우저 콘솔에서 각 화면 `getComputedStyle(document.querySelector('.screen')).paddingTop` 비교 → 전부 동일해야 함.
- 홈 상단바 회귀: `e2e/home.spec.ts` 스모크(검색·스피커 버튼 렌더).
- 실제 노치 인셋(env 숫자)은 헤들리스 불가 → 실기기/시뮬레이터 최종 확인.
