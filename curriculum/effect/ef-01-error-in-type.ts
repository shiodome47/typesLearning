import type { Lesson } from "../types";

export const efLesson01: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ef-01-error-in-type",
  order: 40,
  title: "① 失敗を型に出す — Promise が隠しているもの",
  category: "error-handling",
  difficulty: 3,

  goal: "処理が起こしうる失敗を戻り値の型に現し、呼ぶ側が対処を強制される形で書けるようになる",

  why: {
    problem:
      "`async function getUser(id: string): Promise<User>` という関数があります。\n" +
      "型を見て、あなたは何を知りましたか。\n\n" +
      "「`User` が返ってくる」。それだけです。\n\n" +
      "実際には、この関数は3通りに失敗します。ネットワークが落ちれば例外、" +
      "404 なら `throw new Error()`、返ってきた JSON の形が違えば実行時に壊れる。\n" +
      "**そのどれも型には書かれていません。**\n\n" +
      "だから呼ぶ側は `try/catch` を書かなくてもコンパイルが通ります。" +
      "書き忘れても誰も教えてくれません。書いたとしても `catch (e)` の `e` は `unknown` で、" +
      "**何が来るのかは結局わからない**。\n\n" +
      "この穴が効いてくるのは、AIが1日に数百行書くようになってからです。\n" +
      "生成されたコードに `try/catch` が無いとき、それが「失敗しないから不要」なのか" +
      "「書き忘れ」なのか、**型からは区別できません**。" +
      "人間が1行ずつ読んで判断するしかない。量が増えれば破綻します。",
    insight:
      "Effect の中心にあるのは、1つの型です。\n\n" +
      "```\n" +
      "Effect<成功する値, 起きうるエラー, 必要な依存>\n" +
      "```\n\n" +
      "`Promise<User>` が「`User` が返る」しか言わないのに対し、\n" +
      "`Effect<User, NetworkError | ParseError>` は\n" +
      "**「`User` が返る。ただし2通りに失敗する」**まで言います。\n\n" +
      "そして肝心なのはここです。" +
      "**失敗を処理しないまま実行しようとすると、コンパイルが通りません。**\n\n" +
      "握りつぶしが「うっかり」ではなく「型エラー」になる。" +
      "これが Effect を使う理由の中心で、他の機能は全部おまけだと思って構いません。\n\n" +
      "書き方は3つ覚えれば足ります。\n\n" +
      "**`Data.TaggedError`** — 失敗に名札を付けます。" +
      "`class NetworkError extends Data.TaggedError(\"NetworkError\")<{ status: number }> {}`\n" +
      "`_tag` が付くので、後で「この失敗だけ処理する」ができます。\n\n" +
      "**`Effect.tryPromise`** — Promise を包みます。" +
      "**`catch` を必ず書いてください。** ここで書いた型がそのままエラー型になります。\n\n" +
      "**`Effect.gen`** — `async/await` のように手続き的に書けます。" +
      "`await` の代わりに `yield*` を使うだけで、見た目はほとんど同じです。\n\n" +
      "この回では、まだ実行しません。" +
      "**「失敗が型に出ている関数」を組み立てるところまで**をやります。\n" +
      "そこさえできれば、あとは型が助けてくれます。",
  },
  explanation:
    "`Effect<A, E, R>` は「成功すると A が得られ、E で失敗しうり、R を必要とする処理」を表す型です。" +
    "この値は組み立てた時点では実行されず、設計図として扱われます。" +
    "`Effect.tryPromise({ try, catch })` は Promise を Effect に変換し、`catch` の戻り値がエラー型 E になります。" +
    "`catch` を省略した場合、エラー型は `UnknownException` になり「何が失敗しうるか」の情報が失われます。" +
    "`Data.TaggedError` で作ったエラーは `_tag` を持つため、後から種類ごとに処理を分けられます。" +
    "`Effect.gen` はジェネレータ構文で、`yield*` が `await` に相当します。" +
    "`yield*` した Effect のエラー型は自動的に合成され、全体の E に現れます。",

  starterCode: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

