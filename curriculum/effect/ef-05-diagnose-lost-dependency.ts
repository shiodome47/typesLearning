import type { Lesson } from "../types";

export const efLesson05: Lesson = {
  kind: "diagnose",
  language: "effect",
  id: "ef-05-diagnose-lost-dependency",
  order: 5,
  title: "⑤ 診断: 依存が型から消えている",
  category: "code-review",
  difficulty: 4,

  goal: "R が空になっているコードから、依存が正しく解決されたのか、型を弱めて消しただけなのかを区別できるようになる",

  symptom:
    "CI でテストが全部通っています。ローカルでも通ります。" +
    "`Effect` を使い、`Context` でタグも切ってあり、型注釈も揃っています。\n\n" +
    "ところがある朝、**本番のデータベースにテスト用のレコードが数千件入っていました**。" +
    "誰も本番に接続した覚えはありません。CI のログにも異常はありませんでした。\n\n" +
    "同じ頃、別の環境では「時刻が絡むテストだけ、ときどき落ちる」という報告も出ています。",

  why: {
    problem:
      "③で「依存が型に出ていれば、解決するまで実行できない」を学びました。\n" +
      "この安全装置には、**外し方が2通り**あります。どちらもコンパイルが通ります。\n\n" +
      "**1つ目は、そもそも型に出さないこと。**\n\n" +
      "`Effect.service(Database)` を使わず、モジュールの外にある `db` を直接使えば、" +
      "`R` は `never` のままです。型の上では「依存なし」。\n" +
      "しかし実際には**本物のデータベースに繋がっています**。\n" +
      "テストで差し替える手段が無いので、テストを走らせると本番に書き込みます。\n\n" +
      "**2つ目は、型を弱めて消すこと。**\n\n" +
      "`R` を `any` にする。あるいは実行するとき `as any` を付ける。\n" +
      "「`Type 'Clock' is not assignable to type 'never'` と言われたので直しました」" +
      "——**AIに頼むと、かなりの確率でこの直し方をします**。エラーは消えます。安全装置も消えます。\n\n" +
      "厄介なのは、**どちらも `R` が `never` に見える**ことです。\n" +
      "正しく解決した結果の `never` と、型を弱めて消した `never` が、見た目で区別できません。\n\n" +
      "そして `R` が空になったコードは「もう安全」として扱われ、" +
      "その上に新しいコードが積まれていきます。",
    insight:
      "`R` が空のコードを見たら、問うことは1つです。\n\n" +
      "**「この空は、埋めた結果か。それとも消した結果か。」**\n\n" +
      "見分け方は3つあります。\n\n" +
      "**1. `Effect.provideService` が実際に呼ばれているか。**\n\n" +
      "埋めたなら、必ずどこかで渡しています。渡していないのに `R` が空なら、" +
      "その依存は最初から型に出ていなかったということです。\n\n" +
      "**2. `any` が混ざっていないか。**\n\n" +
      "```\n" +
      "Effect.Effect<number, never, any>      // R が any。何でも通る\n" +
      "Effect.runPromise(stamped() as any)    // 実行時に握り潰す\n" +
      "```\n\n" +
      "`any` は「まだ埋まっていない」も「もう埋まった」も区別せず通します。" +
      "**`R` に `any` があるのは、安全装置が外れている合図**です。\n\n" +
      "**3. 外側の値を直に触っていないか。**\n\n" +
      "```\n" +
      "const listUsers = () =>\n" +
      "  Effect.tryPromise({ try: () => db.query(...), ... });  // db はモジュール外\n" +
      "```\n\n" +
      "これは `R` に何も出ません。**型は静かなまま、本物に繋がります**。\n" +
      "差し替えられないので、テストは本番を叩きます。\n\n" +
      "直し方は素直です。**必要なものを `Context.GenericTag` でタグにし、" +
      "`Effect.service` で取り出す。** そうすれば `R` に現れます。\n" +
      "そして実行する場所で `provideService` を呼び、そこで初めて `never` になる。\n\n" +
      "**`R` が空になる場所は、アプリの中で1か所だけであるべき**です。\n" +
      "そこが「現実世界と繋がる境界」で、テストではその1か所だけを差し替えます。\n\n" +
      "覚え方はこうです。\n" +
      "**`never` は「依存が無い」ではなく「もう全部渡した」という意味。**\n" +
      "渡した覚えが無いのに `never` なら、どこかで型が嘘をついています。",
  },
  explanation:
    "`Effect<A, E, R>` の R は実行前に解決すべき依存を表し、`Effect.runPromise` は R が never の Effect しか受け取りません。" +
    "この制約が働くのは、依存が `Effect.service(tag)` を通じて型に現れている場合だけです。" +
    "モジュールスコープの値を直接呼び出した場合、R には何も現れないため制約は働かず、テスト時の差し替えもできません。" +
    "また R を `any` にしたり実行時に `as any` を付けたりすると、解決済みかどうかに関わらず実行できてしまいます。" +
    "そのため R が never の Effect を見たときは、`provideService` によって解決された結果なのか、" +
    "型を弱めることで消されたのかを区別する必要があります。" +
    "依存を解決する場所はアプリケーション内の一箇所に集約し、テストではその一箇所だけを差し替えるのが基本形です。",

  brokenCode: `import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class QueryError extends Data.TaggedError("QueryError")<{}> {}

// 別ファイルから import してきた本物のデータベース接続。
// （ここでは宣言で代用しているが、実体は import { db } from "./db" と同じ）
declare const db: {
  query: (sql: string) => Promise<User[]>;
  insert: (sql: string) => Promise<void>;
};

// 時刻はタグを切ってある。ここは③のとおり。
interface Clock {
  readonly now: () => number;
}
const Clock = Context.GenericTag<Clock, Clock>("Clock");

// 依存を型に出さずに書いた版。
// R は never なので、型の上では「何も必要としない」ことになっている。
const listUsers = (): Effect.Effect<User[], QueryError> =>
  Effect.tryPromise({
    try: () => db.query("select * from users"),
    catch: () => new QueryError({}),
  });

const seedTestData = (): Effect.Effect<void, QueryError> =>
  Effect.tryPromise({
    try: () => db.insert("insert into users values ('t1', 'test')"),
    catch: () => new QueryError({}),
  });

// 「Type 'Clock' is not assignable to type 'never' と言われたので直しました」
// と説明された関数。エラーは消えている。
const stamped = (): Effect.Effect<number, never, any> =>
  Effect.gen(function* () {
    const clock = yield* Effect.service(Clock);
    return clock.now();
  });

// 実行側。型エラーは出ない。
export const runList = () => Effect.runPromise(listUsers());
export const runSeed = () => Effect.runPromise(seedTestData());
export const runStamp = () => Effect.runPromise(stamped() as any);
`,

  defects: [
    {
      id: "d-ef-05-1",
      summary:
        "データベースをモジュール外から直接使っており、依存が R に現れていない",
      why:
        "`Effect.service` を通していないため、`listUsers` と `seedTestData` の R は `never` のままです。" +
        "型の上では「何も必要としない」ことになりますが、実際には本物の接続に繋がっています。" +
        "差し替える手段が無いので、テストを走らせると本番のデータベースに書き込みます。" +
        "症状にある「本番にテスト用レコードが数千件入っていた」はこれが原因です。" +
        "R が空であることが安全を意味するのは、依存が型に出ている場合に限られます。",
      marker: "try: () => db.query(\"select * from users\")",
    },
    {
      id: "d-ef-05-2",
      summary: "R を `any` にして安全装置を外している（`Effect.Effect<number, never, any>`）",
      why:
        "`any` は「まだ埋まっていない」も「もう埋まった」も区別せずに通します。" +
        "そのため `Clock` を解決していなくても実行でき、依存の渡し忘れが型で止まりません。" +
        "「型エラーが出たので型を弱めて直した」という修正の典型で、エラーメッセージは消えますが" +
        "問題は消えていません。R に `any` があるのは、安全装置が外れている合図です。",
      marker: "Effect.Effect<number, never, any>",
    },
    {
      id: "d-ef-05-3",
      summary: "実行時に `as any` を付けて、未解決のまま走らせている",
      why:
        "`Effect.runPromise` が R = never しか受け取らないのは、依存の渡し忘れを止めるためです。" +
        "`as any` はその検査を無効化するため、`Clock` が無いまま実行されます。" +
        "実際に時刻が必要になった時点で初めて壊れるので、" +
        "「時刻が絡むテストだけ、ときどき落ちる」という不安定な症状になります。" +
        "型で止まるはずだった問題が、実行時の不定期な失敗に変わっています。",
      marker: "Effect.runPromise(stamped() as any)",
    },
  ],

  fixedCode: `import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class QueryError extends Data.TaggedError("QueryError")<{}> {}

// 必要なものをタグにする。実装ではなく「何ができるか」だけを決める。
interface Database {
  readonly query: (sql: string) => Effect.Effect<User[], QueryError>;
  readonly insert: (sql: string) => Effect.Effect<void, QueryError>;
}
const Database = Context.GenericTag<Database, Database>("Database");

interface Clock {
  readonly now: () => number;
}
const Clock = Context.GenericTag<Clock, Clock>("Clock");

// Effect.service で取り出すと、R に Database が現れる。
// 呼ぶ側は「これは DB を必要とする」と実行前に知れる。
const listUsers = (): Effect.Effect<User[], QueryError, Database> =>
  Effect.gen(function* () {
    const database = yield* Effect.service(Database);
    return yield* database.query("select * from users");
  });

const seedTestData = (): Effect.Effect<void, QueryError, Database> =>
  Effect.gen(function* () {
    const database = yield* Effect.service(Database);
    return yield* database.insert("insert into users values ('t1', 'test')");
  });

// any を使わない。必要なものは正直に型へ出す。
const stamped = (): Effect.Effect<number, never, Clock> =>
  Effect.gen(function* () {
    const clock = yield* Effect.service(Clock);
    return clock.now();
  });

// 依存を解決する場所を1か所に集める。
// ここが「現実世界と繋がる境界」で、テストではここだけを差し替える。
//
// as any は要らない。provideService を通したので R が never になり、
// runPromise がそのまま受け取れる。
const testDatabase: Database = {
  query: () => Effect.succeed([{ id: "t1", name: "テスト" }]),
  insert: () => Effect.succeed(undefined),
};

export const runList = () =>
  Effect.runPromise(Effect.provideService(listUsers(), Database, testDatabase));

export const runSeed = () =>
  Effect.runPromise(
    Effect.provideService(seedTestData(), Database, testDatabase)
  );

export const runStamp = () =>
  Effect.runPromise(
    Effect.provideService(stamped(), Clock, { now: () => 0 })
  );
`,

  hints: [
    {
      level: 1,
      text: "`R` が空になっている箇所を全部挙げて、「埋めた結果か、消した結果か」を1つずつ判定してください。埋めたなら `Effect.provideService` がどこかにあるはずです。3か所あります。",
    },
    {
      level: 2,
      text: "`db` を直接呼んでいる2つの関数は、依存が型に出ていません。`Database` のタグを切り、`Effect.service(Database)` で取り出す形に直すと `R` に現れます。`any` と `as any` はどちらも安全装置を外しているので消します。",
    },
    {
      level: 3,
      text: "実行側は `Effect.runPromise(Effect.provideService(listUsers(), Database, testDatabase))` の形にします。`provideService` を通すと `R` が `never` になるので、`as any` は要りません。解決する場所は1か所にまとめてください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-05-1",
      description: "DB を使う処理は依存を型に出しているか（R に Database が出るか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof listUsers>, Effect.Effect<User[], QueryError, Database>>>;`,
      },
    },
    {
      id: "cp-ef-05-2",
      description: "書き込み側も依存を型に出しているか（テストで差し替えられるか）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof seedTestData>, Effect.Effect<void, QueryError, Database>>>;`,
      },
    },
    {
      id: "cp-ef-05-3",
      description: "R から `any` が消えているか（安全装置が戻っているか）？",
      verify: {
        kind: "type",
        assert: `type _R5<T> = T extends Effect.Effect<any, any, infer R> ? R : never;\ntype _c3 = Expect<NotAny<_R5<ReturnType<typeof stamped>>>>;`,
      },
    },
    {
      id: "cp-ef-05-4",
      description: "時刻の依存は正しく型に出ているか？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<ReturnType<typeof stamped>, Effect.Effect<number, never, Clock>>>;`,
      },
    },
    {
      id: "cp-ef-05-5",
      description: "依存を解決してから実行しているか（`as any` に頼っていないか）？",
      verify: {
        kind: "type",
        assert: `type _c5 = Expect<Equal<Awaited<ReturnType<typeof runStamp>>, number>>;`,
      },
    },
    {
      id: "cp-ef-05-6",
      description: "未解決のまま実行しようとすると型で止まるか？",
      verify: {
        kind: "expect-error",
        assert: `const _bad = Effect.runPromise(listUsers());`,
      },
    },
    {
      id: "cp-ef-05-7",
      description:
        "`R` が `never` の関数を1つ挙げて、「埋めた結果か消した結果か」を即答できるか？",
    },
  ],

  tags: [
    "Effect",
    "コード診断",
    "依存注入",
    "any",
    "テスト",
    "AIレビュー",
  ],
  relatedIds: [
    "ef-03-dependency-in-type",
    "ef-02-diagnose-swallowed-error",
    "ts-36-diagnose-any-leak",
  ],
};
