import type { Lesson } from "../types";

// #06(ApiResult) / #19(判別可能Union) / #20(assertNever) / #22(Record) が
// すべて収束する回収レッスン。実務の React + TS で最も頻繁に書くコード。
export const lesson33: Lesson = {
  kind: "write",
  id: "ts-33-async-state-union",
  order: 33,
  title: "非同期状態を判別可能Unionで描画する",
  category: "react-basics",
  difficulty: 4,

  goal: "読み込み中・成功・失敗を判別可能Unionで表現し、JSXで網羅的に分岐描画できるようになる",
  explanation:
    "ここまで学んだ #06（Union/Literal）・#19（判別可能Union）・#20（assertNever）・#22（Record）は、すべてこの1点に収束します。" +
    "非同期処理の状態を `isLoading` / `data` / `error` の3つのフラグで持つと、「読み込み中なのにデータもエラーもある」といった" +
    "ありえない組み合わせが型の上で表現できてしまいます。" +
    "`{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }` という判別可能Unionにすると、" +
    "不正な状態がそもそも作れなくなり（make illegal states unrepresentable）、`switch` で網羅性チェックも効きます。" +
    "実務の React + TypeScript で最も頻繁に書くパターンです。",

  starterCode: `import { useState, useEffect } from "react";

type User = { id: number; name: string };

// 1. AsyncState<T> 型を判別可能Unionで定義してください
//    - { status: "loading" }
//    - { status: "success"; data: T }
//    - { status: "error"; error: string }

// 2. assertNever(x: never): never を定義してください

// 3. UserView コンポーネントを実装してください
//    - useState<AsyncState<User>> の初期値は { status: "loading" }
//    - useEffect でデータ取得（モックでよい）
//    - switch (state.status) で3分岐し、default で assertNever(state) を呼ぶ
//      - loading : <p>読み込み中...</p>
//      - success : <p>{state.data.name}</p>
//      - error   : <p>エラー: {state.error}</p>
`,

  modelAnswer: `import { useState, useEffect } from "react";

type User = { id: number; name: string };

// 1. 状態を判別可能Unionで表現する。
//    「loading なのに data がある」といった不正な状態が作れなくなる。
type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// 2. 網羅性チェック（#20）
function assertNever(x: never): never {
  throw new Error("Unhandled state: " + JSON.stringify(x));
}

function UserView() {
  const [state, setState] = useState<AsyncState<User>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const user: User = await Promise.resolve({ id: 1, name: "Alice" });
        if (!cancelled) setState({ status: "success", data: user });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "不明なエラー";
        if (!cancelled) setState({ status: "error", error: message });
      }
    };
    load();

    // アンマウント後に setState しない（#25 の cleanup）
    return () => {
      cancelled = true;
    };
  }, []);

  // 3. status で分岐。各分岐の中でだけ data / error にアクセスできる。
  switch (state.status) {
    case "loading":
      return <p>読み込み中...</p>;
    case "success":
      return <p>{state.data.name}</p>;
    case "error":
      return <p>エラー: {state.error}</p>;
    default:
      // 状態を1つ増やして case を書き忘れると、ここでコンパイルエラーになる
      return assertNever(state);
  }
}`,

  hints: [
    {
      level: 1,
      text: "3つのフラグ（`isLoading` / `data` / `error`）ではなく、`status` という共通のキーを持つ3つのオブジェクト型を `|` でつなぎます。`data` は success のときだけ、`error` は error のときだけ持たせるのがポイントです。",
    },
    {
      level: 2,
      text: "`useState<AsyncState<User>>({ status: \"loading\" })` のように型引数を明示します。`switch (state.status)` で分岐すると、`case \"success\"` の中でだけ `state.data` にアクセスできます（それ以外の分岐で触ろうとすると型エラーになります）。",
    },
    {
      level: 3,
      text: "`default: return assertNever(state)` を必ず書きます。将来 `{ status: \"idle\" }` を追加したとき、case の書き忘れが `state` が never でなくなることでコンパイルエラーとして表面化します。これが #20 の網羅性チェックの実戦投入です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-33-1",
      description: "`AsyncState<T>` が `status` を判別子とする3状態のUnionになっているか？",
      verify: {
        kind: "type",
        assert: `
type _s1 = Expect<Equal<AsyncState<number>["status"], "loading" | "success" | "error">>;`,
      },
    },
    {
      id: "cp-33-2",
      description: "`data` は success のときだけ、`error` は error のときだけ持つ形になっているか？",
      verify: {
        kind: "type",
        assert: `
type _Succ = Extract<AsyncState<number>, { status: "success" }>;
type _Err = Extract<AsyncState<number>, { status: "error" }>;
type _s2a = Expect<Equal<_Succ["data"], number>>;
type _s2b = Expect<Equal<_Err["error"], string>>;`,
      },
    },
    {
      id: "cp-33-3",
      description: "loading 状態から `data` にアクセスしようとすると型エラーになるか？",
      verify: {
        kind: "expect-error",
        assert: `
const _loading: AsyncState<number> = { status: "loading" };
const _bad = _loading.data;`,
      },
    },
    {
      id: "cp-33-4",
      description: "`loading` 状態に `data` を混ぜた不正な値が型で弾かれるか？",
      verify: {
        kind: "expect-error",
        assert: `
const _illegal: AsyncState<number> = { status: "loading", data: 1 };`,
      },
    },
    {
      id: "cp-33-5",
      description: "`assertNever` が `never` を受け取る形で定義されているか？",
      verify: {
        kind: "type",
        assert: `
type _s5 = Expect<Equal<Parameters<typeof assertNever>[0], never>>;`,
      },
    },
  ],

  tags: [
    "判別可能Union",
    "非同期",
    "useState",
    "assertNever",
    "網羅性チェック",
    "React",
    "状態設計",
  ],
  relatedIds: [
    "ts-19-discriminated-union",
    "ts-20-exhaustive-check",
    "ts-27-usereducer",
    "ts-17-usestate",
    "ts-15-api-fetch",
  ],
};
