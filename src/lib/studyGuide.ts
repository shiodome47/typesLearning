// ─────────────────────────────────────────────────────────────
// 学習の手引き: どう配分するか
//
// 全部を同じ重さでやる必要はない。ただし配分の理由は言語で違う。
//
// TypeScript: 構文を覚える価値は下がった。「AIの出力を判断できるか」
//   に直結するものだけ時間をかける。
// Svelte: 目的が「AIが使えない状況でも書ける」という保険なので、
//   中核構文は手が覚えるまでやる価値がある。ただし中核は小さい。
//
// レッスン追加時の分類漏れは scripts/verify-curriculum.mjs で検出する。
// ─────────────────────────────────────────────────────────────

import type { LessonLanguage } from "@curriculum/types";

// tutorial は「1本のアプリを順番に作り上げる連続チュートリアル」用。
// 拾い読みが前提の他のランクとは性質が違うので分けてある。
export type Tier = "focus" | "tutorial" | "foundation" | "reference";

export interface TierInfo {
  label: string;
  summary: string;
  howTo: string;
  accent: string; // Tailwind クラス
}

export const TIER_INFO: Record<LessonLanguage, Record<Tier, TierInfo>> = {
  typescript: {
    focus: {
      label: "時間をかける",
      summary:
        "判断力に直結します。AIが書いたコードをレビューする力そのものなので、ここだけは繰り返す価値があります。",
      howTo: "1件30分。「これが無いと、どんな入力で落ちるか」を口に出して説明できるまで。",
      accent: "border-red-300 bg-red-50 text-red-900",
    },
    tutorial: {
      label: "順番に通す",
      summary: "（TypeScript 側にはありません）",
      howTo: "",
      accent: "border-gray-300 bg-gray-50 text-gray-700",
    },
    foundation: {
      label: "読んで理解する",
      summary:
        "土台です。白紙で書けるようになる必要はありません。読んで意味が分かれば十分です。",
      howTo: "1件10分。手本を書き写して、意味が分かったら次へ。",
      accent: "border-blue-300 bg-blue-50 text-blue-900",
    },
    reference: {
      label: "必要になったら引く",
      summary:
        "辞書として使ってください。順番に潰す必要はありません。仕事で出てきたときに開けば間に合います。",
      howTo: "今はやらなくてよい。詰まったときに検索して戻ってくる場所。",
      accent: "border-gray-300 bg-gray-50 text-gray-700",
    },
  },
  svelte: {
    focus: {
      label: "手が覚えるまでやる",
      summary:
        "Svelteの中核です。ここは「AIが使えないときでも書ける」ための保険なので、TypeScriptと違って本当に手を動かして覚える価値があります。中核はこれだけです。",
      howTo: "1件30分。手本を見ずに書けるまで。診断は「症状から原因を言えるか」まで。",
      accent: "border-orange-300 bg-orange-50 text-orange-900",
    },
    tutorial: {
      label: "順番に通す（SvelteKit編）",
      summary:
        "①から⑨まで通すと、物件サイトが1本できあがります。拾い読みではなく順番にやってください。前の回の続きを書くので、飛ばすと繋がりません。",
      howTo:
        "1件30〜45分。通しで1〜2日。手本を見ながらで構いません。暗記ではなく「どのファイルに書くか」が身につけば十分です。",
      accent: "border-emerald-300 bg-emerald-50 text-emerald-900",
    },
    foundation: {
      label: "読んで理解する",
      summary:
        "書ける必要はありますが、暗記までは不要です。手本を写して、何をしているか説明できれば十分です。",
      howTo: "1件15分。書き写して、意味が分かったら次へ。",
      accent: "border-blue-300 bg-blue-50 text-blue-900",
    },
    reference: {
      label: "必要になったら引く",
      summary:
        "実際にその場面に出くわしてから読むほうが早く入ります。今は「そういう問題がある」とだけ知っておけば十分です。",
      howTo: "今はやらなくてよい。SvelteKitでアプリを作り始めてから戻ってくる。",
      accent: "border-gray-300 bg-gray-50 text-gray-700",
    },
  },
};

/** 言語ごとのランク分け */
export const TIER_LESSONS: Record<LessonLanguage, Record<Tier, string[]>> = {
  typescript: {
    focus: [
      "ts-15-api-fetch",
      "ts-19-discriminated-union",
      "ts-20-exhaustive-check",
      "ts-33-async-state-union",
      "ts-34-diagnose-as-cast",
      "ts-35-diagnose-ssr-hook",
      "ts-36-diagnose-any-leak",
      "ts-37-diagnose-missing-exhaustive",
    ],
    foundation: [
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
    ],
    reference: [
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
    ],
    tutorial: [],
  },
  svelte: {
    // 中核構文4つ + 最重要の診断4つ。ここが「だいたい書ける」の本体
    focus: [
      "sv-01-reactive-basics",
      "sv-02-derived-values",
      "sv-03-diagnose-effect-sync",
      "sv-05-component-props",
      "sv-07-bindable",
      "sv-09-diagnose-each-key",
      "sv-11-diagnose-a11y",
      "sv-16-diagnose-legacy-syntax",
    ],
    foundation: [
      "sv-04-effect-teardown",
      "sv-06-diagnose-props-mutation",
      "sv-08-snippet",
      "sv-10-form-validation",
      "sv-13-routing-layout",
    ],
    // SvelteKit編。①→⑨で1本の物件サイトを作り上げる連続チュートリアル
    tutorial: [
      "sk-01-routing",
      "sk-02-load",
      "sk-03-dynamic-route",
      "sk-04-server-boundary",
      "sk-05-layout",
      "sk-06-form-actions",
      "sk-07-enhance",
      "sk-08-hooks-auth",
      "sk-09-diagnose-review",
    ],
    reference: [
      "sv-12-shared-state-class",
      "sv-14-load-data",
      "sv-15-diagnose-server-shared-state",
    ],
  },
};

/** レッスンIDからランクを引く */
export function tierOf(
  language: LessonLanguage,
  lessonId: string
): Tier | undefined {
  const tiers = TIER_LESSONS[language];
  for (const tier of ["focus", "tutorial", "foundation", "reference"] as const) {
    if (tiers[tier].includes(lessonId)) return tier;
  }
  return undefined;
}
