# TypeScript 白紙練習

手本を見て理解し、ゼロから再現する。TypeScript の基礎構造を白紙から書けるようにする学習アプリ。

## 学習コンセプト（白紙練習）

```
読む → 理解する → 手本を隠す → ゼロから書く → 答え合わせ → 再挑戦
```

## 技術スタック

- **Next.js 15** (App Router)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v3**
- 進捗保存: **localStorage**（サーバー不要・env不要）

## セットアップ

### 前提

- Node.js 18 以上
- npm（または yarn / pnpm）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/<your-username>/typesLearning.git
cd typesLearning

# 2. 依存関係をインストール
npm install

# 3. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開く。

### ビルド確認

```bash
npm run build
npm run start
```

### 型チェック

```bash
npm run type-check
```

## ファイル構成

```
typesLearning/
├── curriculum/                      # 教材データ（TypeScript配列）
│   ├── types.ts                     # Lesson型定義
│   ├── index.ts                     # allLessons / getLessonById
│   └── phase1-type-basics/          # フェーズ1: 型の基礎（MVP: 5件）
│       ├── ts-01-variable-types.ts
│       ├── ts-04-type-alias.ts
│       ├── ts-06-union-literal.ts
│       ├── ts-11-generics-basics.ts
│       ├── ts-13-async-await.ts
│       └── index.ts
└── src/
    ├── app/
    │   ├── page.tsx                 # 一覧画面（Server Component）
    │   └── lesson/[id]/
    │       ├── page.tsx             # Server Component + generateStaticParams
    │       └── PracticeClient.tsx   # 練習画面（Client Component）
    ├── components/
    │   ├── CodeEditor.tsx           # textarea wrapper（Monaco差し替えポイント）
    │   ├── HintPanel.tsx
    │   ├── LessonCard.tsx
    │   ├── LessonList.tsx
    │   └── ModelAnswer.tsx
    ├── hooks/
    │   └── useProgress.ts           # localStorage管理hook
    └── lib/
        └── progress.ts              # 進捗型 + ユーティリティ
```

## 教材の追加方法

1. `curriculum/phase1-type-basics/` に新しい `ts-XX-topic.ts` を作成
2. `Lesson` 型に従ってデータを定義
3. `curriculum/phase1-type-basics/index.ts` の配列に追加
4. `npm run build` で確認

## Vercel デプロイ

```bash
# Vercel CLI でデプロイ（初回）
npx vercel

# 本番デプロイ
npx vercel --prod
```

または GitHub リポジトリを Vercel と連携すると自動デプロイ。

## 将来の拡張ロードマップ

| 優先度 | 機能 | 備考 |
|--------|------|------|
| 高 | Monaco Editor | `CodeEditor.tsx` の内部差し替えのみ |
| 高 | 教材追加（フェーズ2〜3） | `curriculum/phase2-*/` を追加するだけ |
| 中 | Hono API + DB保存 | `src/app/api/` に Route Handler を追加 |
| 中 | AI採点 | Claude API連携 |
| 低 | 認証 | NextAuth.js |
| 低 | React教材 | `curriculum/phase4-react/` を追加 |

## ライセンス

MIT
