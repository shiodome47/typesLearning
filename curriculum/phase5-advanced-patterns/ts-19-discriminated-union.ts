import type { Lesson } from "../types";

export const lesson19: Lesson = {
  id: "ts-19-discriminated-union",
  order: 19,
  title: "Discriminated Union実践",
  category: "union-literal",
  difficulty: 3,

  goal: "判別可能なUnion型（Discriminated Union）を使い、switch文で型を安全に絞り込めるようになる",
  explanation:
    "Discriminated Union は「共通の判別プロパティ（kind / type など）を持つ Union 型」です。" +
    "各メンバーが固有のリテラル型を持つため、`switch(shape.kind)` で TypeScript が自動的に型を絞り込みます。" +
    "`case 'circle':` の中では `shape.radius` が、`case 'rect':` の中では `shape.width`/`shape.height` が使えます。" +
    "条件分岐と型安全を同時に実現できる、実務で頻出のパターンです。",

  starterCode: `// 1. 以下の3つの型を定義してください
//    Circle:   { kind: "circle";   radius: number }
//    Rect:     { kind: "rect";     width: number; height: number }
//    Triangle: { kind: "triangle"; base: number;  height: number }

// 2. Shape = Circle | Rect | Triangle の Union 型を定義してください

// 3. getArea(shape: Shape): number を実装してください
//    - circle    → Math.PI * radius ** 2
//    - rect      → width * height
//    - triangle  → (base * height) / 2

// 動作確認
// console.log(getArea({ kind: "circle",   radius: 5 }));        // ≈ 78.54
// console.log(getArea({ kind: "rect",     width: 4, height: 3 })); // 12
// console.log(getArea({ kind: "triangle", base: 6, height: 4 })); // 12
`,

  modelAnswer: `type Circle   = { kind: "circle";   radius: number };
type Rect     = { kind: "rect";     width: number; height: number };
type Triangle = { kind: "triangle"; base: number;  height: number };

type Shape = Circle | Rect | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

console.log(getArea({ kind: "circle",   radius: 5 }));           // ≈ 78.54
console.log(getArea({ kind: "rect",     width: 4, height: 3 })); // 12
console.log(getArea({ kind: "triangle", base: 6, height: 4 }));  // 12`,

  hints: [
    {
      level: 1,
      text: "各型に `kind: \"circle\"` のようなリテラル型のプロパティを付けるのがポイントです。`type Circle = { kind: \"circle\"; radius: number }` の形で3つ定義してください。",
    },
    {
      level: 2,
      text: "`type Shape = Circle | Rect | Triangle` と Union 型を作ったら、`getArea` の引数に `Shape` を使います。`switch(shape.kind)` で各 case に分岐すると、TypeScript が自動で型を絞り込みます。",
    },
    {
      level: 3,
      text: "各 case の計算式: circle → `Math.PI * shape.radius ** 2`、rect → `shape.width * shape.height`、triangle → `(shape.base * shape.height) / 2`",
    },
  ],

  checkpoints: [
    { id: "cp-19-1", description: "3つの型それぞれに `kind` プロパティ（リテラル型）が付いているか？" },
    { id: "cp-19-2", description: "`Shape` が Union 型として3つを合わせているか？" },
    { id: "cp-19-3", description: "`switch(shape.kind)` で分岐し、各 case で正しい面積計算をしているか？" },
    { id: "cp-19-4", description: "case 内で `shape.radius` や `shape.width` が型エラーなく使えているか？" },
  ],

  tags: ["Discriminated Union", "switch", "型の絞り込み", "リテラル型", "Union型"],
  relatedIds: ["ts-06-union-literal", "ts-20-exhaustive-check"],
};