// 1. 失敗に名札を付けてください。
//    NetworkError は status: number を持ちます。
//    ParseError は追加の情報を持ちません。
//
//    class 名前 extends Data.TaggedError("名前")<{ ... }> {}


// 2. URL を叩いて JSON を返す処理を書いてください。
//    Effect.tryPromise を使い、catch で NetworkError を返します。
//    戻り値の型は Effect.Effect<unknown, NetworkError> です。
declare const httpGet: unknown;

// 3. unknown を User に変換する処理を書いてください。
//    ここでは中身の検証はせず、Effect.succeed で包むだけで構いません。
//    ただし戻り値の型には ParseError が出ている必要があります。
declare const parseUser: unknown;

// 4. 2つをつないでください。
//    Effect.gen の中で yield* を使います（await のようなものです）。
//    戻り値の型は Effect.Effect<User, NetworkError | ParseError> になります。
declare const getUser: unknown;
`,

  modelAnswer: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

// 失敗に名札を付ける。_tag が付くので、あとで種類ごとに処理を分けられる。
class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ParseError extends Data.TaggedError("ParseError")<{}> {}

// catch を書くと、そこで返した型がそのままエラー型になる。
// ここを省くと UnknownException になり、「何が失敗しうるか」が型から消える。
const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json()),
    catch: () => new NetworkError({ status: 500 }),
  });

// 戻り値の型に ParseError を書いておくと、
// 「この処理は失敗しうる」ことが呼ぶ側に伝わる。
const parseUser = (raw: unknown): Effect.Effect<User, ParseError> =>
  Effect.succeed(raw as User);

// gen の中では yield* が await にあたる。
// yield* した Effect のエラー型は自動で合成され、
// 戻り値の型に NetworkError | ParseError として現れる。
//
// この時点ではまだ何も実行されていない。組み立てただけ。
const getUser = (id: string): Effect.Effect<User, NetworkError | ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet(\`/api/users/\${id}\`);
    return yield* parseUser(raw);
  });
`,

  hints: [
    {
      level: 1,
      text: "書くのは4つです。エラークラス2つ、Effect を返す関数2つ、それをつなぐ関数1つ。`declare const ...` の行は消して、自分の定義に置き換えてください。",
    },
    {
      level: 2,
      text: "エラーは `class NetworkError extends Data.TaggedError(\"NetworkError\")<{ status: number }> {}` の形です。`Effect.tryPromise({ try: ..., catch: ... })` の `catch` で `new NetworkError({ status: 500 })` を返します。",
    },
    {
      level: 3,
      text: "`Effect.gen(function* () { const raw = yield* httpGet(...); return yield* parseUser(raw); })` と書きます。`yield*` が `await` にあたります。戻り値の型注釈に `NetworkError | ParseError` を書けば、型が合っているか機械が確かめてくれます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-01-1",
      description: "`httpGet` は失敗を型に出しているか（NetworkError）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof httpGet>, Effect.Effect<unknown, NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-01-2",
      description: "`parseUser` は失敗を型に出しているか（ParseError）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof parseUser>, Effect.Effect<User, ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-01-3",
      description:
        "`getUser` に2つの失敗が両方出ているか（合成されているか）？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof getUser>, Effect.Effect<User, NetworkError | ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-01-4",
      description: "エラーに `_tag` が付いているか（後で種類ごとに分けられるか）？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<InstanceType<typeof NetworkError>["_tag"], "NetworkError">>;`,
      },
    },
    {
      id: "cp-ef-01-5",
      description:
        "`Promise<User>` と `Effect<User, NetworkError | ParseError>` の違いを、呼ぶ側の立場で説明できるか？",
    },
  ],

  tags: ["Effect", "エラー処理", "型安全", "TaggedError", "Effect.gen"],
  relatedIds: ["ef-02-diagnose-swallowed-error", "ts-15-api-fetch"],
};
