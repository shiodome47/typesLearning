import type { Lesson } from "../types";

export const lesson03: Lesson = {
  id: "ts-03-object-types",
  order: 3,
  title: "オブジェクトの型注釈",
  category: "objects",
  difficulty: 1,

  goal: "オブジェクトの構造をインライン型注釈で表現できるようになる（typeエイリアス前段階）",
  explanation:
    "オブジェクト変数には `{ プロパティ名: 型 }` の形でインライン型を書けます。" +
    "プロパティをセミコロンで区切るのが慣例です。" +
    "省略可能なプロパティは `age?: number` と書きます。" +
    "同じ型を繰り返す場合は `type` エイリアス（#04）を使うとスッキリします。",

  starterCode: `// 1. user 変数を定義してください（インライン型注釈で）
//    プロパティ: name(string), age(number), isAdmin(boolean)

// 2. getLabel 関数を定義してください
//    引数: item（プロパティ: id(number), label(string), count?(number, 省略可能)）
//    戻り値: string（"id:1 label:完了" の形式）
`,

  modelAnswer: `const user: { name: string; age: number; isAdmin: boolean } = {
  name: "Alice",
  age: 25,
  isAdmin: false,
};

function getLabel(item: { id: number; label: string; count?: number }): string {
  return "id:" + item.id + " label:" + item.label;
}

console.log(user.name);                         // "Alice"
console.log(getLabel({ id: 1, label: "完了" })); // "id:1 label:完了"`,

  hints: [
    {
      level: 1,
      text: "`const user: { name: string; age: number; isAdmin: boolean } = { ... }` の形でインライン型を書きます。`,` ではなく `;` 区切りが慣例です。",
    },
    {
      level: 2,
      text: "関数の引数も `item: { id: number; label: string; count?: number }` のようにオブジェクト型を直接書けます。",
    },
    {
      level: 3,
      text: "同じ型を何度も書くなら `type Label = { id: number; label: string }` のようにエイリアス化（#04）するとスッキリします。",
    },
  ],

  checkpoints: [
    { id: "cp-03-1", description: "変数にインライン型注釈 `{ プロパティ: 型; ... }` が書けているか？" },
    { id: "cp-03-2", description: "プロパティを `;` で区切っているか？" },
    { id: "cp-03-3", description: "関数の引数にオブジェクト型を直接書けているか？" },
    { id: "cp-03-4", description: "省略可能プロパティに `?:` が使えているか？" },
  ],

  tags: ["オブジェクト", "インライン型", "プロパティ", "optional", "型注釈"],
  relatedIds: ["ts-02-function-types", "ts-04-type-alias", "ts-05-interface"],
};
