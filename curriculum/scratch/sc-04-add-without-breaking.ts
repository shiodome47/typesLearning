import type { Lesson } from "../types";

export const scLesson04: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-04-add-without-breaking",
  order: 53,
  title: "④ 配列に足す — 元を壊さない",
  category: "scratch",
  difficulty: 2,

  goal: "元の配列を書き換えずに、1件足した新しい配列を返せるようになる",

  why: {
    problem:
      "1件作れるようになったので、一覧に足します。素直に書くとこうです。\n\n" +
      "```\n" +
      "const addTodo = (list: Todo[], text: string) => {\n" +
      "  list.push(createTodo(text));\n" +
      "};\n" +
      "```\n\n" +
      "動きます。データは増えます。そして**画面に出したときに更新されません**。\n\n" +
      "React でも Svelte でも Vue でも同じです。" +
      "これらは「値が変わったか」を見て描き直しますが、`push` は" +
      "**同じ配列の中身を変えるだけ**なので、「配列そのものは変わっていない」と判断されます。\n\n" +
      "原因を見つけるのは難しいです。`console.log` すればちゃんと3件ある。画面だけが2件のまま。",
    insight:
      "原則は1つです。**変えるのではなく、新しく作って返す。**\n\n" +
      "```\n" +
      "const addTodo = (list: Todo[], text: string): Todo[] => {\n" +
      "  return [...list, createTodo(text)];\n" +
      "};\n" +
      "```\n\n" +
      "`[...list, 新しい要素]` の読み方です。\n\n" +
      "`[ ]` … 新しい配列を作ります\n" +
      "`...list` … `list` の中身を**1個ずつ並べて入れます**（コピーです）\n" +
      "`, createTodo(text)` … そのうしろに1件足します\n\n" +
      "`...` は**スプレッド構文**と呼びます。「中身を展開する」という意味です。\n" +
      "`[...[1, 2], 3]` は `[1, 2, 3]` になります。\n\n" +
      "**元の `list` には一切触っていません。** 中身をコピーして新しい箱に入れただけです。\n\n" +
      "これで3つのことが同時に手に入ります。\n\n" +
      "**1. 画面が更新される。** 配列そのものが別物になるので、変わったと判断されます。\n\n" +
      "**2. 元に戻せる。** 前の配列が残っているので、あとで「取り消し」を作れます。\n\n" +
      "**3. テストしやすい。** 引数を渡して戻り値を見るだけです。\n\n" +
      "型の話も1つあります。**`Todo[]`** は「`Todo` が並んだ配列」という意味です。\n" +
      "`string[]` なら文字列の配列、`number[]` なら数値の配列。**`[]` を付けるだけ**です。\n\n" +
      "見分け方はこうです。\n\n" +
      "```\n" +
      "list.push(x)     // 元を変える。使わない\n" +
      "[...list, x]     // 元は変えない。こちらを使う\n" +
      "```\n\n" +
      "`sort` と `reverse` にも同じ罠があります。**どちらも元の配列を並べ替えます。**\n" +
      "並べ替えたいときは `[...list].sort(...)` と、先にコピーしてください。",
  },
  explanation:
    "配列を `push` や `sort` で直接変更すると、配列そのものの同一性は変わりません。" +
    "React / Svelte / Vue はいずれも値の変化を見て再描画を決めるため、" +
    "中身だけが変わった配列は「変わっていない」と判断され、画面が更新されません。" +
    "スプレッド構文 `[...list, item]` は元の配列の要素をコピーした新しい配列を作るため、" +
    "同一性が変わり、再描画されます。元の状態も保持されるので取り消し機能を後から追加できます。" +
    "`Todo[]` は `Todo` の配列という型で、任意の型に `[]` を付けて表せます。",

  starterCode: `// todo.ts
//
// ③の続きです。一覧に1件足す関数を書きます。
// ①〜③のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜③と同じ Todo 型と createTodo を書く。
//
//   2. addTodo という関数を作る。
//        - 引数は2つ: list（Todo の配列）と text（文字列）
//        - 末尾に1件足した「新しい配列」を返す
//        - 渡された list は変更しない（ここが今回の要点）
//
// push は使いません。理由は「なぜ必要か」に書いてあります。

`,

  modelAnswer: `// todo.ts

type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => {
  const id = String(nextId);
  nextId = nextId + 1;
  return { id: id, text: text, done: false };
};

// Todo[] は「Todo が並んだ配列」という型。
// 戻り値が Todo[] であることが要点。
// 何も返さない（void）関数は、たいてい元を壊している。
const addTodo = (list: Todo[], text: string): Todo[] => {
  // [ ]      ... 新しい配列を作る
  // ...list  ... list の中身を1個ずつ並べて入れる（コピー）
  // , x      ... そのうしろに1件足す
  //
  // 元の list には触っていない。
  // list.push(x) だと配列そのものは同じもののままなので、
  // 画面を持つフレームワークは「変わっていない」と判断して描き直さない。
  return [...list, createTodo(text)];
};
`,

  hints: [
    {
      level: 1,
      text: "③のコードに関数を1つ足します。`const addTodo = (list: Todo[], text: string): Todo[] => { ... };` という枠を先に書いてください。中身は1行です。",
    },
    {
      level: 2,
      text: "新しい配列を作って返します。`return [ ... ];` の中に「元の中身」と「新しい1件」を並べます。元の中身を展開するには `...` を使います。",
    },
    {
      level: 3,
      text: "`return [...list, createTodo(text)];` です。`list.push(...)` は使いません。`push` は元の配列の中身を変えてしまい、配列そのものは同じもののままなので画面が更新されません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-04-1",
      description: "`addTodo` は新しい配列を返す型か（`void` ではないか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof addTodo>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-04-2",
      description: "1件足すと1件増えるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var r = addTodo([], "牛乳");
assertEqual(r.length, 1, "1件になっていない");
assertEqual(r[0].text, "牛乳", "足したものが入っていない");
assertEqual(r[0].done, false, "未完で入っていない");`,
      },
    },
    {
      id: "cp-sc-04-3",
      description: "渡した配列を書き換えていないか（`push` を使っていないか）？",
      verify: {
        kind: "run",
        assert: `var original = [];
addTodo(original, "牛乳");
assertEqual(original.length, 0, "元の配列が書き換えられている（push を使っている）");`,
      },
    },
    {
      id: "cp-sc-04-4",
      description: "続けて足せるか（前の状態も壊れていないか）？",
      verify: {
        kind: "run",
        assert: `var a = addTodo([], "1つ目");
var b = addTodo(a, "2つ目");
assertEqual(b.length, 2, "2件にならない");
assertEqual(b[1].text, "2つ目", "末尾に足されていない");
assertEqual(a.length, 1, "途中の状態が壊れている");`,
      },
    },
    {
      id: "cp-sc-04-5",
      description: "`push` で書くと画面が更新されない理由を言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "スプレッド構文", "不変性", "配列"],
  relatedIds: ["sc-03-unique-id", "sc-05-toggle-one"],
};
