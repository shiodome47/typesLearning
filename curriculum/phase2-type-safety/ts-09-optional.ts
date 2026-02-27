import type { Lesson } from "../types";

export const lesson09: Lesson = {
  id: "ts-09-optional",
  order: 9,
  title: "Optional / ? / undefined / ?? / ?.",
  category: "type-basics",
  difficulty: 2,

  goal: "optional chaining（?.）と nullish coalescing（??）を使い、null/undefinedを安全に扱えるようになる",
  explanation:
    "`?.` はプロパティやメソッド呼び出しの前につけ、nullやundefinedなら `undefined` を返します（エラーにならない）。" +
    "`??` は左辺が `null` または `undefined` のときだけ右辺の値を返します（`||` との違い: `0` や `''` は通す）。" +
    "APIレスポンスや `find` の結果など「値があるかもしれない」状況で頻繁に使います。",

  starterCode: `type User = {
  id: number;
  name: string;
  address?: {
    city: string;
  };
};

// 1. getCity 関数を定義してください
//    引数: user(User)
//    address?.city を使って city を返す
//    city がなければ "不明" を返す（?? を使う）

// 2. getUserName 関数を定義してください
//    引数: user(User | null | undefined)
//    ?. と ?? を組み合わせて name を返す
//    user が null/undefined なら "ゲスト" を返す
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  address?: {
    city: string;
  };
};

function getCity(user: User): string {
  return user.address?.city ?? "不明";
}

function getUserName(user: User | null | undefined): string {
  return user?.name ?? "ゲスト";
}

const alice: User = { id: 1, name: "Alice", address: { city: "Tokyo" } };
const bob: User = { id: 2, name: "Bob" }; // address なし

console.log(getCity(alice)); // "Tokyo"
console.log(getCity(bob));   // "不明"
console.log(getUserName(alice)); // "Alice"
console.log(getUserName(null));  // "ゲスト"`,

  hints: [
    {
      level: 1,
      text: "`user.address?.city` と書くと、`address` が `undefined` のとき全体が `undefined` になります（エラーにならない）。",
    },
    {
      level: 2,
      text: "`user.address?.city ?? '不明'` は「cityがundefinedなら'不明'を使う」という意味です。`??` は `null/undefined` のときだけ右辺を返します（`0` や `''` は左辺をそのまま返す）。",
    },
    {
      level: 3,
      text: "`return user?.name ?? 'ゲスト'` — `user` 自体が null/undefined の場合は `?.` が `undefined` を返し、`??` が 'ゲスト' を返します。",
    },
  ],

  checkpoints: [
    { id: "cp-09-1", description: "`?.` でnull/undefinedを安全にチェーンできているか？" },
    { id: "cp-09-2", description: "`??` で `null/undefined` の場合のデフォルト値を設定できているか？" },
    { id: "cp-09-3", description: "`||` ではなく `??` を使っている（0や''を誤って置き換えない）か？" },
    { id: "cp-09-4", description: "`user: User | null | undefined` のような型で `?.` を使えているか？" },
  ],

  tags: ["Optional", "?.", "??", "optional chaining", "nullish coalescing", "null", "undefined"],
  relatedIds: ["ts-08-array-types", "ts-10-crud-basics", "ts-15-api-fetch"],
};
