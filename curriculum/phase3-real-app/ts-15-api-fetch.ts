import type { Lesson } from "../types";

export const lesson15: Lesson = {
  kind: "write",
  id: "ts-15-api-fetch",
  order: 15,
  title: "APIレスポンスを境界で検証する",
  category: "async",
  difficulty: 3,

  goal: "外部APIのレスポンスを `unknown` で受け、実行時に検証してから型を付けられるようになる",
  explanation:
    "`fetch(...).json()` が返すのは、実際には何が入っているか分からない値です。" +
    "ここで `as User` と書くと型チェッカーは黙りますが、実行時には何も検証されません。" +
    "外部APIは仕様書どおりに返らないことがあり（項目名の違い、`null` の混入）、その場合は使う瞬間に落ちます。" +
    "型は「自分が書いたコードの中」を守る仕組みで、外から来たデータは守ってくれません。" +
    "そのため境界では `unknown` で受け、型ガード（#07）で形を確認してから型を名乗らせます。" +
    "実務では zod や valibot でこの検証を宣言的に書きますが、やっていることはこの手書きの検証と同じです。",

  starterCode: `type User = {
  id: number;
  name: string;
  email: string;
};

// 1. isUser 型ガードを定義してください
//    - シグネチャ: (value: unknown) => value is User
//    - object であること、null でないことを確認
//    - id が number、name と email が string であることを確認

// 2. fetchUser 関数を定義してください
//    - 引数: userId: number / 戻り値: Promise<User>
//    - response.ok が false なら Error を throw（fetchは4xx/5xxで例外を投げない）
//    - json() の結果は unknown で受ける（as は使わない）
//    - isUser で検証し、通らなければ Error を throw

// 3. 呼び出し側を書いてください
//    - try/catch で受け、catch は unknown → instanceof Error で絞り込む
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  email: string;
};

// 1. 型ガード（#07）。true を返したら、以降そこは User として扱われる。
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;

  // unknown のままではプロパティを見られないので、
  // インデックス可能な形に一度だけ絞る
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.email === "string"
  );
}

// 2. 境界で検証してから型を付ける
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`);

  // fetch は 404 や 500 でも例外を投げない
  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }

  // as User と書かない。何が来るか分からない値は unknown で受ける
  const data: unknown = await response.json();

  if (!isUser(data)) {
    throw new Error("APIレスポンスが User の形をしていません");
  }

  // ここでは data は User に絞り込まれている
  return data;
}

// 3. 呼び出し側
async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(user.name);
    console.log(user.email.toLowerCase()); // 検証済みなので安全
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("取得エラー:", error.message);
    }
  }
}

main();`,

  hints: [
    {
      level: 1,
      text: "`fetch()` は `Response` を返します。`response.ok` が `false` のとき（4xx/5xx）は例外にならないので、手動で `throw new Error(...)` します。`.json()` の結果は `const data: unknown = ...` で受けるのが出発点です。",
    },
    {
      level: 2,
      text: "型ガードの戻り値型は `value is User` です（#07）。`unknown` のままではプロパティを読めないので、`typeof value !== \"object\" || value === null` を弾いたあと `const v = value as Record<string, unknown>` として、`typeof v.id === \"number\"` のように1つずつ確認します。",
    },
    {
      level: 3,
      text: "`if (!response.ok) throw` → `const data: unknown = await response.json()` → `if (!isUser(data)) throw` → `return data` の順です。最後の `return data` が型エラーにならなければ、型ガードが正しく効いています。",
    },
  ],

  checkpoints: [
    {
      id: "cp-15-1",
      description: "`isUser` が型述語（`value is User`）として定義され、絞り込みが効いているか？",
      verify: {
        kind: "type",
        assert: `
const _v: unknown = null;
function _narrow(): User | null {
  if (isUser(_v)) return _v;
  return null;
}
type _c1 = Expect<Equal<ReturnType<typeof _narrow>, User | null>>;`,
      },
    },
    {
      id: "cp-15-2",
      description: "`isUser` の引数が `unknown` になっているか（`any` に逃げていないか）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<Parameters<typeof isUser>[0], unknown>>;`,
      },
    },
    {
      id: "cp-15-3",
      description: "`fetchUser` の戻り値型が `Promise<User>` と明示されているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ReturnType<typeof fetchUser>, Promise<User>>>;`,
      },
    },
    {
      id: "cp-15-4",
      description: "検証していない値をそのまま `User` として扱えないことを確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `
const _raw: unknown = { id: 1 };
const _bad: User = _raw;`,
      },
    },
    {
      id: "cp-15-5",
      description: "`response.ok` を確認してからデータを使っているか？",
    },
    {
      id: "cp-15-6",
      description: "catch 節で `unknown` を受け、`error instanceof Error` で絞り込んでいるか？",
    },
  ],

  tags: [
    "fetch",
    "API",
    "async",
    "unknown",
    "型ガード",
    "実行時検証",
    "境界",
    "response.ok",
    "zod",
  ],
  relatedIds: [
    "ts-13-async-await",
    "ts-14-error-handling",
    "ts-07-type-guards",
    "ts-34-diagnose-as-cast",
  ],
};
