import type { Lesson } from "../types";

export const scLesson10: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-10-check-the-shape",
  order: 59,
  title: "⑩ 形を確かめてから使う",
  category: "scratch",
  difficulty: 3,

  goal: "外から来たデータの形を実際に検証し、`as` に頼らずに型を確定できるようになる",

  why: {
    problem:
      "⑨で落ちなくなりました。しかし最後の行がまだ嘘をついています。\n\n" +
      "```\n" +
      "return parsed as Todo[];\n" +
      "```\n\n" +
      "**`as` は何も確かめていません。** 「私が保証します」と型に言っているだけです。\n\n" +
      "だから、こういう文字列が保存されていても通ります。\n\n" +
      "```\n" +
      '[{ "id": 2, "text": "id が数値" }, null, "文字列"]\n' +
      "```\n\n" +
      "JSON としては正しいので `JSON.parse` は成功します。`as` も通ります。\n" +
      "そして画面を描くときに `null.text` を読んで落ちます。\n\n" +
      "落ちる場所は `loadTodos` ではなく、**ずっと後の表示部分**です。\n" +
      "だから原因を探すのに時間がかかります。\n\n" +
      "配列ですらない可能性もあります。`{ \"not\": \"array\" }` が入っていたら、" +
      "`.map` を呼んだ瞬間に落ちます。",
    insight:
      "**確かめる関数を自分で書きます。**\n\n" +
      "```\n" +
      "const isTodo = (v: unknown): v is Todo => {\n" +
      "  if (typeof v !== \"object\") return false;\n" +
      "  if (v === null) return false;\n" +
      "  const o = v as { id?: unknown; text?: unknown; done?: unknown };\n" +
      "  return (\n" +
      "    typeof o.id === \"string\" &&\n" +
      "    typeof o.text === \"string\" &&\n" +
      "    typeof o.done === \"boolean\"\n" +
      "  );\n" +
      "};\n" +
      "```\n\n" +
      "**`v is Todo` が今回の新しいものです。**\n\n" +
      "戻り値の型に `boolean` ではなく `v is Todo` と書くと、" +
      "「**この関数が `true` を返したなら、その値は `Todo` として扱ってよい**」" +
      "と型に教えられます。これを**型ガード**と呼びます。\n\n" +
      "`as` との違いはこれです。\n\n" +
      "```\n" +
      "as       … 確かめずに「そうだ」と言う。嘘をつける\n" +
      "v is T   … 中身を確かめる関数。嘘をつけない\n" +
      "```\n\n" +
      "**`typeof` の読み方です。**\n\n" +
      "`typeof v` は値の種類を文字列で返します。" +
      "`typeof \"あ\"` は `\"string\"`、`typeof 1` は `\"number\"`、`typeof true` は `\"boolean\"`。\n\n" +
      "1つ罠があります。**`typeof null` は `\"object\"` です**（JavaScript の古い仕様）。" +
      "だから `v === null` を別に確かめる必要があります。\n\n" +
      "**そして使い方です。**\n\n" +
      "```\n" +
      "if (!Array.isArray(parsed)) return [];\n" +
      "return parsed.filter(isTodo);\n" +
      "```\n\n" +
      "`Array.isArray(...)` で配列かどうかを確かめます。配列でなければ空配列。\n\n" +
      "そして `filter(isTodo)` を通します。⑥で使った `filter` です。\n" +
      "**型ガードを `filter` に渡すと、戻り値の型が `Todo[]` になります。**\n" +
      "`as` は要りません。**本当に確かめたので、型が納得しています。**\n\n" +
      "不正な要素は落とします。**1件おかしいだけで全部捨てるより親切**です。\n\n" +
      "覚え方はこうです。\n" +
      "**境界では、型を主張するのではなく確かめる。**",
  },
  explanation:
    "型アサーション（`as`）は値の内容を検証しないため、外部から来たデータには使えません。" +
    "`(v: unknown): v is Todo` という戻り値の型を持つ関数は型ガードと呼ばれ、" +
    "`true` を返した場合に限り、その値を指定の型として扱えるようになります。" +
    "`typeof` は値の種類を文字列で返しますが、`typeof null` は `\"object\"` になるため、" +
    "`null` は個別に判定する必要があります。" +
    "`Array.isArray` で配列であることを確認し、型ガードを `filter` に渡すと、" +
    "戻り値の型が検証済みの配列型に確定します。" +
    "不正な要素だけを除外すれば、一部の破損で全データを失うことを避けられます。",

  starterCode: `// todo.ts
//
// ⑨の続きです。as を本物の検証に置き換えます。これで読み込みは完成します。
// ①〜⑨のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜⑨と同じ型と7つの関数を書く（saveTodos まで）。
//
//   2. isTodo という関数を作る。
//        - 引数は v（unknown 型）
//        - 戻り値の型は「v is Todo」と書く（boolean ではない）
//        - v が Todo の形をしているかを実際に確かめて true / false を返す
//          （id が文字列 / text が文字列 / done が真偽値）
//        - 注意: typeof null は "object" になるので、null を別に確かめること
//
//   3. loadTodos を次のように直す。
//        - 何も保存されていない → 空配列
//        - 壊れた JSON → 空配列
//        - 配列ではないものが入っている → 空配列
//        - 配列だが Todo でない要素が混ざっている → その要素だけを除いて返す
//
//   as Todo[] は使いません。isTodo を filter に渡します。

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

const STORAGE_KEY = "todos";

const saveTodos = (list: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// v is Todo が今回の新しいところ。
// boolean ではなくこう書くと、「true を返したならその値は Todo として
// 扱ってよい」と型に教えられる。これを型ガードと呼ぶ。
//
// as と違って、中身を実際に確かめている。だから嘘をつけない。
const isTodo = (v: unknown): v is Todo => {
  // typeof は値の種類を文字列で返す。"object" / "string" / "boolean" など。
  if (typeof v !== "object") {
    return false;
  }
  // 罠: typeof null は "object" になる（JavaScript の古い仕様）。
  // だから null は別に確かめる必要がある。
  if (v === null) {
    return false;
  }

  // ここまで来れば object であることは分かった。
  // 項目を見るために、いったん「項目があるかもしれない箱」として扱う。
  const o = v as { id?: unknown; text?: unknown; done?: unknown };

  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    typeof o.done === "boolean"
  );
};

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  // 配列ですらない可能性がある（別のアプリが同じキーに書いた等）。
  if (!Array.isArray(parsed)) {
    return [];
  }

  // 型ガードを filter に渡すと、戻り値の型が Todo[] に確定する。
  // as は要らない。本当に確かめたので型が納得している。
  //
  // 不正な要素は落とす。1件おかしいだけで全部捨てるより親切。
  return parsed.filter(isTodo);
};
`,

  hints: [
    {
      level: 1,
      text: "2つのことをします。`isTodo` を新しく書き、`loadTodos` の最後の `as` を `filter(isTodo)` に置き換えます。配列かどうかの確認（`Array.isArray`）も足します。",
    },
    {
      level: 2,
      text: "`isTodo` の形は `const isTodo = (v: unknown): v is Todo => { ... };` です。中では `typeof v !== \"object\"` と `v === null` を先に弾き、そのあと各項目の `typeof` を見ます。",
    },
    {
      level: 3,
      text: "項目を見るには `const o = v as { id?: unknown; text?: unknown; done?: unknown };` といったん受けます（ここでの `as` は「項目があるかもしれない箱」として扱うだけなので問題ありません）。最後は `return parsed.filter(isTodo);` です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-10-1",
      description: "`loadTodos` は `Todo[]` を返す型か（`any` になっていないか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof loadTodos>, Todo[]>>;
type _c2 = Expect<NotAny<ReturnType<typeof loadTodos>>>;`,
      },
    },
    {
      id: "cp-sc-10-2",
      description: "`isTodo` は型ガードになっているか（`v is Todo` と書いたか）？",
      verify: {
        kind: "type",
        assert: `const _v: unknown = { id: "1", text: "x", done: false };
if (isTodo(_v)) {
  type _c3 = Expect<Equal<typeof _v, Todo>>;
}`,
      },
    },
    {
      id: "cp-sc-10-3",
      description: "正しい形なら true、違えば false を返すか？",
      verify: {
        kind: "run",
        assert: `assertTrue(isTodo({ id: "1", text: "x", done: false }), "正しい形を false にしている");
assertTrue(!isTodo({ id: 1, text: "x", done: false }), "id が数値なのに true にしている");
assertTrue(!isTodo({ id: "1", text: "x" }), "done が無いのに true にしている");
assertTrue(!isTodo(null), "null を true にしている（typeof null は object なので注意）");
assertTrue(!isTodo("文字列"), "文字列を true にしている");`,
      },
    },
    {
      id: "cp-sc-10-4",
      description: "正常な保存データはこれまで通り読み戻せるか？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
saveTodos(addTodo(addTodo([], "牛乳"), "パン"));
var back = loadTodos();
assertEqual(back.length, 2, "2件読み戻せない");
assertEqual(back[0].text, "牛乳", "内容が戻ってこない");`,
      },
    },
    {
      id: "cp-sc-10-5",
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
      id: "cp-sc-10-6",
      description: "形が違う要素だけを除き、正しい要素は残すか（今回の要点）？",
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
assertEqual(r.length, 2, "不正な要素を除けていない");
assertEqual(r.map(function (t) { return t.text; }), ["正しい", "これも正しい"], "残る要素が違う");`,
      },
    },
    {
      id: "cp-sc-10-7",
      description: "`as` と型ガードの違いを、自分の言葉で言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "型ガード", "unknown", "境界の検証"],
  relatedIds: ["sc-09-survive-broken-json", "sc-11-from-scratch", "ts-15-api-fetch"],
};
