# TypeScript 判断力トレーニング

手本を見てゼロから書く「白紙練習」に加え、**欠陥のあるコードを読んで危険を見抜く「診断」** を行う学習アプリ。

## 学習コンセプト

書けることは出発点であって、ゴールではありません。実務で価値になるのは
**書かれたコードを信用してよいか判断できること**です。本アプリは2種類の練習を用意しています。

| モード | 流れ | 鍛えるもの |
|--------|------|-----------|
| **白紙練習**（write） | 読む → 理解する → 手本を隠す → ゼロから書く → 自動採点 | 型を自分で構築する力 |
| **診断**（diagnose） | 症状を読む → 欠陥コードを読む → 危険を見抜く → 修正して自動採点 | 書かれたコードを評価する力 |

診断モードが扱うのは「**型チェックは通るのに本番で落ちる**」コードです。
`as` による偽りの型付け、SSR で存在しない `window`、`any` の漏洩、網羅性チェックの欠落など、
型が守ってくれない領域を意図的に扱います。

## 「なぜ必要か」を先に置く

各レッスンは `why` を必須で持ちます。仕組みの説明（`explanation`）より**前**、画面の最上部に表示されます。

```ts
why: {
  problem: string;  // その道具が無いと何が起きるのか。具体的な失敗の物語
  insight: string;  // その道具は結局なにをしてくれるのか。定義ではなく直感で
}
```

正しいだけの説明は理解を生みません。「`never` は到達できない値の型です」は定義であって直感ではなく、
読んでも「なぜこれを使うのか」が分かりません。そこで仕組みを説明する前に、
**その仕組みが無いと実際に何が起きるのか**を具体的な場面で伝えます。

執筆の原則:

- **抽象的なまとめを書かない** — ×「分岐漏れが生じやすい」 ○「レシートの支払い方法が空欄のまま客に渡り、問い合わせが来て初めて気づく」
- **problem は具体的な場面で** — 誰が何をして、何が起きて、いつ気づくのか
- **用語は定義ではなく直感で** — ×「到達できない値の型」 ○「もう何も残っていない、という意味の型」
- 段落は `\n\n` で区切る。コード片はバッククォートで囲む

見本は `curriculum/phase5-advanced-patterns/ts-20-exhaustive-check.ts` と
`curriculum/phase3-real-app/ts-15-api-fetch.ts` にあります。

## 自動採点

確認ポイントは自己申告ではなく、**TypeScript の型診断で機械的に判定**されます。

学習者のコードに「隠しアサーション」を連結し、Monaco 同梱の TypeScript ワーカーで診断を取得します。
サーバーも外部APIも使わず、ブラウザ内で完結します。

```ts
// 例: getTodo の戻り値が Todo | undefined になっているか
type _c = Expect<Equal<ReturnType<typeof getTodo>, Todo | undefined>>;
```

2種類の判定があります。

- `kind: "type"` … 診断が出なければ合格（意図した型になっている）
- `kind: "expect-error"` … 診断が**出れば**合格（不正な使い方を型で弾けている）

> **注意**: `any` の検出は「値が使えるか」では判定できません。`any` は何でも通すためです。
> 必ず `Expect<Equal<typeof x, 具体型>>` のように**型の同一性そのもの**を問う必要があります。

## 技術スタック

- **Next.js 15** (App Router)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v3**
- **Monaco Editor**（エディタ兼、採点用の型チェッカー）
- 進捗保存: **localStorage**（サーバー不要・env不要）

## セットアップ

```bash
npm install
npm run dev     # http://localhost:3000
```

### 検証コマンド

```bash
npm run type-check         # アプリ本体の型チェック
npm run verify:curriculum  # 教材コードの型チェック + 採点仕様の検証
npm run build              # 本番ビルド
```

`verify:curriculum` は重要です。教材の `starterCode` / `modelAnswer` は**テンプレート文字列なので
`tsc` の対象外**であり、放置すると模範解答がコンパイルできない状態に気づけません。
このハーネスが以下を保証します。

1. 全レッスンの模範コードに型エラーが無いこと
2. 各 `checkpoint.verify` が模範解答に対して正しく合格すること（採点仕様自体の正しさ）
3. `relatedIds` が実在する教材を指していること
4. 診断レッスンの欠陥コードが**型チェックを通ること**（型で気づけては診断練習にならない）

ブラウザ側の採点と同じ React シム・同じ前提（`curriculum/verifySupport.ts`）を使うため、
ここで通れば実際の採点でも同じ結果になります。

## ファイル構成

```
typesLearning/
├── curriculum/                     # 教材データ
│   ├── types.ts                    # Lesson は kind による判別可能Union
│   ├── verifySupport.ts            # 採点の共通前提（ブラウザ/Node で共有）
│   ├── phase1-type-basics/ 〜 phase6-modern-ts/
│   └── phase7-judgment/            # 回収レッスン + 診断レッスン
├── scripts/
│   └── verify-curriculum.mjs       # 教材検証ハーネス（CI で実行）
└── src/
    ├── app/lesson/[id]/
    │   ├── PracticeClient.tsx      # kind で振り分け（assertNever で分岐漏れ検出）
    │   ├── WritePractice.tsx       # 白紙練習モード
    │   ├── DiagnosePractice.tsx    # 診断モード
    │   └── LessonChrome.tsx        # 両モード共通の表示部品
    ├── components/
    │   ├── CheckpointPanel.tsx     # 自動採点 UI
    │   └── ...
    ├── hooks/
    │   ├── useProgress.ts          # 進捗管理（保存はデバウンス）
    │   └── useEditorPrefs.ts       # テーマ・型エラー表示
    └── lib/
        ├── labels.ts               # Record<Category,...> で追加漏れを型で検出
        ├── monaco/setup.ts         # TS 設定・React シム・インスタンス共有
        └── verify/browserEngine.ts # 採点エンジン
```

## 教材の追加方法

1. `curriculum/phaseN-*/ts-XX-topic.ts` を作成し、`WriteLesson` か `DiagnoseLesson` として定義
2. `kind` を必ず指定する（判別可能Unionの判別子）
3. フェーズの `index.ts` の配列に追加
4. `npm run verify:curriculum` で模範解答と採点仕様を検証
5. `npm run build` で確認

`checkpoint.verify` は任意です。付けない場合は従来どおり自己申告のチェックボックスになります。
**カバー率より正確さを優先**してください。検証できないものに無理に付けると誤判定になります。

## Vercel デプロイ

GitHub リポジトリを Vercel と連携すると自動デプロイされます。

## ライセンス

MIT
