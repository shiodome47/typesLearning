import type { Lesson } from "../types";

export const lesson08: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-08-array-types",
  order: 8,
  title: "配列の型と操作",
  category: "objects",
  difficulty: 2,

  goal: "T[] 型で配列を宣言し、map / filter / find を型安全に使えるようになる",

  why: {
    problem:
      "Todo アプリの一覧を作ります。まず入れ物を用意しよう、と `const todos = []` と書きました。\n\n" +
      "この時点で TypeScript は中身が何なのか分かりません。何でも入る配列として扱います。" +
      "だから `todos.map((todo) => todo.titel)` と綴りを間違えても、赤線は1本も出ません。\n\n" +
      "画面を開くと、行は3つ並んでいます。ただし全部空欄です。" +
      "CSS を疑い、データの取得を疑い、`title` の綴りミスにたどり着くまで1時間かかりました。\n\n" +
      "もう一つあります。詳細画面は `todos.find((t) => t.id === id)` で1件を取り出し、`todo.title` を表示します。" +
      "動きます。誰かが削除済みの Todo の URL をブックマークから開くまでは。" +
      "`find` は見つからないと `undefined` を返すので、`Cannot read properties of undefined` で画面が真っ白になります。\n\n" +
      "どちらも、配列の中身が何なのかを書いていなかったせいで起きています。",
    insight:
      "`Todo[]` は「Todo だけが入っている配列」という意味です。角カッコが「〜の配列」を表します。\n\n" +
      "これを書いておくと、`map` や `filter` の中まで型が付いてきます。" +
      "`todos.map((todo) => ...)` の `todo` は Todo だと分かっているので、" +
      "`.` を打った瞬間に `id` `title` `done` が候補に出ます。綴りミスはその場で赤線になります。" +
      "実行して空欄を眺める必要がありません。\n\n" +
      "3つのメソッドは、返ってくる形がそれぞれ違います。\n\n" +
      "・`map` … 全部を別のものに変換する。`Todo[]` から `string[]` へ、個数はそのまま\n" +
      "・`filter` … 条件に合うものだけ残す。`Todo[]` のまま、個数が減る\n" +
      "・`find` … 最初の1件を取り出す。`Todo` **または** `undefined`\n\n" +
      "最後の `find` が肝心なところです。TypeScript は戻り値を `Todo | undefined` と正直に申告します。" +
      "これは不親切なのではなく、「見つからないこともある」という事実を隠さずに渡してくれているのです。\n\n" +
      "だから `.title` といきなり書くと赤線が出ます。真っ白な画面の代わりに、" +
      "書いているその場で「見つからなかったときどうする？」と聞かれます。その答え方が次の #09 です。",
  },
  explanation:
    "`string[]` や `User[]` のように `T[]` で配列型を宣言します。" +
    "`map` は各要素を変換した新しい配列を返し、`filter` は条件を満たす要素だけを残します。" +
    "`find` は条件を満たす最初の要素を返しますが、見つからない場合は `undefined` になります（戻り値型は `T | undefined`）。" +
    "この `undefined` の扱いは #09 Optional につながります。",

  starterCode: `type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const todos: Todo[] = [
  { id: 1, title: "TypeScriptを学ぶ", done: true },
  { id: 2, title: "Reactを学ぶ", done: false },
  { id: 3, title: "アプリを作る", done: false },
];

// 1. getTitles: todos から title だけの string[] を返す（map）
// 2. getActive: done が false の Todo[] を返す（filter）
// 3. findById: id で Todo を検索して返す（find）
//    ※ 戻り値型は Todo | undefined になることに注意
`,

  modelAnswer: `type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const todos: Todo[] = [
  { id: 1, title: "TypeScriptを学ぶ", done: true },
  { id: 2, title: "Reactを学ぶ", done: false },
  { id: 3, title: "アプリを作る", done: false },
];

function getTitles(todos: Todo[]): string[] {
  return todos.map((todo) => todo.title);
}

function getActive(todos: Todo[]): Todo[] {
  return todos.filter((todo) => !todo.done);
}

function findById(todos: Todo[], id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

console.log(getTitles(todos));        // ["TypeScriptを学ぶ", ...]
console.log(getActive(todos).length); // 2
console.log(findById(todos, 1));      // { id: 1, ... }
console.log(findById(todos, 99));     // undefined`,

  hints: [
    {
      level: 1,
      text: "`todos.map((todo) => todo.title)` の戻り値は `string[]` と推論されます。`filter` は元の配列と同じ型の配列を返します。",
    },
    {
      level: 2,
      text: "`find` の戻り値は `Todo | undefined` です。関数の戻り値型を `: Todo | undefined` と明示することで、呼び出し側にundefinedの可能性を伝えられます。",
    },
    {
      level: 3,
      text: "`function findById(todos: Todo[], id: number): Todo | undefined { return todos.find((todo) => todo.id === id); }`",
    },
  ],

  checkpoints: [
    {
      id: "cp-08-1",
      description: "`Todo[]` のように要素型を明示した配列型が書けているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<typeof todos, Todo[]>>;`,
      },
    },
    {
      id: "cp-08-2",
      description: "`map` で各要素を変換した新しい配列を返せているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<Parameters<typeof getTitles>[0], Todo[]>>;
type _c2b = Expect<Equal<ReturnType<typeof getTitles>, string[]>>;`,
      },
    },
    {
      id: "cp-08-3",
      description: "`filter` で条件に合う要素だけの配列を返せているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof getActive>, Todo[]>>;`,
      },
    },
    {
      id: "cp-08-4",
      description: "`find` の戻り値型が `Todo | undefined` と書けているか？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<ReturnType<typeof findById>, Todo | undefined>>;`,
      },
    },
  ],

  tags: ["配列", "T[]", "map", "filter", "find", "undefined", "Todo"],
  relatedIds: ["ts-07-type-guards", "ts-09-optional", "ts-10-crud-basics"],
};
