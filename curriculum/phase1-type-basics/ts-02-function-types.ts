import type { Lesson } from "../types";

export const lesson02: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-02-function-types",
  order: 2,
  title: "関数の型注釈",
  category: "functions",
  difficulty: 1,

  goal: "関数の引数・戻り値に型注釈をつけ、意図しない呼び出しをコンパイル時に検出できるようになる",

  why: {
    problem:
      "送料を計算する関数を書いたとします。重さと「お急ぎ便かどうか」を受け取って金額を返す、`calcShipping(weight, isExpress)` です。\n\n" +
      "自分で書いた関数なので、自分は正しい呼び方を知っています。動作確認も問題なし。\n\n" +
      "3週間後、別の画面から同じ関数を呼ぶことになりました。急いでいたので `calcShipping(weight)` と書いてしまいます。" +
      "お急ぎ便の指定を渡し忘れたのです。\n\n" +
      "JavaScript は文句を言いません。足りない引数には黙って `undefined` を入れて実行します。" +
      "計算の途中で `undefined` が混ざり、結果は `NaN`（数ではない、という値）になります。" +
      "注文確認画面には「送料 NaN円」と出ます。エラー画面すら出ません。\n\n" +
      "同じことは戻り値でも起きます。`logMessage(...)` は何も返さないのに、" +
      "呼ぶ側が「たぶん結果が返ってくるだろう」と `const r = logMessage(\"done\")` と書いて `r` を使ってしまう。" +
      "`r` は `undefined` です。誰も止めません。",
    insight:
      "関数の型注釈は、その関数の使い方を書いた契約書です。" +
      "`function calcShipping(weight: number, isExpress: boolean): number` と書いておけば、" +
      "「数を2つ渡すと数が1つ返る」という取り決めが関数自身に貼り付いた状態になります。\n\n" +
      "契約書があると、破った瞬間に分かります。引数を渡し忘れれば、その呼び出し行に赤い線が出ます。" +
      "3週間後の自分が急いでいても、別の人が使っても同じです。" +
      "覚えていなくても、思い出さなくても、書き間違えれば止まります。\n\n" +
      "`age?: number` の `?` は「渡さなくてもいい」と契約書に明記することです。" +
      "うっかり忘れたのか、意図して省いたのかが、書いてあるだけで区別できます。" +
      "そして省略を許した以上、関数の中では `age` が無い場合を必ず考えることになります。TypeScript がそれを要求してきます。\n\n" +
      "`: void` は「何も返しません」という明記です。" +
      "戻り値を受け取ろうとした人は、その場で「これは何も返さない関数ですよ」と教えてもらえます。",
  },
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
    {
      id: "cp-02-1",
      description: "引数2つに正しい型注釈が書けているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<Parameters<typeof add>[0], number>>;
type _c1b = Expect<Equal<Parameters<typeof add>[1], number>>;`,
      },
    },
    {
      id: "cp-02-2",
      description: "戻り値の型が `)` の後に書けているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof add>, number>>;`,
      },
    },
    {
      id: "cp-02-3",
      description: "`age?: number` で省略可能引数が書けているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<Equal<Parameters<typeof greet>["length"], 1 | 2>>;
type _c3b = Expect<Equal<Parameters<typeof greet>[1], number | undefined>>;
const _c3c: string = greet("Bob");`,
      },
    },
    {
      id: "cp-02-4",
      description: "戻り値なし関数に `: void` がつけられているか？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<ReturnType<typeof logMessage>, void>>;`,
      },
    },
  ],

  tags: ["関数", "引数", "戻り値", "void", "optional", "型注釈"],
  relatedIds: ["ts-01-variable-types", "ts-03-object-types"],
};
