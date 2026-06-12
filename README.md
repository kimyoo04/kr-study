# かんこくご Pocket

スマホでできる韓国語の独学 — ハングルから。React + Vite + PWA、GitHub Pages 静的ホスティング。

Duolingo スタイルの短い(2〜3分)レッスン、即時の効果音フィードバック、ブラウザ内蔵の韓国語発音(TTS)、
軽量な Leitner 間隔反復(SRS)。バックエンドなし — 進捗はブラウザの localStorage に保存。

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
  data/hangul.ts      ハングル + デッキ定義 (基本/発展/単語/外来語/文法 など)
  data/words.ts       基礎単語、loanwords.ts 外来語、grammar.ts 文法例文
  lib/srs.ts          純粋な SRS ロジック (box/interval/due/レッスン選択) — 副作用なし
  lib/quiz.ts         純粋な問題生成 (distractor: 同じ行を優先)
  lib/kata.ts         ハングル → カタカナ読み変換 (会話/敬語デッキの読みがな)
  lib/speak.ts        Web Speech API 発音 (ボイス検出/ジェスチャーゲート/フォールバック)
  lib/sound.ts        Web Audio 効果音 (mp3 不要)
  hooks/useProgress.ts  localStorage 永続化 (プライベートモードのフォールバック)
  components/         App(画面遷移) / Home / Lesson / Complete / Search
```

ドメインロジック(`lib/srs.ts`, `lib/quiz.ts`)は純粋関数なので、モックなしでユニットテストできます。

## デプロイ

`main` にプッシュすると GitHub Actions がテスト → ビルド → GitHub Pages デプロイ。
リポジトリの Settings → Pages → Source を **GitHub Actions** に設定してください。

サブパス(`/kr-study/`)でのホスティングのため、`vite.config.ts` の `base` と PWA manifest の
`start_url`/`scope` がすべてこのパスを使います。リポジトリ名が違う場合は `base` だけ変えれば OK。

## ロードマップ

- v1: ハングル基本 100 音節(反切表) + 発展 134(激音/濃音/合成母音 11 字/パッチム 7 代表音) ✅
- v2: 単語 554 / 外来語 315 / 文法 507(TOPIK 初級 52 パターン別例文) ✅
- v3: 会話 427(カタカナ読み付き) / 敬語 48 / 漢字語 451 / 助数詞 115 / オノマトペ 64 ✅
- v4: 横断検索、カテゴリ選択(行/パターン/状況別)、リスニングモード ✅ — 全 10 デッキ・計 2,715 項目
- v5: 韓国語教育標準への検証 — 国立国語院の字母体系(基本字母 24 + 쌍자음 5 + 이중모음 11)、
  標準発音法のパッチム 7 代表音分類、TOPIK 初級文法網羅、ローマ字表記法(激音化統一)、
  ネイティブ監査による訳語・表記の修正 ✅
- v6+: コンテンツ拡張(会話・漢字語)、学習統計
