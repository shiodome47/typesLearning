import type { Lesson } from "../types";

export const scLesson08: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-08-save-and-load-basic",
  order: 57,
  title: "⑧ 保存して読み戻す — まず「無いとき」を扱う",
  category: "scratch",
  difficulty: 2,

  goal: "localStorage に保存し、まだ何も無い場合を正しく扱えるようになる",

  why: {
    problem:
      "リロードすると全部消えるので、保存します。素直に書くとこうです。\n\n" +
      "```\n" +
      "const save = (list: Todo[]) => localStorage.setItem(\"todos\", JSON.stringify(list));\n" +
      "const load = (): Todo[] => JSON.parse(localStorage.getItem(\"todos\")!);\n" +
      "```\n\n" +
      "保存されます。リロードしても残ります。\n\n" +
      "そして**初めて開いた人の画面が真っ白になります。**\n\n" +
      "何も保存していないとき、`getItem` は `null` を返します。\n" +
      "`JSON.parse(null)` は `null` を返し、そのあと `null.map(...)` で落ちます。\n\n" +
      "`!` を付けたのは型エラーを消すためでした。" +
      "**消えたのはエラーだけで、問題は残っています。**",
    insight:
      "この回でやることは2つだけです。\n\n" +
      "**1. 保存する。1行です。**\n\n" +
      "```\n" +
      "const saveTodos = (list: Todo[]): void => {\n" +
      "  localStorage.setItem(\"todos\", JSON.stringify(list));\n" +
      "};\n" +
      "```\n\n" +
      "`localStorage` は**文字列しか保存できません**。配列はそのまま入りません。\n" +
      "`JSON.stringify(list)` が配列を文字列に変換します。\n\n" +
      "`: void` は「何も返さない」という意味です。保存するだけなので返すものがありません。\n\n" +
      "**2. 読み戻す。「無いとき」を先に返します。**\n\n" +
      "```\n" +
      "const loadTodos = (): Todo[] => {\n" +
      "  const raw = localStorage.getItem(\"todos\");\n" +
      "  if (raw === null) {\n" +
      "    return [];\n" +
      "  }\n" +
      "  return JSON.parse(raw);\n" +
      "};\n" +
      "```\n\n" +
      "**この `if` が今回の主役です。**\n\n" +
      "初めて開いた人には、まだ何も保存されていません。それは**異常ではありません**。" +
      "「空の一覧」という正しい答えがあります。だから `[]` を返します。\n\n" +
      "「エラーを投げる」でも「`null` を返す」でもありません。" +
      "**呼ぶ側が困らない値を返す**のが親切です。\n" +
      "`[]` を返せば、呼ぶ側は `null` かどうかを気にせず `map` できます。\n\n" +
      "これを**早期 return** と呼びます。\n" +
      "「特別な場合を先に片付けて、残りを素直に書く」という形です。" +
      "`if / else` で入れ子にするより読みやすくなります。\n\n" +
      "なお `JSON.parse(raw)` はまだ危ういままです。" +
      "**壊れた文字列が入っていたら落ちます。** それは⑨で扱います。\n" +
      "この回は「無いとき」だけを片付けます。**一度に1つ**です。",
  },
  explanation:
    "`localStorage` は文字列のみを保存できるため、配列は `JSON.stringify` で文字列に変換します。" +
    "`localStorage.getItem` は該当のキーが無いとき `null` を返します。" +
    "これは異常ではなく初回アクセスの正常な状態なので、空配列という既定値を返します。" +
    "戻り値を `null` にせず空配列にすると、呼び出し側が存在確認をせずにそのまま繰り返し処理できます。" +
    "特別な場合を先に `return` で片付ける書き方を早期 return と呼び、入れ子が浅くなり読みやすくなります。",

  starterCode: `// todo.ts
//
// ⑦の続きです。保存と読み込みを作ります。
// ①〜⑦のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜⑦と同じ型と6つの関数を書く。
//
//   2. saveTodos という関数を作る。
//        - 引数は list（Todo の配列）
//        - localStorage のキー "todos" に保存する
//        - 何も返さない（void）
//        - localStorage は文字列しか保存できないので、JSON.stringify を使う
//
//   3. loadTodos という関数を作る。
//        - 引数なし。Todo の配列を返す
//        - 何も保存されていないときは空配列 [] を返す（ここが今回の要点）
//        - 保存されていれば JSON.parse で戻す
//
// localStorage.getItem は、何も無いとき null を返します。

`,

  modelAnswer: `// todo.ts

type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => {
  const id = String(nextId);
  nextId = nextId + 1;
  return { id: id, text: text, done: false };
};

const addTodo = (list: Todo[], text: string): Todo[] => {
  return [...list, createTodo(text)];
};

const toggleTodo = (list: Todo[], id: string): Todo[] => {
  return list.map((t) => {
    if (t.id === id) {
      return { id: t.id, text: t.text, done: !t.done };
    }
    return t;
  });
};

const removeTodo = (list: Todo[], id: string): Todo[] => {
  return list.filter((t) => t.id !== id);
};

const activeTodos = (list: Todo[]): Todo[] => {
  return list.filter((t) => !t.done);
};

const remainingCount = (list: Todo[]): number => {
  return activeTodos(list).length;
};

// キー名を1か所に書いておく。
// save と load で綴りが違うと、保存はできるのに読めない、という
// 気づきにくい不具合になる。
const STORAGE_KEY = "todos";

// void は「何も返さない」。保存するだけなので返すものがない。
const saveTodos = (list: Todo[]): void => {
  // localStorage は文字列しか保存できない。
  // JSON.stringify が配列を文字列に変える。
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);

  // 何も無いとき getItem は null を返す。
  // これは異常ではなく、初めて開いた人の正常な状態。
  // 「空の一覧」という正しい答えがあるので、それを返す。
  //
  // null を返すと、呼ぶ側が毎回 null かどうかを確かめないといけない。
  // [] を返せば、そのまま map できる。
  if (raw === null) {
    return [];
  }

  // ここはまだ危うい。壊れた文字列が入っていたら落ちる。
  // それは⑨で直す。この回は「無いとき」だけを片付ける。
  return JSON.parse(raw);
};
`,

  hints: [
    {
      level: 1,
      text: "`saveTodos` は1行です。`loadTodos` は3段階（取り出す → 無ければ空配列を返す → あれば戻す）です。",
    },
    {
      level: 2,
      text: "保存は `localStorage.setItem(\"todos\", JSON.stringify(list));`。読み込みは `const raw = localStorage.getItem(\"todos\");` で受けて、`if (raw === null) { return []; }` と書きます。",
    },
    {
      level: 3,
      text: "最後は `return JSON.parse(raw);` です。`raw` は `if` を通過しているので `null` ではないと型も分かってくれます（だから `!` は不要です）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-08-1",
      description: "`loadTodos` は `Todo[]` を返す型か？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof loadTodos>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-08-2",
      description: "保存して読み戻せるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
var list = addTodo(addTodo([], "牛乳"), "パン");
saveTodos(list);
var back = loadTodos();
assertEqual(back.length, 2, "2件読み戻せない");
assertEqual(back[0].text, "牛乳", "内容が戻ってこない");
assertEqual(back[1].done, false, "状態が戻ってこない");`,
      },
    },
    {
      id: "cp-sc-08-3",
      description: "何も保存していないとき、空配列を返すか（初めて開いた人）？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
var r = loadTodos();
assertTrue(Array.isArray(r), "配列を返していない（null が返っている可能性）");
assertEqual(r.length, 0, "初回は空配列を返す");`,
      },
    },
    {
      id: "cp-sc-08-4",
      description: "保存と読み込みで同じキーを使っているか？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
saveTodos(addTodo([], "A"));
assertEqual(loadTodos().length, 1, "保存はできているが読めない（キー名が違う可能性）");`,
      },
    },
    {
      id: "cp-sc-08-5",
      description:
        "何も無いときに `null` ではなく `[]` を返す理由を言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "localStorage", "早期return", "境界"],
  relatedIds: ["sc-07-derive-dont-store", "sc-09-survive-broken-json"],
};
