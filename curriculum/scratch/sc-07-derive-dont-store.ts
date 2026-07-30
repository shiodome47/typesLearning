import type { Lesson } from "../types";

export const scLesson07: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-07-derive-dont-store",
  order: 56,
  title: "⑦ 残り件数を出す — 計算できるものは持たない",
  category: "scratch",
  difficulty: 2,

  goal: "他のデータから計算できる値を、状態として持たずに求められるようになる",

  why: {
    problem:
      "「残り3件」と出したい。未完だけ表示もしたい。\n\n" +
      "素直に考えると、件数を持っておけばよさそうです。\n\n" +
      "```\n" +
      "let todos: Todo[] = [];\n" +
      "let remaining = 0;      // 残り件数\n" +
      "```\n\n" +
      "追加したら `remaining` を増やす。完了にしたら減らす。動きます。\n\n" +
      "そして**必ずズレます。** ズレる瞬間は決まっていて、**機能を1つ足したとき**です。\n\n" +
      "「完了済みを一括削除」を足す。`todos` から消す処理は書いた。" +
      "`remaining` の更新を忘れる。画面には「残り3件」、リストは空。\n\n" +
      "これは注意力の問題ではありません。**同じ事実を2か所に持つと、更新箇所も2か所**になります。" +
      "機能が増えるたびに、忘れる場所が増えます。",
    insight:
      "原則は1つです。**他のデータから計算できるものは、持たない。**\n\n" +
      "残り件数は `todos` から数えられます。だから持ちません。**必要なときに数えます。**\n\n" +
      "```\n" +
      "const activeTodos = (list: Todo[]): Todo[] => {\n" +
      "  return list.filter((t) => !t.done);\n" +
      "};\n" +
      "\n" +
      "const remainingCount = (list: Todo[]): number => {\n" +
      "  return activeTodos(list).length;\n" +
      "};\n" +
      "```\n\n" +
      "`activeTodos` は⑥で覚えた `filter` です。条件は `!t.done`（未完のもの）。\n" +
      "`!` は「逆にする」なので、`!t.done` は「終わっていない」という意味になります。\n\n" +
      "`remainingCount` は、その結果の `.length`（長さ）を返すだけです。\n\n" +
      "**`remainingCount` が `activeTodos` を呼んでいる点が大事です。**\n\n" +
      "自分でもう一度 `filter` を書くと、「未完とは何か」の定義が2か所になります。\n" +
      "後で「アーカイブ済みは数えない」という条件が増えたとき、片方だけ直して食い違います。\n\n" +
      "**定義は1か所。** これだけ守れば、ズレは原理的に起きません。\n\n" +
      "「毎回数えたら遅いのでは」と思うかもしれません。\n" +
      "**数千件までは体感できる差になりません。** 遅くなってから測って直せばよく、" +
      "先に持ってしまうと上に書いた「ズレ」を一生抱えます。\n\n" +
      "この考え方には名前が付いています。Svelte の `$derived`、" +
      "React の「レンダー中に計算する」がこれです。" +
      "**フレームワークの機能は、この原則を守りやすくするための道具**です。\n\n" +
      "見分け方はこうです。**その値は、他のデータを見れば求められるか。**\n" +
      "求められるなら状態にしません。求められないもの（利用者が入力したもの、" +
      "外から来たもの）だけが状態です。",
  },
  explanation:
    "他のデータから計算できる値を独立した状態として保持すると、" +
    "元のデータを変更するすべての箇所で同期が必要になり、機能が増えるほど漏れやすくなります。" +
    "型でもテストでも検出できないため、計算できる値は保持せず必要な時点で導出します。" +
    "導出関数を組み合わせて定義すると条件の定義が1箇所に集まり、仕様変更にも1箇所で対応できます。" +
    "`filter` の条件に使う `!` は真偽値を反転させる記号で、`!t.done` は未完を意味します。",

  starterCode: `// todo.ts
//
// ⑥の続きです。絞り込みと集計を作ります。
// ①〜⑥のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜⑥と同じ Todo 型 / createTodo / addTodo / toggleTodo / removeTodo を書く。
//
//   2. activeTodos という関数を作る。
//        - 引数は list（Todo の配列）
//        - 未完（done が false）の項目だけを集めた新しい配列を返す
//
//   3. remainingCount という関数を作る。
//        - 引数は list（Todo の配列）
//        - 未完の件数（数値）を返す
//        - 「未完とは何か」を2か所に書かないこと（要点はここ）
//
// 件数を持つための変数（let remaining = 0 のようなもの）は作りません。

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

// 「未完とは何か」の定義はここだけ。
// ! は「逆にする」。!t.done は「終わっていない」。
//
// 後で条件が増えても、直すのはこの1か所で済む。
const activeTodos = (list: Todo[]): Todo[] => {
  return list.filter((t) => !t.done);
};

// 件数は状態として持たない。todos から毎回数える。
// こうするとズレることが原理的に起きない。
//
// activeTodos を呼び直している点が大事。
// ここでもう一度 filter を書くと、「未完」の定義が2か所になり、
// 後で片方だけ直して食い違う。
const remainingCount = (list: Todo[]): number => {
  return activeTodos(list).length;
};
`,

  hints: [
    {
      level: 1,
      text: "どちらも1行です。`activeTodos` は⑥で使った `filter`、`remainingCount` はその結果の長さです。件数のための変数は作りません。",
    },
    {
      level: 2,
      text: "`activeTodos` は `return list.filter((t) => !t.done);` です。`remainingCount` では自分で `filter` を書かず、`activeTodos` を呼んでください。",
    },
    {
      level: 3,
      text: "`remainingCount` は `return activeTodos(list).length;` です。配列の長さは `.length` で取れます。`list.filter((t) => !t.done).length` でも動きますが、条件が2か所になるので避けます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-07-1",
      description: "`activeTodos` は配列、`remainingCount` は数値を返すか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof activeTodos>, Todo[]>>;
type _c2 = Expect<Equal<ReturnType<typeof remainingCount>, number>>;`,
      },
    },
    {
      id: "cp-sc-07-2",
      description: "未完だけが返るか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo(addTodo([], "A"), "B"), "C");
var done1 = toggleTodo(list, list[1].id);
var active = activeTodos(done1);
assertEqual(active.length, 2, "未完だけになっていない");
assertEqual(active.map(function (t) { return t.text; }), ["A", "C"], "完了済みが混ざっている（条件が逆かも）");`,
      },
    },
    {
      id: "cp-sc-07-3",
      description: "件数が実際の未完数と一致するか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
assertEqual(remainingCount(list), 2, "初期は2件");
assertEqual(remainingCount(toggleTodo(list, list[0].id)), 1, "1件完了したら1件");`,
      },
    },
    {
      id: "cp-sc-07-4",
      description: "操作を重ねても件数がズレないか？",
      verify: {
        kind: "run",
        assert: `var list = [];
for (var i = 0; i < 5; i++) list = addTodo(list, "T" + i);
list = toggleTodo(list, list[0].id);
list = toggleTodo(list, list[1].id);
list = removeTodo(list, list[4].id);
assertEqual(remainingCount(list), 2, "操作を重ねると件数がズレている");
assertEqual(activeTodos(list).length, remainingCount(list), "件数と一覧が食い違っている");`,
      },
    },
    {
      id: "cp-sc-07-5",
      description: "空のときに 0 を返すか（境界）？",
      verify: {
        kind: "run",
        assert: `assertEqual(remainingCount([]), 0, "空のとき 0 にならない");
assertEqual(activeTodos([]).length, 0, "空のとき空配列にならない");`,
      },
    },
    {
      id: "cp-sc-07-6",
      description: "件数を状態として持つと、いつズレるか言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "派生値", "状態設計", "filter"],
  relatedIds: ["sc-06-remove-one", "sc-08-save-and-load-basic", "sv-02-derived-values"],
};
