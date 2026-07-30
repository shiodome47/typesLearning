import type { Lesson } from "../types";

export const scLesson03: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-03-toggle-and-remove",
  order: 52,
  title: "③ 1件だけ変える — id で探す",
  category: "scratch",
  difficulty: 3,

  goal: "一覧の中の1件だけを、位置ではなく id で特定して変更・削除できるようになる",

  why: {
    problem:
      "完了のチェックを付けられるようにします。「3番目を完了にする」ですね。\n\n" +
      "```\n" +
      "const toggle = (list: Todo[], index: number): Todo[] => { ... };\n" +
      "```\n\n" +
      "動きます。テストも通ります。そして**未完だけ表示する機能を足した日に壊れます**。\n\n" +
      "画面には未完の3件が出ています。利用者は3番目にチェックを付けます。" +
      "しかし配列には完了済みも入っているので、配列の3番目は**別のもの**です。\n" +
      "**違う項目が完了になります。**\n\n" +
      "並べ替えでも同じことが起きます。期限順に並べ替えて表示したら、" +
      "画面の1番目と配列の1番目が一致しません。\n\n" +
      "そしてこの不具合は、**再現しにくい**という性質を持っています。" +
      "絞り込みや並べ替えをしていない状態では正しく動くので、" +
      "「たまに違うものが消える」という報告になり、原因が掴めません。\n\n" +
      "もう1つ、削除には別の落とし穴があります。" +
      "`splice` を使うと元の配列を壊しますが、それだけでなく" +
      "**存在しない位置を渡されたときに黙って別のものを消します**。",
    insight:
      "①で `id` を持たせたのは、まさにこのためです。**位置ではなく id で探します。**\n\n" +
      "```\n" +
      "const toggleTodo = (list: Todo[], id: string): Todo[] =>\n" +
      "  list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));\n" +
      "```\n\n" +
      "`map` は元の配列に触らず、**同じ長さの新しい配列**を作ります。\n" +
      "その中で、`id` が一致した1件だけを差し替えます。\n\n" +
      "**`{ ...t, done: !t.done }` の形が肝です。**\n" +
      "「元の中身をそのまま写して、`done` だけ入れ替えた**新しいオブジェクト**」という意味です。\n" +
      "`t.done = !t.done` と書くと元のオブジェクトを壊すので、②と同じ問題が起きます。\n\n" +
      "一致しなかった項目は `t` をそのまま返します。**触らないものは触らない。**\n\n" +
      "削除は `filter` です。\n\n" +
      "```\n" +
      "const removeTodo = (list: Todo[], id: string): Todo[] =>\n" +
      "  list.filter((t) => t.id !== id);\n" +
      "```\n\n" +
      "「`id` が違うものだけを残す」と書くと、削除になります。\n" +
      "`splice` と違って元を壊さず、**存在しない id を渡されても何も起きません**。" +
      "全部残るだけです。\n\n" +
      "この「無い id を渡されたらどうするか」は、自分で決める仕様です。\n" +
      "例外にする手もありますが、削除は**何度押しても同じ結果**であってほしい操作なので、" +
      "「無ければ何もしない」が扱いやすい。\n\n" +
      "覚え方はこうです。\n" +
      "**1件変える → `map` で差し替え。1件消す → `filter` で残す。どちらも id で探す。**",
  },
  explanation:
    "一覧の要素を位置（index）で指定すると、絞り込みや並べ替えを入れた時点で" +
    "画面上の位置と配列の位置が一致しなくなり、意図しない要素を操作してしまいます。" +
    "識別子で指定すれば、表示順や絞り込みの有無に関係なく1件を特定できます。" +
    "変更は `map` で同じ長さの新しい配列を作り、一致した要素だけを" +
    "`{ ...t, 変更したいキー: 新しい値 }` の形で差し替えます。" +
    "削除は `filter` で「条件に合わないものだけを残す」と表現します。" +
    "どちらも元の配列を変更しないため、②で扱った再描画の問題も起きません。" +
    "存在しない識別子を渡されたときの挙動は仕様として決める必要があり、" +
    "削除については「何もしない」を選ぶと、同じ操作を繰り返しても結果が変わりません。",

  starterCode: `// todo.ts
//
// ②の続きです。1件だけを変える・消す機能を作ります。
// これまでの Todo / createTodo / addTodo も書いてください。
//
// 【要件】
//
// 1. これまでと同じ Todo / createTodo / addTodo を用意する。
//
// 2. toggleTodo(list: Todo[], id: string): Todo[] を作る。
//      - id が一致する1件の done を反転させた「新しい配列」を返す
//      - 他の項目は変更しない
//      - 渡された list も、その中のオブジェクトも書き換えない
//      - 一致する id が無ければ、何も変わらない配列を返す
//
// 3. removeTodo(list: Todo[], id: string): Todo[] を作る。
//      - id が一致する1件を除いた「新しい配列」を返す
//      - 一致する id が無ければ、何も減らない
//
// index（何番目か）は使いません。理由は「なぜ必要か」に書いてあります。

`,

  modelAnswer: `// todo.ts
//
// 1件変える → map で差し替え。1件消す → filter で残す。
// どちらも id で探す。

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
  // map は元の配列に触らず、同じ長さの新しい配列を作る。
  list.map((t) =>
    t.id === id
      // 元の中身を写して done だけ入れ替えた「新しいオブジェクト」。
      // t.done = !t.done と書くと元を壊す。
      ? { ...t, done: !t.done }
      // 一致しないものは触らない。
      : t
  );

const removeTodo = (list: Todo[], id: string): Todo[] =>
  // 「id が違うものだけを残す」と書くと削除になる。
  // splice と違って元を壊さず、無い id を渡されても全部残るだけ。
  list.filter((t) => t.id !== id);

export { createTodo, addTodo, toggleTodo, removeTodo };
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "使うのは `map` と `filter` です。どちらも新しい配列を返すので、②で学んだ「元を壊さない」が自動的に満たされます。引数は index ではなく id です。",
    },
    {
      level: 2,
      text: "`toggleTodo` は `list.map((t) => t.id === id ? ... : t)` の形です。一致したときに返すオブジェクトは、`t` を書き換えるのではなく新しく作ります。`removeTodo` は `list.filter(...)` の1行です。",
    },
    {
      level: 3,
      text: "`toggleTodo` は `list.map((t) => (t.id === id ? { ...t, done: !t.done } : t))`、`removeTodo` は `list.filter((t) => t.id !== id)` です。`filter` の条件が `!==` になっていることに注意してください（残すものを書きます）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-03-1",
      description: "`toggleTodo` / `removeTodo` は id を受け取る形になっているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Parameters<typeof toggleTodo>, [Todo[], string]>>;
type _c2 = Expect<Equal<Parameters<typeof removeTodo>, [Todo[], string]>>;`,
      },
    },
    {
      id: "cp-sc-03-2",
      description: "指定した1件だけ完了になるか（他は変わらないか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var after = toggleTodo(list, list[1].id);
assertEqual(after[1].done, true, "指定した1件が完了になる");
assertEqual(after[0].done, false, "指定していない項目まで変わっている");
assertEqual(after.length, 2, "件数が変わってしまっている");`,
      },
    },
    {
      id: "cp-sc-03-3",
      description: "もう一度呼ぶと未完に戻るか（反転しているか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
var once = toggleTodo(list, list[0].id);
var twice = toggleTodo(once, list[0].id);
assertEqual(twice[0].done, false, "2回押したら元に戻る（反転になっていない）");`,
      },
    },
    {
      id: "cp-sc-03-4",
      description: "元の配列と、その中のオブジェクトを壊していないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
toggleTodo(list, list[0].id);
assertEqual(list[0].done, false, "元のオブジェクトを書き換えている（t.done = ... になっている）");
removeTodo(list, list[0].id);
assertEqual(list.length, 1, "元の配列を書き換えている（splice を使っている）");`,
      },
    },
    {
      id: "cp-sc-03-5",
      description: "指定した1件だけ消えるか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var after = removeTodo(list, list[0].id);
assertEqual(after.length, 1, "1件だけ減る");
assertEqual(after[0].text, "B", "残る項目が違う");`,
      },
    },
    {
      id: "cp-sc-03-6",
      description: "存在しない id を渡しても壊れないか（境界）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
assertEqual(removeTodo(list, "存在しない").length, 1, "無い id で消えてしまっている");
assertEqual(toggleTodo(list, "存在しない")[0].done, false, "無い id で変わってしまっている");`,
      },
    },
    {
      id: "cp-sc-03-7",
      description:
        "index で指定すると、どんな機能を足した日に壊れるか説明できるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "map", "filter", "不変性", "id"],
  relatedIds: ["sc-02-hold-the-list", "sc-04-derive-dont-store"],
};
