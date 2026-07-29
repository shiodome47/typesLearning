import type { Lesson } from "../types";

export const efLesson04: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-04-retry-timeout",
  order: 4,
  title: "④ リトライとタイムアウト — 直る失敗と、増える失敗",
  category: "error-handling",
  difficulty: 3,

  goal: "リトライで失敗が消えないこと、タイムアウトでは失敗が増えることを型で確かめられるようになる",

  why: {
    problem:
      "外部APIが時々 500 を返します。もう一度叩けば成功することがほとんどです。\n\n" +
      "そこでリトライを入れます。\n\n" +
      "```ts\n" +
      "for (let i = 0; i < 3; i++) {\n" +
      "  try { return await fetchUser(id); } catch { /* もう一回 */ }\n" +
      "}\n" +
      "throw new Error(\"failed\");\n" +
      "```\n\n" +
      "動きます。エラー率も下がります。そして**2つの問題が同時に入り込みます**。\n\n" +
      "1つ目。この `for` ループは**待ちません**。3回を一瞬で叩きます。" +
      "相手が落ちかけているときに、こちらが最も激しく叩くことになる。" +
      "障害を長引かせているのは、たいていこの種のリトライです。\n\n" +
      "2つ目。相手が**応答を返さない**とき、`await` は永遠に待ちます。" +
      "リトライは1回目から先に進みません。" +
      "こちらのスレッドは埋まり、やがて全体が止まります。\n\n" +
      "そしてタイムアウトを足すと、今度は**新しい失敗**が生まれます。" +
      "「時間切れ」という、それまで無かった失敗です。" +
      "しかし `Promise` の型は変わらないので、**誰もそれに気づきません**。",
    insight:
      "この回で見てほしいのは、2つの操作で**型の変わり方が違う**ことです。\n\n" +
      "**リトライ — 型は変わりません。**\n\n" +
      "```\n" +
      "Effect.retry(self, Schedule.recurs(3))\n" +
      "Effect<User, NetworkError>  →  Effect<User, NetworkError>\n" +
      "```\n\n" +
      "これは正しい設計です。**3回やっても失敗するときは失敗する**からです。\n" +
      "リトライは成功率を上げますが、失敗を消しません。" +
      "型が変わらないことが、そのまま「リトライしたから安全、ではない」と言っています。\n\n" +
      "**タイムアウト — 型が増えます。**\n\n" +
      "```\n" +
      "Effect.timeout(self, \"3 seconds\")\n" +
      "Effect<User, NetworkError>  →  Effect<User, NetworkError | Cause.TimeoutException>\n" +
      "```\n\n" +
      "制限時間を付けた瞬間、**「時間切れ」という失敗が新しく生まれます**。\n" +
      "だからエラー型に足される。そして呼ぶ側は、それを処理するまでコンパイルが通りません。\n\n" +
      "**`try/catch` では、この差が一切見えません。**\n" +
      "リトライを足してもタイムアウトを足しても `Promise<User>` のままです。\n" +
      "時間切れの扱いを書き忘れても、誰も教えてくれない。\n\n" +
      "順番も型が教えてくれます。\n\n" +
      "```\n" +
      "Effect.retry(Effect.timeout(self, \"3 seconds\"), Schedule.recurs(3))\n" +
      "```\n\n" +
      "**内側にタイムアウト、外側にリトライ**。こうすると「3秒待って諦め、それを3回」になります。\n" +
      "逆にすると「全体で3秒」になり、リトライする暇がありません。\n\n" +
      "そして待ち方です。`Schedule.recurs(3)` は即座に3回ですが、" +
      "`Schedule.exponential(\"100 millis\")` なら待ち時間を伸ばしながら再試行します。\n" +
      "**落ちかけている相手を、こちらが止めにいかないために**必要な配慮です。",
  },
  explanation:
    "`Effect.retry(self, policy)` は失敗したときに再実行しますが、成功型もエラー型も変えません。" +
    "何回試しても最終的に失敗する可能性は残るため、型の上でも失敗は消えません。" +
    "一方 `Effect.timeout(self, duration)` は制限時間を超えたときの失敗を新たに導入するため、" +
    "エラー型に `Cause.TimeoutException` が加わります。" +
    "この差は `Promise` では表現できず、リトライやタイムアウトを足しても型は `Promise<A>` のままです。" +
    "`Schedule.recurs(n)` は n 回の再試行、`Schedule.exponential(base)` は待ち時間を指数的に伸ばす再試行を表し、" +
    "後者は相手に負荷をかけ続けないために使います。" +
    "タイムアウトを内側、リトライを外側に置くと「1回あたりの制限時間 × 回数」という意味になります。",

  starterCode: `import { Effect, Data, Schedule, Cause } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/users/\${id}\`).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 1. リトライを足してください。
//    Effect.retry と Schedule.exponential("100 millis") を使います。
//    （即座に3回ではなく、待ち時間を伸ばしながら再試行します）
//
//    型に注目してください。エラー型は変わりません。
//    3回やっても失敗するときは失敗するからです。
declare const withRetry: unknown;

// 2. タイムアウトを足してください。
//    Effect.timeout(fetchUser(id), "3 seconds") の形です。
//
//    今度はエラー型が増えます。
//    「時間切れ」という失敗が新しく生まれるためです。
declare const withTimeout: unknown;

// 3. 2つを組み合わせてください。
//    内側にタイムアウト、外側にリトライです。
//    こうすると「3秒待って諦める」を繰り返します。
//    逆にすると全体で3秒になり、再試行する時間が残りません。
declare const robust: unknown;
`,

  modelAnswer: `import { Effect, Data, Schedule, Cause } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/users/\${id}\`).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

// リトライしても型は変わらない。
// 何回試しても失敗するときは失敗するので、これが正しい。
// 「リトライを入れたから安全」ではない、と型が言っている。
//
// exponential を使うのは、落ちかけている相手を
// こちらが叩き続けて止めにいかないため。
const withRetry = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.retry(fetchUser(id), Schedule.exponential("100 millis"));

// タイムアウトを付けると型が増える。
// 「時間切れ」という失敗が新しく生まれたので、
// 呼ぶ側はそれを処理するまでコンパイルが通らない。
const withTimeout = (
  id: string
): Effect.Effect<User, NetworkError | Cause.TimeoutException> =>
  Effect.timeout(fetchUser(id), "3 seconds");

// 内側にタイムアウト、外側にリトライ。
// 「3秒待って諦める」を繰り返す形になる。
// 逆にすると全体で3秒になり、再試行する時間が残らない。
const robust = (
  id: string
): Effect.Effect<User, NetworkError | Cause.TimeoutException> =>
  Effect.retry(
    Effect.timeout(fetchUser(id), "3 seconds"),
    Schedule.exponential("100 millis")
  );

export { withRetry, withTimeout, robust };
`,

  hints: [
    {
      level: 1,
      text: "3つとも1行です。`Effect.retry(...)` / `Effect.timeout(...)` / その組み合わせ。`declare const ...` は自分の定義に置き換えてください。戻り値の型を自分で書いてみると、型の変化が確かめられます。",
    },
    {
      level: 2,
      text: "リトライは `Effect.retry(fetchUser(id), Schedule.exponential(\"100 millis\"))` です。エラー型は `NetworkError` のまま変わりません。タイムアウトは `Effect.timeout(fetchUser(id), \"3 seconds\")` で、型が `NetworkError | Cause.TimeoutException` になります。",
    },
    {
      level: 3,
      text: "組み合わせは `Effect.retry(Effect.timeout(fetchUser(id), \"3 seconds\"), Schedule.exponential(\"100 millis\"))` です。timeout が内側にあることを確かめてください。時間切れの型は `Cause.TimeoutException` で、先頭の import に `Cause` が入っています。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-04-1",
      description: "リトライしてもエラー型は変わっていないか（失敗は消えない）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof withRetry>, Effect.Effect<User, NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-04-2",
      description:
        "タイムアウトでエラー型が増えているか（時間切れという失敗が生まれる）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof withTimeout>, Effect.Effect<User, NetworkError | Cause.TimeoutException>>>;`,
      },
    },
    {
      id: "cp-ef-04-3",
      description: "組み合わせた側も両方の失敗を型に持っているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof robust>, Effect.Effect<User, NetworkError | Cause.TimeoutException>>>;`,
      },
    },
    {
      id: "cp-ef-04-4",
      description:
        "時間切れを処理しないまま「NetworkError だけ」として扱えないか（型で止まるか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad: Effect.Effect<User, NetworkError> = robust("1");`,
      },
    },
    {
      id: "cp-ef-04-5",
      description:
        "タイムアウトを外側に書くと意味がどう変わるか、説明できるか？",
    },
  ],

  tags: ["Effect", "リトライ", "タイムアウト", "Schedule", "障害対応"],
  relatedIds: ["ef-01-error-in-type", "ef-03-dependency-in-type"],
};
