import type { Lesson } from "../types";

export const lesson05: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-05-interface",
  order: 5,
  title: "interface",
  category: "type-basics",
  difficulty: 1,

  goal: "interfaceでオブジェクト型を定義し、typeとの使い分けの感覚をつかめるようになる",

  why: {
    problem:
      "ペットの管理アプリを作ったとします。犬・猫・鳥を扱います。\n\n" +
      "前の教材で型に名前をつけられるようになったので、`Dog` `Cat` `Bird` を定義しました。" +
      "どれも `name` と `sound` を持っていて、そのうえで犬には犬種、猫には室内飼いかどうか、鳥には飛べるかどうかが付きます。" +
      "共通の `name` と `sound` は、3つの定義それぞれに書きました。\n\n" +
      "3ヶ月後、「すべてのペットに年齢を持たせる」ことになりました。" +
      "`Dog` に `age` を足し、`Cat` にも足し、`Bird` は……忘れました。\n\n" +
      "誰も教えてくれません。`Bird` は `age` を持たない型として、それはそれで完全に成立しているからです。" +
      "一覧画面の年齢欄が鳥だけ空っぽになっているのに気づくのは、飼い主から「うちのインコの年齢が出ないんですけど」と連絡が来たときです。\n\n" +
      "もうひとつ。「ペットなら何でも受け取って鳴き声を表示する関数」を書きたいとき、" +
      "引数の型を何にすればいいでしょうか。`Dog | Cat | Bird` と全部並べる？ " +
      "種類が増えるたびに、その関数も書き直すことになります。",
    insight:
      "`interface Dog extends Animal` は、「Dog は Animal であることに加えて、これも持つ」と書く方法です。\n\n" +
      "大事なのは、共通部分を書き写していないことです。`Animal` を指しているだけです。" +
      "だから `Animal` に `age` を足せば、`Dog` も `Cat` も `Bird` も、その瞬間に `age` を持ちます。" +
      "足し忘れるという事故が起きる場所がありません。\n\n" +
      "そして「ペットなら何でも受け取る関数」の引数は `Animal` と書くだけで済みます。" +
      "`Dog` の値をそのまま渡せます。TypeScript は名前ではなく形を見ていて、" +
      "`Dog` は `Animal` が要求する `name` と `sound` を確かに持っているからです。" +
      "種類が10個に増えても、この関数は書き直しになりません。\n\n" +
      "`interface` は `type` とほとんど同じことができます。" +
      "違いを全部覚える必要はいまはありません。" +
      "「オブジェクトの形を積み上げていくなら `interface`、Union 型のようにそれ以外の形にも名前をつけたいなら `type`」" +
      "くらいの感覚で始めて、困ったときに調べ直せば十分です。",
  },
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
    {
      id: "cp-05-1",
      description: "`interface` キーワードで型が定義できているか？（`=` なし）",
      verify: {
        kind: "type",
        assert: `
const _c1: Animal = { name: "Mike", sound: "Nyan" };
type _c1a = Expect<Equal<Animal["name"], string>>;
type _c1b = Expect<Equal<Animal["sound"], string>>;`,
      },
    },
    {
      id: "cp-05-2",
      description: "`extends` で Animal の全プロパティを引き継げているか？",
      verify: {
        kind: "type",
        assert: `
const _c2: Dog = { name: "Pochi", sound: "Woof", breed: "Shiba" };
type _c2a = Expect<Equal<Dog["breed"], string>>;
const _c2b: Animal = _c2;`,
      },
    },
    {
      id: "cp-05-3",
      description: "関数の引数に `Animal` 型が使えているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<Equal<Parameters<typeof describeAnimal>[0], Animal>>;
type _c3b = Expect<Equal<ReturnType<typeof describeAnimal>, string>>;`,
      },
    },
    {
      id: "cp-05-4",
      description: "`Dog` 型の値を `Animal` を受け取る関数に渡せることを確認できたか？",
      verify: {
        kind: "type",
        assert: `
const _c4: Dog = { name: "Pochi", sound: "Woof", breed: "Shiba" };
const _c4msg: string = describeAnimal(_c4);`,
      },
    },
  ],

  tags: ["interface", "extends", "継承", "オブジェクト型", "type比較"],
  relatedIds: ["ts-04-type-alias", "ts-03-object-types", "ts-06-union-literal"],
};
