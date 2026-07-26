// ─────────────────────────────────────────────────────────────
// 学習の手引き: 37件をどう配分するか
//
// 全部を同じ重さでやる必要はない。
// 「AIが書いたコードを判断できるか」に直結するものだけ時間をかけ、
// 残りは読んで分かればよい／必要になったら引けばよい、と割り切る。
//
// レッスンを追加したときの分類漏れは scripts/verify-curriculum.mjs で検出する。
// ─────────────────────────────────────────────────────────────

export type Tier = "focus" | "foundation" | "reference";

export interface TierInfo {
  id: Tier;
  label: string;
  summary: string;
  howTo: string;
  accent: string; // Tailwind クラス
}

export const TIER_INFO: Record<Tier, TierInfo> = {
  focus: {
    id: "focus",
    label: "時間をかける",
    summary:
      "判断力に直結します。AIが書いたコードをレビューする力そのものなので、ここだけは繰り返す価値があります。",
    howTo: "1件30分。「これが無いと、どんな入力で落ちるか」を口に出して説明できるまで。",
    accent: "border-red-300 bg-red-50 text-red-900",
  },
  foundation: {
    id: "foundation",
    label: "読んで理解する",
    summary:
      "土台です。白紙で書けるようになる必要はありません。読んで意味が分かれば十分です。",
    howTo: "1件10分。手本を書き写して、意味が分かったら次へ。",
    accent: "border-blue-300 bg-blue-50 text-blue-900",
  },
  reference: {
    id: "reference",
    label: "必要になったら引く",
    summary:
      "辞書として使ってください。順番に潰す必要はありません。仕事で出てきたときに開けば間に合います。",
    howTo: "今はやらなくてよい。詰まったときに検索して戻ってくる場所。",
    accent: "border-gray-300 bg-gray-50 text-gray-700",
  },
};

/** 時間をかける価値があるもの */
export const FOCUS_LESSONS = [
  "ts-15-api-fetch",
  "ts-19-discriminated-union",
  "ts-20-exhaustive-check",
  "ts-33-async-state-union",
  "ts-34-diagnose-as-cast",
  "ts-35-diagnose-ssr-hook",
  "ts-36-diagnose-any-leak",
  "ts-37-diagnose-missing-exhaustive",
];

/** 読んで理解できればよいもの */
export const FOUNDATION_LESSONS = [
  "ts-01-variable-types",
  "ts-02-function-types",
  "ts-03-object-types",
  "ts-04-type-alias",
  "ts-05-interface",
  "ts-06-union-literal",
  "ts-07-type-guards",
  "ts-08-array-types",
  "ts-09-optional",
  "ts-10-crud-basics",
  "ts-11-generics-basics",
  "ts-12-promise",
  "ts-13-async-await",
  "ts-14-error-handling",
];

/** 必要になったときに引くもの */
export const REFERENCE_LESSONS = [
  "ts-16-component-props",
  "ts-17-usestate",
  "ts-18-form-input",
  "ts-21-utility-types",
  "ts-22-record-type",
  "ts-23-keyof",
  "ts-24-mapped-types",
  "ts-25-useeffect-cleanup",
  "ts-26-usecontext",
  "ts-27-usereducer",
  "ts-28-custom-hook-pattern",
  "ts-29-generics-constraints",
  "ts-30-utility-returntype",
  "ts-31-satisfies",
  "ts-32-generic-react-component",
];

export const TIER_LESSONS: Record<Tier, string[]> = {
  focus: FOCUS_LESSONS,
  foundation: FOUNDATION_LESSONS,
  reference: REFERENCE_LESSONS,
};

/** レッスンIDからランクを引く */
export function tierOf(lessonId: string): Tier | undefined {
  if (FOCUS_LESSONS.includes(lessonId)) return "focus";
  if (FOUNDATION_LESSONS.includes(lessonId)) return "foundation";
  if (REFERENCE_LESSONS.includes(lessonId)) return "reference";
  return undefined;
}
