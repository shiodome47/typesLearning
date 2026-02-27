import type { Lesson } from "../types";

export const lesson13: Lesson = {
  id: "ts-13-async-await",
  order: 13,
  title: "async / await",
  category: "async",
  difficulty: 2,

  goal: "async/awaitを使って非同期処理を型安全に書けるようになる",
  explanation:
    "`async` をつけた関数は必ず `Promise` を返します。" +
    "`await` で Promise の解決を待ち、結果を変数に受け取れます。" +
    "TypeScriptでは `async function fetchUser(): Promise<User>` のように戻り値型を明示します。" +
    "`try/catch` と組み合わせてエラーも型安全に処理できます。",

  starterCode: `type User = {
  id: number;
  name: string;
};

// fetchUser関数を定義してください
// - 引数: userId: number
// - 戻り値: Promise<User>
// - 実装: 1秒後に { id: userId, name: "Alice" } を返す
// - エラー処理: userId が 0 以下なら Error をthrow する
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
};

async function fetchUser(userId: number): Promise<User> {
  if (userId <= 0) {
    throw new Error("Invalid user ID");
  }

  // 1秒後にデータを返すモック
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  return { id: userId, name: "Alice" };
}

// 呼び出し側
async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(user.name); // "Alice"
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

main();`,

  hints: [
    {
      level: 1,
      text: "`async function 関数名(): Promise<戻り値の型>` の形で書きます。関数内で `await` が使えます。",
    },
    {
      level: 2,
      text: "Promiseを使った待機は `await new Promise<void>((resolve) => setTimeout(resolve, 1000))` のように書けます。",
    },
    {
      level: 3,
      text: "戻り値型 `Promise<User>` を明示 → `await` で待機 → `try/catch` でエラーを `error instanceof Error` で型絞り込み",
    },
  ],

  checkpoints: [
    { id: "cp-13-1", description: "`async` キーワードが関数につけられているか？" },
    { id: "cp-13-2", description: "戻り値型が `Promise<User>` と明示されているか？" },
    { id: "cp-13-3", description: "`await` で非同期処理の完了を待てているか？" },
    { id: "cp-13-4", description: "呼び出し側で `try/catch` が書けているか？" },
    { id: "cp-13-5", description: "`error instanceof Error` で型を絞り込んでから `.message` を読んでいるか？" },
  ],

  tags: ["async", "await", "Promise", "非同期", "try-catch"],
  relatedIds: ["ts-11-generics-basics"],
};
