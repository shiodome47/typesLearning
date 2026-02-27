import type { Lesson } from "../types";

export const lesson05: Lesson = {
  id: "ts-05-interface",
  order: 5,
  title: "interface",
  category: "type-basics",
  difficulty: 1,

  goal: "interfaceでオブジェクト型を定義し、typeとの使い分けの感覚をつかめるようになる",
  explanation:
    "`interface` は `type` と同様にオブジェクト型に名前をつけます。" +
    "大きな違いは `extends` で継承できる点と、同名定義でマージできる点です。" +
    "Reactの props 型や公開APIの型定義には `interface` がよく使われます。" +
    "迷ったら「オブジェクト型には interface、それ以外（Union型など）には type」が実践的な目安です。",

  starterCode: `// 1. Animal インターフェースを定義してください
//    プロパティ: name(string), sound(string)

// 2. Dog インターフェースを定義してください
//    Animal を extends して breed(string) を追加

// 3. describeAnimal 関数を定義してください
//    引数: Animal型 / 戻り値: string（"{name} says {sound}"）
`,

  modelAnswer: `interface Animal {
  name: string;
  sound: string;
}

interface Dog extends Animal {
  breed: string;
}

function describeAnimal(animal: Animal): string {
  return animal.name + " says " + animal.sound;
}

const dog: Dog = {
  name: "Pochi",
  sound: "Woof",
  breed: "Shiba",
};

console.log(describeAnimal(dog)); // "Pochi says Woof"
// Dog は Animal を extends しているので Animal を受け取る関数に渡せる`,

  hints: [
    {
      level: 1,
      text: "`interface 名前 { プロパティ: 型; }` の形で定義します。`type` と違い `=` は不要です。",
    },
    {
      level: 2,
      text: "`interface Dog extends Animal { breed: string; }` で継承できます。`Dog` は `Animal` のすべてのプロパティを持ちます。",
    },
    {
      level: 3,
      text: "`Dog extends Animal` なので、`Animal` を受け取る関数に `Dog` の値を渡せます（構造的部分型）。",
    },
  ],

  checkpoints: [
    { id: "cp-05-1", description: "`interface` キーワードで型が定義できているか？（`=` なし）" },
    { id: "cp-05-2", description: "`extends` で Animal の全プロパティを引き継げているか？" },
    { id: "cp-05-3", description: "関数の引数に `Animal` 型が使えているか？" },
    { id: "cp-05-4", description: "`Dog` 型の値を `Animal` を受け取る関数に渡せることを確認できたか？" },
  ],

  tags: ["interface", "extends", "継承", "オブジェクト型", "type比較"],
  relatedIds: ["ts-04-type-alias", "ts-03-object-types", "ts-06-union-literal"],
};
