import type { Lesson } from "../types";

export const lesson16: Lesson = {
  kind: "write",
  id: "ts-16-component-props",
  order: 16,
  title: "Reactコンポーネントの型（props）",
  category: "react-basics",
  difficulty: 3,

  goal: "propsの型をtypeで定義し、型安全なReactコンポーネントを書けるようになる",

  why: {
    problem:
      "会員向けのページを作っていて、名前と年齢を表示する小さな部品（コンポーネント）を作ったとします。" +
      "作った本人は `userName` という名前で値を受け取るつもりでした。\n\n" +
      "次の日、別の画面でその部品を使います。`<Greeting username=\"Alice\" age={25} />`。" +
      "`userName` と `username`。`N` が小文字になっています。\n\n" +
      "型を付けていないと、これは何も起きません。エラーも警告も出ません。" +
      "受け取る側では `userName` が `undefined` になり、画面には「Hello, さん」とだけ表示されます。" +
      "名前が消えた理由を探して、部品の中身を読み、呼び出し側を読み、30分たってやっとスペルに気づきます。\n\n" +
      "もっと厄介なのは、あとから項目を1つ増やしたときです。" +
      "「管理者バッジを出したいので `isAdmin` を追加しよう」。追加はできました。" +
      "では、この部品を使っている画面は何ヶ所あるでしょう。渡し忘れている画面はどれでしょう。" +
      "全部を目で確認するしかありません。\n\n" +
      "部品というのは「他人が使うもの」です。半年後の自分も他人です。" +
      "何を渡せばいいのかがコードのどこにも書かれていない部品は、使うたびに中身を読む羽目になります。",
    insight:
      "`type GreetingProps = { ... }` は、その部品の**取扱説明書**です。" +
      "「この部品には name と age を渡してください。isAdmin は無くても動きます」と、機械が読める形で書いたものです。\n\n" +
      "説明書があると、TypeScript が使う側をチェックしてくれます。" +
      "`username` と打ち間違えれば、その場で `<Greeting` の行に赤線が出ます。" +
      "`age` を渡し忘れても赤線が出ます。部品の中身を一度も開かずに、間違いが分かります。\n\n" +
      "`?:` を付けたプロパティは「省略してもいい」という意味です。" +
      "逆に言うと、`?` が付いていないものは必ず渡さないといけません。" +
      "この区別を型に書いておくと、「これって渡さなくても動くんだっけ？」と毎回悩まなくて済みます。\n\n" +
      "そしてエディタが `<Greeting ` まで打った時点で候補を出してくれるようになります。" +
      "型定義は、チェックのためだけでなく、書くときの手すりでもあります。\n\n" +
      "つまり props の型は「あとで誰かが困らないように、渡すべきものを先に宣言しておく」仕組みです。",
  },
  explanation:
    "Reactコンポーネントの props は `type Props = { ... }` で型定義します。" +
    "関数コンポーネントは `function Greeting(props: Props)` または分割代入 `{ name }: Props` の形で受け取ります。" +
    "省略可能なpropsは `?:` でoptionalにします。" +
    "TypeScriptの型定義がそのままコンポーネントの「インターフェース仕様書」になります。",

  starterCode: `// 1. GreetingProps 型を定義してください
//    プロパティ: name(string), age(number), isAdmin?(boolean, 省略可能)

// 2. Greeting コンポーネントを定義してください
//    - props を分割代入で受け取る
//    - isAdmin が true なら " [Admin]" を名前の後に追加する
//    - 例: <Greeting name="Alice" age={25} /> → "Hello, Alice (25)"
//    - 例: <Greeting name="Bob" age={30} isAdmin /> → "Hello, Bob (30) [Admin]"
`,

  modelAnswer: `type GreetingProps = {
  name: string;
  age: number;
  isAdmin?: boolean;
};

function Greeting({ name, age, isAdmin }: GreetingProps) {
  const adminLabel = isAdmin ? " [Admin]" : "";
  return (
    <p>
      Hello, {name} ({age}){adminLabel}
    </p>
  );
}

// 使用例
// <Greeting name="Alice" age={25} />
// <Greeting name="Bob" age={30} isAdmin />`,

  hints: [
    {
      level: 1,
      text: "`type GreetingProps = { name: string; age: number; isAdmin?: boolean; }` の形でprops型を定義します。`?:` がoptionalです。",
    },
    {
      level: 2,
      text: "引数を `({ name, age, isAdmin }: GreetingProps)` のように分割代入すると、props を直接変数として使えます。",
    },
    {
      level: 3,
      text: "`const adminLabel = isAdmin ? ' [Admin]' : ''` で条件分岐 → JSXの `{adminLabel}` で埋め込む",
    },
  ],

  checkpoints: [
    {
      id: "cp-16-1",
      description: "`type` でprops型が定義できているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<GreetingProps["name"], string>>;
type _c1b = Expect<Equal<GreetingProps["age"], number>>;`,
      },
    },
    {
      id: "cp-16-2",
      description: "`isAdmin` が `?:` でoptionalになっているか？",
      verify: {
        kind: "type",
        assert: `
type _OptionalKeys = {
  [K in keyof GreetingProps]-?: {} extends Pick<GreetingProps, K> ? K : never;
}[keyof GreetingProps];
type _c2a = Expect<Equal<_OptionalKeys, "isAdmin">>;
type _c2b = Expect<Equal<Required<GreetingProps>["isAdmin"], boolean>>;`,
      },
    },
    {
      id: "cp-16-3",
      description: "引数で `{ name, age, isAdmin }: GreetingProps` の分割代入ができているか？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<Equal<Parameters<typeof Greeting>[0], GreetingProps>>;
const _c3el = <Greeting name="Alice" age={25} />;
const _c3el2 = <Greeting name="Bob" age={30} isAdmin />;`,
      },
    },
    { id: "cp-16-4", description: "`isAdmin` の有無で表示を切り替えられているか？" },
  ],

  tags: ["React", "props", "型定義", "コンポーネント", "optional", "分割代入"],
  relatedIds: ["ts-04-type-alias", "ts-17-usestate"],
};
