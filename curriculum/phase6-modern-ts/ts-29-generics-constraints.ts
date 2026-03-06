import type { Lesson } from "../types";

export const lesson29: Lesson = {
  id: "ts-29-generics-constraints",
  order: 29,
  title: "Generics制約（extends / keyof）",
  category: "generics",
  difficulty: 3,

  goal: "`T extends object` や `K extends keyof T` で型パラメータに制約を付け、安全で汎用的な関数を書けるようになる",
  explanation:
    "#11（Generics基礎）では `<T>` で「任意の型を受け取る」関数を学びました。" +
    "この教材では `extends` を使って型パラメータの範囲を絞り込む方法を学びます。" +
    "`T extends object` は「T はオブジェクト型に限る」という制約で、プリミティブ型での誤用をコンパイル時に防げます。" +
    "`K extends keyof T` は「K は T に存在するキーに限る」という制約で、#23（keyof / Indexed Access）で学んだ `T[K]` と組み合わせると完全に型安全なプロパティ取得関数が作れます。" +
    "この制約パターンは #24（Mapped Types）や #28（カスタムhook）の型設計にも応用でき、型を「道具として作る」第一歩になります。",

  starterCode: `// ── Part 1: T extends object ──────────────────────────────
// 1. getKeys<T extends object>(obj: T): (keyof T)[] を実装してください
//    - Object.keys(obj) を返す（ただし as (keyof T)[] でキャストする）
//    - 制約なし版と比べて getKeys(42) がコンパイルエラーになることを確認してください（コメントで示すだけでOK）

// ── Part 2: K extends keyof T ─────────────────────────────
// 2. getProp<T extends object, K extends keyof T>(obj: T, key: K): T[K] を実装してください
//    - obj[key] を返すだけ
//    - 存在しないキーを渡したときに型エラーになることを確認してください（コメントで示すだけでOK）

// ── Part 3: 応用 ───────────────────────────────────────────
// 3. pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> を実装してください
//    - keys 配列で指定したプロパティだけを持つオブジェクトを返す
//    - ヒント: keys.reduce で空オブジェクトに詰めていく

// 動作確認
// const user = { id: 1, name: "Alice", email: "a@b.com" };
// console.log(getKeys(user));                          // ["id", "name", "email"]
// console.log(getProp(user, "name"));                  // "Alice"
// console.log(pick(user, ["id", "name"]));             // { id: 1, name: "Alice" }
// getProp(user, "missing");                            // ← 型エラー
`,

  modelAnswer: `// Part 1: T extends object
function getKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

// 制約なし版との比較（コメント）
// function getKeysAny<T>(obj: T) { return Object.keys(obj as object) as (keyof T)[]; }
// getKeysAny(42);  // エラーにならない（危険）
// getKeys(42);     // 型エラー: number は object を満たさない

// Part 2: K extends keyof T
function getProp<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// getProp(user, "missing"); // 型エラー: "missing" は keyof User に存在しない

// Part 3: pick
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

// 動作確認
const user = { id: 1, name: "Alice", email: "a@b.com" };
console.log(getKeys(user));              // ["id", "name", "email"]
console.log(getProp(user, "name"));      // "Alice"
console.log(pick(user, ["id", "name"])); // { id: 1, name: "Alice" }`,

  hints: [
    {
      level: 1,
      text: "`<T extends object>` と書くことで、T にオブジェクト型以外（数値・文字列など）を渡したとき型エラーになります。`getKeys` は `Object.keys(obj) as (keyof T)[]` で OK です。",
    },
    {
      level: 2,
      text: "`getProp` のシグネチャは `<T extends object, K extends keyof T>(obj: T, key: K): T[K]` です。`K extends keyof T` の制約により、T に存在しないキーを渡すとコンパイルエラーになります。戻り値 `T[K]` は Indexed Access 型（#23）です。",
    },
    {
      level: 3,
      text: "`pick` は `keys.reduce((acc, key) => { acc[key] = obj[key]; return acc; }, {} as Pick<T, K>)` で実装できます。`Pick<T, K>` は #21 の Utility Types です。`reduce` の初期値を `{} as Pick<T, K>` と型キャストするのがポイントです。",
    },
  ],

  checkpoints: [
    { id: "cp-29-1", description: "`<T extends object>` の制約で、プリミティブ型の引数が型エラーになるか確認できたか？" },
    { id: "cp-29-2", description: "`<K extends keyof T>` で、存在しないキーを渡したときに型エラーが出るか確認できたか？" },
    { id: "cp-29-3", description: "`getProp` の戻り値型が `T[K]`（Indexed Access型）になっているか？" },
    { id: "cp-29-4", description: "`pick` の戻り値型が `Pick<T, K>` になっているか？" },
    { id: "cp-29-5", description: "`pick` の `reduce` で指定キーだけを持つオブジェクトが作れているか？" },
  ],

  tags: ["Generics制約", "extends", "keyof", "Indexed Access型", "Pick", "型安全"],
  relatedIds: ["ts-11-generics", "ts-23-keyof", "ts-24-mapped-types", "ts-21-utility-types"],
};
