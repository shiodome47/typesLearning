import type { Lesson } from "../types";

export const scLesson05: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-05-save-and-load",
  order: 54,
  title: "⑤ 保存する — 外から戻ってきたものを信じない",
  category: "scratch",
  difficulty: 3,

  goal: "保存したデータを読み戻すときに、形が違っていても壊れないコードを書けるようになる",

  why: {
    problem:
      "リロードすると全部消えるので、`localStorage` に保存します。\n\n" +
      "```\n" +
      "const save = (list: Todo[]) => localStorage.setItem(\"todos\", JSON.stringify(list));\n" +
      "const load = (): Todo[] => JSON.parse(localStorage.getItem(\"todos\")!);\n" +
      "```\n\n" +
      "動きます。保存されます。リロードしても残ります。\n\n" +
      "そして**初回アクセスで白い画面になります**。\n\n" +
      "何も保存していないとき、`getItem` は `null` を返します。" +
      "`JSON.parse(null)` は `null` を返し、`null.map(...)` で落ちます。\n" +
      "`!` を付けたのは型エラーを消すためでしたが、**消したのはエラーだけで、問題は残っています**。\n\n" +
      "そして根っこはもっと深いところにあります。\n\n" +
      "**`JSON.parse` の戻り値は `any` です。**\n\n" +
      "つまり `load()` が `Todo[]` を返すと書いてあっても、" +
      "**型は何も確かめていません**。中身が何であろうと通ります。\n\n" +
      "実際に何が入ってくるか。\n" +
      "- 別のバージョンのアプリが保存した、フィールドが違うデータ\n" +
      "- 利用者が開発者ツールで書き換えた値\n" +
      "- 途中で切れた壊れた JSON\n" +
      "- 別のタブが同じキーに書いた、まったく別の形のデータ\n\n" +
      "どれも `any` なので型は通り、**画面を描画する瞬間に落ちます**。" +
      "しかも落ちる場所は `load` ではなく、ずっと後の `t.text` を読むところです。",
    insight:
      "原則はこうです。**自分のプログラムの外から来たものは、すべて `unknown` として扱う。**\n\n" +
      "外とは、`localStorage`・API のレスポンス・URL のパラメータ・フォームの入力、" +
      "つまり**自分が型を保証していない場所すべて**です。\n\n" +
      "やることは3つです。\n\n" +
      "**1. 無いときを先に返す。**\n\n" +
      "```\n" +
      "const raw = localStorage.getItem(\"todos\");\n" +
      "if (raw === null) return [];\n" +
      "```\n\n" +
      "初回アクセスは異常ではなく、**普通に起こること**です。" +
      "「空の一覧」という正しい答えがあります。\n\n" +
      "**2. 壊れた JSON で落ちないようにする。**\n\n" +
      "```\n" +
      "let parsed: unknown;\n" +
      "try { parsed = JSON.parse(raw); } catch { return []; }\n" +
      "```\n\n" +
      "受け取る変数を `unknown` と書くのが大事です。" +
      "`any` のままにすると、この先の検証を型が要求してくれません。\n\n" +
      "**3. 形を確かめてから使う。**\n\n" +
      "```\n" +
      "const isTodo = (v: unknown): v is Todo =>\n" +
      "  typeof v === \"object\" && v !== null &&\n" +
      "  typeof (v as Todo).id === \"string\" &&\n" +
      "  typeof (v as Todo).text === \"string\" &&\n" +
      "  typeof (v as Todo).done === \"boolean\";\n" +
      "\n" +
      "return Array.isArray(parsed) ? parsed.filter(isTodo) : [];\n" +
      "```\n\n" +
      "`v is Todo` は**型ガード**です。「この関数が true を返したら、" +
      "その値は `Todo` として扱ってよい」と型に教えます。\n" +
      "`filter(isTodo)` を通すと、戻り値は `unknown[]` ではなく `Todo[]` になります。\n\n" +
      "混ざっていた不正な項目は落とします。**1件おかしいだけで全部捨てるより親切**です。\n\n" +
      "ここで大事なのは、`as Todo[]` と書かないことです。\n" +
      "`as` は「私が保証します」という宣言であって、**何も確かめません**。" +
      "確かめる代わりに黙らせるのが `as`、実際に確かめるのが型ガードです。\n\n" +
      "覚え方はこうです。\n" +
      "**境界では、型を主張するのではなく確かめる。**",
  },
  explanation:
    "`localStorage` や API から戻ってくる値は、自分のプログラムが型を保証していないため `unknown` として扱います。" +
    "`localStorage.getItem` は保存が無いとき `null` を返し、`JSON.parse` は戻り値が `any` になるため、" +
    "そのまま使うと型チェックを通り抜けて実行時に失敗します。" +
    "必要なのは3段階で、値が無い場合の既定値、解析失敗時の処理、そして形の検証です。" +
    "検証には `v is Todo` という型ガードを使い、確認が通った値だけを `Todo` として扱います。" +
    "`as Todo[]` による型アサーションは何も確認しないため、境界では使いません。" +
    "不正な要素が混ざっている場合は該当要素だけを落とすと、全体を失わずに済みます。",

  starterCode: `// todo.ts
//
// ④の続きです。保存と読み込みを作ります。
// これまでの型と関数もすべて書いてください。
//
// 【要件】
//
// 1. これまでと同じ型 + 6関数を用意する。
//
// 2. saveTodos(list: Todo[]): void を作る。
//      - localStorage のキー "todos" に JSON で保存する
//
// 3. loadTodos(): Todo[] を作る。次のどの場合でも例外を投げないこと。
//      - 何も保存されていない        → 空配列を返す
//      - 壊れた JSON が入っている     → 空配列を返す
//      - 配列ではないものが入っている  → 空配列を返す
//      - 配列だが Todo ではない要素が混ざっている → その要素だけを除いて返す
//
// as Todo[] は使いません。理由は「なぜ必要か」に書いてあります。

`,

  modelAnswer: `// todo.ts
//
// 境界では、型を主張するのではなく確かめる。

type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => ({
  id: String(nextId++),
  text,
  done: false,
});

const addTodo = (list: Todo[], text: string): Todo[] => [
  ...list,
  createTodo(text),
];

const toggleTodo = (list: Todo[], id: string): Todo[] =>
  list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));

const removeTodo = (list: Todo[], id: string): Todo[] =>
  list.filter((t) => t.id !== id);

const activeTodos = (list: Todo[]): Todo[] => list.filter((t) => !t.done);

const remainingCount = (list: Todo[]): number => activeTodos(list).length;

const STORAGE_KEY = "todos";

const saveTodos = (list: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// 型ガード。true が返ったら Todo として扱ってよい、と型に教える。
// as と違って、実際に中身を確かめている。
const isTodo = (v: unknown): v is Todo =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as Todo).id === "string" &&
  typeof (v as Todo).text === "string" &&
  typeof (v as Todo).done === "boolean";

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  // 初回アクセスは異常ではない。「空の一覧」という正しい答えがある。
  if (raw === null) return [];

  // 受け取る変数を unknown にするのが要点。
  // any のままだと、この先の検証を型が要求してくれない。
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // 途中で切れた JSON などはここに来る。落とさず空で始める。
    return [];
  }

  // 配列ですらない可能性がある（別のタブが同じキーに書いた等）。
  if (!Array.isArray(parsed)) return [];

  // 形を確かめた要素だけを残す。
  // 1件おかしいだけで全部捨てるより、その1件を落とす方が親切。
  return parsed.filter(isTodo);
};

export {
  createTodo,
  addTodo,
  toggleTodo,
  removeTodo,
  activeTodos,
  remainingCount,
  saveTodos,
  loadTodos,
};
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "`saveTodos` は1行です。`loadTodos` は「無いとき」「壊れているとき」「配列でないとき」を順番に早期 return し、最後に形の検証をした要素だけを返します。4段階です。",
    },
    {
      level: 2,
      text: "`JSON.parse` の結果を受ける変数は `let parsed: unknown;` と書き、`try { parsed = JSON.parse(raw); } catch { return []; }` で囲みます。`Array.isArray(parsed)` で配列かを確かめてから中身を見ます。",
    },
    {
      level: 3,
      text: "型ガードは `const isTodo = (v: unknown): v is Todo => typeof v === \"object\" && v !== null && typeof (v as Todo).id === \"string\" && ...` の形です。最後に `return parsed.filter(isTodo);` とすると、戻り値が `Todo[]` になります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-05-1",
      description: "`loadTodos` は `Todo[]` を返す型か（`any` のままではないか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof loadTodos>, Todo[]>>;
