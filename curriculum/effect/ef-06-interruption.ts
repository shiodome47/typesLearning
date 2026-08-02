import type { Lesson } from "../types";

export const efLesson06: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-06-interruption",
  order: 6,
  title: "⑥ 中断 — Promise は止められない",
  category: "async",
  difficulty: 3,

  goal: "走っている処理を後から止められること、そして「止められるかどうか」が型に出ることを確かめられるようになる",

  why: {
    problem:
      "画面を開くと価格の取得が始まります。ユーザーはすぐに別の画面へ移りました。\n\n" +
      "**その取得は、まだ走っています。**\n\n" +
      "```ts\n" +
      "const p = fetchPrice(\"BTC\");   // Promise<Price>\n" +
      "// 画面が閉じた。止めたい。\n" +
      "// …止める方法が無い。\n" +
      "```\n\n" +
      "`Promise` にキャンセルはありません。`p.cancel()` は存在しないし、" +
      "`p` を捨てても処理は走り続けます。**受け取った側にできることは、待つか、無視するかの2つだけ**です。\n\n" +
      "無視しても消えません。レスポンスは返ってきて、`then` の中身は実行され、" +
      "もう存在しない画面の状態を書き換えようとします。" +
      "React で見る `Can't perform a React state update on an unmounted component` は、これです。\n\n" +
      "`AbortController` はあります。しかしあれは `fetch` にだけ効く**別建ての仕組み**で、" +
      "`Promise<Price>` という型には何も現れません。" +
      "**この Promise が止められるのかどうかは、型を見ても分からない。**\n\n" +
      "そして `Promise.race` でタイムアウトを付けたときも同じです。" +
      "3秒で諦めた「つもり」になりますが、**負けた方の処理は最後まで走ります**。" +
      "課金も、書き込みも、そのまま続きます。",
    insight:
      "Effect では、走らせると `Fiber`（ファイバー）が返ります。\n\n" +
      "```\n" +
      "Effect.fork(fetchPrice(\"BTC\"))\n" +
      "Effect<Price, NetworkError>  →  Effect<Fiber<Price, NetworkError>>\n" +
      "```\n\n" +
      "`Fiber` は**走っている処理そのもの**です。持っていれば止められます。\n\n" +
      "```\n" +
      "Fiber.interrupt(fiber)   // 止める\n" +
      "Fiber.join(fiber)        // 終わるまで待って結果を受け取る\n" +
      "```\n\n" +
      "ここが `Promise` との決定的な差です。\n" +
      "**`Promise` を受け取った人には、止める権利がありません。**\n" +
      "**`Fiber` を受け取った人には、あります。**\n" +
      "そしてどちらを受け取ったかは、型を見れば分かります。\n\n" +
      "**中断は途中で止まるだけではありません。**\n" +
      "Effect の中断は処理の内側まで伝わります。`Effect.sleep(\"10 seconds\")` の途中でも、" +
      "3つ目の API を叩いている最中でも、そこで止まります。" +
      "そして⑦でやるように、**開いたものは閉じられてから止まります**。\n\n" +
      "④の `Effect.timeout` が「本当に止める」と言えるのはこの仕組みがあるからです。\n" +
      "`Promise.race` のタイムアウトは待つのをやめるだけですが、`Effect.timeout` は**中断します**。\n\n" +
      "**もう1つ、驚くところ。**\n\n" +
      "Effect は「時間」も差し替えられる部品として持っています（`TestClock`）。\n" +
      "テストのときだけ仮想の時計に差し替えると、`Effect.sleep(\"1 hour\")` を含む処理でも、" +
      "時計を1時間ぶん**進めるだけ**でテストが終わります。実時間は1ミリ秒も待ちません。\n" +
      "「1時間後にリトライする」処理を、1時間待たずにテストできる。\n" +
      "これは③の依存注入がそのまま効いている話です。**時刻すら依存として扱える**、ということ。",
  },
  explanation:
    "`Promise` は生成された時点で実行が始まり、外部から停止する手段を持ちません。" +
    "`AbortController` は `fetch` など対応した API に対してのみ働き、`Promise<T>` の型には現れないため、" +
    "その Promise が中断可能かどうかを型から判断することはできません。" +
    "Effect では `Effect.fork(self)` が `Fiber` を返し、`Fiber.interrupt(fiber)` で中断、" +
    "`Fiber.join(fiber)` で完了を待って結果を受け取ります。" +
    "`Fiber.join` の戻り値には元の Effect のエラー型がそのまま現れるため、失敗の扱いを省略できません。" +
    "中断は処理の内部まで伝播し、待機中や別の処理の実行中であってもその時点で停止します。" +
    "`Effect.timeout` が実際に処理を停止できるのはこの中断機構の上に作られているためで、" +
    "`Promise.race` によるタイムアウトが待機をやめるだけであるのとは意味が異なります。",

  starterCode: `import { Effect, Data, Fiber } from "effect";

type Price = { symbol: string; value: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchPrice = (symbol: string): Effect.Effect<Price, NetworkError> =>
  Effect.tryPromise({
    try: () =>
      fetch(\`/api/prices/\${symbol}\`).then((r) => r.json() as Promise<Price>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 1. バックグラウンドで走らせて、止める手段を受け取ってください。
//    Effect.fork(fetchPrice(symbol)) の形です。
//
//    戻り値の型に注目してください。
//    Fiber が返るということが、そのまま「止められる」という意味になります。
declare const start: unknown;

// 2. 止めてください。
//    Fiber.interrupt(fiber) の形です。
declare const stop: unknown;

// 3. 終わるまで待って、結果を受け取ってください。
//    Fiber.join(fiber) の形です。
//
//    ここでエラー型が戻ってきます。
//    走らせた時点では失敗は起きていないので、待った人が受け取ります。
declare const wait: unknown;
`,

  modelAnswer: `import { Effect, Data, Fiber } from "effect";

type Price = { symbol: string; value: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchPrice = (symbol: string): Effect.Effect<Price, NetworkError> =>
  Effect.tryPromise({
    try: () =>
      fetch(\`/api/prices/\${symbol}\`).then((r) => r.json() as Promise<Price>),
    catch: () => new NetworkError({ status: 500 }),
  });

// fork すると Fiber が返る。
// Promise を受け取っても止める手段は無いが、Fiber なら止められる。
// 「中断できるかどうか」が型に出ている、ということ。
const start = (
  symbol: string
): Effect.Effect<Fiber.Fiber<Price, NetworkError>> =>
  Effect.fork(fetchPrice(symbol));

// 止める。走っている処理そのものを持っているので止められる。
const stop = (fiber: Fiber.Fiber<Price, NetworkError>): Effect.Effect<void> =>
  Fiber.interrupt(fiber);

// 待つ。失敗はここで受け取る。
// fork した時点ではまだ失敗していないので、エラー型は join 側に出る。
const wait = (
  fiber: Fiber.Fiber<Price, NetworkError>
): Effect.Effect<Price, NetworkError> => Fiber.join(fiber);

export { start, stop, wait };
`,

  hints: [
    {
      level: 1,
      text: "3つとも1行です。`Effect.fork(...)` / `Fiber.interrupt(...)` / `Fiber.join(...)`。`declare const ...` は自分の定義に置き換えてください。戻り値の型を自分で書いてみると、どこでエラー型が現れるかが見えます。",
    },
    {
      level: 2,
      text: "`start` は文字列を受け取り `Effect.Effect<Fiber.Fiber<Price, NetworkError>>` を返します。`stop` と `wait` は `Fiber.Fiber<Price, NetworkError>` を受け取ります。型を書くときの `Fiber` は `import { Fiber } from \"effect\"` から来ています。",
    },
    {
      level: 3,
      text: "`const start = (symbol: string): Effect.Effect<Fiber.Fiber<Price, NetworkError>> => Effect.fork(fetchPrice(symbol));` です。`stop` の戻りは `Effect.Effect<void>`、`wait` の戻りは `Effect.Effect<Price, NetworkError>` になります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-06-1",
      description: "走らせた結果として Fiber を受け取っているか（止める手段があるか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof start>, Effect.Effect<Fiber.Fiber<Price, NetworkError>>>>;`,
      },
    },
    {
      id: "cp-ef-06-2",
      description: "中断できるか（Fiber を渡して止められるか）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof stop>, Effect.Effect<void>>>;`,
      },
    },
    {
      id: "cp-ef-06-3",
      description: "待った側にエラー型が戻ってきているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof wait>, Effect.Effect<Price, NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-06-4",
      description: "結果を待つ側が失敗を無かったことにできないか（型で止まるか）？",
      verify: {
        kind: "expect-error",
        assert: `declare const _f: Fiber.Fiber<Price, NetworkError>;\nconst _bad: Effect.Effect<Price, never> = wait(_f);`,
      },
    },
    {
      id: "cp-ef-06-5",
      description:
        "`Promise<Price>` を受け取ったとき、それを止める方法はあるか。無いと即答できるか？",
    },
  ],

  tags: ["Effect", "中断", "Fiber", "キャンセル", "非同期"],
  relatedIds: ["ef-04-retry-timeout", "ef-07-acquire-release", "ts-25-useeffect-cleanup"],
};
