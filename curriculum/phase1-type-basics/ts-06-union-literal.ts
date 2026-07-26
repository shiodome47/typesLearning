import type { Lesson } from "../types";

export const lesson06: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-06-union-literal",
  order: 6,
  title: "Union型 / Literal型",
  category: "union-literal",
  difficulty: 2,

  goal: "Union型とLiteral型で、取りうる値の範囲を型で表現できるようになる",

  why: {
    problem:
      "データを読み込む画面を作ったとします。状態は3つ。読み込み中、完了、エラー。\n\n" +
      "状態を `let status: string` で持つことにしました。" +
      "読み込みが終わったら `status = \"success\"` を入れて、表示側で `if (status === \"success\")` と見る。素直な作りです。\n\n" +
      "動作確認では正しく動きました。リリースします。\n\n" +
      "しばらくして「読み込みが終わってもぐるぐるが止まらない」と報告が来ます。" +
      "コードを見ると、表示側に `if (status === \"sucess\")` と書いてありました。`c` が1つ足りません。\n\n" +
      "`status` の型は `string` です。`\"sucess\"` も立派な文字列なので、TypeScript は何も言いませんでした。" +
      "この比較は永遠に false になり続けるだけです。エラーも警告も出ません。\n\n" +
      "同じ理由で、別の人が `status = \"完了\"` と日本語で入れることも、`status = \"done\"` と入れることも通ります。" +
      "`string` は「どんな文字列でもいい」という意味なので、当然なのです。" +
      "でもこのアプリにとって、状態は3つしかないはずでした。",
    insight:
      "`\"loading\" | \"success\" | \"error\"` は、「この3つの文字列のどれか」という型です。" +
      "文字列全部ではありません。3つだけです。\n\n" +
      "`|` は「または」と読みます。`\"success\"` のように値そのものを型として書けるのがポイントで、" +
      "これは「文字列」ではなく「`success` というちょうどこの文字列」という意味になります。\n\n" +
      "この型を付けた瞬間、`\"sucess\"` と打ったところに赤い線が引かれます。" +
      "3つのどれでもないからです。打ち間違えた瞬間に分かります。ユーザーからの報告ではなく。\n\n" +
      "おまけの効果もあります。`status === ` まで打つと、エディタが3つの候補を出してくれます。" +
      "候補から選べば打ち間違いようがありません。" +
      "「取りうる値を型に書く」ことは、間違いを防ぐと同時に、他の人（と半年後の自分）への説明にもなっています。\n\n" +
      "さらに `switch` と組み合わせると、TypeScript は「3つ全部に対応したか」まで見てくれるようになります。" +
      "取りうる値が有限だと分かっているからこそできる芸当です。",
  },
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
    {
      id: "cp-06-1",
      description: "Literal Union型が `|` で正しく定義できているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Status, "loading" | "success" | "error">>;`,
      },
    },
    {
      id: "cp-06-2",
      description: "関数の引数に定義した型が使えているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<Parameters<typeof showMessage>[0], Status>>;`,
      },
    },
    {
      id: "cp-06-3",
      description: "`switch`で3ケースすべて網羅できているか？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<Equal<ReturnType<typeof showMessage>, string>>;
const _c3a: string = showMessage("loading");
const _c3b: string = showMessage("success");
const _c3c: string = showMessage("error");`,
      },
    },
    {
      id: "cp-06-4",
      description: "型に含まれない値を渡すとエラーになることを確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `const _c4: Status = "sleeping";`,
      },
    },
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
