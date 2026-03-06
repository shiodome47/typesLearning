import type { Lesson } from "../types";

export const lesson30: Lesson = {
  id: "ts-30-utility-returntype",
  order: 30,
  title: "ReturnType / Parameters / Awaited",
  category: "generics",
  difficulty: 3,

  goal: "`ReturnType` / `Parameters` / `Awaited` で既存の関数から型情報を取り出し、型の二重定義をなくせるようになる",
  explanation:
    "TypeScript には既存の関数から型情報を取り出す組み込みユーティリティ型があります。" +
    "`ReturnType<typeof fn>` は関数 `fn` の戻り値型を、`Parameters<typeof fn>` は引数型のタプルをそれぞれ取得します。" +
    "`Awaited<T>` は `Promise<T>` の解決後の型 `T` を取り出します。" +
    "これらを組み合わせると `Awaited<ReturnType<typeof fetchUser>>` で非同期関数の解決済み戻り値型が得られます。" +
    "外部ライブラリの関数型を再利用したり、ラッパー関数を型安全に書く際に毎回登場するパターンです。",

  starterCode: `// ── Part 1: ReturnType / Parameters ───────────────────────
function formatUser(id: number, name: string): { id: number; label: string } {
  return { id, label: \`[\${id}] \${name}\` };
}

// 1. FormatUserReturn 型を ReturnType で定義してください
//    → { id: number; label: string } になるはずです

// 2. FormatUserParams 型を Parameters で定義してください
//    → [number, string] になるはずです

// 型テスト（コメントを外して確認）
// const r: FormatUserReturn = { id: 1, label: "[1] Alice" }; // OK
// const p: FormatUserParams = [1, "Alice"];                   // OK

// ── Part 2: Awaited<ReturnType<...>> ──────────────────────
async function fetchProduct(
  id: number
): Promise<{ id: number; name: string; price: number }> {
  return { id, name: "Product", price: 100 };
}

// 3. FetchProductResult 型を Awaited<ReturnType<...>> で定義してください
//    → Promise が剥がれて { id: number; name: string; price: number } になるはずです

// ── Part 3: ラッパー関数 ──────────────────────────────────
// 4. withLogging<T extends (...args: unknown[]) => unknown>(fn: T) を実装してください
//    - fn と同じ引数・戻り値を持つ関数を返す
//    - 呼び出し前に console.log("calling:", fn.name) を出力する
//    - 引数型に Parameters<T>、戻り値型に ReturnType<T> を使うこと

// 動作確認
// const loggedFormat = withLogging(formatUser);
// loggedFormat(1, "Alice"); // "calling: formatUser" → { id: 1, label: "[1] Alice" }
`,

  modelAnswer: `function formatUser(id: number, name: string): { id: number; label: string } {
  return { id, label: \`[\${id}] \${name}\` };
}

// Part 1
type FormatUserReturn = ReturnType<typeof formatUser>;
// → { id: number; label: string }

type FormatUserParams = Parameters<typeof formatUser>;
// → [number, string]

// Part 2
async function fetchProduct(
  id: number
): Promise<{ id: number; name: string; price: number }> {
  return { id, name: "Product", price: 100 };
}

type FetchProductResult = Awaited<ReturnType<typeof fetchProduct>>;
// → { id: number; name: string; price: number }

// Part 3
function withLogging<T extends (...args: unknown[]) => unknown>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log("calling:", fn.name);
    return fn(...args) as ReturnType<T>;
  };
}

// 動作確認
const loggedFormat = withLogging(formatUser);
loggedFormat(1, "Alice"); // "calling: formatUser" → { id: 1, label: "[1] Alice" }`,

  hints: [
    {
      level: 1,
      text: "`ReturnType<typeof formatUser>` — `typeof` で関数の型を取り、`ReturnType<>` でその戻り値型を取り出します。`Parameters<>` は引数のタプル型になります。どちらも `typeof 関数名` をそのまま渡すだけです。",
    },
    {
      level: 2,
      text: "`Awaited<ReturnType<typeof fetchProduct>>` — まず `ReturnType` で `Promise<{...}>` を取得し、さらに `Awaited<>` で包むと `Promise` が剥がれて `{...}` だけが残ります。入れ子の順番に注意してください。",
    },
    {
      level: 3,
      text: "`withLogging` のシグネチャは `<T extends (...args: unknown[]) => unknown>(fn: T)` です。返す関数の引数は `(...args: Parameters<T>)` 、戻り値型は `ReturnType<T>` とし、`fn(...args) as ReturnType<T>` でキャストして返します。",
    },
  ],

  checkpoints: [
    { id: "cp-30-1", description: "`ReturnType<typeof formatUser>` で戻り値型が取り出せているか？" },
    { id: "cp-30-2", description: "`Parameters<typeof formatUser>` で引数型のタプルが取り出せているか？" },
    { id: "cp-30-3", description: "`Awaited<ReturnType<typeof fetchProduct>>` で `Promise` が剥がれた型が得られるか？" },
    { id: "cp-30-4", description: "`withLogging` の返す関数の引数に `Parameters<T>`、戻り値に `ReturnType<T>` が使われているか？" },
  ],

  tags: ["ReturnType", "Parameters", "Awaited", "typeof", "Generics", "ラッパー関数", "型推論"],
  relatedIds: ["ts-11-generics", "ts-12-promise", "ts-13-async-await", "ts-15-api-fetch", "ts-21-utility-types"],
};
