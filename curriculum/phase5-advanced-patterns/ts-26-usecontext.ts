import type { Lesson } from "../types";

export const lesson26: Lesson = {
  kind: "write",
  id: "ts-26-usecontext",
  order: 26,
  title: "useContext + 型定義",
  category: "react-basics",
  difficulty: 3,

  goal: "`createContext<T | null>(null)` と `useContext` を使い、型安全なコンテキストをコンポーネント間で共有できるようになる",

  why: {
    problem:
      "画面の右上に、ログイン中の利用者の名前を出したいだけです。" +
      "名前を持っているのは一番外側の `App`。表示するのは一番奥の `Avatar`。" +
      "その間には `Layout` → `Header` → `UserMenu` と3つの部品が挟まっています。\n\n" +
      "値を届けるには、この3つ全部に `user` を受け取らせて、下へ手渡ししていくしかありません。" +
      "`Layout` も `Header` も `user` を1ミリも使わないのに、下に渡すためだけに受け取ります。" +
      "props の型定義も3か所増えます。\n\n" +
      "次にテーマ（ライト/ダーク）を追加します。また同じ3か所に配線を通します。" +
      "次に表示言語。また3か所。`Header` の props の型は、自分では使わない項目でどんどん膨らんでいきます。\n\n" +
      "ある日、`Header` を管理画面でも使い回そうとして手が止まります。" +
      "管理画面には `user` も `theme` も `language` もありません。" +
      "`Header` は「そのバケツリレーの列に並んでいる場所」でしか使えない部品になっていたのです。\n\n" +
      "さらに `Header` と `UserMenu` の間にもう1つ部品を挟むことになったら、" +
      "そこにも同じ配線を全部通し直すことになります。表示を1つ増やしたいだけなのに。",
    insight:
      "Context は「途中の部品を飛ばして値を届ける」仕組みです。\n\n" +
      "`Provider` で囲んだ範囲の中なら、どんなに深い場所からでも `useContext` で直接値を取り出せます。" +
      "間に挟まっている部品は、その値の存在すら知らなくて済みます。" +
      "配線が消えるので、`Header` はどこにでも置ける部品に戻ります。\n\n" +
      "型の書き方でひとつ引っかかるのが `createContext<ThemeContextType | null>(null)` の `| null` です。" +
      "これは「`Provider` で囲むのを忘れた場所から使われるかもしれない」という現実を、正直に型で表したものです。" +
      "囲み忘れは実際に起きます。そのとき値は `null` になります。\n\n" +
      "だからといって使う側で毎回 `if (ctx)` と書かせるのは面倒です。" +
      "そこで `useTheme` というカスタムフックを1つ挟み、その中で `null` なら " +
      "「ThemeProvider の中で使ってください」と例外を投げます。\n\n" +
      "こうすると2つ得をします。" +
      "囲み忘れたときは画面が壊れる前に、原因がそのまま書かれたエラーが出ます。" +
      "そして `null` を弾いた後なので、`useTheme()` の戻り値は必ず値がある型になり、" +
      "使う側は `ctx?.theme` のような書き方をしなくて済みます。",
  },
  explanation:
    "`useContext` は Provider から値を受け取るフックです。TypeScript では `createContext<型 | null>(null)` と初期値を `null` にするパターンが定番です。" +
    "Provider の外で使われたときに `null` が返るため、カスタムフック内で `if (!ctx) throw` とガードするのが安全な設計です。" +
    "#27（useReducer）で学んだ `state` と `dispatch` を Provider で配布するのが、実務でよく見る組み合わせパターンです。" +
    "この教材では useReducer との合体ではなく、「createContext + useContext の型付け」の構造だけを白紙で再現できることを目標とします。",

  starterCode: `import { createContext, useContext, useState } from "react";

// テーマ切り替えコンテキストを実装してください

// 1. ThemeContextType 型を定義してください
//    プロパティ:
//    - theme: "light" | "dark"
//    - toggleTheme: () => void

// 2. ThemeContext を作成してください
//    - createContext で ThemeContextType | null 型、初期値 null で作る

// 3. ThemeProvider コンポーネントを実装してください
//    - theme state を持つ（初期値 "light"）
//    - toggleTheme で "light" / "dark" を切り替える
//    - ThemeContext.Provider の value に { theme, toggleTheme } を渡す
//    - children を受け取って表示する

// 4. useTheme カスタムフックを実装してください
//    - useContext(ThemeContext) で値を取得する
//    - null チェック: コンテキスト外で使われたら Error をスローする
//    - コンテキストの値を返す
`,

  modelAnswer: `import { createContext, useContext, useState } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// 使用例
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      現在のテーマ: {theme}
    </button>
  );
}`,

  hints: [
    {
      level: 1,
      text: "`ThemeContextType` を `type` で定義してから、`createContext<ThemeContextType | null>(null)` と書きます。`| null` にするのは「Provider 外では値がない」ことを型で表現するためです。",
    },
    {
      level: 2,
      text: "`ThemeProvider` は `children: React.ReactNode` を受け取り、`<ThemeContext.Provider value={{ theme, toggleTheme }}>` で囲みます。`toggleTheme` は `setTheme(t => t === \"light\" ? \"dark\" : \"light\")` で切り替えます。",
    },
    {
      level: 3,
      text: "`useTheme` の完成形: `const ctx = useContext(ThemeContext); if (!ctx) throw new Error(...); return ctx;` — null チェックの後では `ctx` が `ThemeContextType` に絞り込まれるため、型安全に値を返せます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-26-1",
      description: "`createContext<ThemeContextType | null>(null)` の形でコンテキストが作れているか？",
      verify: {
        kind: "type",
        assert: `
type _c1 = Expect<
  Equal<typeof ThemeContext, import("react").Context<ThemeContextType | null>>
>;`,
      },
    },
    {
      id: "cp-26-2",
      description: "Provider の `value` prop に型通りの値 `{ theme, toggleTheme }` が渡せているか？",
      verify: {
        kind: "type",
        assert: `
const _value2: ThemeContextType = { theme: "light", toggleTheme: () => {} };
const _el2 = <ThemeContext.Provider value={_value2}>子要素</ThemeContext.Provider>;`,
      },
    },
    {
      id: "cp-26-3",
      description: "`useTheme` 内で null チェックが行われ、Provider 外で使ったときにエラーになるか？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<Equal<ReturnType<typeof useTheme>, ThemeContextType>>;`,
      },
    },
    {
      id: "cp-26-4",
      description: "null チェック後の `ctx` が `ThemeContextType` として扱えているか（型エラーなくプロパティにアクセスできるか）？",
      verify: {
        kind: "type",
        assert: `
const _ctx4 = useTheme();
type _c4a = Expect<Equal<typeof _ctx4.theme, "light" | "dark">>;
type _c4b = Expect<Equal<typeof _ctx4.toggleTheme, () => void>>;`,
      },
    },
  ],

  tags: ["useContext", "createContext", "Provider", "カスタムhook", "null チェック", "コンテキスト"],
  relatedIds: ["ts-17-usestate", "ts-25-useeffect-cleanup", "ts-27-usereducer"],
};
