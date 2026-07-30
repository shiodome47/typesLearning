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
    // ここがスクラッチ編。starter にコードが1行も無い唯一の章で、
    // 「白紙のファイルを前にして何も書けない」という壁を越えるために置いている。
    tutorial: {
      label: "白紙から作る（スクラッチ編）",
      summary:
        "①〜⑪で ToDoアプリのロジックを、コードが1行も無い状態から組み立てます。他の章と違って穴埋めの枠がありません。各回で新しいことは1つだけです。構文を知っていても白紙から書けない、という壁はここでしか越えられません。",
      howTo:
        "1件10〜25分。前半は数分で終わります。⑪だけは手本を開かずに書き切ってください。開いたら閉じて、もう一度ゼロから書く。それができたら「作れる」ということです。",
      accent: "border-rose-300 bg-rose-50 text-rose-900",
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
      label: "順番に通す（SvelteKit編 → ガードレール編）",
      summary:
        "SvelteKit編①〜⑨で物件サイトを1本作り、ガードレール編①〜⑥でそれを「納品できる状態」にします。拾い読みではなく順番にやってください。前の回の続きを書くので、飛ばすと繋がりません。",
      howTo:
        "1件30〜45分。通しで2〜3日。手本を見ながらで構いません。暗記ではなく「どのファイルに書くか」「何を機械に任せるか」が身につけば十分です。",
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
  // Compact（Midnight / 現 LFDT Minokawa）。
  // 目的は TypeScript 側とも Svelte 側とも違う。構文は小さいので暗記は要らないが、
  // 「何を公開し、何を隠し、何を証明するか」の判断は間違えると取り返しがつかない。
  // だから focus は構文ではなく境界の設計判断に置く。
  compact: {
    focus: {
      label: "境界の判断を身につける",
      summary:
        "Compact の難しさは文法ではなく「何を公開してよいか」の判断です。公開してしまった秘密は取り消せないので、ここは繰り返す価値があります。",
      howTo:
        "1件30分。`disclose(...)` の中身を指さして「なぜこれは公開してよいのか」を言えるまで。",
      accent: "border-violet-300 bg-violet-50 text-violet-900",
    },
    tutorial: {
      label: "順番に通す（Compact 編）",
      summary:
        "公開だけの世界から始めて、秘密が登場したときに何が増えるのかを順番に見ます。診断が2回あり、⑦は⑤⑥の、⑨は②④の回収です。",
      howTo: "1件30〜40分。手本を見ながらで構いません。",
      accent: "border-emerald-300 bg-emerald-50 text-emerald-900",
    },
    foundation: {
      label: "読んで理解する",
      summary:
        "Compact の骨格（ledger / circuit / witness）です。書き写して意味が分かれば十分です。",
      howTo: "1件15分。手本を写して、どれが公開でどれが秘密かを言えたら次へ。",
      accent: "border-blue-300 bg-blue-50 text-blue-900",
    },
    reference: {
      label: "必要になったら引く",
      summary:
        "実際に dApp を書き始めてから戻ってくる場所です。今は「そういう問題がある」とだけ知っておけば十分です。",
      howTo: "今はやらなくてよい。",
      accent: "border-gray-300 bg-gray-50 text-gray-700",
    },
  },
  // Effect。学習コストが高いので、全体を手で覚えさせる方針は取らない。
  // 使う理由は Effect<成功, エラー, 依存> の 2 番目と 3 番目に尽きるので、
  // そこだけを扱い、白紙練習ではなく診断に寄せる。
  effect: {
    focus: {
      label: "順番に通す（5件だけ）",
      summary:
        "Effect の全体を覚える必要はありません。見るのは「失敗と依存が型に出ているか」の1点だけです。①から⑤まで順番に通してください。②と⑤の診断が本命で、①③④はその準備です。",
      howTo:
        "1件30分。診断は「エラー型が never になっている箇所」を自分で指させるまで。",
      accent: "border-indigo-300 bg-indigo-50 text-indigo-900",
    },
    tutorial: {
      label: "順番に通す",
      summary: "（focus と同じ扱いです）",
      howTo: "",
      accent: "border-gray-300 bg-gray-50 text-gray-700",
    },
    foundation: {
      label: "読んで理解する",
      summary: "（Effect 側にはありません。5件すべてが中核です）",
      howTo: "",
      accent: "border-blue-300 bg-blue-50 text-blue-900",
    },
    reference: {
      label: "必要になったら引く",
      summary:
        "実際に Effect でアプリを書き始めてから戻ってくる場所です。",
      howTo: "今はやらなくてよい。",
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
    tutorial: [
      "sc-01-write-one-type",
      "sc-02-return-an-object",
      "sc-03-unique-id",
      "sc-04-add-without-breaking",
      "sc-05-toggle-one",
      "sc-06-remove-one",
      "sc-07-derive-dont-store",
      "sc-08-save-and-load-basic",
      "sc-09-survive-broken-json",
      "sc-10-check-the-shape",
      "sc-11-from-scratch",
    ],
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
      "gr-01-types-annotation",
      "gr-02-app-d-ts",
      "gr-03-eslint",
      "gr-04-svelte-check",
      "gr-05-formdata-boundary",
      "gr-06-diagnose-guardrail-gap",
    ],
    reference: [
      "sv-12-shared-state-class",
      "sv-14-load-data",
      "sv-15-diagnose-server-shared-state",
    ],
  },
  compact: {
    focus: [],
    foundation: [],
    // ①→⑨で会員制の掲示板とオークションを作る連続チュートリアル。
    // 前の回の続きを書くので、拾い読みではなく順番に通す
    tutorial: [
      "cp-01-ledger-circuit",
      "cp-02-witness-secret",
      "cp-03-assert-guard",
      "cp-04-authorization",
      "cp-05-selective-disclosure",
      "cp-08-range-proof",
      "cp-09-diagnose-over-disclosure",
      "cp-07-dapp-wiring",
      "cp-06-diagnose-secret-leak",
    ],
    reference: [],
  },
  effect: {
    // 5件すべてが中核。②と⑤の診断が本命で、①③④はその準備
    focus: [
      "ef-01-error-in-type",
      "ef-02-diagnose-swallowed-error",
      "ef-03-dependency-in-type",
      "ef-04-retry-timeout",
      "ef-05-diagnose-lost-dependency",
    ],
    foundation: [],
    tutorial: [],
    reference: [],
  },
};

