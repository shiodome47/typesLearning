import type { Lesson } from "../types";

export const lesson31: Lesson = {
  kind: "write",
  id: "ts-31-satisfies",
  order: 31,
  title: "satisfies 演算子（TS4.9+）",
  category: "type-basics",
  difficulty: 3,

  goal: "`satisfies` 演算子で型の安全性とリテラル型推論を同時に得られるようになる",

  why: {
    problem:
      "画面のURLをあちこちに直書きするのはやめよう、ということになりました。" +
      "1ヶ所にまとめます。`const ROUTES = { home: \"/\", about: \"/about\", dashboard: \"/dashboard\" }`。\n\n" +
      "型も付けておきましょう。中身は全部「キーが文字列、値も文字列」なので、" +
      "`const ROUTES: Record<string, string> = { ... }` と書きます。丁寧な仕事に見えます。\n\n" +
      "ところが、この1行が余計でした。" +
      "`Record<string, string>` は「どんな文字列のキーでも入っている」という意味です。" +
      "型注釈を書いた瞬間、TypeScript は `ROUTES` を「キーが3つのオブジェクト」ではなく" +
      "「あらゆるキーを持ちうるオブジェクト」として扱うようになります。\n\n" +
      "半年後、新しく入った人が `router.push(ROUTES.setting)` と書きます。" +
      "正しくは `settings` ですが、`ROUTES.` と打っても候補は1つも出てきません（何でも入っている扱いなので、出しようがないのです）。" +
      "`ROUTES.setting` にも赤線は出ません。あらゆるキーが存在することになっているからです。\n\n" +
      "実行すると `undefined` が返り、ブラウザは `/undefined` へ飛びます。" +
      "型を付けたことで、型が教えてくれるはずだったことが消えてしまいました。\n\n" +
      "では型注釈を外せばいいのか、というと今度は検証されません。" +
      "`about: 42` と数値を書いても、誰も止めてくれません。" +
      "検証は欲しい。でもキーの情報も残したい。この2つが同時に欲しかったのです。",
    insight:
      "型注釈（`: 型`）は、上書きです。「この変数はこの型ということにする」と宣言する書き方なので、" +
      "TypeScript がもともと読み取っていた具体的な情報（キーが3つしかないこと）は捨てられます。\n\n" +
      "`satisfies` は上書きしません。「この形を満たしているか確かめてほしい。ただし変数の型は、書いたとおりのままにしておいて」というお願いです。" +
      "検査はする。でも塗りつぶさない。それだけの違いです。\n\n" +
      "`const ROUTES = { ... } satisfies Record<string, string>` と書くと、こうなります。\n\n" +
      "・値に数値を混ぜたら、その行だけ赤線が出る（検査は効いている）\n" +
      "・`ROUTES.` と打つと `home` `about` `dashboard` の3つが候補に出る（情報は残っている）\n" +
      "・`ROUTES.setting` はその場で赤線になる\n\n" +
      "`as` は3つ目の選択肢ですが、これは検査を弱める書き方なので逆方向です。" +
      "`as` は「文句を言わないでくれ」、`satisfies` は「ちゃんと見てくれ」。目的が正反対です。\n\n" +
      "設定オブジェクト、ルート定義、翻訳のキー一覧、カラーテーマ。" +
      "「形は決まっているが、キーの一つ一つも大事」という場面はよくあります。そこでの現代的な書き方がこれです。",
  },
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
    {
      id: "cp-31-1",
      description: "`const x = { ... } satisfies Record<string, string>` の構文でオブジェクトリテラルの後ろに置けているか？",
      verify: {
        kind: "type",
        assert: `
// satisfies なら「Record<string, string> を満たす」かつ「キーが具体的なまま」
// 型注釈（: Record<string, string>）だと keyof が string に広がりここで落ちる
type _c1 = Expect<Equal<keyof typeof ROUTES, "home" | "about" | "dashboard">>;
const _sat1: Record<string, string> = ROUTES;`,
      },
    },
    // 注: satisfies Record<string, string> では値側の contextual type が string の
    // ため各値は string に広がる（リテラル型は残らない）。自動採点できないので
    // ここは自己申告のままにする。
    { id: "cp-31-2", description: "`ROUTES.home` が `string` ではなく `\"/\"` のリテラル型として推論されるか？" },
    { id: "cp-31-3", description: "値型違反（`number` など）のプロパティで型エラーが発生するか確認できたか？" },
    {
      id: "cp-31-4",
      description: "型注釈・`as`・`satisfies` の推論型の違いをコメントで説明できているか？",
      verify: {
        kind: "type",
        assert: `
// A（型注釈）と B（as）は Record<string, string> そのものに潰れ、キーの情報が消える。
// C（satisfies）だけが「型の検証」と「具体的なキーの保持」を両立する。
type _c4a = Expect<Equal<keyof typeof A, string>>;
type _c4b = Expect<Equal<keyof typeof B, string>>;
type _c4c = Expect<Equal<keyof typeof C, "home">>;`,
      },
    },
  ],

  tags: ["satisfies", "リテラル型", "型推論", "型注釈", "as", "TS4.9"],
  relatedIds: ["ts-04-type-alias", "ts-22-record-type", "ts-21-utility-types", "ts-24-mapped-types"],
};
