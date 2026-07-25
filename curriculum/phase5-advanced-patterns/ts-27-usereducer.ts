import type { Lesson } from "../types";

export const lesson27: Lesson = {
  kind: "write",
  id: "ts-27-usereducer",
  order: 27,
  title: "useReducer + Discriminated Union",
  category: "react-basics",
  difficulty: 3,

  goal: "`Action` を Discriminated Union で定義し、`useReducer` で型安全な状態管理を書けるようになる",

  why: {
    problem:
      "買い物かごの画面を作ります。持つ状態は、商品のリスト、合計金額、送料、クーポンの割引額。" +
      "`useState` を4つ並べました。ここまでは素直です。\n\n" +
      "問題は、これらが互いに関係し合っていることです。" +
      "商品を1つ足したら、リストも合計も送料も変わります。" +
      "数量を変えても同じ。削除しても同じ。クーポンを外しても同じ。" +
      "そこで「＋」ボタンの中に `setItems` と `setTotal` と `setShipping` を並べて書きます。" +
      "「−」ボタンにも、削除ボタンにも、クーポン欄にも、同じような3行を書きます。\n\n" +
      "ある日、クーポンを外す処理に `setShipping` を書き忘れます。" +
      "5000円以上で送料無料なのに、クーポンを外して4800円になっても送料が0円のまま表示されます。" +
      "画面には0円、注文が確定するときには実際の送料。金額が食い違います。\n\n" +
      "原因を探そうにも、`setShipping` はコンポーネントのあちこちに散らばっています。" +
      "「送料はどういうときに、どう変わるのか」を知るには、画面のコード全体を読むしかありません。" +
      "ボタンが1つ増えるたびに、書き忘れる場所が1つ増えていきます。",
    insight:
      "`useReducer` がやることは、**状態の変え方を1か所に集める**ことです。\n\n" +
      "ボタン側はもう `setXxx` を呼びません。" +
      "代わりに「＋が押された」「クーポンが外された」という**出来事**だけを送ります。これが `dispatch` です。" +
      "その出来事を受けて状態がどうなるかを決めるのは、`reducer` という1つの関数だけ。" +
      "送料の計算はそこに1回書けば済み、書き忘れる場所そのものが無くなります。\n\n" +
      "そして送る出来事の型が `Action` です。" +
      "ここで #19 の Discriminated Union が効いてきます。" +
      "`{ type: \"increment\" }` と `{ type: \"reset\"; payload: number }` を `|` でつないでおくと、" +
      "`switch (action.type)` で分岐した中では TypeScript が自動的に相手を見分けてくれます。\n\n" +
      "`case \"reset\"` の中では `action.payload` が使えて、`case \"increment\"` の中では使えません。" +
      "`dispatch({ type: \"reset\" })` と payload を忘れれば、その場で赤線です。" +
      "「この操作にはこの情報が必要」という約束を、型が代わりに見張ってくれます。\n\n" +
      "最後に `default` で `assertNever(action)` を呼んでおけば、#20 の網羅性チェックがそのまま効きます。" +
      "半年後に「まとめ買い割引」という出来事を足したとき、対応を書き忘れたその瞬間に赤線が出ます。",
  },
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
//    default 節で assertNever(action) を呼び、#20 の網羅性チェックを効かせること

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

// #20 で学んだ網羅性チェック。Action を増やして case を書き忘れると、
// default 節の action が never でなくなりコンパイルエラーで気づける。
function assertNever(x: never): never {
  throw new Error("Unhandled action: " + JSON.stringify(x));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: action.payload };
    default:
      return assertNever(action);
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
    {
      id: "cp-27-1",
      description: "`Action` が Discriminated Union で定義され、`reset` のみ `payload` を持つ形になっているか？",
      verify: {
        kind: "type",
        assert: `
type _c1a = Expect<Equal<Action["type"], "increment" | "decrement" | "reset">>;
type _Reset1 = Extract<Action, { type: "reset" }>;
type _c1b = Expect<Equal<_Reset1["payload"], number>>;
type _Inc1 = Extract<Action, { type: "increment" }>;
type _c1c = Expect<Equal<keyof _Inc1, "type">>;`,
      },
    },
    {
      id: "cp-27-2",
      description: "`reducer` の戻り値型が `State` になっているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<ReturnType<typeof reducer>, State>>;
type _c2b = Expect<Equal<State["count"], number>>;`,
      },
    },
    {
      id: "cp-27-3",
      description: "`switch(action.type)` の各 case で TypeScript が型を絞り込んでいるか（`case \"reset\"` 内で `action.payload` が使えるか）？",
      verify: {
        kind: "type",
        assert: `
function _narrow3(a: Action): number {
  if (a.type === "reset") return a.payload;
  return 0;
}
type _c3 = Expect<Equal<ReturnType<typeof _narrow3>, number>>;`,
      },
    },
    {
      id: "cp-27-4",
      description: "`useReducer(reducer, { count: 0 })` で `state` と `dispatch` が取得できているか？",
      verify: {
        kind: "type",
        assert: `
const [_state4, _dispatch4] = useReducer(reducer, { count: 0 });
type _c4a = Expect<Equal<typeof _state4, State>>;
type _c4b = Expect<Equal<typeof _dispatch4, import("react").Dispatch<Action>>>;`,
      },
    },
    {
      id: "cp-27-5",
      description: "`dispatch` の呼び出しが型安全か（間違った type や payload 漏れが型エラーになるか）？",
      verify: {
        kind: "expect-error",
        assert: `
const [, _dispatch5] = useReducer(reducer, { count: 0 });
_dispatch5({ type: "reset" });`,
      },
    },
    {
      id: "cp-27-6",
      description: "`default` 節で `assertNever(action)` を呼び、Action を増やしたときに分岐漏れがコンパイルエラーになるか？",
      verify: {
        kind: "type",
        assert: `
type _c6 = Expect<Equal<Parameters<typeof assertNever>[0], never>>;`,
      },
    },
  ],

  tags: ["useReducer", "Discriminated Union", "reducer", "dispatch", "状態管理", "switch"],
  relatedIds: ["ts-19-discriminated-union", "ts-20-exhaustive-check", "ts-17-usestate", "ts-25-useeffect-cleanup"],
};
