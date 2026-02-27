import type { Lesson } from "../types";

export const lesson07: Lesson = {
  id: "ts-07-type-guards",
  order: 7,
  title: "型ガード",
  category: "type-guards",
  difficulty: 2,

  goal: "typeof / in / カスタム型ガードで、Union型の値を実行時に安全に絞り込めるようになる",
  explanation:
    "Union型の変数は、そのままでは共通プロパティしか使えません。" +
    "`typeof` は `string | number` などのプリミティブ型に、" +
    "`in` はオブジェクト型のプロパティ有無による分岐に使います。" +
    "カスタム型ガード（`value is 型`）を使うと、自分で絞り込み関数を作れます。",

  starterCode: `type Cat = { kind: "cat"; meow: () => void };
type Dog = { kind: "dog"; bark: () => void };
type Pet = Cat | Dog;

// 1. formatValue 関数を定義してください
//    引数: value(string | number)
//    string なら "文字列: " + value を返す
//    number なら "数値: " + value を返す（typeof を使う）

// 2. speakPet 関数を定義してください
//    引数: pet(Pet)
//    Cat なら meow(), Dog なら bark() を呼ぶ（in 演算子を使う）

// 3. isCat 型ガード関数を定義してください
//    引数: pet(Pet) / 戻り値: pet is Cat
`,

  modelAnswer: `type Cat = { kind: "cat"; meow: () => void };
type Dog = { kind: "dog"; bark: () => void };
type Pet = Cat | Dog;

// 1. typeof を使った型ガード
function formatValue(value: string | number): string {
  if (typeof value === "string") {
    return "文字列: " + value;
  }
  return "数値: " + value;
}

// 2. in 演算子を使った型ガード
function speakPet(pet: Pet): void {
  if ("meow" in pet) {
    pet.meow();
  } else {
    pet.bark();
  }
}

// 3. カスタム型ガード（戻り値型に "is" を使う）
function isCat(pet: Pet): pet is Cat {
  return pet.kind === "cat";
}

const cat: Cat = { kind: "cat", meow: () => console.log("meow") };
console.log(isCat(cat)); // true`,

  hints: [
    {
      level: 1,
      text: "`typeof value === 'string'` のブロック内では `value` が `string` に絞り込まれます。`in` は `'meow' in pet` のように使います。",
    },
    {
      level: 2,
      text: "カスタム型ガードは `function isCat(pet: Pet): pet is Cat` の形。戻り値型の `pet is Cat` が型絞り込みのシグナルです。",
    },
    {
      level: 3,
      text: "`function isCat(pet: Pet): pet is Cat { return pet.kind === 'cat'; }` — 戻り値は `boolean` だが型注釈で `pet is Cat` と宣言する",
    },
  ],

  checkpoints: [
    { id: "cp-07-1", description: "`typeof` で string/number を絞り込めているか？" },
    { id: "cp-07-2", description: "`in` 演算子でプロパティ有無による分岐ができているか？" },
    { id: "cp-07-3", description: "カスタム型ガードの戻り値型が `pet is Cat` の形で書けているか？" },
    { id: "cp-07-4", description: "型ガード後のブロックで型補完が効く（絞り込みが成立している）か？" },
  ],

  tags: ["型ガード", "typeof", "in", "カスタム型ガード", "is", "Union型", "絞り込み"],
  relatedIds: ["ts-06-union-literal", "ts-08-array-types"],
};
