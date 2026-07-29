import type { Lesson } from "../types";

export const efLesson03: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-03-dependency-in-type",
  order: 3,
  title: "③ 依存を型に出す — テストのために本番のコードを曲げない",
  category: "error-handling",
  difficulty: 4,

  goal: "処理が必要とする外部依存を型の3番目に現し、実行前に解決を強制される形で書けるようになる",

  why: {
    problem:
      "`getUser` の中で `fetch` を直接呼んでいます。動きます。\n\n" +
      "そしてテストを書こうとした瞬間、詰まります。\n" +
      "`fetch` を差し替える方法が無いからです。\n\n" +
      "ここから、見覚えのある回り道が始まります。\n" +
      "`jest.mock(\"node-fetch\")` でモジュールごと乗っ取る。" +
      "あるいは `globalThis.fetch` を書き換える。" +
      "あるいは引数に `fetchFn = fetch` というデフォルト引数を足して、テストのときだけ渡す。\n\n" +
      "どれも動きます。そして**どれも本番のコードをテストのために曲げています**。\n\n" +
      "さらに悪いのは、こうして注入した依存が**型に出ない**ことです。\n" +
      "`getUser(id)` という呼び出しを見ても、これが何を必要とするのか分かりません。" +
      "DB に触るのか、外部APIを叩くのか、時計を読むのか、乱数を使うのか。\n\n" +
      "分からないので、**テスト環境で本番のAPIを叩いてしまう**という事故が起きます。" +
      "しかもそれは、叩いた後で初めて分かります。",
    insight:
      "`Effect<A, E, R>` の**3番目**が、ここで効いてきます。\n\n" +
      "```\n" +
      "Effect<User, NetworkError, HttpClient>\n" +
      "         ↑     ↑            ↑\n" +
      "       成功   失敗      必要なもの\n" +
      "```\n\n" +
      "`R` に `HttpClient` と書いてあれば、この処理が何を必要とするかが**呼ぶ前に分かります**。\n\n" +
      "そして肝心なのはここです。\n" +
      "**`R` が空（`never`）でないと実行できません。**\n" +
      "`Effect.runPromise` は `Effect<A, E, never>` しか受け取らないので、" +
      "依存を渡し忘れたコードは**コンパイルが通りません**。\n\n" +
      "使うのは2つだけです。\n\n" +
      "**`Context.GenericTag`** — 依存に名札を付けます。\n" +
      "`const HttpClient = Context.GenericTag<HttpClient, { get: ... }>(\"HttpClient\")`\n\n" +
      "**`Effect.service(タグ)`** — 依存を取り出します。" +
      "これを `yield*` した瞬間、その依存が `R` に現れます。**自分で書く必要はありません。**\n\n" +
      "解決するときは `Effect.provideService(処理, タグ, 実物)` を呼びます。" +
      "渡した分だけ `R` から消え、全部消えたら実行できるようになります。\n\n" +
      "この形にすると、テストで嬉しいことが起きます。\n\n" +
      "```\n" +
      "Effect.provideService(getUser(\"1\"), HttpClient, 本物)   // 本番\n" +
      "Effect.provideService(getUser(\"1\"), HttpClient, 偽物)   // テスト\n" +
      "```\n\n" +
      "**`getUser` は1文字も変わりません。** モジュールを乗っ取る必要も、" +
      "テスト用のデフォルト引数を足す必要もありません。\n\n" +
      "覚え方はこうです。\n" +
      "**`R` は「まだ埋まっていない穴」の一覧。埋まるまで実行させてもらえない。**",
  },
  explanation:
    "`Effect<A, E, R>` の 3 番目の型引数 R は、その処理を実行するために必要な依存を表します。" +
    "`Context.GenericTag<Id, Service>(key)` で依存に識別子を与え、`Effect.service(tag)` で取り出します。" +
    "取り出した時点で R にその依存が現れ、以降 R は自動的に合成されていきます。" +
    "`Effect.provideService(self, tag, impl)` は依存を 1 つ解決し、R からその型を取り除きます。" +
    "`Effect.runPromise` は R が never の Effect しか受け取らないため、" +
    "依存を解決し忘れたまま実行しようとするとコンパイルエラーになります。" +
    "実装の差し替えは provideService に渡す値を変えるだけで済み、対象のコードは変更しません。",

  starterCode: `import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

// 1. 依存の形を決めてください。
//    HttpClient は get(url: string) を持ち、
//    Effect.Effect<unknown, NetworkError> を返します。
interface HttpClient {
}

// 2. 依存に名札を付けてください。
//    Context.GenericTag<HttpClient, HttpClient>("HttpClient") を使います。
declare const HttpClient: unknown;

// 3. 依存を使って User を取ってくる処理を書いてください。
//    Effect.gen の中で Effect.service(HttpClient) を yield* します。
//    戻り値の型は Effect.Effect<User, NetworkError, HttpClient> になります。
//    （3番目に依存が出ることが、この回の要点です）
declare const getUser: unknown;

// 4. テスト用の偽物を渡して、依存を解決してください。
//    Effect.provideService(getUser("1"), HttpClient, 偽物) の形です。
//    偽物の get は Effect.succeed({ id: "1", name: "テスト" }) を返せば十分です。
//    戻り値の型は Effect.Effect<User, NetworkError, never> になり、
//    3番目が never になったので実行できるようになります。
declare const testable: unknown;
`,

  modelAnswer: `import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

// 依存の形。実装ではなく「何ができるか」だけを決める。
interface HttpClient {
  readonly get: (url: string) => Effect.Effect<unknown, NetworkError>;
}

// 依存に名札を付ける。型と値の両方の役割を持つ。
const HttpClient = Context.GenericTag<HttpClient, HttpClient>("HttpClient");

// Effect.service で取り出すと、その依存が R に現れる。
// 戻り値の型に HttpClient と書いてあるので、
// 呼ぶ側は「これは HTTP を必要とする」と実行前に知れる。
const getUser = (
  id: string
): Effect.Effect<User, NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* Effect.service(HttpClient);
    const raw = yield* http.get(\`/api/users/\${id}\`);
    return raw as User;
  });

// 依存を渡すと R から消える。
// getUser 自体は1文字も変えていない。
// 本番なら本物の HttpClient を、テストなら偽物を渡すだけ。
const testable: Effect.Effect<User, NetworkError, never> =
  Effect.provideService(getUser("1"), HttpClient, {
    get: () => Effect.succeed({ id: "1", name: "テスト" }),
  });

// R が never になったので実行できる。
// 解決し忘れていたら、この行がコンパイルエラーになる。
export const run = () => Effect.runPromise(testable);
`,

  hints: [
    {
      level: 1,
      text: "書くのは4つです。依存の形（interface）、名札（Context.GenericTag）、依存を使う処理、依存を解決した値。`declare const ...` は自分の定義に置き換えてください。",
    },
    {
      level: 2,
      text: "名札は `const HttpClient = Context.GenericTag<HttpClient, HttpClient>(\"HttpClient\");` です。interface と同じ名前にできます（型と値で名前空間が別なので衝突しません）。",
    },
    {
      level: 3,
      text: "`Effect.gen` の中で `const http = yield* Effect.service(HttpClient);` と書けば、戻り値の型の3番目に `HttpClient` が自動で現れます。解決は `Effect.provideService(getUser(\"1\"), HttpClient, { get: () => Effect.succeed({ id: \"1\", name: \"テスト\" }) })` です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-03-1",
      description: "`getUser` の型の3番目に依存が出ているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof getUser>, Effect.Effect<User, NetworkError, HttpClient>>>;`,
      },
    },
    {
      id: "cp-ef-03-2",
      description: "依存を解決したら型から消えているか（3番目が never）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<typeof testable, Effect.Effect<User, NetworkError, never>>>;`,
      },
    },
    {
      id: "cp-ef-03-3",
      description: "失敗の型は保たれているか（依存の話でエラーを消していないか）？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<Awaited<ReturnType<typeof run>>, User>>;`,
      },
    },
    {
      id: "cp-ef-03-4",
      description:
        "依存を解決していない Effect は実行できないか（型で止まるか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad = Effect.runPromise(getUser("1"));`,
      },
    },
    {
      id: "cp-ef-03-5",
      description:
        "「テストのために本番のコードを変えなくてよい」のはなぜか、説明できるか？",
    },
  ],

  tags: ["Effect", "依存注入", "テスト", "Context", "型安全"],
  relatedIds: ["ef-01-error-in-type", "ef-04-retry-timeout"],
};
