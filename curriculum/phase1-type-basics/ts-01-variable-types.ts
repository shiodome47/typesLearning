import type { Lesson } from "../types";

export const lesson01: Lesson = {
  id: "ts-01-variable-types",
  order: 1,
  title: "変数への型注釈",
  category: "type-basics",
  difficulty: 1,

  goal: "変数と関数に型を明示的に宣言できるようになる",
  explanation:
    "TypeScriptでは変数の後に `: 型名` を書くことで型を宣言できます。" +
    "型が合わない値を代入しようとするとコンパイルエラーになります。" +
    "`string`（文字列）、`number`（数値）、`boolean`（真偽値）が最も基本的な型です。" +
    "関数の引数と戻り値にも同じ書き方で型をつけられます。",

  starterCode: `// 以下の変数に適切な型注釈を追加してください

let username = "Alice";
let age = 25;
let isLoggedIn = false;

function greet(name) {
  return "Hello, " + name;
}`,

  modelAnswer: `let username: string = "Alice";
let age: number = 25;
let isLoggedIn: boolean = false;

function greet(name: string): string {
  return "Hello, " + name;
}`,

  hints: [
    {
      level: 1,
      text: "変数名の後に `: 型名` を書きます。関数の引数も同じ書き方です。",
    },
    {
      level: 2,
      text: "文字列は `string`、数値は `number`、真偽値は `boolean` です。戻り値の型は `)` の後に書きます。",
    },
    {
      level: 3,
      text: "`let username: string` / `let age: number` / `let isLoggedIn: boolean` / 関数は `(name: string): string`",
    },
  ],

  checkpoints: [
    { id: "cp-01-1", description: "変数3つすべてに型注釈が書けているか？" },
    { id: "cp-01-2", description: "関数の引数に型注釈が書けているか？" },
    { id: "cp-01-3", description: "関数の戻り値の型が `)` の後に書けているか？" },
  ],

  tags: ["変数", "型注釈", "string", "number", "boolean", "基本"],
  relatedIds: ["ts-02-function-types", "ts-03-object-types"],
};
