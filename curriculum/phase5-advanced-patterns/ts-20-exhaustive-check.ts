import type { Lesson } from "../types";

export const lesson20: Lesson = {
  kind: "write",
  id: "ts-20-exhaustive-check",
  order: 20,
  title: "網羅性チェック（never と assertNever）",
  category: "type-guards",
  difficulty: 3,

  goal: "`never` 型と `assertNever` 関数を使い、Union 型の分岐漏れをコンパイルエラーで検出できるようになる",

  why: {
    problem:
      "お店のアプリを作ったとします。支払い方法は「現金」「カード」「QR」の3つ。" +
      "支払い方法によって画面の表示を変える処理を書きました。3つとも書いたので完璧です。\n\n" +
      "半年後、「電子マネー」を追加することになりました。型に1行足します。\n\n" +
      "ここで問題です。このアプリの中で、支払い方法によって処理を分けている場所は何ヶ所あるでしょう？ " +
      "画面表示、売上集計、レシート、返金処理… 10ヶ所以上あるかもしれません。全部直したと言い切れますか？\n\n" +
      "TypeScript は何も教えてくれません。`default` が書いてあるからです。" +
      "`default: return \"\"` なら、電子マネーは黙って空欄になります。エラーも警告も出ません。" +
      "気づくのは、お客さんから「レシートの支払い方法が空欄なんですけど」と連絡が来たときです。\n\n" +
      "これが解決したい問題です。「種類を1つ増やしたら、直すべき場所を全部コンパイラに教えてほしい」。",
    insight:
      "`never` は「もう何も残っていない」という意味の型です。\n\n" +
      "switch で「現金」「カード」「QR」を全部処理し終えたあと、`default` に来る可能性のある値は何でしょう？ " +
      "——ありません。3種類しかないものを3種類とも処理したので、残りはゼロです。" +
      "この「残りゼロ」の状態を TypeScript は `never` と呼びます。\n\n" +
      "`assertNever(x: never)` は「残りゼロのものしか受け取らない関数」です。だから:\n\n" +
      "・全部処理した → 残りゼロ → `never` → 受け取れる → コンパイル成功\n" +
      "・電子マネーを足して case を書き忘れた → 残りが1つある → `never` ではない → 受け取れない → その場で赤線\n\n" +
      "つまり `assertNever` は「全部やった？」をコンパイラに確認させる仕掛けです。" +
      "書き忘れた瞬間に分かります。半年後のクレームではなく。",
  },
  explanation:
    "Discriminated Union の switch 文では、新しいメンバーを追加したとき分岐漏れが生じやすいです。" +
    "`default` ケースで `assertNever(x: never): never` を呼ぶと、未処理のケースがある場合に TypeScript がコンパイルエラーを出します。" +
    "`never` は「到達できない値の型」であり、すべての case を網羅したときだけ default に `never` 型が来ます。" +
    "この手法を「Exhaustive Check（網羅性チェック）」と呼びます。",

  starterCode: `// 1. assertNever 関数を定義してください
//    引数: x: never
//    戻り値型: never
//    実装: throw new Error(\`Unexpected value: \${JSON.stringify(x)}\`)

// 2. 前の教材の Shape 型（Circle / Rect / Triangle）と getArea を再定義してください

// 3. getArea の switch 文の default case で assertNever を呼んでください

// 4. Shape に新しいメンバー { kind: "ellipse"; rx: number; ry: number } を追加して
//    getArea がコンパイルエラーになることを確認してください（確認後、ellipse の case を追加してOK）
`,

  modelAnswer: `function assertNever(x: never): never {
  throw new Error(\`Unexpected value: \${JSON.stringify(x)}\`);
}

type Circle   = { kind: "circle";   radius: number };
type Rect     = { kind: "rect";     width: number; height: number };
type Triangle = { kind: "triangle"; base: number;  height: number };
type Ellipse  = { kind: "ellipse";  rx: number;    ry: number };

type Shape = Circle | Rect | Triangle | Ellipse;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    case "ellipse":
      return Math.PI * shape.rx * shape.ry;
    default:
      return assertNever(shape); // 未処理 case があればここでエラー
  }
}`,

  hints: [
    {
      level: 1,
      text: "`function assertNever(x: never): never { throw new Error(...) }` と定義します。引数・戻り値どちらも `never` 型であることが重要です。",
    },
    {
      level: 2,
      text: "`switch` の `default` ケースで `return assertNever(shape)` と書きます。すべての `kind` を case で処理しているなら `shape` は `never` 型になり、エラーは出ません。",
    },
    {
      level: 3,
      text: "`Shape` に `Ellipse` を追加しただけで `getArea` がエラーになるのを確認してから、`case \"ellipse\"` を追加して解決します。`Math.PI * shape.rx * shape.ry` が楕円の面積です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-20-1",
      description: "`assertNever` の引数と戻り値の型が両方 `never` になっているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<Parameters<typeof assertNever>[0], never>>;
type _c1b = Expect<Equal<typeof assertNever, (x: never) => never>>;`,
      },
    },
    { id: "cp-20-2", description: "`switch` の `default` で `assertNever(shape)` が呼ばれているか？" },
    {
      id: "cp-20-3",
      description: "新しい Union メンバーを追加したとき、case を書くまでコンパイルエラーが出ることを確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `
// case を書き漏らすと default に届く値は never にならない。
// それを assertNever に渡すとエラーになる、という仕組みそのものの確認。
const _c3: Shape = { kind: "circle", radius: 1 };
assertNever(_c3);`,
      },
    },
    {
      id: "cp-20-4",
      description: "全 case を追加すれば型エラーが消えることを確認できたか？",
      verify: {
        kind: "type",
        assert: `
type _c4a = Expect<Equal<Shape["kind"], "circle" | "rect" | "triangle" | "ellipse">>;
type _c4b = Expect<Equal<ReturnType<typeof getArea>, number>>;
const _c4c: number = getArea({ kind: "ellipse", rx: 1, ry: 2 });`,
      },
    },
  ],

  tags: ["never", "assertNever", "Exhaustive Check", "網羅性", "Discriminated Union", "型安全"],
  relatedIds: ["ts-19-discriminated-union", "ts-07-type-guards"],
};
