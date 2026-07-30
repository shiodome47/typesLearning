import type { Lesson } from "../types";

export const scLesson05: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-05-toggle-one",
  order: 54,
  title: "⑤ 1件だけ完了にする",
  category: "scratch",
  difficulty: 3,

  goal: "配列の中の1件だけを、id で見つけて差し替えられるようになる",

  why: {
    problem:
      "完了のチェックを付けます。「3番目を完了にする」と考えて、こう書きたくなります。\n\n" +
      "```\n" +
      "const toggle = (list: Todo[], index: number) => { ... };\n" +
      "```\n\n" +
      "動きます。そして**「未完だけ表示」を足した日に壊れます**。\n\n" +
      "画面には未完の3件が出ています。利用者が3番目を押します。\n" +
      "でも配列には完了済みも入っているので、配列の3番目は**別のもの**です。\n" +
      "**違う項目が完了になります。**\n\n" +
      "しかもこの不具合は、絞り込みをしていない状態では正しく動くので、" +
      "「たまに違うものが変わる」という掴みにくい報告になります。",
    insight:
      "①で `id` を持たせたのは、まさにこのためです。**位置ではなく id で探します。**\n\n" +
      "```\n" +
      "const toggleTodo = (list: Todo[], id: string): Todo[] => {\n" +
      "  return list.map((t) => {\n" +
      "    if (t.id === id) {\n" +
      "      return { id: t.id, text: t.text, done: !t.done };\n" +
      "    }\n" +
      "    return t;\n" +
      "  });\n" +
      "};\n" +
      "```\n\n" +
      "**`map` の読み方です。**\n\n" +
      "`list.map((t) => ...)` は「`list` の要素を1つずつ `t` に入れて、" +
      "**返した値で新しい配列を作る**」という意味です。\n" +
      "元の配列には触りません。長さも変わりません。\n\n" +
      "```\n" +
      "[1, 2, 3].map((n) => n * 2)   →   [2, 4, 6]\n" +
      "```\n\n" +
      "だから中で「一致したら新しいもの、違えばそのまま」を返せば、1件だけ差し替わります。\n\n" +
      "**`!t.done` の読み方です。**\n\n" +
      "`!` は「逆にする」です。`!true` は `false`、`!false` は `true`。\n" +
      "だから `!t.done` は「いまの逆」。押すたびに切り替わります。\n\n" +
      "**ここが一番大事です。** 一致したとき、`t` を書き換えてはいけません。\n\n" +
      "```\n" +
      "t.done = !t.done;                                   // ✗ 元を壊している\n" +
      "return { id: t.id, text: t.text, done: !t.done };   // ○ 新しく作っている\n" +
      "```\n\n" +
      "④と同じ理由です。**元を書き換えると画面が更新されません。**\n" +
      "`map` で新しい配列を作っても、中のオブジェクトが同じものなら意味がありません。\n\n" +
      "なお `{ ...t, done: !t.done }` という短い書き方もあります" +
      "（「`t` の中身を全部写して、`done` だけ差し替える」）。" +
      "④で覚えた `...` の、オブジェクト版です。**慣れたらこちらでも構いません。**",
  },
  explanation:
    "要素を位置（index）で指定すると、絞り込みや並べ替えを入れた時点で" +
    "画面上の位置と配列の位置が一致しなくなり、意図しない要素を操作します。" +
    "識別子で指定すれば表示順に関係なく1件を特定できます。" +
    "`map` は各要素に関数を適用し、返り値から新しい配列を作ります。元の配列は変更されません。" +
    "一致した要素については、既存のオブジェクトを書き換えるのではなく新しいオブジェクトを返します。" +
    "オブジェクトを書き換えると、配列が新しくても中身の同一性が変わらないため再描画されません。",

  starterCode: `// todo.ts
//
// ④の続きです。1件だけ完了/未完を切り替える関数を書きます。
// ①〜④のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜④と同じ Todo 型 / createTodo / addTodo を書く。
//
//   2. toggleTodo という関数を作る。
//        - 引数は2つ: list（Todo の配列）と id（文字列）
//        - id が一致する1件の done を反転させた「新しい配列」を返す
//        - 他の項目は変えない
//        - 渡された list も、その中のオブジェクトも書き換えない
//        - 一致する id が無ければ、何も変わらない配列を返す
//
// index（何番目か）は使いません。
// 使うのは map です。

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
  // map は要素を1つずつ t に入れて、返した値で新しい配列を作る。
  // 元の配列には触らない。長さも変わらない。
  return list.map((t) => {
    if (t.id === id) {
      // 一致した1件だけ差し替える。
      //
      // t.done = !t.done と書くと元のオブジェクトを壊すので、
      // 新しいオブジェクトを作って返す。
      // ! は「逆にする」。押すたびに切り替わる。
      //
      // 短く書くなら { ...t, done: !t.done } でもよい。
      return { id: t.id, text: t.text, done: !t.done };
    }
    // 一致しないものは、そのまま返す。触らない。
    return t;
  });
};
`,

  hints: [
    {
      level: 1,
      text: "`list.map((t) => { ... })` の形を先に書いてください。中で「`t.id` が引数の `id` と同じなら差し替え、違えばそのまま返す」と書きます。",
    },
    {
      level: 2,
      text: "比較は `t.id === id` です（`===` は3つ）。反転は `!t.done`。一致したときは新しいオブジェクトを `return` し、一致しないときは `return t;` とします。",
    },
    {
      level: 3,
      text: "一致したときに返すのは `{ id: t.id, text: t.text, done: !t.done }` です。`t.done = !t.done;` と書かないでください。それは元のオブジェクトを書き換えているので、④で学んだ問題が起きます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-05-1",
      description: "`toggleTodo` は id（文字列）を受け取り、配列を返すか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Parameters<typeof toggleTodo>, [Todo[], string]>>;
type _c2 = Expect<Equal<ReturnType<typeof toggleTodo>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-05-2",
      description: "指定した1件だけ完了になるか（他は変わらないか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var after = toggleTodo(list, list[1].id);
assertEqual(after[1].done, true, "指定した1件が完了になっていない");
assertEqual(after[0].done, false, "指定していない項目まで変わっている");
assertEqual(after.length, 2, "件数が変わってしまっている");`,
      },
    },
    {
      id: "cp-sc-05-3",
      description: "もう一度呼ぶと未完に戻るか（反転しているか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
var once = toggleTodo(list, list[0].id);
var twice = toggleTodo(once, list[0].id);
assertEqual(twice[0].done, false, "2回押しても元に戻らない（反転になっていない）");`,
      },
    },
    {
      id: "cp-sc-05-4",
      description: "元の配列とその中のオブジェクトを壊していないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
toggleTodo(list, list[0].id);
assertEqual(list[0].done, false, "元のオブジェクトを書き換えている（t.done = ... になっている）");`,
      },
    },
    {
      id: "cp-sc-05-5",
      description: "存在しない id を渡しても壊れないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
var r = toggleTodo(list, "存在しない");
assertEqual(r.length, 1, "件数が変わってしまっている");
assertEqual(r[0].done, false, "無い id を渡したのに変わってしまっている");`,
      },
    },
    {
      id: "cp-sc-05-6",
      description: "index で指定すると、どんな機能を足した日に壊れるか言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "map", "不変性", "id"],
  relatedIds: ["sc-04-add-without-breaking", "sc-06-remove-one"],
};
