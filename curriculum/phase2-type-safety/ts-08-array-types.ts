import type { Lesson } from "../types";

export const lesson08: Lesson = {
  id: "ts-08-array-types",
  order: 8,
  title: "配列の型と操作",
  category: "objects",
  difficulty: 2,

  goal: "T[] 型で配列を宣言し、map / filter / find を型安全に使えるようになる",
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
    { id: "cp-08-1", description: "`Todo[]` のように要素型を明示した配列型が書けているか？" },
    { id: "cp-08-2", description: "`map` で各要素を変換した新しい配列を返せているか？" },
    { id: "cp-08-3", description: "`filter` で条件に合う要素だけの配列を返せているか？" },
    { id: "cp-08-4", description: "`find` の戻り値型が `Todo | undefined` と書けているか？" },
  ],

  tags: ["配列", "T[]", "map", "filter", "find", "undefined", "Todo"],
  relatedIds: ["ts-07-type-guards", "ts-09-optional", "ts-10-crud-basics"],
};
