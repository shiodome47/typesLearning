import type { Lesson } from "../types";

export const lesson12: Lesson = {
  id: "ts-12-promise",
  order: 12,
  title: "Promise基礎",
  category: "async",
  difficulty: 2,

  goal: "Promise<T>の型を明示して、非同期処理の成功/失敗を型安全に扱えるようになる",
  explanation:
    "`Promise<T>` は「将来Tという型の値を返す」約束を表す型です。" +
    "`.then()` で成功時の処理、`.catch()` で失敗時の処理を書きます。" +
    "`new Promise<T>()` でPromiseを手動生成することもできます。" +
    "TypeScriptでは戻り値型として `Promise<User>` のように型引数を明示します。",

  starterCode: `type User = {
  id: number;
  name: string;
};

// fetchUser関数を定義してください
// - 引数: userId: number
// - 戻り値: Promise<User>
// - 成功: 1秒後に { id: userId, name: "Alice" } を resolve
// - 失敗: userId <= 0 なら reject（"Invalid user ID"）

// 呼び出し例:
// fetchUser(1).then((user) => console.log(user.name)).catch((e) => console.error(e));
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
};

function fetchUser(userId: number): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    if (userId <= 0) {
      reject(new Error("Invalid user ID"));
      return;
    }
    setTimeout(() => {
      resolve({ id: userId, name: "Alice" });
    }, 1000);
  });
}

fetchUser(1)
  .then((user) => console.log(user.name)) // "Alice"
  .catch((error) => console.error(error));`,

  hints: [
    {
      level: 1,
      text: "`function fetchUser(userId: number): Promise<User>` の形で戻り値型を宣言します。関数内で `new Promise<User>(...)` を返します。",
    },
    {
      level: 2,
      text: "`new Promise<User>((resolve, reject) => { ... })` の中で成功時は `resolve(値)`, 失敗時は `reject(new Error(...))` を呼びます。",
    },
    {
      level: 3,
      text: "`setTimeout(() => resolve({ id: userId, name: 'Alice' }), 1000)` で遅延解決。`.then().catch()` で呼び出す。",
    },
  ],

  checkpoints: [
    { id: "cp-12-1", description: "戻り値型が `Promise<User>` と明示されているか？" },
    { id: "cp-12-2", description: "`new Promise<User>((resolve, reject) => {...})` の形で書けているか？" },
    { id: "cp-12-3", description: "失敗条件で `reject(new Error(...))` を呼べているか？" },
    { id: "cp-12-4", description: "`.then()` と `.catch()` で結果をハンドリングできているか？" },
  ],

  tags: ["Promise", "非同期", "resolve", "reject", "then", "catch"],
  relatedIds: ["ts-11-generics-basics", "ts-13-async-await"],
};
