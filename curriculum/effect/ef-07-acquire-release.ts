import type { Lesson } from "../types";

export const efLesson07: Lesson = {
  kind: "write",
  language: "effect",
  id: "ef-07-acquire-release",
  order: 7,
  title: "⑦ 後始末 — 閉じ忘れが型で止まる",
  category: "error-handling",
  difficulty: 4,

  goal: "開いたものを閉じる約束を型に出し、閉じ忘れたコードがコンパイルできない状態を作れるようになる",

  why: {
    problem:
      "コネクションを開いて、使って、閉じます。誰もが書く形です。\n\n" +
      "```ts\n" +
      "const conn = await openConnection();\n" +
      "try {\n" +
      "  return await conn.query(\"show tables\");\n" +
      "} finally {\n" +
      "  await conn.close();\n" +
      "}\n" +
      "```\n\n" +
      "正しく見えます。実際、**例外が出たときは閉じます**。\n" +
      "問題は、閉じない場合があることです。\n\n" +
      "**1. 中断されたとき。**\n\n" +
      "⑥でやったとおり、`Promise` は止められません。" +
      "では止められる仕組み（`AbortController`、あるいはプロセスの終了）で外から止めた場合、" +
      "この `finally` は走るとは限りません。`await` の途中で捨てられた関数は、そこで終わりです。\n\n" +
      "**2. 開いた直後に何かが起きたとき。**\n\n" +
      "`openConnection()` は成功したが、`try` に入る前に中断された。" +
      "コネクションは開いたまま、誰も参照していない状態で残ります。\n\n" +
      "**3. そもそも `try/finally` を書き忘れたとき。**\n\n" +
      "これが一番多い。そして**型は何も言いません**。\n\n" +
      "```ts\n" +
      "const conn = await openConnection();\n" +
      "return await conn.query(\"show tables\");   // 閉じていない。コンパイルは通る\n" +
      "```\n\n" +
      "閉じ忘れは、レビューで見つけるか、本番でメモリが増えていくのを見て気づくかのどちらかです。" +
      "**「1日で数GB増えて、再起動すると戻る」**は、たいていこれです。",
    insight:
      "Effect では、開くときに**閉じ方も一緒に渡します**。\n\n" +
      "```\n" +
      "Effect.acquireRelease(開く, (資源) => 閉じる)\n" +
      "```\n\n" +
      "そして返ってくる型が、こうなります。\n\n" +
      "```\n" +
      "Effect<Conn, ConnError, Scope>\n" +
      "                        ~~~~~\n" +
      "```\n\n" +
      "3番目に `Scope` が出ました。③でやった依存の場所です。\n" +
      "これは「**この処理は、後始末の範囲がまだ決まっていない**」という意味です。\n\n" +
      "`Scope` は `Effect.scoped` を通したときに消えます。\n\n" +
      "```\n" +
      "Effect.scoped(自分)\n" +
      "Effect<A, E, Scope>  →  Effect<A, E, never>\n" +
      "```\n\n" +
      "**ここが要点です。**\n\n" +
      "⑤でやったとおり、`Effect.runPromise` は `R = never` の Effect しか受け取りません。\n" +
      "`Scope` が残っていれば `R` は `never` になりません。" +
      "つまり**閉じる範囲を決めないコードは、実行できない**。\n\n" +
      "```ts\n" +
      "Effect.runPromise(listTables());          // ✗ コンパイルが通らない\n" +
      "Effect.runPromise(Effect.scoped(listTables()));  // ○\n" +
      "```\n\n" +
      "**リソースの閉じ忘れが、コンパイルエラーになりました。**\n" +
      "レビューでも本番のメモリ監視でもなく、書いている最中に止まります。\n\n" +
      "そして `scoped` を通したあとの保証は強いです。\n\n" +
      "- 成功しても閉じる\n" +
      "- 失敗しても閉じる\n" +
      "- **⑥で中断されても閉じる**\n" +
      "- 複数開いていたら、**開いた逆順で**閉じる\n\n" +
      "`try/finally` が守れるのは1つ目と2つ目だけです。3つ目が抜けているせいで、" +
      "「タイムアウトを入れたらコネクションが枯れた」という事故が起きます。\n\n" +
      "覚え方はこうです。\n" +
      "**`R` に `Scope` がいる = まだ後始末の約束が閉じていない。**\n" +
      "**`Scope` が消えた場所 = そこが資源の寿命の境目。**",
  },
  explanation:
    "`Effect.acquireRelease(acquire, release)` は資源の取得と解放を1つの値として組み立て、" +
    "戻り値の R に `Scope.Scope` を加えます。" +
    "R に Scope が残っている限り `Effect.runPromise` は受け取らないため、解放範囲を決めないまま実行することはできません。" +
    "`Effect.scoped(self)` は解放の範囲を確定させ、R から Scope を取り除きます。" +
    "この範囲を抜けるとき、成功・失敗・中断のいずれの場合でも release が実行され、" +
    "複数の資源を取得している場合は取得と逆の順序で解放されます。" +
    "`try/finally` は例外による離脱には対応しますが、外部からの中断で関数が破棄された場合には実行されず、" +
    "また記述そのものを省略しても型検査では検出されません。" +
    "Scope を用いる形では、解放の有無がコンパイル時に判定される点が異なります。",

  starterCode: `import { Effect, Data, Scope } from "effect";

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class ConnError extends Data.TaggedError("ConnError")<{}> {}

// 別ファイルから import してきたドライバ。
// （ここでは宣言で代用しているが、実体は import { openConnection } from "./db" と同じ）
declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

// 1. 開くときに、閉じ方も一緒に渡してください。
//    Effect.acquireRelease(開く, (c) => 閉じる) の形です。
//
//    開く側は失敗しうるので Effect.tryPromise、
//    閉じる側は失敗しない前提なので Effect.promise を使います。
//
//    戻り値の型に Scope が出ることを確かめてください。
//    「後始末の範囲がまだ決まっていない」という意味です。
declare const connection: unknown;

// 2. 使ってください。
//    Effect.gen の中で yield* connection してから query します。
//
//    Scope はそのまま持ち越されます。
//    使っただけでは、まだ閉じる場所が決まっていないからです。
declare const listTables: unknown;

// 3. 後始末の範囲を閉じてください。
//    Effect.scoped(...) の形です。ここで Scope が R から消えます。
declare const program: unknown;

// 4. 実行してください。
//    3 を通していないと、ここでコンパイルが通りません。
//    閉じ忘れが型で止まる、というのがこの回の要点です。
declare const run: unknown;
`,

  modelAnswer: `import { Effect, Data, Scope } from "effect";

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class ConnError extends Data.TaggedError("ConnError")<{}> {}

// 別ファイルから import してきたドライバ。
declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

// 開き方と閉じ方を1つにまとめる。
// 後始末の範囲がまだ決まっていないので、R に Scope が出る。
const connection: Effect.Effect<Conn, ConnError, Scope.Scope> =
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => openConnection(),
      catch: () => new ConnError({}),
    }),
    (c) => Effect.promise(() => closeConnection(c))
  );

// 使っても Scope は消えない。
// 「使い終わった」と「閉じてよい」は別の話だから。
const listTables = (): Effect.Effect<string[], ConnError, Scope.Scope> =>
  Effect.gen(function* () {
    const conn = yield* connection;
    return yield* Effect.tryPromise({
      try: () => conn.query("show tables"),
      catch: () => new ConnError({}),
    });
  });

// ここが資源の寿命の境目。
// 抜けるときに必ず閉じる。成功しても、失敗しても、中断されても。
const program = (): Effect.Effect<string[], ConnError> =>
  Effect.scoped(listTables());

// scoped を通したので R が never になり、実行できる。
// 通していなければ、この行がコンパイルエラーになる。
const run = (): Promise<string[]> => Effect.runPromise(program());

export { connection, listTables, program, run };
`,

  hints: [
    {
      level: 1,
      text: "`Effect.acquireRelease` の第2引数は「資源を受け取って、閉じる Effect を返す関数」です。閉じる処理は失敗しない前提なので `Effect.promise(() => closeConnection(c))` を使います。`Effect.tryPromise` と違って catch は要りません。",
    },
    {
      level: 2,
      text: "`connection` の型は `Effect.Effect<Conn, ConnError, Scope.Scope>` です。`listTables` も同じ Scope を持ち越すので `Effect.Effect<string[], ConnError, Scope.Scope>` になります。`Scope` は `import { Scope } from \"effect\"` から来ていて、型としては `Scope.Scope` と書きます。",
    },
    {
      level: 3,
      text: "`program` は `Effect.scoped(listTables())` で、型は `Effect.Effect<string[], ConnError>` です（Scope が消えます）。`run` は `Effect.runPromise(program())` です。`Effect.runPromise(listTables())` と書くと、Scope が残っているのでコンパイルが通りません。それがこの回の確認したいことです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-07-1",
      description:
        "開くときに閉じ方も渡しているか（型に Scope が出ているか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<typeof connection, Effect.Effect<Conn, ConnError, Scope.Scope>>>;`,
      },
    },
    {
      id: "cp-ef-07-2",
      description: "使っている間も後始末の約束が持ち越されているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof listTables>, Effect.Effect<string[], ConnError, Scope.Scope>>>;`,
      },
    },
    {
      id: "cp-ef-07-3",
      description: "後始末の範囲を閉じたか（Scope が R から消えたか）？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof program>, Effect.Effect<string[], ConnError>>>;`,
      },
    },
    {
      id: "cp-ef-07-4",
      description: "実行できる形になっているか？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<Awaited<ReturnType<typeof run>>, string[]>>;`,
      },
    },
    {
      id: "cp-ef-07-5",
      description:
        "閉じる範囲を決めないまま実行しようとすると型で止まるか（閉じ忘れがコンパイルエラーになるか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad = Effect.runPromise(listTables());`,
      },
    },
    {
      id: "cp-ef-07-6",
      description:
        "`try/finally` では守れないのはどの場合か、1つ挙げられるか？",
    },
  ],

  tags: ["Effect", "リソース管理", "Scope", "後始末", "中断"],
  relatedIds: [
    "ef-06-interruption",
    "ef-03-dependency-in-type",
    "sv-04-effect-teardown",
  ],
};
