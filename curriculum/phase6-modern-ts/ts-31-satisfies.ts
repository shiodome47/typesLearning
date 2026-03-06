import type { Lesson } from "../types";

export const lesson31: Lesson = {
  id: "ts-31-satisfies",
  order: 31,
  title: "satisfies 演算子（TS4.9+）",
  category: "type-basics",
  difficulty: 3,

  goal: "`satisfies` 演算子で型の安全性とリテラル型推論を同時に得られるようになる",
  explanation:
    "TypeScript 4.9 で追加された `satisfies` 演算子は、「型を満たしているか検証しつつ、より具体的な型（リテラル型）として推論させる」ための演算子です。" +
    "型注釈（`: Record<string, string>`）を付けると各値が `string` に広がり、プロパティのリテラル型が失われます。" +
    "`as` による型アサーションは型チェック自体が甘くなり、誤った型を代入してもエラーにならない場合があります。" +
    "`satisfies Record<string, string>` にすると、型の形を検証しつつ各値はリテラル型のまま保持できます。" +
    "ルート定義・i18n マップ・カラーテーマなど「形は固定・値は参照側でも活用したい」設計で頻繁に登場します。",

  starterCode: `// ── Part 1: satisfies の基本 ──────────────────────────────
// ROUTES オブジェクトを satisfies を使って定義してください
// 型制約: Record<string, string>
//
// 期待する挙動:
//   ROUTES.home       → "/" として推論（string ではなく）
//   値が string でないプロパティはエラーになる

// const ROUTES = {
//   home: "/",
//   about: "/about",
//   dashboard: "/dashboard",
// } /* ここに satisfies を追加 */;

// ── Part 2: 型エラーの確認 ────────────────────────────────
// 下記で count: 42 が型エラーになることを確認してください
// （satisfies Record<string, string> を付けて、number がエラーになる行をコメントで示す）

// const INVALID = {
//   home: "/",
//   count: 42, // ← number なので型エラーになるはずです
// } /* satisfies を追加 */;

// ── Part 3: 3パターン比較（コメントで説明） ───────────────
// 下記の A / B / C それぞれで .home の推論型がどう違うか、
// コメントで説明してください

// A: 型注釈
// const A: Record<string, string> = { home: "/" };
// A.home // → ???

// B: as（型アサーション）
// const B = { home: "/" } as Record<string, string>;
// B.home // → ???（かつ型チェックが甘い）

// C: satisfies
// const C = { home: "/" } satisfies Record<string, string>;
// C.home // → ???
`,

  modelAnswer: `// Part 1: satisfies の基本
const ROUTES = {
  home: "/",
  about: "/about",
  dashboard: "/dashboard",
} satisfies Record<string, string>;

// ROUTES.home は "/" のリテラル型として推論される（string に広がらない）
const home = ROUTES.home; // type: "/"

// Part 2: 型エラーの確認
// const INVALID = {
//   home: "/",
//   count: 42, // 型エラー: number は string を満たさない
// } satisfies Record<string, string>;

// Part 3: 3パターン比較

// A: 型注釈 → プロパティ値が string に広がる。リテラル型が失われる
const A: Record<string, string> = { home: "/" };
// A.home は string → switch や比較での恩恵が薄い

// B: as → 型チェックが甘い。誤った値を入れてもエラーにならない場合がある
const B = { home: "/" } as Record<string, string>;
// B.home は string （かつ number を混在させてもエラーにならないことがある）

// C: satisfies → 型の検証 + リテラル型推論の両立
const C = { home: "/" } satisfies Record<string, string>;
// C.home は "/" のリテラル型 → より精度の高い型補完・比較が可能`,

  hints: [
    {
      level: 1,
      text: "`satisfies` はオブジェクトリテラルの末尾に置きます。`const x = { ... } satisfies SomeType` の形です。型注釈（`: SomeType`）と違い、各プロパティの値がリテラル型のまま推論されます。",
    },
    {
      level: 2,
      text: "Part 2 の `count: 42` は `Record<string, string>` の値型 `string` を満たさないため、`satisfies` を付けると `count` の行だけ型エラーになります。型注釈では全体が `Record<string, string>` に広がるため、エラーの出方が変わります。",
    },
    {
      level: 3,
      text: "3パターンまとめ: A（型注釈）はリテラル型が消える・B（`as`）は型チェックが効かない・C（`satisfies`）は「型の検証 + リテラル型推論の両立」ができます。実務ではルート定義や設定オブジェクトに `satisfies` を使うのが現代的な書き方です。",
    },
  ],

  checkpoints: [
    { id: "cp-31-1", description: "`const x = { ... } satisfies Record<string, string>` の構文でオブジェクトリテラルの後ろに置けているか？" },
    { id: "cp-31-2", description: "`ROUTES.home` が `string` ではなく `\"/\"` のリテラル型として推論されるか？" },
    { id: "cp-31-3", description: "値型違反（`number` など）のプロパティで型エラーが発生するか確認できたか？" },
    { id: "cp-31-4", description: "型注釈・`as`・`satisfies` の推論型の違いをコメントで説明できているか？" },
  ],

  tags: ["satisfies", "リテラル型", "型推論", "型注釈", "as", "TS4.9"],
  relatedIds: ["ts-04-type-alias", "ts-22-record-type", "ts-21-utility-types", "ts-24-mapped-types"],
};
