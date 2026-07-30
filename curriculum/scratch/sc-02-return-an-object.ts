import type { Lesson } from "../types";

export const scLesson02: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-02-return-an-object",
  order: 51,
  title: "② オブジェクトを1つ返す関数",
  category: "scratch",
  difficulty: 2,

  goal: "決めた型に合うオブジェクトを作って返す関数を書けるようになる",

  why: {
    problem:
      "①で `Todo` という形が決まりました。次は**その形のものを作る**関数です。\n\n" +
      "ここで多くの人が1回つまずきます。原因は理屈ではなく、**書き方**です。\n\n" +
      "```\n" +
      "const createTodo = (text: string): Todo => { id: \"1\", text: text, done: false };\n" +
      "```\n\n" +
      "これは動きません。エラーになります。\n" +
      "しかし理屈は合っているので、何が悪いのか分かりません。",
    insight:
      "原因はこれです。**アロー関数の `=>` のうしろに `{` を書くと、" +
      "「オブジェクト」ではなく「処理の始まり」だと解釈されます。**\n\n" +
      "```\n" +
      "=> { ... }     ← 中身は「処理」。返したいなら return が要る\n" +
      "=> ({ ... })   ← 丸括弧で包むと「オブジェクトを返す」になる\n" +
      "```\n\n" +
      "だから2通りの書き方があります。**どちらでも正解です。**\n\n" +
      "**書き方A（return を書く。最初はこちらが分かりやすい）**\n\n" +
      "```\n" +
      "const createTodo = (text: string): Todo => {\n" +
      "  return { id: \"1\", text: text, done: false };\n" +
      "};\n" +
      "```\n\n" +
      "**書き方B（丸括弧で包む。慣れるとこちらが短い）**\n\n" +
      "```\n" +
      "const createTodo = (text: string): Todo => ({\n" +
      "  id: \"1\",\n" +
      "  text: text,\n" +
      "  done: false,\n" +
      "});\n" +
      "```\n\n" +
      "**この回は書き方A で構いません。** 迷ったら `return` を書いてください。\n\n" +
      "残りの部分の読み方です。\n\n" +
      "`(text: string)` … `text` という文字列を受け取ります\n" +
      "`: Todo` … 返すものは `Todo` の形です。**ここを書いておくと、" +
      "項目を書き忘れたときに型が教えてくれます**\n" +
      "`text: text` … 「`text` という項目に、受け取った `text` を入れる」\n\n" +
      "`id` はこの回では `\"1\"` の固定でよいことにします。\n" +
      "「呼ぶたびに違う値にする」は③でやります。**一度に1つだけ**進めます。",
  },
  explanation:
    "アロー関数の `=>` の直後に `{` を書くと関数本体（処理）として解釈されるため、" +
    "オブジェクトを返したい場合は `return { ... };` と書くか、`=> ({ ... })` のように丸括弧で包みます。" +
    "戻り値の型注釈（`: Todo`）を書いておくと、項目の書き忘れや型の誤りをその場で検出できます。" +
    "`text: text` は「オブジェクトの `text` 項目に引数の `text` を入れる」という意味です。",

  starterCode: `// todo.ts
//
// ①で決めた型を使って、Todo を1つ作る関数を書きます。
// ①の型も、この回でもう一度書いてください（前の回のコードは残っていません）。
//
// 【要件】
//
//   1. ①と同じ Todo 型を書く。
//
//   2. createTodo という関数を作る。
//        - text（文字列）を1つ受け取る
//        - Todo を1つ返す
//        - id は "1" の固定でよい（③で直します）
//        - text には受け取った text を入れる
//        - done は false にする
//
// つまずきやすい場所を1つだけ先に言います。
// アロー関数でオブジェクトを返すときは return を書いてください。
//   => { return { ... }; }     ← これでよい
//   => { ... }                 ← これは動きません

`,

  modelAnswer: `// todo.ts

type Todo = { id: string; text: string; done: boolean };

// (text: string) ... 文字列を1つ受け取る
// : Todo         ... 返すものは Todo の形
//                    ここを書いておくと、項目の書き忘れを型が教えてくれる
const createTodo = (text: string): Todo => {
  // => のうしろに { を書いたので、ここは「処理」。
  // だから返すときは return を書く。
  //
  // text: text は「text という項目に、受け取った text を入れる」。
  // （text だけに省略もできるが、この教材では省略しない）
  return { id: "1", text: text, done: false };
};
`,

  hints: [
    {
      level: 1,
      text: "`const createTodo = (text: string): Todo => { ... };` という枠を先に書いてください。中で `return` を使ってオブジェクトを返します。",
    },
    {
      level: 2,
      text: "オブジェクトは `{ id: ..., text: ..., done: ... }` の形です。項目は `,` で区切ります（型のときの `;` とは違います）。",
    },
    {
      level: 3,
      text: "`return { id: \"1\", text: text, done: false };` です。`id` は文字列なので `\"1\"` とダブルクォートで囲みます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-02-1",
      description: "`createTodo` は `Todo` を返す型になっているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof createTodo>, Todo>>;`,
      },
    },
    {
      id: "cp-sc-02-2",
      description: "渡した text がそのまま入るか（実行して確認）？",
      verify: {
        kind: "run",
        assert: `assertEqual(createTodo("牛乳を買う").text, "牛乳を買う", "text が入っていない");`,
      },
    },
    {
      id: "cp-sc-02-3",
      description: "作った直後は未完（`done` が false）か？",
      verify: {
        kind: "run",
        assert: `assertEqual(createTodo("x").done, false, "done が false になっていない");`,
      },
    },
    {
      id: "cp-sc-02-4",
      description: "`id` は文字列で、空になっていないか？",
      verify: {
        kind: "run",
        assert: `var t = createTodo("x");
assertTrue(typeof t.id === "string", "id が文字列になっていない");
assertTrue(t.id.length > 0, "id が空になっている");`,
      },
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "関数", "オブジェクト", "アロー関数"],
  relatedIds: ["sc-01-write-one-type", "sc-03-unique-id"],
};
