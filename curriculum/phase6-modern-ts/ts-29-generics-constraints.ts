import type { Lesson } from "../types";

export const lesson29: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-29-generics-constraints",
  order: 29,
  title: "Generics制約（extends / keyof）",
  category: "generics",
  difficulty: 3,

  goal: "`T extends object` や `K extends keyof T` で型パラメータに制約を付け、安全で汎用的な関数を書けるようになる",

  why: {
    problem:
      "社内で使い回す小さな便利関数を作ることになりました。" +
      "「オブジェクトとキー名を渡すと、その値を返す」だけの関数です。\n\n" +
      "`function getProp<T>(obj: T, key: string) { return (obj as any)[key]; }` と書きました。" +
      "`<T>` を付けたので汎用的です。`key` は文字列なので何でも受け取れます。便利です。\n\n" +
      "半年後、`User` 型の `email` を `mailAddress` に改名することになりました。" +
      "エディタのリネーム機能を使えば、`user.email` と書かれた箇所はすべて直ります。" +
      "でも `getProp(user, \"email\")` の `\"email\"` は、ただの文字列です。リネーム機能はここを直しません。\n\n" +
      "型エラーも出ません。`key: string` なので `\"email\"` は正しい引数です。" +
      "実行すると `undefined` が返り、画面に「undefined」と表示されます。" +
      "そして `getProp` は社内の20ヶ所から呼ばれています。どこが壊れたのか、探すところから始まります。\n\n" +
      "もうひとつ。`getProp(42, \"length\")` も通ってしまいます。" +
      "`<T>` は「何でも受け取る」という意味なので、数値も受け取れてしまうのです。",
    insight:
      "`extends` は「T は何でもいい」を「T はこういうものに限る」に狭める書き方です。\n\n" +
      "`T extends object` なら「オブジェクトだけ」。数値や文字列を渡した時点で赤線が出ます。" +
      "汎用にしたいのは本当です。でも「何でも」ではなく「オブジェクトなら何でも」が本当に欲しかったものでした。\n\n" +
      "そしてもうひとつの道具が `keyof T` です。これは「その型が実際に持っているキー名の一覧」で、" +
      "`{ id, name, email }` に対しては `\"id\" | \"name\" | \"email\"` という3択の型になります。" +
      "文字列全般ではなく、この3つのどれか、という意味です。\n\n" +
      "`K extends keyof T` と書けば、`key` に渡せるのはその3択だけになります。" +
      "`\"email\"` を `\"mailAddress\"` に改名すれば3択の中身も自動で変わるので、" +
      "古い `\"email\"` が残っている呼び出しはその場で赤線になります。" +
      "おまけに、キーを打つときに候補が3つ出てきます。\n\n" +
      "戻り値の `T[K]` は「そのキーの中身の型」です。" +
      "`\"id\"` を渡せば `number`、`\"name\"` を渡せば `string` が返ってくると、TypeScript が呼ぶ側まで分かってくれます。",
  },
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
    {
      id: "cp-29-1",
      description: "`<T extends object>` の制約で、プリミティブ型の引数が型エラーになるか確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `
const _bad1 = getKeys(42);`,
      },
    },
    {
      id: "cp-29-2",
      description: "`<K extends keyof T>` で、存在しないキーを渡したときに型エラーが出るか確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `
const _u2 = { id: 1, name: "Alice", email: "a@b.com" };
const _bad2 = getProp(_u2, "missing");`,
      },
    },
    {
      id: "cp-29-3",
      description: "`getProp` の戻り値型が `T[K]`（Indexed Access型）になっているか？",
      verify: {
        kind: "type",
        assert: `
const _u3 = { id: 1, name: "Alice", email: "a@b.com" };
const _id3 = getProp(_u3, "id");
const _name3 = getProp(_u3, "name");
type _c3a = Expect<Equal<typeof _id3, number>>;
type _c3b = Expect<Equal<typeof _name3, string>>;`,
      },
    },
    {
      id: "cp-29-4",
      description: "`pick` の戻り値型が `Pick<T, K>` になっているか？",
      verify: {
        kind: "type",
        assert: `
const _u4 = { id: 1, name: "Alice", email: "a@b.com" };
const _picked4 = pick(_u4, ["id", "name"]);
type _c4 = Expect<Equal<typeof _picked4, Pick<typeof _u4, "id" | "name">>>;`,
      },
    },
    {
      id: "cp-29-5",
      description: "`pick` の `reduce` で指定キーだけを持つオブジェクトが作れているか？",
      verify: {
        kind: "expect-error",
        assert: `
const _u5 = { id: 1, name: "Alice", email: "a@b.com" };
const _picked5 = pick(_u5, ["id"]);
const _bad5 = _picked5.email;`,
      },
    },
  ],

  tags: ["Generics制約", "extends", "keyof", "Indexed Access型", "Pick", "型安全"],
  relatedIds: ["ts-11-generics-basics", "ts-23-keyof", "ts-24-mapped-types", "ts-21-utility-types"],
};
