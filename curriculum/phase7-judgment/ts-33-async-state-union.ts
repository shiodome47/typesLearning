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

  why: {
    problem:
      "サーバーからデータを取ってきて一覧を出す画面を作ります。" +
      "状態は3つ。読み込み中、成功、失敗。素直に書くとこうなります。\n\n" +
      "・`const [isLoading, setIsLoading] = useState(true)`\n" +
      "・`const [data, setData] = useState<User[] | null>(null)`\n" +
      "・`const [error, setError] = useState<string | null>(null)`\n\n" +
      "ここで数えてみてください。" +
      "`isLoading` が2通り、`data` が「ある/ない」で2通り、`error` も2通り。" +
      "組み合わせは8通りあります。意味があるのは3通りだけです。残りの5通りは「あってはいけない状態」ですが、" +
      "型の上ではどれも作れてしまいます。\n\n" +
      "そして実際に作ってしまいます。" +
      "「再読み込み」ボタンを付けたとき、`setIsLoading(true)` は書いたのに `setError(null)` を書き忘れる。" +
      "前回のエラーが残ったまま読み込みが始まります。" +
      "画面には「読み込み中...」と「エラー: 通信に失敗しました」が同時に表示されます。\n\n" +
      "描画側も苦しくなります。" +
      "`if (isLoading) return ...` `if (error) return ...` と並べて、最後に `<List items={data!} />`。" +
      "この `!` は「ここまで来たなら `data` は必ずある」という主張ですが、" +
      "その根拠は3つのフラグの組み合わせを頭の中で追った結果でしかありません。" +
      "誰かが `if` の順番を1つ入れ替えた瞬間に、根拠は消えて `!` だけが残ります。\n\n" +
      "この画面はアプリの中に何十個もあります。全部で同じことが起きます。",
    insight:
      "考え方を変えます。この3つは「独立した3つのスイッチ」ではありません。「3つのうちのどれか1つ」です。\n\n" +
      "そう思って型を書き直すと、こうなります。\n\n" +
      "`{ status: \"loading\" } | { status: \"success\"; data: T } | { status: \"error\"; error: string }`\n\n" +
      "`status` は、それぞれの状態に貼った名札です。そして重要なのは `data` の置き場所です。" +
      "`data` は success の中にしか書いてありません。つまり「読み込み中なのにデータがある」という値は、" +
      "書こうとしても型が受け付けません。ありえない5通りが、そもそも存在しなくなります。\n\n" +
      "状態は必ず丸ごと差し替えることになるので、書き忘れも起こりません。" +
      "`setState({ status: \"loading\" })` と書けば、前のエラーは一緒に消えます。" +
      "消し忘れようがない、というのが利点です。\n\n" +
      "描画側では `switch (state.status)` で分けます。" +
      "`case \"success\"` の中に入ると、TypeScript はそこが success の枝だと分かっているので `state.data` を読ませてくれます。" +
      "他の枝では `state.data` と書くと赤線が出ます。`!` はもう要りません。\n\n" +
      "この「あってはいけない状態を、そもそも作れなくする」考え方には名前が付いていて、" +
      "make illegal states unrepresentable と呼ばれます。" +
      "バグを見つけて直すのではなく、バグを書けないようにする、という発想です。",
  },
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
