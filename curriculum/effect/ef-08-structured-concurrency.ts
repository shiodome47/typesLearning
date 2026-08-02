import type { Lesson } from "../types";

export const efLesson08: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-08-structured-concurrency",
  order: 8,
  title: "⑧ 並行 — 同時に走らせ、要らなくなったら全部止める",
  category: "async",
  difficulty: 3,

  goal: "同時実行数を明示して並行処理を書き、競争させたときにエラー型がどう合流するかを型で確かめられるようになる",

  why: {
    problem:
      "1000人ぶんのユーザー情報をまとめて取ります。素直に書くとこうなります。\n\n" +
      "```ts\n" +
      "const users = await Promise.all(ids.map(fetchUser));\n" +
      "```\n\n" +
      "**これは1000本の同時リクエストです。**\n\n" +
      "自分のプロセスはファイルディスクリプタを使い切り、相手のサーバーは詰まり、" +
      "運が良ければ 429 が返り、運が悪ければ相手が落ちます。" +
      "④で「落ちかけている相手を叩きにいかない」と書きましたが、これはその最大の発生源です。\n" +
      "そして `Promise.all` に**同時本数を指定する引数はありません**。\n\n" +
      "2つ目の問題。**1つ失敗したときです。**\n\n" +
      "`Promise.all` は最初の失敗で reject します。速い。しかし——\n" +
      "**残りの999本は走り続けています。** 結果を受け取る人がいなくなっただけです。\n" +
      "その999本は課金され、レートリミットを消費し、書き込み系なら書き込みます。\n" +
      "⑥でやったとおり、`Promise` は止められないからです。\n\n" +
      "3つ目。**`Promise.race` の負けた方です。**\n\n" +
      "```ts\n" +
      "const user = await Promise.race([fromPrimary(id), fromMirror(id)]);\n" +
      "```\n\n" +
      "速い方を採る、よくある書き方です。" +
      "しかし**負けた方は最後まで走ります**。2倍の負荷をかけ続け、" +
      "遅れて返ってきたエラーは誰にも捕まえられず `unhandledRejection` になります。\n\n" +
      "共通しているのは1つです。\n" +
      "**要らなくなった処理を止める手段が無い。**",
    insight:
      "Effect の並行は、この3つに全部答えます。\n\n" +
      "**1. 同時本数を書く。**\n\n" +
      "```\n" +
      "Effect.all(ids.map(fetchUser), { concurrency: 5 })\n" +
      "Effect<User, NetworkError>[]  →  Effect<User[], NetworkError>\n" +
      "```\n\n" +
      "`concurrency` は省略できます。**省略すると1本ずつ（直列）です。**\n" +
      "「うっかり1000本」にはなりません。速くしたいなら自分で数を書く、という設計です。\n\n" +
      "**2. 1つ失敗したら、残りは中断される。**\n\n" +
      "結果を捨てるのではなく、⑥の中断が伝わって**本当に止まります**。\n" +
      "⑦の `Scope` を持っていれば、止まる前に閉じます。\n\n" +
      "**3. 競争に負けた方も、中断される。**\n\n" +
      "```\n" +
      "Effect.race(fromPrimary(id), fromMirror(id))\n" +
      "Effect<User, NetworkError> と Effect<User, SlowError>\n" +
      "  →  Effect<User, NetworkError | SlowError>\n" +
      "```\n\n" +
      "エラー型が**和になる**ことにも注目してください。" +
      "どちらの失敗もありうるので、両方が型に出ます。片方だけ処理して済ませることはできません。\n\n" +
      "この「親が終われば子も必ず終わる」性質を**構造化並行性**と呼びます。\n" +
      "関数から抜けたらローカル変数が消えるのと同じことを、走っている処理に対してやる、ということです。\n\n" +
      "```\n" +
      "Promise:  親が終わっても子は走り続ける（誰も見ていない処理が残る）\n" +
      "Effect :  親が終われば子も終わる（残らない）\n" +
      "```\n\n" +
      "**`Promise.allSettled` は答えになりません。**\n" +
      "全部待つので失敗しても止まりませんが、それは「止めない」を選んだだけで、" +
      "同時本数の問題も、要らなくなった処理を止める問題も、何も解決していません。",
  },
  explanation:
    "`Effect.all(effects, options)` は複数の Effect をまとめて実行し、結果を配列で返します。" +
    "`concurrency` を省略した場合は順に1つずつ実行され、数値を指定するとその本数までを同時に実行します。" +
    "いずれかが失敗した場合、残りは中断されます。`Promise.all` は最初の失敗で reject しますが、" +
    "残りの Promise はそのまま実行され続けるため、この点で挙動が異なります。" +
    "`Effect.race(a, b)` は先に完了した方の結果を採用し、もう一方を中断します。" +
    "成功型とエラー型はいずれも両者の和になるため、どちらの失敗も呼び出し側で扱う必要があります。" +
    "親の処理が終わるときに子の処理も必ず終了するこの性質を構造化並行性と呼び、" +
    "参照されていない処理が背後で実行され続ける状態を防ぎます。",

  starterCode: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class MirrorError extends Data.TaggedError("MirrorError")<{}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/users/\${id}\`).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 予備のサーバー。遅いが落ちにくい。
declare const fetchUserFromMirror: (
  id: string
) => Effect.Effect<User, MirrorError>;

// 1. まとめて取ってください。ただし同時に走らせる本数を 5 に決めます。
//    Effect.all(配列, { concurrency: 5 }) の形です。
//
//    concurrency を省略すると直列（1本ずつ）になります。
//    「うっかり1000本」にならない側が既定になっている、ということです。
declare const fetchAll: unknown;

// 2. 名前だけの配列にしてください。
//    Effect.map(1で作ったもの, (users) => ...) の形です。
declare const allNames: unknown;

// 3. 本番と予備を競争させ、速い方を採ってください。
//    Effect.race(a, b) の形です。負けた方は中断されます。
//
//    エラー型に注目してください。どちらの失敗もありうるので、和になります。
declare const fastest: unknown;
`,

  modelAnswer: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class MirrorError extends Data.TaggedError("MirrorError")<{}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/users/\${id}\`).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 予備のサーバー。遅いが落ちにくい。
declare const fetchUserFromMirror: (
  id: string
) => Effect.Effect<User, MirrorError>;

// 同時本数を自分で決める。
// 1つ失敗したら残りは中断されるので、要らない処理が背後に残らない。
const fetchAll = (
  ids: readonly string[]
): Effect.Effect<User[], NetworkError> =>
  Effect.all(
    ids.map((id) => fetchUser(id)),
    { concurrency: 5 }
  );

// 取れたあとの加工。ここは並行の話ではないので map で足りる。
const allNames = (
  ids: readonly string[]
): Effect.Effect<string[], NetworkError> =>
  Effect.map(fetchAll(ids), (users) => users.map((user) => user.name));

// 競争させる。負けた方は中断される（走り続けない）。
// エラー型は両方の和になる。どちらの失敗も起こりうるから。
const fastest = (
  id: string
): Effect.Effect<User, NetworkError | MirrorError> =>
  Effect.race(fetchUser(id), fetchUserFromMirror(id));

export { fetchAll, allNames, fastest };
`,

  hints: [
    {
      level: 1,
      text: "`Effect.all` に渡すのは Effect の配列です。`ids.map((id) => fetchUser(id))` で作れます。第2引数の `{ concurrency: 5 }` を忘れると直列実行になります（間違いではありませんが、この回では明示してください）。",
    },
    {
      level: 2,
      text: "`fetchAll` の戻り値は `Effect.Effect<User[], NetworkError>` です。配列の Effect が、Effect の配列に変わっていることを確かめてください。`allNames` は `Effect.map(fetchAll(ids), (users) => users.map((user) => user.name))` です。",
    },
    {
      level: 3,
      text: "`fastest` は `Effect.race(fetchUser(id), fetchUserFromMirror(id))` で、戻り値の型は `Effect.Effect<User, NetworkError | MirrorError>` です。`NetworkError` だけにすると型が合いません。どちらの失敗も起こりうるからです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-08-1",
      description: "まとめて取る形になっているか（Effect の配列が配列の Effect になったか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof fetchAll>, Effect.Effect<User[], NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-08-2",
      description: "取れた結果を加工できているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof allNames>, Effect.Effect<string[], NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-08-3",
      description: "競争させた側のエラー型が両方の和になっているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof fastest>, Effect.Effect<User, NetworkError | MirrorError>>>;`,
      },
    },
    {
      id: "cp-ef-08-4",
      description: "片方の失敗だけを見て済ませられないか（型で止まるか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad: Effect.Effect<User, NetworkError> = fastest("1");`,
      },
    },
    {
      id: "cp-ef-08-5",
      description:
        "`Promise.all` で1件失敗したとき、残りのリクエストはどうなるか答えられるか？",
    },
  ],

  tags: ["Effect", "並行処理", "構造化並行性", "race", "中断"],
  relatedIds: [
    "ef-06-interruption",
    "ef-04-retry-timeout",
    "ef-07-acquire-release",
  ],
};
