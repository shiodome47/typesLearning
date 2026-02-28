import type { Lesson } from "../types";

export const lesson26: Lesson = {
  id: "ts-26-usecontext",
  order: 26,
  title: "useContext + 型定義",
  category: "react-basics",
  difficulty: 3,

  goal: "`createContext<T | null>(null)` と `useContext` を使い、型安全なコンテキストをコンポーネント間で共有できるようになる",
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
    { id: "cp-26-1", description: "`createContext<ThemeContextType | null>(null)` の形でコンテキストが作れているか？" },
    { id: "cp-26-2", description: "Provider の `value` prop に型通りの値 `{ theme, toggleTheme }` が渡せているか？" },
    { id: "cp-26-3", description: "`useTheme` 内で null チェックが行われ、Provider 外で使ったときにエラーになるか？" },
    { id: "cp-26-4", description: "null チェック後の `ctx` が `ThemeContextType` として扱えているか（型エラーなくプロパティにアクセスできるか）？" },
  ],

  tags: ["useContext", "createContext", "Provider", "カスタムhook", "null チェック", "コンテキスト"],
  relatedIds: ["ts-17-usestate", "ts-25-useeffect-cleanup", "ts-27-usereducer"],
};
