import type { Lesson } from "../types";

export const lesson07: Lesson = {
  kind: "write",
  id: "ts-07-type-guards",
  order: 7,
  title: "型ガード",
  category: "type-guards",
  difficulty: 2,

  goal: "typeof / in / カスタム型ガードで、Union型の値を実行時に安全に絞り込めるようになる",

  why: {
    problem:
      "ペットの一覧画面を作っています。犬と猫が同じリストに並んでいて、" +
      "カードをクリックすると鳴き声が再生される。犬なら `bark()`、猫なら `meow()` を呼びます。\n\n" +
      "素直に `pet.bark()` と書くと、赤線が出ます。「`Pet` に `bark` はありません」。" +
      "当然です。そのリストには猫も混ざっているので、" +
      "TypeScript から見れば目の前の `pet` が犬だという保証がどこにもありません。\n\n" +
      "締め切りが近いので、`(pet as Dog).bark()` と書いて赤線を消しました。動きます。犬のカードをクリックしたときは。\n\n" +
      "猫のカードをクリックすると `pet.bark is not a function` で画面が固まります。" +
      "テストデータの先頭が犬だったので、開発中は一度も踏みませんでした。\n\n" +
      "困りごとはこうです。「種類の違うものが混ざった値がある。人間には見分けがつく。" +
      "それをどうやって TypeScript に伝えるか」。",
    insight:
      "型ガードは、TypeScript に「いま目の前の値はこっちです」と**確かめた上で**教える方法です。\n\n" +
      "`if (typeof value === \"string\")` と書くと、その `{}` の中だけ `value` は `string` として扱われ、" +
      "`toUpperCase()` が使えるようになります。ブロックを出れば元に戻ります。これを絞り込みと呼びます。\n\n" +
      "道具は3つありますが、聞き方が違うだけです。\n\n" +
      "・`typeof` … 「これは文字列？ 数値？」文字列や数値などの単純な値に使う\n" +
      "・`in` … 「このオブジェクトに `meow` という項目はある？」\n" +
      "・カスタム型ガード（`pet is Cat`）… 猫かどうかの判定を自分で書く\n\n" +
      "`as` との違いは順番です。`as Dog` は「犬だと決めてから使う」。型ガードは「犬だと確かめてから使う」。" +
      "確かめているので、猫が来てもその場で else に流れるだけです。実行時に落ちません。\n\n" +
      "`pet is Cat` という戻り値型は「この関数が true を返したら、その値は Cat だと思ってよい」という約束です。" +
      "中身はただ `boolean` を返す関数ですが、この宣言があると、呼び出した側でも絞り込みが効くようになります。",
  },
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
    {
      id: "cp-07-3",
      description: "カスタム型ガードの戻り値型が `pet is Cat` の形で書けているか？",
      verify: {
        kind: "type",
        assert: `
function _narrowCat(_p: Pet): Cat | null {
  if (isCat(_p)) return _p;
  return null;
}
type _c3 = Expect<Equal<ReturnType<typeof _narrowCat>, Cat | null>>;`,
      },
    },
    {
      id: "cp-07-4",
      description: "型ガード後のブロックで型補完が効く（絞り込みが成立している）か？",
      verify: {
        kind: "type",
        assert: `
function _useCat(_p: Pet): (() => void) | null {
  if (isCat(_p)) return _p.meow;
  return null;
}
type _c4 = Expect<Equal<ReturnType<typeof _useCat>, (() => void) | null>>;`,
      },
    },
  ],

  tags: ["型ガード", "typeof", "in", "カスタム型ガード", "is", "Union型", "絞り込み"],
  relatedIds: ["ts-06-union-literal", "ts-08-array-types"],
};
