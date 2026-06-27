# かんこくご Pocket

スマホでできる韓国語の独学 — ハングルから。React + Vite + PWA、GitHub Pages 静的ホスティング。

Duolingo スタイルのレッスン、即時の効果音フィードバック、ブラウザ内蔵の韓国語発音(TTS)、
軽量な Leitner 間隔反復(SRS)。穴埋め問題、TOPIK I/II のミニ模試(自動採点)、流し聞き(自動再生リスニング)、
連続セッション内の 1/5/10 問スキップと前後移動も。バックエンドなし — 進捗はブラウザの localStorage に保存。

## 開発

```bash
pnpm install
pnpm dev          # http://localhost:5173/kr-study/
pnpm test         # ユニットテスト (Vitest)
pnpm test:e2e     # E2E (Playwright) — 初回のみ: pnpm exec playwright install chromium
pnpm build        # プロダクションビルド -> dist/
pnpm preview      # ビルド結果のプレビュー
```

## 構成

```
src/
  data/hangul.ts      ハングル(基本/発展)+ 全デッキ定義 (DECKS レジストリ)
  data/{words,loanwords,counters,mimetic,hanja}.ts   語彙系デッキ
  data/{grammar,phrases,keigo}.ts                     例文系デッキ
  data/cloze.ts       穴埋め(空欄補充)デッキ
  data/topik/         TOPIK 模擬試験の問題バンク (TOPIK I/II・聞き取り/読解)
  lib/srs.ts          純粋な SRS ロジック (box/interval/due/セッション選択) — 副作用なし
  lib/quiz.ts         純粋な問題生成 (distractor: 同じ行を優先)
  lib/topik.ts        TOPIK 模試のサンプリング/採点/永続化
  lib/kata.ts         ハングル → カタカナ読み変換 (会話/敬語デッキの読みがな)
  lib/{speak,sound,search}.ts   TTS 発音 / Web Audio 効果音 / 横断検索
  hooks/             useProgress (SRS永続化) / useSettings / useTopikExam
  components/         App(画面遷移) / Home / Lesson(+Quiz/IntroCard) / Complete /
                     ListenPlayer(流し聞き) / Search / Topik*(模試) /
                     共有 UI(ChoiceGrid / ProgressHeader / ConfirmDialog)
```

ドメインロジック(`lib/srs.ts`, `lib/quiz.ts`, `lib/topik.ts`)は純粋関数なので、モックなしでユニットテストできます。

## デプロイ

`main` にプッシュすると GitHub Actions がテスト → ビルド → GitHub Pages デプロイ。
リポジトリの Settings → Pages → Source を **GitHub Actions** に設定してください。

サブパス(`/kr-study/`)でのホスティングのため、`vite.config.ts` の `base` と PWA manifest の
`start_url`/`scope` がすべてこのパスを使います。リポジトリ名が違う場合は `base` だけ変えれば OK。

## ロードマップ

- v1: ハングル基本 100 音節(反切表) + 発展 134(激音/濃音/合成母音 11 字/パッチム 7 代表音) ✅
- v2: 単語 554 / 外来語 315 / 文法 507(TOPIK 初級 52 パターン別例文) ✅
- v3: 会話 502(カタカナ読み付き) / 敬語 48 / 漢字語 501 / 助数詞 115 / オノマトペ 64 ✅
- v4: 横断検索、カテゴリ選択(行/パターン/状況別)、リスニングモード ✅
- v5: 韓国語教育標準への検証 — 国立国語院の字母体系(基本字母 24 + 쌍자음 5 + 이중모음 11)、
  標準発音法のパッチム 7 代表音分類、TOPIK 初級文法網羅、ローマ字表記法(激音化統一)、
  ネイティブ監査による訳語・表記の修正 ✅
- v6: 穴埋め(空欄補充)504 ✅ / TOPIK 模擬試験(TOPIK I 175・II 169 = 計 344 問、聞き取り・読解、自動採点)✅ /
  流し聞き(自動再生リスニング)✅
- v7: 連続学習セッション(復習は全件・新規はフェンス)+ 1/5/10 問スキップ・前後移動 ✅
  — 全 11 デッキ・計 3,344 項目
- v8+: 学習統計、コンテンツ拡張
