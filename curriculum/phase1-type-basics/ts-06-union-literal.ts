import type { Lesson } from "../types";

export const lesson06: Lesson = {
  id: "ts-06-union-literal",
  order: 6,
  title: "Union型 / Literal型",
  category: "union-literal",
  difficulty: 2,

  goal: "Union型とLiteral型で、取りうる値の範囲を型で表現できるようになる",
  explanation:
    "Union型 (`A | B`) は「AまたはB」を表します。" +
    "Literal型は `'success'` のように特定の値そのものを型にします。" +
    "組み合わせることで「この3つの文字列しか入れられない」という制約を型で表現できます。" +
    "switch文と組み合わせると、TypeScriptが全ケース網羅を検証してくれます。",

  starterCode: `// 1. Status型を定義してください
//    取りうる値: "loading" | "success" | "error"


// 2. showMessage関数を定義してください
//    引数: Status型の status
//    戻り値: string
//    loading → "読み込み中..."
//    success → "完了しました"
//    error   → "エラーが発生しました"
`,

  modelAnswer: `type Status = "loading" | "success" | "error";

function showMessage(status: Status): string {
  switch (status) {
    case "loading":
      return "読み込み中...";
    case "success":
      return "完了しました";
    case "error":
      return "エラーが発生しました";
  }
}

console.log(showMessage("success")); // "完了しました"
// showMessage("unknown"); // ← コンパイルエラー！ 型に含まれない値`,

  hints: [
    {
      level: 1,
      text: "`type Status = 'A' | 'B' | 'C'` の形でLiteral Union型を作れます。`switch`文と相性が良いです。",
    },
    {
      level: 2,
      text: "`switch (status)` で全ケースを網羅すると、TypeScriptが「漏れ」を検出してくれます。各caseで `return` を忘れずに。",
    },
    {
      level: 3,
      text: '`type Status = "loading" | "success" | "error"` → `function showMessage(status: Status): string { switch(status) { case "loading": return "..."; ... } }`',
    },
  ],

  checkpoints: [
    { id: "cp-06-1", description: "Literal Union型が `|` で正しく定義できているか？" },
    { id: "cp-06-2", description: "関数の引数に定義した型が使えているか？" },
    { id: "cp-06-3", description: "`switch`で3ケースすべて網羅できているか？" },
    { id: "cp-06-4", description: "型に含まれない値を渡すとエラーになることを確認できたか？" },
  ],

  tags: ["Union型", "Literal型", "switch", "型安全", "ステータス管理"],
  relatedIds: ["ts-04-type-alias", "ts-07-type-guards"],

  variants: [
    {
      label: "実用版: Discriminated Union",
      starterCode: `// ApiResult型を定義してください（Discriminated Union）
// 成功時: { status: "success"; data: string[] }
// 失敗時: { status: "error"; message: string }

// handleResult関数: ApiResult を受け取り、結果をconsole出力する
`,
      modelAnswer: `type ApiResult =
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function handleResult(result: ApiResult): void {
  if (result.status === "success") {
    console.log("データ:", result.data);
  } else {
    console.error("エラー:", result.message);
  }
}`,
    },
  ],
};