// ── 進め方のロードマップ ────────────────────────────────────
//
// 「どの順番で、何時間かけると、何ができるようになるか」。
//
// 件数と所要時間は TIER_LESSONS から計算する。
// 教材を足したときに手引きの数字だけ古いまま、という事故を防ぐため。

export interface RoadmapStep {
  /** 段階の見出し */
  title: string;
  /** どこから対象レッスンを取るか */
  source: {
    language: LessonLanguage;
    tier: Tier;
    /** tutorial のように複数章が同居するランクを分けるための接頭辞 */
    prefix?: string;
  } | null;
  /** 1件あたりの目安（分） */
  minutesPerLesson: number;
  /** 何をするのか */
  what: string;
  /** 終わったときに言えるようになること */
  outcome: string;
  /** 進んでよいかの自己判定 */
  gate: string;
}

export const ROADMAP: RoadmapStep[] = [
  {
    title: "第1段階　白紙から1本作る（スクラッチ編）",
    source: { language: "typescript", tier: "tutorial" },
    minutesPerLesson: 35,
    what:
      "①から⑪まで順番に通します。starter にコードが1行もありません。" +
      "構文は知っているのに白紙から書けない、という壁を越えるための章です。" +
      "各回で新しいことは1つだけです。⑪だけは手本を開かずに書き切ってください。",
    outcome:
      "要件だけを渡された状態から、ToDoアプリのロジック一式を自分で組み立てられる。" +
      "「何から書き始めるか」を毎回自分で決められる。",
    gate:
      "⑪を手本なしで書き切れたら次へ。開いてしまったら、閉じてもう一度書いてください。",
  },
  {
    title: "第2段階　AIの出力を疑えるようになる",
    source: { language: "typescript", tier: "focus" },
    minutesPerLesson: 30,
    what:
      "TypeScript の「時間をかける」だけをやります。" +
      "境界の検証・状態の設計・網羅性・診断の4つです。それ以外は飛ばしてください。",
    outcome:
      "AIが書いた TypeScript を読んで、「この入力が来たら落ちる」と具体的に指摘できる。",
    gate: "診断レッスンで、症状を読んだだけで原因の見当がつくようになったら次へ。",
  },
  {
    title: "第3段階　AIが無くても画面が書けるようになる",
    source: { language: "svelte", tier: "focus" },
    minutesPerLesson: 30,
    what:
      "Svelte の「手が覚えるまでやる」だけをやります。" +
      "ここは TypeScript と違って、手本を見ずに書けるまで繰り返す価値があります。",
    outcome:
      "AIが使えない状況でも、$state・$derived・$props・bind: を使って画面を1枚組める。",
    gate: "$state と $derived を、手本を見ずに書けるようになったら次へ。",
  },
  {
    title: "第4段階　1本のサイトを動かす",
    source: { language: "svelte", tier: "tutorial", prefix: "sk-" },
    minutesPerLesson: 40,
    what:
      "SvelteKit編を①から⑨まで順番に通します。飛ばさないでください。" +
      "前の回の続きを書くので、飛ばすと繋がりません。手本は見ながらで構いません。",
    outcome:
      "物件サイトが1本できあがる。新しい機能を足すとき「どのファイルに書くか」を自分で決められる。",
    gate:
      "「このファイルはブラウザに配られるか？」に、ファイル名を見て即答できるようになったら次へ。",
  },
  {
    title: "第5段階　納品できる状態にする",
    source: { language: "svelte", tier: "tutorial", prefix: "gr-" },
    minutesPerLesson: 35,
    what:
      "ガードレール編を①から⑥まで通します。" +
      "第4段階で目で見つけた地雷を、型と Lint に見つけさせる作業です。",
    outcome:
      "型・Lint・CI が入り、AIが何行書いてきても機械が止めてくれる。人間が見るべきものが3点（秘密・認可・条件の向き）に絞られる。",
    gate: "Lint と型が「止められないもの」を3つ挙げられたら、教材は卒業です。",
  },
  {
    title: "第6段階　公開してよいものを見分ける（Compact編）",
    source: { language: "compact", tier: "tutorial" },
    minutesPerLesson: 35,
    what:
      "Compact 編を①から⑨まで順番に通します。" +
      "第4・第5段階で扱った「秘密がブラウザに漏れる」話が、ここでは言語仕様そのものになります。" +
      "見る場所は毎回 `disclose(...)` の中身だけです。",
    outcome:
      "秘密そのものを渡さずに「条件を満たしている」ことだけを示せる。" +
      "公開してよい値と、派生値にしてからでないと出せない値を、コードを見て切り分けられる。",
    gate:
      "`disclose` の中身を指さして「なぜこれは公開してよいのか」を毎回言えるようになったら次へ。",
  },
  {
    title: "第7段階　失敗と依存を型に出す（Effect編）",
    source: { language: "effect", tier: "focus" },
    minutesPerLesson: 30,
    what:
      "Effect 編を①から⑤まで順番に通します。" +
      "全体を覚える必要はありません。見るのは「失敗と依存が型に出ているか」の1点だけです。" +
      "②と⑤の診断が本命で、①③④はその準備です。",
    outcome:
      "AIが書いた Effect のコードを読んで、エラー型や依存が握りつぶされている箇所を型から指摘できる。" +
      "`never` を見たときに「埋めた結果か、消した結果か」を判断できる。",
    gate:
      "エラー型が `never` になっている箇所を見て、その理由を毎回言えるようになったら卒業です。",
  },
  {
    title: "第8段階　自分の題材で1本作る",
    source: null,
    minutesPerLesson: 0,
    what:
      "教材はここで終わりです。第4・第5段階で作ったものを土台に、自分の題材で1本作ってください。" +
      "ファイル構成も app.d.ts も eslint.config.js も、そのまま持っていけます。",
    outcome:
      "受託の相談を受けたときに、できる/できないを自分で判断できる。ここが本来の目的地です。",
    gate: "—",
  },
];

