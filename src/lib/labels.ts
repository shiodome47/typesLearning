// ─────────────────────────────────────────────────────────────
// src/lib/labels.ts
// カテゴリ・難易度の表示ラベル/スタイルを一元管理する。
// Record<Category, ...> / Record<Difficulty, ...> で型付けしているため、
// curriculum/types.ts に種別を追加するとここでコンパイルエラーになり、
// 追記漏れを防げる。
// ─────────────────────────────────────────────────────────────

import type { Category, Difficulty, LessonLanguage } from "@curriculum/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  "type-basics": "型の基礎",
  functions: "関数",
  objects: "オブジェクト",
  "union-literal": "Union/Literal",
  "type-guards": "型ガード",
  generics: "Generics",
  async: "非同期",
  "error-handling": "エラー処理",
  crud: "CRUD",
  "react-basics": "React",
  "runtime-safety": "実行時安全",
  "code-review": "コード診断",
  runes: "リアクティビティ",
  components: "コンポーネント",
  template: "テンプレート",
  sveltekit: "SvelteKit",
  a11y: "アクセシビリティ",
  tooling: "ガードレール",
  compact: "Compact",
  "zk-privacy": "公開と秘匿",
};

export const LANGUAGE_LABELS: Record<LessonLanguage, string> = {
  typescript: "TypeScript",
  svelte: "Svelte",
  compact: "Compact",
  effect: "Effect",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "入門",
  2: "基礎",
  3: "中級",
  4: "応用",
};

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  1: "text-green-700 bg-green-50 border-green-200",
  2: "text-blue-700 bg-blue-50 border-blue-200",
  3: "text-purple-700 bg-purple-50 border-purple-200",
  4: "text-red-700 bg-red-50 border-red-200",
};

// カテゴリラベルの安全な取得（未知の値は ID をそのまま返す）
export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as Category] ?? category;
}
