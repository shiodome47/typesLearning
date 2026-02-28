import type { Lesson } from "../types";

export const lesson27: Lesson = {
  id: "ts-27-usereducer",
  order: 27,
  title: "useReducer + Discriminated Union",
  category: "react-basics",
  difficulty: 3,

  goal: "`Action` を Discriminated Union で定義し、`useReducer` で型安全な状態管理を書けるようになる",
  explanation:
    "`useReducer` は `(state, action) => newState` の形で複雑な状態を管理するフックです。" +
    "`Action` 型を Discriminated Union（`type Action = { type: 'increment' } | { type: 'reset'; payload: number }` の形）で定義すると、" +
    "`reducer` 内の `switch(action.type)` で TypeScript が型を自動的に絞り込みます。" +
    "#19（Discriminated Union）と #20（assertNever）で学んだパターンをそのまま React に適用する教材です。" +
    "次の #26（useContext）では、この `state` と `dispatch` をコンポーネントツリー全体に共有する方法を学びます。",

  starterCode: `import { useReducer } from "react";

// カウンターの State と Action を定義してください

// 1. State 型を定義してください
//    プロパティ: count: number

// 2. Action 型を Discriminated Union で定義してください
//    パターン:
//    - { type: "increment" }
//    - { type: "decrement" }
//    - { type: "reset"; payload: number }

// 3. reducer 関数を実装してください
//    引数: state: State, action: Action
//    戻り値: State
//    switch(action.type) で分岐し、各 case を実装してください

// 4. Counter コンポーネントを実装してください
//    - useReducer(reducer, { count: 0 }) で初期化
//    - ボタン3つ: "+1"（increment）, "-1"（decrement）, "リセット"（reset, payload: 0）
//    - <div>カウント: {state.count}</div> を表示
`,

  modelAnswer: `import { useReducer } from "react";

type State = {
  count: number;
};

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: action.payload };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <div>カウント: {state.count}</div>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset", payload: 0 })}>リセット</button>
    </div>
  );
}`,

  hints: [
    {
      level: 1,
      text: "`Action` 型は `| { type: \"increment\" } | { type: \"decrement\" } | { type: \"reset\"; payload: number }` のように Union で定義します。`reset` だけ `payload` を持つのがポイントです。",
    },
    {
      level: 2,
      text: "`reducer` 関数は `switch(action.type)` で分岐します。`case \"reset\":` の中では `action.payload` が型安全に使えます（Discriminated Union の恩恵）。各 case で `{ count: ... }` の新しいオブジェクトを返します。",
    },
    {
      level: 3,
      text: "`const [state, dispatch] = useReducer(reducer, { count: 0 })` で初期化。`dispatch({ type: \"reset\", payload: 0 })` のように `payload` が必要な Action には値を渡します。`dispatch({ type: \"increment\" })` には `payload` は不要です（型エラーになる）。",
    },
  ],

  checkpoints: [
    { id: "cp-27-1", description: "`Action` が Discriminated Union で定義され、`reset` のみ `payload` を持つ形になっているか？" },
    { id: "cp-27-2", description: "`reducer` の戻り値型が `State` になっているか？" },
    { id: "cp-27-3", description: "`switch(action.type)` の各 case で TypeScript が型を絞り込んでいるか（`case \"reset\"` 内で `action.payload` が使えるか）？" },
    { id: "cp-27-4", description: "`useReducer(reducer, { count: 0 })` で `state` と `dispatch` が取得できているか？" },
    { id: "cp-27-5", description: "`dispatch` の呼び出しが型安全か（間違った type や payload 漏れが型エラーになるか）？" },
  ],

  tags: ["useReducer", "Discriminated Union", "reducer", "dispatch", "状態管理", "switch"],
  relatedIds: ["ts-19-discriminated-union", "ts-20-exhaustive-check", "ts-17-usestate", "ts-25-useeffect-cleanup"],
};
