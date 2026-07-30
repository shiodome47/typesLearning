import type { Lesson } from "../types";

export const scLesson02: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-02-hold-the-list",
  order: 51,
  title: "② 一覧に足す — 元の配列を壊さない",
  category: "scratch",
  difficulty: 2,

  goal: "元のデータを書き換えずに、新しい状態を返す形で操作を書けるようになる",

  why: {
    problem:
      "①で `createTodo` ができました。次は一覧に足します。\n\n" +
      "素直に書くと、こうなります。\n\n" +
      "```\n" +
      "const addTodo = (list: Todo[], text: string): void => {\n" +
      "  list.push(createTodo(text));\n" +
      "};\n" +
      "```\n\n" +
      "動きます。テストも書けます。そして**画面に出したときに更新されません**。\n\n" +
      "React でも Svelte でも Vue でも同じことが起きます。" +
      "これらは「値が変わったか」を見て再描画を決めますが、" +
      "`push` は**同じ配列の中身を変える**だけなので、" +
      "「配列そのものは変わっていない」と判断されます。\n\n" +
      "そして原因がここだと気づくのは、かなり難しいです。" +
      "データは正しく増えています。`console.log` すれば3件あります。" +
      "画面だけが2件のまま。**バグはデータ側ではなく、変え方の側にあります**。\n\n" +
      "もう1つ、地味に効いてくる問題があります。" +
      "`push` すると**元の状態が消えます**。" +
      "「元に戻す」を後から足したくなったとき、戻る先がもう存在しません。",
    insight:
      "原則は1つです。**変えるのではなく、新しく作って返す。**\n\n" +
      "```\n" +
      "const addTodo = (list: Todo[], text: string): Todo[] =>\n" +
      "  [...list, createTodo(text)];\n" +
      "```\n\n" +
      "`[...list, 新しい要素]` は、**元の配列に触らずに**" +
      "「元の中身 + 1件」の新しい配列を作ります。\n\n" +
      "これで3つのことが同時に手に入ります。\n\n" +
      "**1. 画面が更新される。** 配列そのものが別物になるので、変わったと判断されます。\n\n" +
      "**2. 元に戻せる。** 前の配列がそのまま残っているので、履歴を持てます。\n\n" +
      "**3. テストが書きやすい。** 引数を渡して戻り値を見るだけで済みます。" +
      "`void` を返す関数は、何が起きたかを確かめるために外の変数を覗く必要があります。\n\n" +
      "見分け方はこうです。\n\n" +
      "```\n" +
      "list.push(x)     // 元を変える。戻り値は新しい長さ（使わない）\n" +
      "[...list, x]     // 元は変えない。新しい配列が返る\n" +
      "```\n\n" +
      "`sort` と `reverse` にも同じ罠があります。**どちらも元の配列を並べ替えます。**\n" +
      "並べ替えたいときは `[...list].sort(...)` と、先に複製してください。\n\n" +
      "覚え方はこうです。\n" +
      "**戻り値が `void` の関数は、たいてい元を壊している。**\n" +
      "状態を扱う関数は、新しい状態を返すようにします。",
  },
  explanation:
    "配列を `push` や `sort` で直接変更すると、配列そのものの同一性は変わりません。" +
    "React / Svelte / Vue はいずれも参照や値の変化を見て再描画を決めるため、" +
    "中身だけが変わった配列は「変わっていない」と判断され、画面が更新されません。" +
    "`[...list, item]` のように新しい配列を作って返すと、同一性が変わるため再描画されます。" +
    "また元の状態が保持されるので、履歴や取り消し機能を後から追加できます。" +
    "状態を扱う関数の戻り値を `void` ではなく新しい状態にしておくと、" +
    "引数と戻り値だけでテストできるようになります。",

  starterCode: `// todo.ts
//
// ①の続きです。一覧に足す機能を作ります。
// ①で書いた Todo 型と createTodo も、この回でもう一度書いてください
// （前の回のコードは残っていません）。
//
// 【要件】
//
// 1. ①と同じ Todo 型と createTodo を用意する。
//
// 2. addTodo(list: Todo[], text: string): Todo[] を作る。
//      - 一覧の末尾に1件足した「新しい配列」を返す
//      - 渡された list は変更しない（ここが今回の要点）
//      - 何度呼んでも足せる
//
// push を使わずに書いてください。理由は「なぜ必要か」に書いてあります。

`,

  modelAnswer: `// todo.ts
//
// 変えるのではなく、新しく作って返す。

type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => ({
  id: String(nextId++),
  text,
  done: false,
});

// 戻り値が Todo[] であることが要点。
// void を返す関数は、たいてい元を壊している。
const addTodo = (list: Todo[], text: string): Todo[] =>
  // [...list, x] は元の配列に触らない。
  // 「元の中身 + 1件」の新しい配列を作って返す。
  //
  // list.push(x) だと配列そのものは同じもののままなので、
  // 画面を持つフレームワークは「変わっていない」と判断して再描画しない。
  [...list, createTodo(text)];

export { createTodo, addTodo };
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "①のコード（`Todo` 型と `createTodo`）をもう一度書いてから、`addTodo` を足します。`addTodo` の戻り値の型は `void` ではなく `Todo[]` です。ここが決まれば中身は1行です。",
    },
    {
      level: 2,
      text: "`const addTodo = (list: Todo[], text: string): Todo[] => ...` の右辺で、スプレッド構文（`...`）を使います。「元の中身を全部展開して、そのうしろに1件足す」という形です。",
    },
    {
      level: 3,
      text: "`[...list, createTodo(text)]` です。`list.push(...)` は使いません。`push` は元の配列の中身を変えてしまい、配列そのものは同じもののままなので、画面が更新されません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-02-1",
      description: "`addTodo` は新しい配列を返す型になっているか（`void` ではないか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof addTodo>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-02-2",
      description: "1件足すと1件増えるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var r = addTodo([], "牛乳");
assertEqual(r.length, 1, "1件になる");
assertEqual(r[0].text, "牛乳", "足したものが入っている");
assertEqual(r[0].done, false, "未完で入る");`,
      },
    },
    {
      id: "cp-sc-02-3",
      description: "渡した配列を書き換えていないか（`push` を使っていないか）？",
      verify: {
        kind: "run",
        assert: `var original = [];
addTodo(original, "牛乳");
assertEqual(original.length, 0, "元の配列が書き換えられている（push を使っている）");`,
      },
    },
    {
      id: "cp-sc-02-4",
      description: "続けて足せるか（2件、3件と増えるか）？",
      verify: {
        kind: "run",
        assert: `var a = addTodo([], "1つ目");
var b = addTodo(a, "2つ目");
var c = addTodo(b, "3つ目");
assertEqual(c.length, 3, "3件になる");
assertEqual(c[2].text, "3つ目", "末尾に足される");
assertEqual(a.length, 1, "途中の状態が壊れている");`,
      },
    },
    {
      id: "cp-sc-02-5",
      description: "足した項目の id が重複していないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
assertTrue(list[0].id !== list[1].id, "id が重複している");`,
      },
    },
    {
      id: "cp-sc-02-6",
      description:
        "`push` で書いた場合に画面が更新されない理由を、自分の言葉で言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "不変性", "配列", "状態管理"],
  relatedIds: ["sc-01-decide-the-type", "sc-03-toggle-and-remove"],
};
