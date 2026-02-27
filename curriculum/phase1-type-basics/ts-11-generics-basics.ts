import type { Lesson } from "../types";

export const lesson11: Lesson = {
  id: "ts-11-generics-basics",
  order: 11,
  title: "Generics基礎",
  category: "generics",
  difficulty: 3,

  goal: "型パラメータ<T>を使って、型安全な汎用関数・型を作れるようになる",
  explanation:
    "Genericsは「型を引数として受け取る」仕組みです。" +
    "`<T>`と書くことで、呼び出し時に型が決まる柔軟な関数・型を作れます。" +
    "`Array<T>`, `Promise<T>` もGenericsで作られており、" +
    "APIレスポンスの型や汎用ユーティリティによく使います。",

  starterCode: `// 1. identity関数を定義してください
//    任意の型Tの値を受け取り、そのまま返す（引数と同じ型を返す）


// 2. ApiResponse型を定義してください
//    プロパティ: success(boolean), data(T), error?(string)


// 3. wrap関数を定義してください
//    値を受け取り、ApiResponse でラップして返す
//    例: wrap("hello") → { success: true, data: "hello" }
`,

  modelAnswer: `// 1. identity: 受け取った値をそのまま返す汎用関数
function identity<T>(value: T): T {
  return value;
}

const str = identity("hello"); // 型: string
const num = identity(42);      // 型: number

// 2. ApiResponse: 任意の型をラップするレスポンス型
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// 3. wrap: 値をApiResponseでラップする
function wrap<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

const result = wrap<string[]>(["Alice", "Bob"]);
// result.data の型は string[]`,

  hints: [
    {
      level: 1,
      text: "関数名の後に `<T>` をつけると型パラメータを宣言できます。引数と戻り値で同じ `T` を使えます。",
    },
    {
      level: 2,
      text: "`function identity<T>(value: T): T` / `type ApiResponse<T> = { data: T; ... }` の形です。",
    },
    {
      level: 3,
      text: "`function wrap<T>(data: T): ApiResponse<T> { return { success: true, data }; }` — Tが呼び出し元から伝搬することを意識する",
    },
  ],

  checkpoints: [
    { id: "cp-11-1", description: "`<T>` を関数名の後に書けているか？" },
    { id: "cp-11-2", description: "引数と戻り値で同じ型パラメータ `T` を使えているか？" },
    { id: "cp-11-3", description: "`type ApiResponse<T>` のようにtype定義にも `<T>` がつけられているか？" },
    { id: "cp-11-4", description: "`wrap<string[]>(...)` のように型引数を明示して呼び出せるか？" },
  ],

  tags: ["Generics", "型パラメータ", "汎用関数", "ApiResponse", "再利用"],
  relatedIds: ["ts-04-type-alias", "ts-13-async-await"],
};
