// ─────────────────────────────────────────────────────────────
// curriculum/types.ts
// 教材データの型定義（Phase1設計をそのまま使用）
// ─────────────────────────────────────────────────────────────

export type Difficulty = 1 | 2 | 3 | 4;

export type Category =
  | "type-basics"    // 型の基礎
  | "functions"      // 関数
  | "objects"        // オブジェクト・配列
  | "union-literal"  // Union/Literal型
  | "type-guards"    // 型ガード
  | "generics"       // Generics
  | "async"          // 非同期
  | "error-handling" // エラー処理
  | "crud"           // CRUDロジック
  | "react-basics";  // React連携（将来拡張用）

export type HintLevel = 1 | 2 | 3; // 1: 方向性, 2: 構文ヒント, 3: ほぼ答え

export interface Hint {
  level: HintLevel;
  text: string;
}

export interface Checkpoint {
  id: string;
  description: string; // 「〇〇が書けているか？」
}

export interface Lesson {
  id: string;          // 例: "ts-01-variable-types"
  order: number;       // 表示順（ソート用）
  title: string;
  category: Category;
  difficulty: Difficulty;

  goal: string;        // 「〇〇できるようになる」（1文）
  explanation: string; // 概念の短い説明（3〜5文）

  starterCode: string;  // 白紙練習の開始コード
  modelAnswer: string;  // お手本コード

  hints: Hint[];                // 段階ヒント（3段階）
  checkpoints: Checkpoint[];    // 自己採点ポイント（3〜5個）

  tags: string[];
  relatedIds: string[];

  // 将来拡張用（初級版/実用版など）
  variants?: {
    label: string;
    starterCode: string;
    modelAnswer: string;
  }[];
}

export interface Curriculum {
  version: string;
  lessons: Lesson[];
}
