import type { Lesson } from "../types";

export const lesson16: Lesson = {
  id: "ts-16-component-props",
  order: 16,
  title: "Reactコンポーネントの型（props）",
  category: "react-basics",
  difficulty: 3,

  goal: "propsの型をtypeで定義し、型安全なReactコンポーネントを書けるようになる",
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
    { id: "cp-16-1", description: "`type` でprops型が定義できているか？" },
    { id: "cp-16-2", description: "`isAdmin` が `?:` でoptionalになっているか？" },
    { id: "cp-16-3", description: "引数で `{ name, age, isAdmin }: GreetingProps` の分割代入ができているか？" },
    { id: "cp-16-4", description: "`isAdmin` の有無で表示を切り替えられているか？" },
  ],

  tags: ["React", "props", "型定義", "コンポーネント", "optional", "分割代入"],
  relatedIds: ["ts-04-type-alias", "ts-17-usestate"],
};
