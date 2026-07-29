import type { Lesson } from "../types";

export const efLesson02: Lesson = {
  kind: "diagnose",
  language: "effect",
  id: "ef-02-diagnose-swallowed-error",
  order: 2,
  title: "② 診断: Effect なのに失敗が消えている",
  category: "code-review",
  difficulty: 4,

  goal: "Effect のコードを読んで、エラー型が握りつぶされている箇所を型から特定できるようになる",

  symptom:
    "AIに「Effect で書き直して」と頼んだコードです。" +
    "`Effect` を使い、`gen` で組み立て、型注釈も付いていて、コンパイルも通ります。\n\n" +
    "しかし本番で、サーバーが 500 を返したときにユーザーの画面には何も表示されず、" +
    "エラーも記録されませんでした。ログを見ても、その時刻には何も残っていません。",

  why: {
    problem:
      "Effect を導入すれば安全になる、というわけではありません。\n" +
      "**Effect を使いながら、Effect の利点だけを捨てる書き方が存在します。**\n\n" +
      "しかも、それは見た目にはまったく問題がありません。" +
      "`Effect.gen` があり、型注釈があり、コンパイルも通る。\n" +
      "レビューで「Effect 使ってるね、OK」と流れていきます。\n\n" +
      "厄介なのは、これがAIの出力で特に起きやすいことです。\n" +
      "AIは「動くコード」を書くのが得意で、`catch` を省いても動きますし、" +
      "`Effect<A, never>` と書いても型は通ります。" +
      "**型を通すために型を弱めるのは、AIが最も自然にやってしまう修正**です。\n\n" +
      "そして一度エラー型が `never` になってしまうと、" +
      "その先を呼ぶコードは全部「失敗しない前提」で書かれていきます。" +
      "**型が嘘をついたまま伝播する**わけです。",
    insight:
      "Effect のコードを読むとき、見る場所は2つだけです。\n\n" +
      "**1つ目: `catch` を書いているか。**\n\n" +
      "```\n" +
      "Effect.tryPromise({ try: ..., catch: (e) => new NetworkError() })  // 型に出る\n" +
      "Effect.tryPromise(() => fetch(url))                                 // UnknownException\n" +
      "```\n\n" +
      "後者もコンパイルは通ります。ただしエラー型が `UnknownException` になり、" +
      "**「何が失敗しうるか」という情報が消えます**。`unknown` を返す `catch (e)` と同じ状態です。\n\n" +
      "**2つ目: `catchAll` が何をしているか。**\n\n" +
      "```\n" +
      "Effect.catchAll(self, () => Effect.succeed(null))\n" +
      "```\n\n" +
      "これは「エラーを処理した」ように見えて、実際には**握りつぶしています**。" +
      "エラー型は `never` になり、型の上では「もう失敗しない」ことになる。\n" +
      "しかし失敗そのものが消えたわけではなく、`null` に化けて先へ流れていきます。\n\n" +
      "`try/catch` で `catch {}` と書くのと同じことですが、" +
      "**Effect で書くと「ちゃんと処理している」ように見えてしまう**分だけ質が悪い。\n\n" +
      "処理したいなら、こう書きます。\n\n" +
      "```\n" +
      "Effect.catchTag(self, \"NetworkError\", (e) => ...)   // これだけ処理。残りは型に残る\n" +
      "```\n\n" +
      "`catchTag` なら、処理した分だけがエラー型から消え、**残りは型に残ります**。\n" +
      "「全部消す」のではなく「1つずつ減らす」。これが正しい向き合い方です。\n\n" +
      "見分け方をまとめます。\n" +
      "**エラー型が `never` になっている箇所を探し、そこで何が起きたのかを問う。**\n" +
      "正しく処理されたのか、握りつぶされたのか。答えは必ずそこにあります。",
  },
  explanation:
    "`Effect.tryPromise` は `catch` を省略できますが、その場合エラー型は `UnknownException` になり、" +
    "どんな失敗が起こりうるかという情報が型から失われます。" +
    "`Effect.catchAll` はすべてのエラーを処理してエラー型を `never` にするため、" +
    "処理内容が実質的な握りつぶしであっても型の上では「安全」に見えてしまいます。" +
    "対して `Effect.catchTag` は `_tag` の一致する種類だけを処理し、残りのエラーは型に残ります。" +
    "そのため Effect のコードを診断するときは、エラー型が `never` や `UnknownException` に" +
    "なっている箇所を探し、そこで失敗がどう扱われたかを確認するのが有効です。",

  brokenCode: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

// AI に「Effect で書き直して」と頼んだ結果。
// 型注釈も付いていて、コンパイルも通る。

const httpGet = (url: string) =>
  // catch を書いていない。
  Effect.tryPromise(() => fetch(url).then((r) => r.json()));

const parseUser = (raw: unknown): Effect.Effect<User, never> =>
  Effect.succeed(raw as User);

// 「エラー処理も入れておきました」と言われたコード。
const getUser = (id: string): Effect.Effect<User | null, never> =>
  Effect.catchAll(
    Effect.gen(function* () {
      const raw = yield* httpGet(\`/api/users/\${id}\`);
      return yield* parseUser(raw);
    }),
    () => Effect.succeed(null)
  );

// 呼ぶ側は「失敗しない」前提で書かれている。
// 型がそう言っているので、そう書くのが自然になる。
export const showUser = (id: string) =>
  Effect.runPromise(getUser(id));
`,

  defects: [
    {
      id: "d-ef-02-1",
      summary:
        "`Effect.tryPromise` に `catch` が無く、エラー型が `UnknownException` になっている",
      why:
        "`catch` を省くと、失敗はすべて `UnknownException` にまとめられます。" +
        "型からは「ネットワークが落ちたのか」「JSON が壊れていたのか」が区別できなくなり、" +
        "呼ぶ側は種類ごとの対処を書けません。" +
        "`catch (e)` で `e` が `unknown` になるのと同じ状態で、Effect を使う利点が失われています。",
      marker: "Effect.tryPromise(() => fetch(url).then((r) => r.json()))",
    },
    {
      id: "d-ef-02-2",
      summary:
        "`catchAll` で全てのエラーを `null` に潰しており、失敗が型からも実行時からも消えている",
      why:
        "`catchAll` はエラー型を `never` にします。型の上では「もう失敗しない」ことになりますが、" +
        "失敗そのものは消えておらず `null` に化けて先へ流れます。" +
        "記録も残らないため、本番で何が起きたのか後から追えません。" +
        "`try { ... } catch {}` と同じ握りつぶしですが、Effect で書かれている分" +
        "「ちゃんと処理している」ように見えてしまいます。",
      marker: "Effect.catchAll(..., () => Effect.succeed(null))",
    },
    {
      id: "d-ef-02-3",
      summary:
        "型が `never` に弱められた結果、呼ぶ側が「失敗しない前提」で書かれている",
      why:
        "`getUser` の戻り値が `Effect<User | null, never>` になっているため、" +
        "呼ぶ側は失敗の処理を書く必要がなく、書かなくてもコンパイルが通ります。" +
        "型が嘘をついたまま伝播し、この関数を使う全てのコードが誤った前提の上に乗ります。" +
        "エラー型を握りつぶす影響は、その関数の中だけでは終わりません。",
      marker: "Effect.Effect<User | null, never>",
    },
  ],

  fixedCode: `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ParseError extends Data.TaggedError("ParseError")<{}> {}

// catch を書く。ここで返した型がそのままエラー型になり、
// 「何が失敗しうるか」が呼ぶ側に伝わる。
const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json()),
    catch: () => new NetworkError({ status: 500 }),
  });

// 失敗しうるなら、型にそう書く。
const parseUser = (raw: unknown): Effect.Effect<User, ParseError> =>
  Effect.succeed(raw as User);

// エラーを消さない。合成された型をそのまま外に出す。
// 呼ぶ側は「2通りに失敗する」ことを型から知り、対処を強制される。
const getUser = (id: string): Effect.Effect<User, NetworkError | ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet(\`/api/users/\${id}\`);
    return yield* parseUser(raw);
  });

// 処理するときは catchTag で1種類ずつ減らす。
// NetworkError だけを扱い、ParseError は型に残るので、
// 「まだ対処していない失敗がある」ことが型から分かる。
export const getUserWithRetryHint = (
  id: string
): Effect.Effect<User | "retry", ParseError> =>
  Effect.catchTag(getUser(id), "NetworkError", () =>
    Effect.succeed("retry" as const)
  );
`,

  hints: [
    {
      level: 1,
      text: "エラー型が `never` や `UnknownException` になっている箇所を探してください。Effect のコードの問題は、ほぼ必ずそこに現れます。3か所あります。",
    },
    {
      level: 2,
      text: "`Effect.tryPromise` に `catch` を足すと、エラー型が `UnknownException` から自分で決めた型に変わります。`parseUser` の `never` も、失敗しうるなら正直に書き直します。",
    },
    {
      level: 3,
      text: "`catchAll(..., () => Effect.succeed(null))` を消し、合成されたエラー型をそのまま返します。処理したい場合は `Effect.catchTag(self, \"NetworkError\", ...)` を使うと、その種類だけが型から消え、残りは型に残ります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-ef-02-1",
      description: "`httpGet` のエラー型は具体的になったか（UnknownException ではないか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof httpGet>, Effect.Effect<unknown, NetworkError>>>;`,
      },
    },
    {
      id: "cp-ef-02-2",
      description: "`parseUser` は失敗を型に出したか（never のままにしていないか）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof parseUser>, Effect.Effect<User, ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-02-3",
      description: "`getUser` は失敗を握りつぶさず、型に残しているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof getUser>, Effect.Effect<User, NetworkError | ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-02-4",
      description:
        "処理した分だけエラーが減っているか（catchTag で1種類だけ消え、残りは型にある）？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<ReturnType<typeof getUserWithRetryHint>, Effect.Effect<User | "retry", ParseError>>>;`,
      },
    },
    {
      id: "cp-ef-02-5",
      description:
        "「エラー型が never になっている」と「エラーを処理した」の違いを説明できるか？",
    },
  ],

  tags: [
    "Effect",
    "コード診断",
    "エラー処理",
    "catchAll",
    "catchTag",
    "AIレビュー",
  ],
  relatedIds: ["ef-01-error-in-type", "ts-36-diagnose-any-leak"],
};
