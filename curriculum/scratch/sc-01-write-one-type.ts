import type { Lesson } from "../types";

export const scLesson01: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-01-write-one-type",
  order: 50,
  title: "① 型を1つ書く",
  category: "scratch",
  difficulty: 1,

  goal: "白紙のファイルに、扱うデータの形を1つ書けるようになる",

  why: {
    problem:
      "ToDoアプリを作ろうとして空のファイルを開き、**何も書けませんでした**。\n\n" +
      "構文は知っています。それでもカーソルが1行目で止まる。\n" +
      "教材は部品を教えますが、**どの部品から手を付けるか**はどこにも書かれていないからです。\n\n" +
      "この回でやるのは、たった1行を書くことだけです。",
    insight:
      "順番はいつも同じです。**扱うものが何かを決める。それが最初の1行。**\n\n" +
      "ToDoアプリで扱うのは「やること1件」なので、こう書きます。\n\n" +
      "```\n" +
      "type Todo = { id: string; text: string; done: boolean };\n" +
      "```\n\n" +
      "読み方はこうです。\n\n" +
      "`type Todo =` … これから「Todo」という名前の形を決めます\n" +
      "`{ ... }` … その形は、いくつかの項目を持つ箱です\n" +
      "`id: string` … `id` という項目があり、中身は文字列\n" +
      "`;` … 項目の区切り（`,` でも書けます）\n\n" +
      "**この1行を書くと、次に書くものが自動的に決まります。**\n" +
      "「Todo を作る」「Todo を並べる」「Todo を1件消す」。\n" +
      "白紙だった問題が、部品の並びに変わります。\n\n" +
      "3つの項目には理由があります。\n\n" +
      "**`id`** … その1件を特定するための名前です。「配列の何番目か」で管理すると、" +
      "並べ替えたり絞り込んだりした瞬間に壊れます。**中身が動いても変わらない名前**が必要です。\n\n" +
      "**`text`** … やることの内容です。\n\n" +
      "**`done`** … 終わったかどうか。`true` か `false` の2択なので `boolean` にします。" +
      "文字列にすると `\"done\"` `\"Done\"` `\"完了\"` が全部通ってしまい、打ち間違いを型が止めてくれません。",
  },
  explanation:
    "アプリを作るときは、扱うデータの形を先に決めます。" +
    "`type 名前 = { 項目: 型; ... };` という書き方で、その形に名前を付けられます。" +
    "形が決まると「そのデータに対して何をするか」という形で機能が並び、白紙の状態から抜け出せます。" +
    "2値しか取らない状態は `boolean` にすると、綴りの誤りを型が防げます。",

  starterCode: `// todo.ts
//
// この回で書くのは1行だけです。
//
// 【要件】
//
//   Todo という名前の型を作る。次の3つの項目を持つ。
//
//     id    文字列（その1件を特定するための名前）
//     text  文字列（やることの内容）
//     done  真偽値（終わったかどうか）
//
// 下に書いてください。書き方が分からなければ「ヒントを見る」を押してください。

`,

  modelAnswer: `// todo.ts
//
// 扱うものが何かを決める。それが最初の1行。

// type Todo =  ... これから「Todo」という形を決める
// { ... }      ... 項目をいくつか持つ箱
// id: string   ... id という項目があり、中身は文字列
// ;            ... 項目の区切り
type Todo = { id: string; text: string; done: boolean };
`,

  hints: [
    {
      level: 1,
      text: "`type` で始めます。`type 名前 = { ... };` という形です。名前は `Todo`、中身に3つの項目を書きます。",
    },
    {
      level: 2,
      text: "項目は `名前: 型` の順で書き、`;` で区切ります。文字列の型は `string`、真偽値の型は `boolean` です。",
    },
    {
      level: 3,
      text: "`type Todo = { id: string; text: string; done: boolean };` です。最後の `;` を忘れないでください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-01-1",
      description: "`Todo` という型があり、3つの項目を持っているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Todo, { id: string; text: string; done: boolean }>>;`,
      },
    },
    {
      id: "cp-sc-01-2",
      description:
        "「配列の何番目か」ではなく `id` を持たせる理由を言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "型", "最初の1行"],
  relatedIds: ["sc-02-return-an-object", "ts-03-object-types"],
};
