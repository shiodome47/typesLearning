import type { Lesson } from "../types";

export const efLesson09: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-09-schema-boundary",
  order: 9,
  title: "⑨ 境界 — as をやめる。形を値として書く",
  category: "runtime-safety",
  difficulty: 3,

  goal: "外から来た値を検証してから取り込み、検証の失敗をエラー型に出せるようになる",

  why: {
    problem:
      "API から来た JSON を受け取ります。ほぼ全員が、一度はこう書きます。\n\n" +
      "```ts\n" +
      "const user = (await res.json()) as User;\n" +
      "```\n\n" +
      "**`as` は実行時に何もしません。**\n" +
      "コンパイル後に消えます。`as User` が言っているのは「そう思うことにする」だけです。\n\n" +
      "実際に来たのが `{ \"id\": 1, \"nam\": \"太郎\" }` でも、通ります。\n" +
      "`user.name` は `undefined` になり、型は `string` と言い続けます。\n" +
      "そして壊れるのは**ここではありません**。この値を受け取った3画面先で、\n" +
      "`user.name.trim()` が `Cannot read properties of undefined` を出します。\n\n" +
      "**原因の場所と、症状の場所が離れる。** これが `as` の本当の害です。\n\n" +
      "そして `JSON.parse` はさらに悪い。返り値が `any` なので、**`as` すら要りません**。\n\n" +
      "```ts\n" +
      "const user: User = JSON.parse(text);   // 何も検査していない。エラーも出ない\n" +
      "```\n\n" +
      "型を一通り学んだあとに残る、いちばん大きな穴がここです。\n" +
      "**プログラムの内側は型で守られているのに、外から入ってくる場所だけ素通しになっている。**\n\n" +
      "手で書くこともできます。\n\n" +
      "```ts\n" +
      "if (typeof v === \"object\" && v !== null && \"id\" in v && typeof v.id === \"string\" && ...)\n" +
      "```\n\n" +
      "書けますが、`User` を1つ直すたびに、この検査も直さなければなりません。" +
      "**直し忘れても何も起きません。**（そして必ず忘れます）",
    insight:
      "`Schema` は、形を**値として**書きます。\n\n" +
      "```ts\n" +
      "const UserSchema = Schema.Struct({\n" +
      "  id: Schema.String,\n" +
      "  name: Schema.String,\n" +
      "  age: Schema.Number,\n" +
      "});\n" +
      "```\n\n" +
      "見た目は型定義ですが、これは**実行時に存在する値**です。ここが要点です。\n\n" +
      "TypeScript の型はコンパイルすると消えるので、実行時に「この形か？」と尋ねることができません。" +
      "だから外から来た値を検査できない。**`as` しか残らなかったのは、そのせいです。**\n" +
      "形を値として持てば、実行時に尋ねられます。\n\n" +
      "そして1つの定義から両方が出ます。\n\n" +
      "```\n" +
      "UserSchema  ──→  型   Schema.Schema.Type<typeof UserSchema>\n" +
      "            └─→  検査 Schema.decodeUnknown(UserSchema)\n" +
      "```\n\n" +
      "**型と検査がずれません。**片方だけ直すことができないからです。\n" +
      "（この回では確認のために `type User` を手で書いていますが、" +
      "実際のコードでは `type User = Schema.Schema.Type<typeof UserSchema>` と書いて、ずれる余地を消します）\n\n" +
      "取り込みはこうなります。\n\n" +
      "```\n" +
      "Schema.decodeUnknown(UserSchema)(input)\n" +
      "unknown  →  Effect<User, ParseResult.ParseError>\n" +
      "```\n\n" +
      "**入口が `unknown` であることに意味があります。**\n" +
      "`any` なら何でも通ってしまいますが、`unknown` は検証を通すまで何にも使えません。\n\n" +
      "そして失敗が `Effect` のエラー型に入りました。\n" +
      "ここから先は①②と同じ話です。**握りつぶすとコンパイルが通らない。**\n" +
      "「検証していない」ことが、型で見えるようになったということです。\n\n" +
      "**驚くのはこの先です。**\n" +
      "形が値なので、他のものも同じ定義から出せます。" +
      "逆向きの変換（`encode`）、JSON Schema や OpenAPI の生成、`string` から `Date` への変換つき検証、" +
      "フォームの検査、エラーメッセージ。**書くのは1か所だけ**です。\n\n" +
      "覚え方はこうです。\n" +
      "**`as` は「検査しない」と宣言する記法。**\n" +
      "**`decodeUnknown` は「検査した」と型に残す記法。**",
  },
  explanation:
    "型注釈と `as` はコンパイル時にのみ存在し、実行時の値がその形であることを保証しません。" +
    "`JSON.parse` の戻り値は `any` であるため、代入時の検査も行われません。" +
    "`Schema.Struct` はデータの形を実行時に存在する値として定義し、" +
    "`Schema.Schema.Type<typeof S>` で対応する型を取り出せます。型と検査が同じ定義から導かれるため、両者がずれません。" +
    "`Schema.decodeUnknown(schema)` は `unknown` を受け取り `Effect<A, ParseResult.ParseError>` を返します。" +
    "検証の失敗がエラー型に現れるため、呼び出し側はその失敗を処理するまで実行できません。" +
    "入力の型が `unknown` であることにより、検証を経ずに値を使うことができない点も `any` との違いです。",

  starterCode: `import { Effect, Data, Schema, ParseResult } from "effect";

// アプリの中で使っている型。これは変えません。
type User = { id: string; name: string; age: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 1. User の形を「値」として書いてください。
//    Schema.Struct({ id: Schema.String, ... }) の形です。
//
//    型注釈ではなく値です。実行時に残るので、実行時に検査できます。
declare const UserSchema: unknown;

// 2. unknown を検証して取り込んでください。
//    Schema.decodeUnknown(UserSchema)(input) の形です。
//
//    戻り値に注目してください。失敗が Effect のエラー型に入ります。
//    「検証していない」ことが型で見えるようになる、ということです。
declare const parseUser: unknown;

// 3. 境界で使ってください。
//    httpGet で取ってきた unknown を、そのまま parseUser に通します。
//
//    エラー型が2つになります。通信の失敗と、形が違う失敗です。
//    as User と書いていたときは、後者が型から見えていませんでした。
declare const getUser: unknown;
`,

  modelAnswer: `import { Effect, Data, Schema, ParseResult } from "effect";

// アプリの中で使っている型。これは変えません。
type User = { id: string; name: string; age: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 形を値として書く。
// TypeScript の型は実行時に消えるので、実行時に検査したければ値が要る。
// as しか使えなかったのは、それが無かったから。
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
});

// unknown を検証して取り込む。
// 入口が unknown なので、検証を通すまで何にも使えない。
const parseUser = (
  input: unknown
): Effect.Effect<User, ParseResult.ParseError> =>
  Schema.decodeUnknown(UserSchema)(input);

// 境界。ここを通った値だけが User として中に入る。
// エラー型が2つあるのは、失敗の種類が2つあるから。
// as User と書いていたときは、2つ目が型から消えていた。
const getUser = (
  id: string
): Effect.Effect<User, NetworkError | ParseResult.ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet(\`/api/users/\${id}\`);
    return yield* parseUser(raw);
  });

export { UserSchema, parseUser, getUser };
`,

  hints: [
    {
      level: 1,
      text: "`Schema.Struct({ ... })` の中身は「フィールド名: スキーマ」です。文字列なら `Schema.String`、数値なら `Schema.Number`。型注釈と違って、これは値なので `const` に入れます。",
    },
    {
      level: 2,
      text: "`Schema.decodeUnknown(UserSchema)` は関数を返します。その関数に `input` を渡してください（`Schema.decodeUnknown(UserSchema)(input)`）。`parseUser` の戻り値の型は `Effect.Effect<User, ParseResult.ParseError>` です。",
    },
    {
      level: 3,
      text: "`getUser` は `Effect.gen(function* () { const raw = yield* httpGet(...); return yield* parseUser(raw); })` です。戻り値の型は `Effect.Effect<User, NetworkError | ParseResult.ParseError>` になります。片方だけにすると型が合いません。失敗の種類が2つあるからです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-09-1",
      description:
        "スキーマが User とぴったり同じ形になっているか（フィールド名も型も）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Schema.Schema.Type<typeof UserSchema>, User>>;`,
      },
    },
    {
      id: "cp-ef-09-2",
      description: "検証の失敗がエラー型に出ているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof parseUser>, Effect.Effect<User, ParseResult.ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-09-3",
      description: "境界で通信の失敗と形の失敗の両方が型に出ているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof getUser>, Effect.Effect<User, NetworkError | ParseResult.ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-09-4",
      description: "検証の失敗を無かったことにできないか（型で止まるか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad: Effect.Effect<User, never> = parseUser({});`,
      },
    },
    {
      id: "cp-ef-09-5",
      description:
        "`as User` と `decodeUnknown` の違いを、実行時に何が起きるかで説明できるか？",
    },
  ],

  tags: ["Effect", "Schema", "境界", "as", "実行時検証"],
  relatedIds: [
    "ts-34-diagnose-as-cast",
    "sc-10-check-the-shape",
    "ef-01-error-in-type",
  ],
};
