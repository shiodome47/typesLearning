import type { Lesson } from "../types";

export const lesson01: Lesson = {
  kind: "write",
  id: "ts-01-variable-types",
  order: 1,
  title: "変数への型注釈",
  category: "type-basics",
  difficulty: 1,

  goal: "変数と関数に型を明示的に宣言できるようになる",

  why: {
    problem:
      "会員登録の画面を作ったとします。入力欄から年齢を受け取って、「来年で〇歳ですね」と表示するだけの処理です。\n\n" +
      "`const age = 入力欄の値` と受け取って、`age + 1` を画面に出しました。" +
      "動作確認では自分で `25` と決め打ちして試したので、ちゃんと `26` と出ます。完成です。\n\n" +
      "ところが公開したあと、25歳の人の画面には「来年で251歳ですね」と表示されていました。\n\n" +
      "入力欄から出てくる値は、数字を打っても文字列の `\"25\"` です。" +
      "文字列に `1` を足すと、JavaScript は計算せずに後ろへくっつけて `\"251\"` にします。" +
      "エラーは1つも出ません。プログラムは最後まで元気に動きます。ただ答えが違うだけです。\n\n" +
      "厄介なのは、この間違いに気づける瞬間が「実際に動かして画面を見たとき」しかないことです。" +
      "画面が10個あって、そのうち1つでしか通らない条件分岐の中にこれがあったら、あなたはいつ気づくでしょうか。",
    insight:
      "型注釈は「この入れ物には数値しか入れません」と、書いた本人が宣言することです。" +
      "`let age: number` と書いた瞬間から、そこに文字列を入れようとすると、保存した時点で赤い線が引かれます。" +
      "実行する必要はありません。動かす前に分かります。\n\n" +
      "つまり型注釈は、動かさずに済ませる動作確認のようなものです。" +
      "「文字列と数値を足していないか」を、あなたが画面を見る代わりに TypeScript が全部の行について調べてくれます。10個の画面でも、通らない分岐の中でも同じです。\n\n" +
      "`string` は文字、`number` は数、`boolean` は「はい／いいえ」。まずはこの3つだけで十分です。\n\n" +
      "関数も同じで、`function greet(name: string): string` と書けば「文字を1つ受け取って文字を返す」という約束になります。" +
      "約束を破った呼び出し方——数値を渡す、渡し忘れる——はその場で止まります。",
  },
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
    {
      id: "cp-01-1",
      description: "変数3つすべてに型注釈が書けているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<typeof username, string>>;
type _c1b = Expect<Equal<typeof age, number>>;
function _c1c() {
  // boolean は代入で true/false に絞り込まれるため、関数内で宣言時の型を問う
  type _c1cType = Expect<Equal<typeof isLoggedIn, boolean>>;
  return null as unknown as _c1cType;
}`,
      },
    },
    {
      id: "cp-01-2",
      description: "関数の引数に型注釈が書けているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<Parameters<typeof greet>[0], string>>;`,
      },
    },
    {
      id: "cp-01-3",
      description: "関数の戻り値の型が `)` の後に書けているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof greet>, string>>;`,
      },
    },
  ],

  tags: ["変数", "型注釈", "string", "number", "boolean", "基本"],
  relatedIds: ["ts-02-function-types", "ts-03-object-types"],
};
