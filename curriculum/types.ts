// ─────────────────────────────────────────────────────────────
// curriculum/types.ts
// 教材データの型定義
//
// Lesson は kind による判別可能Union:
//   - "write"    : 手本を見て白紙から書く（従来の練習）
//   - "diagnose" : 欠陥のあるコードを見抜いて直す（コードレビュー訓練）
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
  | "react-basics"   // React連携
  | "runtime-safety" // 型と実行時のズレ（境界の検証）
  | "code-review";   // コードレビュー・欠陥診断

export type HintLevel = 1 | 2 | 3; // 1: 方向性, 2: 構文ヒント, 3: ほぼ答え

export interface Hint {
  level: HintLevel;
  text: string;
}

// ── 自動採点 ────────────────────────────────────────────────
//
// 学習者のコードに assert を連結して型診断にかけ、機械的に合否を出す。
//   "type"         : 診断が出なければ合格（意図した型になっている）
//   "expect-error" : 診断が出れば合格（不正な使い方を型で弾けている）
//
// 注意: any は何でも通してしまうため、値の使用可否ではなく
// Expect<Equal<...>> で型の同一性そのものを問うこと。
export type CheckKind = "type" | "expect-error";

export interface CheckSpec {
  kind: CheckKind;
  /** 学習者コードの後ろに連結されるアサーションコード */
  assert: string;
}

export interface Checkpoint {
  id: string;
  description: string; // 「〇〇が書けているか？」
  /** 指定すると自動採点される。無い場合は自己申告のまま */
  verify?: CheckSpec;
}

interface LessonBase {
  id: string;          // 例: "ts-01-variable-types"
  order: number;       // 表示順（ソート用）
  title: string;
  category: Category;
  difficulty: Difficulty;

  goal: string;        // 「〇〇できるようになる」（1文）
  explanation: string; // 概念の短い説明（3〜5文）

  hints: Hint[];             // 段階ヒント（3段階）
  checkpoints: Checkpoint[]; // 自己採点／自動採点ポイント

  tags: string[];
  relatedIds: string[];
}

/** 手本を見て白紙から書く従来型の練習 */
export interface WriteLesson extends LessonBase {
  kind: "write";

  starterCode: string;  // 白紙練習の開始コード
  modelAnswer: string;  // お手本コード

  // 将来拡張用（初級版/実用版など）
  variants?: {
    label: string;
    starterCode: string;
    modelAnswer: string;
  }[];
}

/** 欠陥コードの1件分 */
export interface Defect {
  id: string;
  /** 何が問題か（答え） */
  summary: string;
  /** なぜ危険か。実務で何が起きるか */
  why: string;
  /** 該当箇所の目印になるコード片 */
  marker?: string;
}

/**
 * 欠陥のあるコードを読み、危険を見抜いて修正する練習。
 * AI が書いたコードをレビューする実務に対応する。
 */
export interface DiagnoseLesson extends LessonBase {
  kind: "diagnose";

  /** 学習者に提示する欠陥入りコード */
  brokenCode: string;
  /** 見抜くべき欠陥（段階開示する） */
  defects: Defect[];
  /** 模範修正 */
  fixedCode: string;
  /** 修正版が満たすべき条件（自動採点される） */
  symptom: string;
}

export type Lesson = WriteLesson | DiagnoseLesson;

export interface Curriculum {
  version: string;
  lessons: Lesson[];
}

// ── 型ガード ────────────────────────────────────────────────
export function isWriteLesson(lesson: Lesson): lesson is WriteLesson {
  return lesson.kind === "write";
}

export function isDiagnoseLesson(lesson: Lesson): lesson is DiagnoseLesson {
  return lesson.kind === "diagnose";
}
