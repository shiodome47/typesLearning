import type { Lesson } from "../types";

export const lesson20: Lesson = {
  id: "ts-20-exhaustive-check",
  order: 20,
  title: "網羅性チェック（never と assertNever）",
  category: "type-guards",
  difficulty: 3,

  goal: "`never` 型と `assertNever` 関数を使い、Union 型の分岐漏れをコンパイルエラーで検出できるようになる",
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
    { id: "cp-20-1", description: "`assertNever` の引数と戻り値の型が両方 `never` になっているか？" },
    { id: "cp-20-2", description: "`switch` の `default` で `assertNever(shape)` が呼ばれているか？" },
    { id: "cp-20-3", description: "新しい Union メンバーを追加したとき、case を書くまでコンパイルエラーが出ることを確認できたか？" },
    { id: "cp-20-4", description: "全 case を追加すれば型エラーが消えることを確認できたか？" },
  ],

  tags: ["never", "assertNever", "Exhaustive Check", "網羅性", "Discriminated Union", "型安全"],
  relatedIds: ["ts-19-discriminated-union", "ts-09-type-guards"],
};
