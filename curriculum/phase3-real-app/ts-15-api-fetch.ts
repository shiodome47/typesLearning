import type { Lesson } from "../types";

export const lesson15: Lesson = {
  id: "ts-15-api-fetch",
  order: 15,
  title: "型を使ったAPIレスポンス処理",
  category: "async",
  difficulty: 3,

  goal: "fetch + 型キャスト + エラー処理を組み合わせて、型安全なAPI呼び出し関数を書けるようになる",
  explanation:
    "fetch はレスポンスを `Response` 型で返し、`.json()` の戻り値は `Promise<unknown>` です。" +
    "`as 型` でキャストするか、型ガード関数で検証してから使います。" +
    "HTTPエラー（404, 500など）は例外にならないため、`response.ok` を必ず確認します。" +
    "これらを組み合わせると「型安全なAPIラッパー関数」の基本パターンが完成します。",

  starterCode: `type User = {
  id: number;
  name: string;
  email: string;
};

// fetchUser関数を定義してください（モック実装でOK）
// - 引数: userId: number
// - 戻り値: Promise<User>
// - 以下のパターンを含める:
//   1. response.ok のチェック（false なら Error をthrow）
//   2. json() の結果を User 型にキャスト
//   3. try/catch + unknown エラーの処理
// ※ 実際の通信は不要。fetch の型パターンを練習するのが目的。
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  email: string;
};

// fetch を使った型安全なAPIラッパーの基本パターン
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);

  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }

  // .json() の戻り値は unknown なので型キャスト
  const data = await response.json() as User;
  return data;
}

// 呼び出し側（型安全なエラーハンドリング）
async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(user.name);   // 型補完が効く
    console.log(user.email);  // 型補完が効く
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
      text: "`fetch()` は `Response` を返します。`response.ok` が `false` のとき（4xx/5xx）は例外にならないので、手動で `throw new Error(...)` します。",
    },
    {
      level: 2,
      text: "`const data = await response.json() as User` でキャストします。`as` は TypeScript を信頼させる宣言なので、実際のAPIレスポンス構造と一致させる必要があります。",
    },
    {
      level: 3,
      text: "パターン: `const res = await fetch(url)` → `if (!res.ok) throw new Error(...)` → `const data = await res.json() as User` → `return data` を try/catch で包む",
    },
  ],

  checkpoints: [
    { id: "cp-15-1", description: "`response.ok` を確認してからデータを使っているか？" },
    { id: "cp-15-2", description: "`.json()` の結果を型アサーション（`as User`）でキャストできているか？" },
    { id: "cp-15-3", description: "関数の戻り値型が `Promise<User>` と明示されているか？" },
    { id: "cp-15-4", description: "catch 節で `error instanceof Error` で絞り込んでいるか？" },
    { id: "cp-15-5", description: "テンプレートリテラルでURLにuserIdを埋め込めているか？" },
  ],

  tags: ["fetch", "API", "async", "await", "型キャスト", "as", "response.ok"],
  relatedIds: ["ts-13-async-await", "ts-14-error-handling", "ts-11-generics-basics"],
};
