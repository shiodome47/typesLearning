import type { Lesson } from "../types";

export const efLesson10: Lesson = {
  kind: "diagnose",
  language: "effect",
  id: "ef-10-diagnose-leak-and-runaway",
  order: 10,
  title: "⑩ 診断: 止まらない処理と、閉じない資源",
  category: "code-review",
  difficulty: 4,

  goal: "Effect を使っていても Promise のときと同じ壊れ方をしているコードを、型に何が出ていないかで見抜けるようになる",

  symptom:
    "Effect に書き換えたあとのコードです。型は通り、テストも通っています。\n\n" +
    "本番で、4つのことが起きています。\n\n" +
    "1. サーバーのメモリが1日で数GB増えます。**再起動すると戻ります。**\n" +
    "2. ユーザーが画面を閉じても、そのユーザー宛の通知取得が**続いています**。" +
    "1週間動かしたら、止まっていない取得が数万件ありました。\n" +
    "3. 外部APIの提供元から連絡が来ました。**「同時接続が多すぎる」**。以後 429 で締め出されています。\n" +
    "4. ときどき `Cannot read properties of undefined (reading 'trim')` が出ます。" +
    "**本番だけ**です。ローカルでは再現しません。\n\n" +
    "4つとも、⑥〜⑨で扱った話が1つずつ抜けています。",

  why: {
    problem:
      "Effect に書き換えても、**書き方が Promise のままなら壊れ方も Promise のまま**です。\n\n" +
      "厄介なのは、4つとも**コンパイルが通る**ことです。\n" +
      "型エラーは1つも出ません。だから「Effect にしたから安全になった」と思ってしまう。\n\n" +
      "そして4つとも、**本番でしか症状が出ません**。\n" +
      "ローカルは再起動が頻繁でメモリは戻り、ユーザーは自分1人なので同時接続も増えず、" +
      "モックのAPIは必ず正しい形を返します。\n\n" +
      "この回は、**型に何が出ていないか**を探す練習です。" +
      "書いてあるものではなく、書いていないものを見ます。",
    insight:
      "⑥〜⑨で見た「型に出るはずのもの」を、順に確かめます。\n\n" +
      "**1. 走らせた結果は何型か。**\n\n" +
      "`void` や `Promise<void>` なら、**止める手段を捨てています**。\n" +
      "`Effect.runPromise(...)` を呼び捨てにしているコードは、⑥の `Fiber` を捨てたということです。\n" +
      "止めたくなっても、もう止められません。\n\n" +
      "**2. 資源を開いている処理の `R` に `Scope` があるか。**\n\n" +
      "無ければ、後始末は型の外にあります。`try/finally` は書いてあるかもしれませんが、" +
      "⑦のとおり中断では走りません。そして書き忘れても誰も教えてくれません。\n\n" +
      "**3. `Effect.all` に同時本数が書いてあるか。**\n\n" +
      "`{ concurrency: \"unbounded\" }` は「無制限」です。`Promise.all` と同じものを、" +
      "**わざわざ選んで**書いた状態になります。件数が増えた日に相手を潰します。\n\n" +
      "**4. 外から来た値が `as` で入っていないか。**\n\n" +
      "⑨のとおり `as` は実行時に何もしません。" +
      "`Effect` で包んであっても、包んだ中身が検証されていなければ同じです。\n" +
      "**エラー型に検証の失敗（`ParseError`）が無いこと自体が、検証していない証拠**になります。\n\n" +
      "まとめると、読むところは4か所です。\n\n" +
      "```\n" +
      "戻り値が void            → 止める手段を捨てている\n" +
      "R に Scope が無い        → 後始末が型の外にある\n" +
      "concurrency が無制限     → 相手を潰す\n" +
      "エラー型に検証の失敗が無い → 境界を検証していない\n" +
      "```\n\n" +
      "**「Effect を使っているか」ではなく「型に出ているか」を見る。**\n" +
      "これは②と⑤でやったことと同じ見方です。",
  },
  explanation:
    "Effect を導入しても、Fiber を保持しない、Scope を型に出さない、同時実行数を制限しない、" +
    "境界で検証しない、という書き方をすれば、Promise を用いた場合と同じ問題が生じます。" +
    "`Effect.runPromise` の戻り値を破棄すると中断の手段が失われ、実行中の処理を停止できなくなります。" +
    "`try/finally` による解放は例外時には働きますが中断時には保証されず、記述の欠落も型検査では検出されません。" +
    "`concurrency: \"unbounded\"` は同時実行数を制限しないため、対象件数に比例して負荷が増加します。" +
    "`as` による変換は実行時に何も行わないため、外部から取得した値の形が異なっていても検出されず、" +
    "エラーはその値を利用する別の箇所で発生します。" +
    "いずれも型検査を通過するため、レビューでは戻り値の型、R に Scope があるか、同時実行数の指定、" +
    "エラー型に検証の失敗が含まれるかを個別に確認する必要があります。",

  brokenCode: `import { Effect, Data } from "effect";

type User = { id: string; name: string; age: number };

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ConnError extends Data.TaggedError("ConnError")<{}> {}

declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

// 通知の取得。1件ぶん。
const poll = (userId: string): Effect.Effect<void, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/notify/\${userId}\`).then(() => undefined),
    catch: () => new NetworkError({ status: 500 }),
  });

// 一覧を取る。
const listTables = (): Effect.Effect<string[], ConnError> =>
  Effect.tryPromise({
    try: async () => {
      const conn = await openConnection();
      try {
        return await conn.query("show tables");
      } finally {
        await closeConnection(conn);
      }
    },
    catch: () => new ConnError({}),
  });

// 画面を開いたときに呼ぶ。
const startPolling = (userId: string): void => {
  Effect.runPromise(poll(userId));
};

// 1件ぶんのユーザー取得。
const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.map(httpGet(\`/api/users/\${id}\`), (raw) => raw as User);

// まとめて取る。
const fetchAll = (
  ids: readonly string[]
): Effect.Effect<User[], NetworkError> =>
  Effect.all(
    ids.map((id) => fetchUser(id)),
    { concurrency: "unbounded" }
  );

export { listTables, startPolling, fetchUser, fetchAll };
`,

  defects: [
    {
      id: "d-ef-10-1",
      summary:
        "後始末が `try/finally` にあり、型に出ていない（中断されると閉じない）",
      why:
        "`finally` は例外で抜けるときには走りますが、⑥の中断で処理そのものが破棄されたときには走りません。" +
        "タイムアウトを付けた日や、画面を閉じた日に、コネクションが閉じずに残ります。" +
        "さらに問題なのは、この関数の型が `Effect.Effect<string[], ConnError>` になっていることです。" +
        "**後始末をしているかどうかが型のどこにも出ていない**ので、書き忘れても誰も気づきません。" +
        "`Effect.acquireRelease` を使えば `R` に `Scope` が現れ、" +
        "`Effect.scoped` を通すまで実行できなくなります。症状1（メモリが増え続ける）はこれが原因です。",
      marker: "await closeConnection(conn);",
    },
    {
      id: "d-ef-10-2",
      summary:
        "`Effect.runPromise` を呼び捨てにしていて、止める手段（Fiber）を捨てている",
      why:
        "戻り値が `void` になっていることが合図です。走らせただけで、⑥の `Fiber` を受け取っていません。" +
        "つまり**このポーリングを止める方法は、もうどこにもありません**。" +
        "ユーザーが画面を閉じても走り続け、開くたびに1本ずつ増えていきます。" +
        "`Effect.fork` で `Fiber` を受け取り、画面を閉じるときに `Fiber.interrupt` で止める形にします。" +
        "症状2（止まらない取得が数万件）はこれです。",
      marker: "Effect.runPromise(poll(userId));",
    },
    {
      id: "d-ef-10-3",
      summary: "同時実行数が無制限になっている（`concurrency: \"unbounded\"`）",
      why:
        "件数ぶんのリクエストを一度に投げます。`Promise.all` と同じものを、明示的に選んで書いた状態です。" +
        "④で見たとおり、落ちかけている相手を叩き続けるのがいちばんまずい振る舞いで、" +
        "件数が増えた日に相手を潰すか、こちらが締め出されます。" +
        "`{ concurrency: 10 }` のように上限を決めてください。" +
        "なお `concurrency` を省略した場合は直列（1本ずつ）になるので、うっかり無制限になることはありません。" +
        "無制限は、書いたときだけ起こります。症状3（429 で締め出された）はこれです。",
      marker: '{ concurrency: "unbounded" }',
    },
    {
      id: "d-ef-10-4",
      summary: "外から来た値を `as User` で素通しにしている（境界を検証していない）",
      why:
        "⑨のとおり `as` は実行時に何もしません。`Effect` で包んでも、包んだ中身が検証されていなければ同じです。" +
        "見分け方は型です。**エラー型に検証の失敗が入っていないこと自体が、検証していない証拠**になります。" +
        "`Schema.decodeUnknown` を通すと `ParseResult.ParseError` がエラー型に現れます。" +
        "検証していないと、形の違う値がそのまま奥まで入り、" +
        "遠く離れた場所で `undefined` を触って落ちます。症状4（本番だけ落ちる）はこれです。",
      marker: "(raw) => raw as User",
    },
  ],

  fixedCode: `import { Effect, Data, Fiber, Scope, Schema, ParseResult } from "effect";

type User = { id: string; name: string; age: number };

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ConnError extends Data.TaggedError("ConnError")<{}> {}

declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

const poll = (userId: string): Effect.Effect<void, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(\`/api/notify/\${userId}\`).then(() => undefined),
    catch: () => new NetworkError({ status: 500 }),
  });

// 形を値として持つ。ここから型も検査も出る。
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
});

// 直し1: 開くときに閉じ方を渡す。
// R に Scope が出るので、閉じる範囲を決めるまで実行できない。
const connection: Effect.Effect<Conn, ConnError, Scope.Scope> =
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => openConnection(),
      catch: () => new ConnError({}),
    }),
    (c) => Effect.promise(() => closeConnection(c))
  );

const listTablesScoped = (): Effect.Effect<string[], ConnError, Scope.Scope> =>
  Effect.gen(function* () {
    const conn = yield* connection;
    return yield* Effect.tryPromise({
      try: () => conn.query("show tables"),
      catch: () => new ConnError({}),
    });
  });

// ここが資源の寿命の境目。成功しても失敗しても中断されても閉じる。
const listTables = (): Effect.Effect<string[], ConnError> =>
  Effect.scoped(listTablesScoped());

// 直し2: fork して Fiber を受け取る。止める手段を持つ。
const startPolling = (
  userId: string
): Effect.Effect<Fiber.Fiber<void, NetworkError>> => Effect.fork(poll(userId));

// 画面を閉じるときに呼ぶ。持っているから止められる。
const stopPolling = (
  fiber: Fiber.Fiber<void, NetworkError>
): Effect.Effect<void> => Fiber.interrupt(fiber);

// 直し4: 境界で検証する。検証の失敗がエラー型に出る。
const fetchUser = (
  id: string
): Effect.Effect<User, NetworkError | ParseResult.ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet(\`/api/users/\${id}\`);
    return yield* Schema.decodeUnknown(UserSchema)(raw);
  });

// 直し3: 同時本数を決める。
const fetchAll = (
  ids: readonly string[]
): Effect.Effect<User[], NetworkError | ParseResult.ParseError> =>
  Effect.all(
    ids.map((id) => fetchUser(id)),
    { concurrency: 10 }
  );

export { listTables, listTablesScoped, startPolling, stopPolling, fetchUser, fetchAll };
`,

  hints: [
    {
      level: 1,
      text: "⑥〜⑨を1つずつ当てはめてください。「走らせた結果は何型か」「R に Scope はあるか」「同時本数は書いてあるか」「エラー型に検証の失敗はあるか」。欠陥は4件です。",
    },
    {
      level: 2,
      text: "`startPolling` の戻り値が `void` になっています。これは⑥の `Fiber` を捨てたということです。`listTables` は `try/finally` で閉じていますが、中断では走りません（⑦）。`fetchUser` のエラー型に検証の失敗が入っていないのは、検証していないからです（⑨）。",
    },
    {
      level: 3,
      text: "`listTables` は `Effect.acquireRelease` + `Effect.scoped` に、`startPolling` は `Effect.fork` にして `Fiber` を返し、止める `stopPolling` を足します。`fetchUser` は `Schema.decodeUnknown(UserSchema)` を通し、エラー型を `NetworkError | ParseResult.ParseError` にします。`concurrency` は `10` のような具体的な数にします。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-10-1",
      description: "資源の後始末が型に出ているか（Scope を使っているか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof listTablesScoped>, Effect.Effect<string[], ConnError, Scope.Scope>>>;`,
      },
    },
    {
      id: "cp-ef-10-2",
      description: "閉じる範囲を決めた形で外に出しているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof listTables>, Effect.Effect<string[], ConnError>>>;`,
      },
    },
    {
      id: "cp-ef-10-3",
      description: "走らせた処理を止める手段を受け取っているか（Fiber が返るか）？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof startPolling>, Effect.Effect<Fiber.Fiber<void, NetworkError>>>>;`,
      },
    },
    {
      id: "cp-ef-10-4",
      description: "実際に止められるか（中断する関数があるか）？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<ReturnType<typeof stopPolling>, Effect.Effect<void>>>;`,
      },
    },
    {
      id: "cp-ef-10-5",
      description: "境界を検証しているか（検証の失敗がエラー型に出ているか）？",
      verify: {
        kind: "type",
        assert: `type _c5 = Expect<Equal<ReturnType<typeof fetchUser>, Effect.Effect<User, NetworkError | ParseResult.ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-10-6",
      description: "まとめて取る側にも検証の失敗が伝わっているか？",
      verify: {
        kind: "type",
        assert: `type _c6 = Expect<Equal<ReturnType<typeof fetchAll>, Effect.Effect<User[], NetworkError | ParseResult.ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-10-7",
      // 欠陥コードでは startPolling が void を返すのでこの代入が通ってしまう。
      // 直っていれば Effect が返るので代入できない。
      // 「走らせただけで終わっていないか」を、この1行で見分けている
      description: "走らせっぱなしになっていないか（戻り値が void のままではないか）？",
      verify: {
        kind: "expect-error",
        assert: `const _bad: void = startPolling("1");`,
      },
    },
    {
      id: "cp-ef-10-8",
      description:
        "この4つのうち、`Promise` で書いていたときにも同じように起きていたのはどれか。全部だと即答できるか？",
    },
  ],

  tags: [
    "Effect",
    "コード診断",
    "リソースリーク",
    "中断",
    "並行処理",
    "境界",
    "AIレビュー",
  ],
  relatedIds: [
    "ef-06-interruption",
    "ef-07-acquire-release",
    "ef-08-structured-concurrency",
    "ef-09-schema-boundary",
  ],
};
