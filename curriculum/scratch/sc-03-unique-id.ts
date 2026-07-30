import type { Lesson } from "../types";

export const scLesson03: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-03-unique-id",
  order: 52,
  title: "③ 呼ぶたびに違う id にする",
  category: "scratch",
  difficulty: 2,

  goal: "関数の外に変数を置いて、呼ぶたびに違う値を作れるようになる",

  why: {
    problem:
      "②の `createTodo` は `id` が `\"1\"` の固定でした。\n" +
      "2件作ると、**両方とも `id` が `\"1\"`** になります。\n\n" +
      "これでは「3番目を消す」と言われたときに、どれを消せばいいか分かりません。\n" +
      "`id` は1件ずつ違わないと意味がありません。\n\n" +
      "そこで「番号を1つずつ増やす」ことを考えます。しかし素直に書くと、こうなります。\n\n" +
      "```\n" +
      "const createTodo = (text: string): Todo => {\n" +
      "  let nextId = 1;                        // 関数の中に置いた\n" +
      "  return { id: String(nextId), ... };\n" +
      "};\n" +
      "```\n\n" +
      "動きません。**毎回 `1` に戻ります。**\n" +
      "関数の中の変数は、呼ばれるたびに作り直されるからです。",
    insight:
      "覚え方は1つです。**呼ぶたびに変わってほしいものは、関数の外に置く。**\n\n" +
      "```\n" +
      "let nextId = 1;                      // ← 関数の外。1回だけ作られる\n" +
      "\n" +
      "const createTodo = (text: string): Todo => {\n" +
      "  const id = String(nextId);         // いまの番号を文字列にする\n" +
      "  nextId = nextId + 1;               // 次のために1増やす\n" +
      "  return { id: id, text: text, done: false };\n" +
      "};\n" +
      "```\n\n" +
      "関数の外にあるので、`nextId` は**1回だけ作られてそのまま残ります**。\n" +
      "だから2回目の呼び出しでは `2` になっています。\n\n" +
      "3つ、書き方の説明をします。\n\n" +
      "**`let` なのはなぜか。**\n" +
      "`const` は「後で変えない」という意味なので、`nextId = nextId + 1` ができません。" +
      "**変える予定があるものだけ `let`** にします。\n\n" +
      "**`String(nextId)` は何か。**\n" +
      "`nextId` は数値（`1`）ですが、`Todo` の `id` は文字列と決めました。" +
      "`String(...)` で数値を文字列に変換します。`String(1)` は `\"1\"` になります。\n\n" +
      "**なぜ `list.length + 1` にしないのか。**\n" +
      "件数から作ると、**1件消したあとで同じ id が生まれます**。\n" +
      "3件（1,2,3）から2番を消すと2件になり、次に作る id が `\"3\"` になって既にある3番と衝突します。\n" +
      "**一度使った番号は二度と使わない**のが安全です。\n\n" +
      "なお `nextId++` という短い書き方もあります（返してから増やす）。" +
      "同じ意味ですが、この教材では2行に分けて書きます。**何が起きているかが見えるほうを選びます。**",
  },
  explanation:
    "関数の中で宣言した変数は、呼び出しごとに新しく作られるため、値を持ち越せません。" +
    "呼び出しをまたいで変化させたい値は関数の外で宣言します。" +
    "値を書き換える予定がある変数は `const` ではなく `let` を使います。" +
    "`String(値)` は数値などを文字列に変換します。" +
    "識別子を要素数から作ると、削除後に既存の識別子と重複する可能性があるため、" +
    "一度使った番号を再利用しないカウンタ方式を使います。",

  starterCode: `// todo.ts
//
// ②の続きです。id を「呼ぶたびに違う値」にします。
// ①②のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①と同じ Todo 型を書く。
//
//   2. createTodo を作る。②と同じだが、id を次のようにする。
//        - 1回目に呼んだら "1"、2回目は "2"、3回目は "3" …
//        - つまり呼ぶたびに違う値（同じ id が2つできてはいけない）
//
// ヒント代わりに1つだけ:
//   呼ぶたびに変わってほしいものは、関数の「外」に置きます。

`,

  modelAnswer: `// todo.ts

type Todo = { id: string; text: string; done: boolean };

// 関数の外に置く。ここは1回だけ実行されるので、値が残り続ける。
// （関数の中に置くと、呼ばれるたびに 1 に戻ってしまう）
//
// あとで書き換えるので const ではなく let。
let nextId = 1;

const createTodo = (text: string): Todo => {
  // nextId は数値（1）だが、Todo の id は文字列と決めた。
  // String(...) で文字列にする。String(1) は "1"。
  const id = String(nextId);

  // 次に呼ばれたときのために1増やしておく。
  // これで一度使った番号は二度と使われない。
  //
  // list.length + 1 にしないのは、1件消したあとで
  // 既にある id と衝突するため。
  nextId = nextId + 1;

  return { id: id, text: text, done: false };
};
`,

  hints: [
    {
      level: 1,
      text: "②のコードに2行足すだけです。1つは関数の外、1つは関数の中（`return` の前）です。",
    },
    {
      level: 2,
      text: "関数の外に `let nextId = 1;` を書きます。関数の中では、いまの `nextId` を文字列にして `id` に使い、そのあと `nextId` を1増やします。",
    },
    {
      level: 3,
      text: "関数の中はこうです。`const id = String(nextId);` → `nextId = nextId + 1;` → `return { id: id, text: text, done: false };`。順番が大事です（増やす前の値を使います）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-03-1",
      description: "`createTodo` は `Todo` を返す型になっているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof createTodo>, Todo>>;`,
      },
    },
    {
      id: "cp-sc-03-2",
      description: "2回呼ぶと違う id になるか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `var a = createTodo("A");
var b = createTodo("B");
assertTrue(a.id !== b.id, "2回呼んでも同じ id になっている（変数を関数の外に置いたか確認）");`,
      },
    },
    {
      id: "cp-sc-03-3",
      description: "3回、4回呼んでも重複しないか？",
      verify: {
        kind: "run",
        assert: `var ids = [];
for (var i = 0; i < 4; i++) ids.push(createTodo("T" + i).id);
var unique = ids.filter(function (v, idx) { return ids.indexOf(v) === idx; });
assertEqual(unique.length, ids.length, "id が重複している");`,
      },
    },
    {
      id: "cp-sc-03-4",
      description: "text と done は②のまま正しいか？",
      verify: {
        kind: "run",
        assert: `var t = createTodo("牛乳");
assertEqual(t.text, "牛乳", "text が入っていない");
assertEqual(t.done, false, "done が false になっていない");`,
      },
    },
    {
      id: "cp-sc-03-5",
      description:
        "`list.length + 1` を id にすると、どんなときに壊れるか言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "let", "スコープ", "id"],
  relatedIds: ["sc-02-return-an-object", "sc-04-add-without-breaking"],
};
