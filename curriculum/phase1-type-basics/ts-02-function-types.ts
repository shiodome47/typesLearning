import type { Lesson } from "../types";

export const lesson02: Lesson = {
  id: "ts-02-function-types",
  order: 2,
  title: "関数の型注釈",
  category: "functions",
  difficulty: 1,

  goal: "関数の引数・戻り値に型注釈をつけ、意図しない呼び出しをコンパイル時に検出できるようになる",
  explanation:
    "関数の引数は `(name: string)` の形で、戻り値は `)` の後に `: 型` を書きます。" +
    "戻り値がない関数には `: void` をつけます。" +
    "省略可能な引数は `age?: number` のように `?:` で書きます。" +
    "型注釈をつけると、型が合わない呼び出しをコンパイル時に検出できます。",

  starterCode: `// 1. add 関数を定義してください
//    引数: a(number), b(number) / 戻り値: number

// 2. greet 関数を定義してください
//    引数: name(string), age?(number, 省略可能) / 戻り値: string
//    age がある場合: "Hello, Alice (25)"
//    age がない場合: "Hello, Alice"

// 3. logMessage 関数を定義してください
//    引数: message(string) / 戻り値: void（何も返さない）
`,

  modelAnswer: `function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string, age?: number): string {
  if (age !== undefined) {
    return "Hello, " + name + " (" + age + ")";
  }
  return "Hello, " + name;
}

function logMessage(message: string): void {
  console.log(message);
}

console.log(add(1, 2));        // 3
console.log(greet("Alice", 25)); // "Hello, Alice (25)"
console.log(greet("Bob"));      // "Hello, Bob"
logMessage("done");`,

  hints: [
    {
      level: 1,
      text: "引数は `(a: number, b: number)` の形。戻り値の型は `)` の後に `: number` と書きます。何も返さない場合は `: void`。",
    },
    {
      level: 2,
      text: "省略可能な引数は `age?: number` と書きます。関数内では `age` は `number | undefined` になるため `age !== undefined` で確認します。",
    },
    {
      level: 3,
      text: "`function greet(name: string, age?: number): string` → `if (age !== undefined) { return '...' + age + '...'; }` の形",
    },
  ],

  checkpoints: [
    { id: "cp-02-1", description: "引数2つに正しい型注釈が書けているか？" },
    { id: "cp-02-2", description: "戻り値の型が `)` の後に書けているか？" },
    { id: "cp-02-3", description: "`age?: number` で省略可能引数が書けているか？" },
    { id: "cp-02-4", description: "戻り値なし関数に `: void` がつけられているか？" },
  ],

  tags: ["関数", "引数", "戻り値", "void", "optional", "型注釈"],
  relatedIds: ["ts-01-variable-types", "ts-03-object-types"],
};
