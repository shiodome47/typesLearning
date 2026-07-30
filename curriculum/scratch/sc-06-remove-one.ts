import type { Lesson } from "../types";

export const scLesson06: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-06-remove-one",
  order: 55,
  title: "⑥ 1件だけ消す",
  category: "scratch",
  difficulty: 2,

  goal: "「残すものの条件」を書いて削除を表現できるようになる",

  why: {
    problem:
      "削除を作ります。素直に考えると「消す」処理を書きたくなります。\n\n" +
      "```\n" +
      "list.splice(index, 1);   // index の位置から1件消す\n" +
      "```\n\n" +
      "これには2つ問題があります。\n\n" +
      "1つ目は④⑤と同じで、**元の配列を壊します**。画面が更新されません。\n\n" +
      "2つ目はもっと厄介です。**存在しない位置を渡されたときに、黙って別のものを消します。**\n" +
      "`splice(-1, 1)` は末尾を消し、`splice(99, 1)` は何も消しません。" +
      "どちらもエラーになりません。",
    insight:
      "考え方をひっくり返します。**「消す」のではなく「残すものを選ぶ」。**\n\n" +
      "```\n" +
      "const removeTodo = (list: Todo[], id: string): Todo[] => {\n" +
      "  return list.filter((t) => t.id !== id);\n" +
      "};\n" +
      "```\n\n" +
      "これで削除になります。1行です。\n\n" +
      "**`filter` の読み方です。**\n\n" +
      "`list.filter((t) => 条件)` は「条件が `true` になった要素だけを集めて、" +
      "**新しい配列を作る**」という意味です。⑤の `map` と同じく、元には触りません。\n\n" +
      "```\n" +
      "[1, 2, 3, 4].filter((n) => n > 2)   →   [3, 4]\n" +
      "```\n\n" +
      "**`!==` の向きに注意してください。**\n\n" +
      "書くのは「残す条件」です。だから「**id が違うものを残す**」＝ `t.id !== id`。\n" +
      "`===` にすると、指定した1件**だけ**が残ります。逆になります。\n\n" +
      "この形には嬉しいことが3つあります。\n\n" +
      "**1. 元を壊さない。** 新しい配列が返るだけです。\n\n" +
      "**2. 存在しない id でも壊れない。** 全部が「違う」ので、全部残ります。" +
      "つまり**何も起きません**。例外にもなりません。\n\n" +
      "**3. 何度押しても同じ結果。** 1回目で消え、2回目以降は何も起きない。" +
      "削除ボタンを連打されても壊れません。\n\n" +
      "「無い id を渡されたら例外にすべきか」は自分で決める仕様です。\n" +
      "ただし削除は**何度押しても同じ結果**であってほしい操作なので、" +
      "「無ければ何もしない」が扱いやすい選択です。\n\n" +
      "⑤と並べて覚えてください。\n\n" +
      "**1件変える → `map` で差し替え。1件消す → `filter` で残す。どちらも id で探す。**",
  },
  explanation:
    "`filter` は条件を満たす要素だけを集めた新しい配列を返します。" +
    "削除は「消す対象を指定する」のではなく「残す条件を書く」ことで表現でき、" +
    "条件は `t.id !== id`（識別子が異なるものを残す）になります。" +
    "`splice` は元の配列を変更し、範囲外の指定でも例外にならないため、意図しない削除が起こりえます。" +
    "`filter` を使うと元の配列は変更されず、存在しない識別子を渡しても全要素が残るだけで済みます。" +
    "同じ操作を繰り返しても結果が変わらないため、削除操作として扱いやすくなります。",

  starterCode: `// todo.ts
//
// ⑤の続きです。1件だけ消す関数を書きます。
// ①〜⑤のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜⑤と同じ Todo 型 / createTodo / addTodo / toggleTodo を書く。
//
//   2. removeTodo という関数を作る。
//        - 引数は2つ: list（Todo の配列）と id（文字列）
//        - id が一致する1件を除いた「新しい配列」を返す
//        - 渡された list は変更しない
//        - 一致する id が無ければ、何も減らない
//
// splice は使いません。使うのは filter です。
// 書くのは「消す条件」ではなく「残す条件」です。

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
  // filter は「条件が true になった要素だけ」を集めて新しい配列を作る。
  //
  // 書くのは「残す条件」。だから「id が違うものを残す」= !==。
  // === にすると、指定した1件だけが残ってしまう（逆になる）。
  //
  // splice と違って元を壊さず、無い id を渡されても
  // 全部が「違う」ので全部残るだけ。何も起きない。
  return list.filter((t) => t.id !== id);
};
`,

  hints: [
    {
      level: 1,
      text: "1行です。`return list.filter((t) => ...);` の形で、`...` に「残す条件」を書きます。",
    },
    {
      level: 2,
      text: "残したいのは「引数の `id` と違うもの」です。等しくないことを表す記号は `!==` です。",
    },
    {
      level: 3,
      text: "`return list.filter((t) => t.id !== id);` です。`===` にすると逆（指定した1件だけが残る）になるので注意してください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-06-1",
      description: "`removeTodo` は id を受け取り、配列を返すか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Parameters<typeof removeTodo>, [Todo[], string]>>;
type _c2 = Expect<Equal<ReturnType<typeof removeTodo>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-06-2",
      description: "指定した1件だけ消えるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var after = removeTodo(list, list[0].id);
assertEqual(after.length, 1, "1件だけ減っていない");
assertEqual(after[0].text, "B", "残る項目が違う（条件が逆になっている可能性）");`,
      },
    },
    {
      id: "cp-sc-06-3",
      description: "元の配列を書き換えていないか（`splice` を使っていないか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
removeTodo(list, list[0].id);
assertEqual(list.length, 2, "元の配列を書き換えている（splice を使っている）");`,
      },
    },
    {
      id: "cp-sc-06-4",
      description: "存在しない id を渡しても減らないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
assertEqual(removeTodo(list, "存在しない").length, 2, "無い id で消えてしまっている");`,
      },
    },
    {
      id: "cp-sc-06-5",
      description: "2回続けて同じ id を消しても壊れないか（連打しても平気か）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var once = removeTodo(list, list[0].id);
var twice = removeTodo(once, list[0].id);
assertEqual(twice.length, 1, "2回目で何かが起きてしまっている");`,
      },
    },
    {
      id: "cp-sc-06-6",
      description: "`filter` に書くのが「残す条件」である理由を言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "filter", "不変性", "削除"],
  relatedIds: ["sc-05-toggle-one", "sc-07-derive-dont-store"],
};
