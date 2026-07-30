import type { Lesson } from "../types";

export const scLesson01: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-01-decide-the-type",
  order: 50,
  title: "① 最初の1行を決める — 何から書き始めるか",
  category: "scratch",
  difficulty: 2,

  goal: "白紙のファイルを前にして、最初に書くべき1行を自分で決められるようになる",

  why: {
    problem:
      "ToDoアプリを作ろうとして、空のファイルを開きました。\n\n" +
      "そして**何も書けません**。\n\n" +
      "構文は知っています。`type` も `interface` も `map` も `filter` も分かる。" +
      "チュートリアルを読めば理解できる。それでもカーソルが1行目で止まったままです。\n\n" +
      "これは知識の問題ではありません。\n" +
      "教材やチュートリアルは**部品**を教えますが、" +
      "「どの部品から手を付けるか」は、ほとんどどこにも書かれていないからです。\n\n" +
      "そして多くの人が、ここで一番よくない順番を選びます。\n" +
      "**画面から書き始める**のです。`<div>` を書き、ボタンを置き、" +
      "見た目を整えて、それから「あれ、データはどう持つんだろう」と詰まる。\n\n" +
      "見た目から入ると、データの形が画面の都合で決まります。" +
      "後で機能を足すたびに、データの形を直すことになります。",
    insight:
      "順番はいつも同じです。**扱うものが何かを決める。それが最初の1行。**\n\n" +
      "ToDoアプリで扱うのは「やること1件」です。だから1行目はこうなります。\n\n" +
      "```\n" +
      "type Todo = { id: string; text: string; done: boolean };\n" +
      "```\n\n" +
      "これが決まると、その後に書くものが**自動的に決まっていきます**。" +
      "「Todo を作る」「Todo の一覧を持つ」「Todo を1件消す」。" +
      "白紙だった問題が、部品の並びに変わります。\n\n" +
      "3つのフィールドには、それぞれ判断が入っています。\n\n" +
      "**`id` — なぜ必要か。**\n" +
      "「配列の何番目か」で管理すればいい気がします。しかし並べ替えたら壊れます。" +
      "絞り込んで表示したら、画面の3番目と配列の3番目が違うものになります。\n" +
      "**中身が動いても変わらない名前が必要です。** それが `id` です。\n\n" +
      "**`done: boolean` — なぜ文字列にしないか。**\n" +
      "`status: string` にすると、`\"done\"` `\"Done\"` `\"完了\"` が全部通ります。" +
      "打ち間違いを型が止めてくれません。**2択なら `boolean`** が一番強い。\n\n" +
      "**`text` — 名前をどう選ぶか。**\n" +
      "`name` でも `title` でも動きます。ただ後から読む人（3か月後の自分）が" +
      "迷わない名前を選びます。\n\n" +
      "そしてもう1つ、**`id` を誰が作るか**という判断があります。\n" +
      "呼ぶ側に毎回考えさせるのは面倒なので、作る関数の中で採番します。\n\n" +
      "この回で書くのは、型1つと関数1つだけです。**それだけで足場ができます。**",
  },
  explanation:
    "アプリを作るときは、扱うデータの形を先に決めます。" +
    "データの形が決まると、そのデータに対して何をするかという形で機能が並び、" +
    "白紙の状態から抜け出せます。" +
    "識別子（`id`）を持たせるのは、配列の位置が並べ替えや絞り込みで変わってしまうためです。" +
    "位置ではなく値そのものに名前を付けておけば、表示順に関係なく1件を特定できます。" +
    "2値しか取らない状態は `boolean` にすると、打ち間違いを型が防げます。" +
    "識別子の採番は生成関数の中に閉じ込め、呼ぶ側が意識しなくて済むようにします。",

  starterCode: `// todo.ts
//
// ToDoアプリを白紙から作ります。この回で書くのは2つだけです。
//
// 【要件】
//
// 1. Todo という型を作る。次の3つを持つ。
//      id:   string   （その1件を特定するための名前）
//      text: string   （やることの内容）
//      done: boolean  （終わったかどうか）
//
// 2. createTodo(text: string): Todo という関数を作る。
//      - text をそのまま入れる
//      - done は false で始まる（作った直後は終わっていない）
//      - id は呼ぶたびに違う値にする（同じ id が2つあってはいけない）
//
// ヒントは要りません。上の要件だけを見て、下に自分で書いてください。
// 詰まったら「ヒントを見る」を押してください。

`,

  modelAnswer: `// todo.ts
//
// 扱うものが何かを決める。それが最初の1行。

// 位置ではなく値そのものに名前を付ける。
// 並べ替えても絞り込んでも、この id は変わらない。
type Todo = { id: string; text: string; done: boolean };

// 採番は関数の中に閉じ込める。
// 呼ぶ側に「次の id は何番か」を考えさせない。
let nextId = 1;

const createTodo = (text: string): Todo => ({
  // 呼ぶたびに違う値になる。
  // list.length + 1 にすると、1件消したあとで id が衝突する。
  id: String(nextId++),
  text,
  // 作った直後は終わっていない。既定値をここで決めておくと、
  // 呼ぶ側が毎回 false を渡す必要がなくなる。
  done: false,
});

export { createTodo };
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "書くのは2つです。`type Todo = { ... }` と、`const createTodo = (text: string): Todo => ...`。型を先に書くと、関数の戻り値に何を書けばいいかが決まります。",
    },
    {
      level: 2,
      text: "`type Todo = { id: string; text: string; done: boolean };` です。`createTodo` はオブジェクトを返すので、アロー関数なら `=> ({ ... })` と丸括弧で包みます（波括弧だけだとブロックとして解釈されます）。",
    },
    {
      level: 3,
      text: "id を毎回違う値にするには、関数の外にカウンタを置きます。`let nextId = 1;` を書き、`id: String(nextId++)` とします。`list.length + 1` にしないでください。1件消したあとで同じ id が生まれます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-01-1",
      description: "`Todo` 型が3つのフィールドを持っているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Todo, { id: string; text: string; done: boolean }>>;`,
      },
    },
    {
      id: "cp-sc-01-2",
      description: "`createTodo` は `Todo` を返すか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof createTodo>, Todo>>;`,
      },
    },
    {
      id: "cp-sc-01-3",
      description: "渡した text がそのまま入るか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `assertEqual(createTodo("牛乳を買う").text, "牛乳を買う", "text が入る");`,
      },
    },
    {
      id: "cp-sc-01-4",
      description: "作った直後は未完（`done` が false）か？",
      verify: {
        kind: "run",
        assert: `assertEqual(createTodo("x").done, false, "作った直後は未完");`,
      },
    },
    {
      id: "cp-sc-01-5",
      description: "呼ぶたびに違う id になるか（同じ id が2つできないか）？",
      verify: {
        kind: "run",
        assert: `var a = createTodo("A");
var b = createTodo("B");
assertTrue(a.id !== b.id, "id が重複している（呼ぶたびに違う値にする）");
assertTrue(a.id.length > 0, "id が空になっている");`,
      },
    },
    {
      id: "cp-sc-01-6",
      description:
        "「配列の何番目か」を id にしてはいけない理由を、自分の言葉で言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "設計", "型", "最初の1行"],
  relatedIds: ["sc-02-hold-the-list", "ts-03-object-types"],
};
