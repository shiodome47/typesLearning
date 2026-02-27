import type { Lesson } from "../types";

export const lesson04: Lesson = {
  id: "ts-04-type-alias",
  order: 4,
  title: "type エイリアス",
  category: "type-basics",
  difficulty: 1,

  goal: "type を使って複雑な型に名前をつけ、再利用できるようになる",
  explanation:
    "`type` キーワードを使うと型に名前をつけられます（型エイリアス）。" +
    "同じ型を複数箇所で使う場合や、型の意味を明確にしたい場合に使います。" +
    "オブジェクト型・Union型・関数型など、あらゆる型に名前をつけられます。" +
    "プロパティはセミコロン区切りで書くのが慣例です。",

  starterCode: `// 1. User型を定義してください
//    プロパティ: name(string), age(number), isAdmin(boolean)


// 2. greetUser関数を定義してください
//    引数: User型の user
//    戻り値: string（"Hello, Alice! Age: 25" の形式）
`,

  modelAnswer: `type User = {
  name: string;
  age: number;
  isAdmin: boolean;
};

function greetUser(user: User): string {
  return "Hello, " + user.name + "! Age: " + user.age;
}

const alice: User = {
  name: "Alice",
  age: 25,
  isAdmin: false,
};

console.log(greetUser(alice)); // "Hello, Alice! Age: 25"`,

  hints: [
    {
      level: 1,
      text: "`type 型名 = { プロパティ名: 型; ... }` の形でオブジェクト型を定義できます。",
    },
    {
      level: 2,
      text: "プロパティはセミコロン区切りで書きます。定義した型名を引数の型として `user: User` のように使います。",
    },
    {
      level: 3,
      text: "`type User = { name: string; age: number; isAdmin: boolean; }` → 関数引数で `user: User` と使う",
    },
  ],

  checkpoints: [
    { id: "cp-04-1", description: "`type` キーワードで型を定義できているか？" },
    { id: "cp-04-2", description: "プロパティが3つすべて正しい型で書けているか？" },
    { id: "cp-04-3", description: "定義した型を関数の引数で使えているか？" },
    { id: "cp-04-4", description: "変数宣言で `: User` と型注釈として使えているか？" },
  ],

  tags: ["type", "型エイリアス", "オブジェクト型", "再利用"],
  relatedIds: ["ts-01-variable-types", "ts-05-interface"],
};