type _c2 = Expect<NotAny<ReturnType<typeof loadTodos>>>;`,
      },
    },
    {
      id: "cp-sc-05-2",
      description: "保存して読み戻せるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "牛乳"), "パン");
saveTodos(list);
var back = loadTodos();
assertEqual(back.length, 2, "2件読み戻せる");
assertEqual(back[0].text, "牛乳", "内容が戻ってこない");
assertEqual(back[1].done, false, "状態が戻ってこない");`,
      },
    },
    {
      id: "cp-sc-05-3",
      description: "何も保存していないとき、空配列を返すか（初回アクセス）？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
var r = loadTodos();
assertTrue(Array.isArray(r), "配列を返していない（null が返っている可能性）");
assertEqual(r.length, 0, "初回は空配列");`,
      },
    },
    {
      id: "cp-sc-05-4",
      description: "壊れた JSON が入っていても落ちないか？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem("todos", '[{"id":"1","text":"途中で切れ');
var r = loadTodos();
assertTrue(Array.isArray(r), "壊れた JSON で落ちている（try/catch が無い）");
assertEqual(r.length, 0, "壊れていたら空で始める");`,
      },
    },
    {
      id: "cp-sc-05-5",
      description: "配列ではないものが入っていても落ちないか？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem("todos", '{"not":"an array"}');
var r = loadTodos();
assertTrue(Array.isArray(r), "配列以外を受け取って落ちている（Array.isArray の確認が無い）");
assertEqual(r.length, 0, "配列でなければ空");`,
      },
    },
    {
      id: "cp-sc-05-6",
      description: "形が違う要素だけを除き、正しい要素は残すか（一番大事な確認）？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem(
  "todos",
  JSON.stringify([
    { id: "1", text: "正しい", done: false },
    { id: 2, text: "id が数値", done: false },
    { id: "3", text: "done が無い" },
    null,
    "文字列",
    { id: "6", text: "これも正しい", done: true }
  ])
);
var r = loadTodos();
assertEqual(r.length, 2, "不正な要素を除けていない（形の検証が無い）");
assertEqual(r.map(function (t) { return t.text; }), ["正しい", "これも正しい"], "残る要素が違う");`,
      },
    },
    {
      id: "cp-sc-05-7",
      description:
        "`as Todo[]` と型ガードの違いを、自分の言葉で説明できるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "境界の検証", "型ガード", "localStorage", "unknown"],
  relatedIds: ["sc-04-derive-dont-store", "sc-06-from-scratch", "ts-15-api-fetch"],
};
