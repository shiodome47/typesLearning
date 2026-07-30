import type { Lesson } from "../types";

export const scLesson04: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-04-derive-dont-store",
  order: 53,
  title: "④ 残り件数を出す — 計算できるものは持たない",
  category: "scratch",
  difficulty: 3,

  goal: "他のデータから計算できる値を状態として持たず、必要なときに求める形で書けるようになる",

  why: {
    problem:
      "「残り3件」と表示したい。未完だけ表示する切り替えも付けたい。\n\n" +
      "素直に考えると、こうなります。件数を持っておけばいい。\n\n" +
      "```\n" +
      "let todos: Todo[] = [];\n" +
      "let remaining = 0;   // 残り件数\n" +
      "```\n\n" +
      "追加したら `remaining++`、完了にしたら `remaining--`。動きます。\n\n" +
      "そして**必ずズレます**。\n\n" +
      "ズレる瞬間は決まっています。**機能を1つ足したとき**です。\n" +
      "「完了済みを一括削除」を足す。`todos` から消す処理は書いた。" +
      "`remaining` の更新を忘れる。\n\n" +
      "画面には「残り3件」と出ているのに、リストは空。\n\n" +
      "これは注意力の問題ではありません。**構造の問題です。**\n" +
      "同じ事実を2か所に持つと、更新箇所も2か所になります。" +
      "機能が増えるたびに、更新し忘れる場所が増えます。" +
      "5つの機能があれば、5か所すべてで正しく更新し続けなければなりません。\n\n" +
      "そして**ズレたことに気づく仕組みがありません**。" +
      "型は通ります。テストも、その機能だけを見れば通ります。",
    insight:
      "原則は1つです。**他のデータから計算できるものは、持たない。**\n\n" +
      "残り件数は `todos` から計算できます。だから持ちません。**必要なときに数えます。**\n\n" +
      "```\n" +
      "const activeTodos = (list: Todo[]): Todo[] => list.filter((t) => !t.done);\n" +
      "const remainingCount = (list: Todo[]): number => activeTodos(list).length;\n" +
      "```\n\n" +
      "こうすると、**ズレることが原理的に起きません**。\n" +
      "`todos` が唯一の事実で、件数はそこから毎回導かれるからです。" +
      "「完了済みを一括削除」を足しても、件数の更新を書く必要すらありません。\n\n" +
      "`remainingCount` が `activeTodos` を使っている点にも注目してください。\n" +
      "「未完とは何か」の定義が**1か所にしかありません**。" +
      "後で「アーカイブ済みは数えない」という条件が増えたとき、直すのは1か所です。\n\n" +
      "「毎回数えたら遅いのでは」と思うかもしれません。\n" +
      "**数千件までは体感できる差になりません。** 遅くなってから測って直せばよく、" +
      "先に持ってしまうと、上に書いた「ズレ」を一生抱えます。\n\n" +
      "この考え方には名前が付いていて、Svelte なら `$derived`、" +
      "React なら「レンダー中に計算する」がこれです。\n" +
      "**フレームワークが用意しているのは、この原則を守りやすくするための道具**です。\n\n" +
      "見分け方はこうです。\n" +
      "**その値は、他のデータを見れば求められるか。**\n" +
      "求められるなら状態にしません。求められないもの（利用者が入力したもの、" +
      "外から来たもの）だけが状態です。",
  },
  explanation:
    "他のデータから計算できる値を独立した状態として保持すると、" +
    "元のデータを変更するすべての箇所で同期を取る必要が生じます。" +
    "機能が増えるほど同期漏れの機会が増え、型でもテストでも検出できません。" +
    "計算できる値は保持せず、必要になった時点で導出すれば、不整合は原理的に発生しません。" +
    "導出関数を組み合わせて定義すると、条件の定義が1箇所に集まり、仕様変更にも1箇所で対応できます。" +
    "性能が問題になるのは要素数が非常に多い場合に限られ、" +
    "先に最適化して不整合を抱えるより、計測してから対処する方が安全です。" +
    "Svelte の `$derived` や React のレンダー中の計算は、この原則を守るための仕組みです。",

  starterCode: `// todo.ts
//
// ③の続きです。絞り込みと集計を作ります。
// これまでの Todo / createTodo / addTodo / toggleTodo / removeTodo も書いてください。
//
// 【要件】
//
// 1. これまでと同じ5つ（型 + 4関数）を用意する。
//
// 2. activeTodos(list: Todo[]): Todo[] を作る。
//      - 未完（done が false）の項目だけを返す
//      - 元の配列は変更しない
//
// 3. remainingCount(list: Todo[]): number を作る。
//      - 未完の件数を返す
//      - 「未完とは何か」の定義を2か所に書かないこと（要点はここ）
//
// 件数を状態として持ってはいけません。理由は「なぜ必要か」に書いてあります。

`,

  modelAnswer: `// todo.ts
//
// 他のデータから計算できるものは、持たない。

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

// 「未完とは何か」の定義はここだけ。
// 後で条件が増えても、直すのは1か所で済む。
const activeTodos = (list: Todo[]): Todo[] => list.filter((t) => !t.done);

// 件数は状態として持たない。todos から毎回導く。
// こうするとズレることが原理的に起きない。
//
// activeTodos を使い回しているので、
// 「未完」の定義がここに二重に書かれることもない。
const remainingCount = (list: Todo[]): number => activeTodos(list).length;

export {
  createTodo,
  addTodo,
  toggleTodo,
  removeTodo,
  activeTodos,
  remainingCount,
};
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "どちらも1行です。`activeTodos` は `filter`、`remainingCount` はその長さ。件数のための変数（`let remaining = 0` のようなもの）は作りません。",
    },
    {
      level: 2,
      text: "`activeTodos` は `list.filter((t) => !t.done)` です。`remainingCount` は自分で `filter` をもう一度書かず、`activeTodos` を呼んでください。「未完とは何か」を2か所に書かないためです。",
    },
    {
      level: 3,
      text: "`const remainingCount = (list: Todo[]): number => activeTodos(list).length;` です。`list.filter((t) => !t.done).length` でも動きますが、条件が2か所になるので後で片方だけ直す事故が起きます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-04-1",
      description: "`remainingCount` は数値を返すか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof remainingCount>, number>>;
type _c2 = Expect<Equal<ReturnType<typeof activeTodos>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-04-2",
      description: "未完だけが返るか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo(addTodo([], "A"), "B"), "C");
var done1 = toggleTodo(list, list[1].id);
var active = activeTodos(done1);
assertEqual(active.length, 2, "未完だけが返る");
assertEqual(active.map(function (t) { return t.text; }), ["A", "C"], "完了済みが混ざっている");`,
      },
    },
    {
      id: "cp-sc-04-3",
      description: "件数が実際の未完数と一致するか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
assertEqual(remainingCount(list), 2, "初期は2件");
var after = toggleTodo(list, list[0].id);
assertEqual(remainingCount(after), 1, "1件完了したら1件");`,
      },
    },
    {
      id: "cp-sc-04-4",
      description: "件数が状態とズレないか（操作を重ねても一致し続けるか）？",
      verify: {
        kind: "run",
        assert: `var list = [];
for (var i = 0; i < 5; i++) list = addTodo(list, "T" + i);
list = toggleTodo(list, list[0].id);
list = toggleTodo(list, list[1].id);
list = removeTodo(list, list[4].id);
// 手で数えた答え: 5件足して2件完了、未完の1件を削除 → 未完は 2
assertEqual(remainingCount(list), 2, "操作を重ねると件数がズレている");
assertEqual(activeTodos(list).length, remainingCount(list), "件数と一覧が食い違っている");`,
      },
    },
    {
      id: "cp-sc-04-5",
      description: "空のときに 0 を返すか（境界）？",
      verify: {
        kind: "run",
        assert: `assertEqual(remainingCount([]), 0, "空のとき 0");
assertEqual(activeTodos([]).length, 0, "空のとき空配列");`,
      },
    },
    {
      id: "cp-sc-04-6",
      description: "元の配列を壊していないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
activeTodos(list);
remainingCount(list);
assertEqual(list.length, 2, "元の配列が変わっている");`,
      },
    },
    {
      id: "cp-sc-04-7",
      description:
        "自分の手元のアプリで「持っているが計算できる値」を1つ挙げられるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "派生値", "状態設計", "単一の事実"],
  relatedIds: ["sc-03-toggle-and-remove", "sc-05-save-and-load", "sv-02-derived-values"],
};
