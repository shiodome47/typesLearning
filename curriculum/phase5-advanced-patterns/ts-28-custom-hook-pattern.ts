import type { Lesson } from "../types";

export const lesson28: Lesson = {
  id: "ts-28-custom-hook-pattern",
  order: 28,
  title: "型安全なカスタムhookパターン",
  category: "react-basics",
  difficulty: 4,

  goal: "Generics `<T>` を使った型安全なカスタムフック `useLocalStorage<T>` を、白紙から再現できるようになる",
  explanation:
    "この教材は Phase5 の総合演習です。" +
    "#11（Generics）・#17（useState）・#25（useEffect）・#14（try/catch）で学んだ知識をすべて組み合わせます。" +
    "`useLocalStorage<T>(key, initialValue)` は「localStorage に値を保存・復元しながら state と同期するカスタムフック」です。" +
    "Generics `<T>` により、文字列・数値・オブジェクトなど任意の型で使い回せます。" +
    "初期読み込みは `JSON.parse`（型は `as T` でキャスト）、保存は `useEffect` で `JSON.stringify`、" +
    "読み込み失敗時は `try/catch` で `initialValue` にフォールバックするパターンが基本形です。",

  starterCode: `import { useState, useEffect } from "react";

// useLocalStorage<T> カスタムフックを実装してください
//
// シグネチャ:
//   function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void]
//
// 要件:
// 1. useState<T> で value state を持つ
//    - 初期値: localStorage から key で読み込む
//      - 読み込めた場合: JSON.parse した値（as T でキャスト）
//      - 失敗した場合（try/catch）: initialValue を使う
//    - ※ SSR安全のため typeof window === "undefined" なら initialValue を返す
//
// 2. useEffect で value が変わるたびに localStorage へ保存する
//    - JSON.stringify(value) で文字列化して保存
//    - 依存配列: [key, value]
//
// 3. [value, setValue] を返す（setValue は useState の setter をそのまま使う）

// 動作確認用コンポーネント（実装後にコメントを外して確認）
// function App() {
//   const [name, setName] = useLocalStorage<string>("username", "ゲスト");
//   return (
//     <div>
//       <p>名前: {name}</p>
//       <input value={name} onChange={(e) => setName(e.target.value)} />
//     </div>
//   );
// }
`,

  modelAnswer: `import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 動作確認用コンポーネント
function App() {
  const [name, setName] = useLocalStorage<string>("username", "ゲスト");
  return (
    <div>
      <p>名前: {name}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}`,

  hints: [
    {
      level: 1,
      text: "まず `useState<T>` の初期値を関数形式 `useState<T>(() => { ... })` にします。関数内で `localStorage.getItem(key)` を試み、取れたら `JSON.parse(item) as T`、失敗したら（`try/catch` で）`initialValue` を返します。SSR対策で最初に `typeof window === \"undefined\"` をチェックします。",
    },
    {
      level: 2,
      text: "`useEffect` で `localStorage.setItem(key, JSON.stringify(value))` を呼びます。依存配列は `[key, value]` にすると、value が変わるたびに自動保存されます。",
    },
    {
      level: 3,
      text: "戻り値は `[value, setValue]` — `setValue` は `useState` のセッター関数をそのまま返せばOKです。シグネチャ全体: `function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void]`",
    },
  ],

  checkpoints: [
    { id: "cp-28-1", description: "関数に `<T>` の型パラメータが付いているか？" },
    { id: "cp-28-2", description: "`useState<T>` の初期値でlocalStorageを読み込み、`try/catch` でフォールバックしているか？" },
    { id: "cp-28-3", description: "`useEffect` で `JSON.stringify(value)` を保存し、依存配列が `[key, value]` になっているか？" },
    { id: "cp-28-4", description: "`typeof window === \"undefined\"` のSSRガードが入っているか？" },
    { id: "cp-28-5", description: "戻り値が `[value, setValue]` のタプル形式で返せているか？" },
  ],

  tags: ["カスタムhook", "Generics", "useLocalStorage", "localStorage", "JSON.parse", "SSR安全"],
  relatedIds: ["ts-11-generics", "ts-14-error-handling", "ts-17-usestate", "ts-25-useeffect-cleanup"],
};