/** ロードマップの1段階に含まれるレッスンID */
export function stepLessonIds(step: RoadmapStep): string[] {
  if (!step.source) return [];
  const { language, tier, prefix } = step.source;
  const ids = TIER_LESSONS[language][tier];
  return prefix ? ids.filter((id) => id.startsWith(prefix)) : ids;
}

/** 「約4時間」のような表記にする */
export function formatMinutes(total: number): string {
  if (total <= 0) return "—";
  const hours = total / 60;
  if (hours < 1) return `約${total}分`;
  // 0.5時間刻みに丸める
  const rounded = Math.round(hours * 2) / 2;
  return `約${rounded % 1 === 0 ? rounded : rounded.toFixed(1)}時間`;
}

/** ロードマップ全体の目安時間（分） */
export function totalRoadmapMinutes(): number {
  return ROADMAP.reduce(
    (sum, step) => sum + stepLessonIds(step).length * step.minutesPerLesson,
    0
  );
}

/** 1レッスン（30分）の中の時間配分 */
export const LESSON_TIME_BREAKDOWN: { minutes: number; label: string }[] = [
  { minutes: 5, label: "「なぜ必要か」を読む" },
  { minutes: 5, label: "手本コードを読む" },
  { minutes: 10, label: "手本を隠して書く（詰まったらすぐ開く）" },
  { minutes: 5, label: "自動採点して、✕ の理由を読む" },
  { minutes: 5, label: "もう一度「なぜ必要か」を読む" },
];

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
