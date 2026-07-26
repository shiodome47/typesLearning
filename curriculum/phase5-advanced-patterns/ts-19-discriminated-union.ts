import type { Lesson } from "../types";

export const lesson19: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-19-discriminated-union",
  order: 19,
  title: "Discriminated Union実践",
  category: "union-literal",
  difficulty: 3,

  goal: "判別可能なUnion型（Discriminated Union）を使い、switch文で型を安全に絞り込めるようになる",

  why: {
    problem:
      "データを取ってきて表示する画面を作ります。状態は3つ。読み込み中か、成功してデータがあるか、失敗してエラーが出たか。\n\n" +
      "素直に書くとこうなります。`{ isLoading: boolean; data?: User; error?: string }`。" +
      "3つとも1つの箱に入れて、必要なものだけ使う。動きます。\n\n" +
      "ですがこの型は、**ありえない状態も表現できてしまいます**。" +
      "`{ isLoading: true, data: user, error: \"失敗\" }` ——読み込み中なのにデータもエラーもある。" +
      "`{ isLoading: false }` ——終わったのに何も無い。" +
      "現実には起こらないはずの組み合わせが、型としては全部 OK です。\n\n" +
      "そして実際に起こります。エラーのあとに再取得したとき `error` を消し忘れる。" +
      "画面には取得できたデータと「失敗しました」の赤い文字が同時に出ます。" +
      "直そうとしてコードを読むと、あちこちに `if (state.error)` `if (state.data)` が散らばっていて、" +
      "どの順番で判定すべきなのかが誰にも分かりません。" +
      "`data?` は省略可能なので、使うたびに `state.data!.name` と書くか、null チェックを重ねることになります。\n\n" +
      "問題の根っこは、コードのバグではなく型のほうにあります。" +
      "「同時には起きないはずの組み合わせ」を、型が許してしまっているのです。",
    insight:
      "考え方をひっくり返します。「1つの型に全部の項目を入れる」のをやめて、" +
      "**状態ごとに別の型を作り、それを `|` でつなぐ**のです。\n\n" +
      "`{ status: \"loading\" }` / `{ status: \"success\"; data: User }` / `{ status: \"error\"; message: string }`。" +
      "こうすると、読み込み中の型にはそもそも `data` という項目が存在しません。" +
      "書きようがないので、ありえない状態が作れません。" +
      "しかも `success` の `data` は省略不可なので、`!` も null チェックも要らなくなります。\n\n" +
      "ここで `status` のような、全メンバーが持っていて値が全部違うプロパティを**判別子**と呼びます。" +
      "「今どれなのか」を書いた名札だと思ってください。" +
      "この練習では図形に `kind: \"circle\"` のような名札を付けますが、やっていることは同じです。\n\n" +
      "名札があると、TypeScript が読んでくれます。" +
      "`switch (shape.kind)` と書いて `case \"circle\":` の中に入った瞬間、" +
      "TypeScript は「ここに来たということは円だ」と理解して、`shape.radius` を使わせてくれます。" +
      "`shape.width` と書けば、円に幅は無いのでその場で赤線です。" +
      "こちらが `if` で確認したことを、型のほうもちゃんと覚えていてくれる、ということです。\n\n" +
      "つまり判別可能 Union は、「起こりえない状態を、そもそも書けなくする」型の組み立て方です。" +
      "バグを見つける道具ではなく、バグを生まれなくする道具です。",
  },
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
    {
      id: "cp-19-1",
      description: "3つの型それぞれに `kind` プロパティ（リテラル型）が付いているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<Circle["kind"], "circle">>;
type _c1b = Expect<Equal<Rect["kind"], "rect">>;
type _c1c = Expect<Equal<Triangle["kind"], "triangle">>;`,
      },
    },
    {
      id: "cp-19-2",
      description: "`Shape` が Union 型として3つを合わせているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<Shape, Circle | Rect | Triangle>>;
type _c2b = Expect<Equal<Shape["kind"], "circle" | "rect" | "triangle">>;`,
      },
    },
    {
      id: "cp-19-3",
      description: "`switch(shape.kind)` で分岐し、各 case で正しい面積計算をしているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<Equal<Parameters<typeof getArea>[0], Shape>>;
type _c3b = Expect<Equal<ReturnType<typeof getArea>, number>>;
const _c3c: number = getArea({ kind: "rect", width: 4, height: 3 });`,
      },
    },
    {
      id: "cp-19-4",
      description: "case 内で `shape.radius` や `shape.width` が型エラーなく使えているか？",
      verify: {
        kind: "type",
        assert: `
// 判別子で絞り込めていれば、各分岐で固有のプロパティに触れる
function _narrow(shape: Shape): number {
  if (shape.kind === "circle") return shape.radius;
  if (shape.kind === "rect") return shape.width * shape.height;
  return shape.base * shape.height;
}
type _c4a = Expect<Equal<ReturnType<typeof _narrow>, number>>;
type _c4b = Expect<Equal<Extract<Shape, { kind: "circle" }>["radius"], number>>;
type _c4c = Expect<Equal<Extract<Shape, { kind: "rect" }>["width"], number>>;
type _c4d = Expect<Equal<Extract<Shape, { kind: "triangle" }>["base"], number>>;`,
      },
    },
  ],

  tags: ["Discriminated Union", "switch", "型の絞り込み", "リテラル型", "Union型"],
  relatedIds: ["ts-06-union-literal", "ts-20-exhaustive-check"],
};
