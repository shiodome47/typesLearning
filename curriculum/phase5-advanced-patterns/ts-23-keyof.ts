import type { Lesson } from "../types";

export const lesson23: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-23-keyof",
  order: 23,
  title: "keyof / Indexed Access型",
  category: "type-basics",
  difficulty: 3,

  goal: "`keyof T` でオブジェクト型のキー一覧を型として取り出し、`T[K]` でそのキーに対応する値の型にアクセスできるようになる",

  why: {
    problem:
      "商品一覧の表に「列名をクリックすると並び替わる」機能を付けたとします。" +
      "並び替える列はそのつど変わるので、列の名前を文字列で渡す関数を書きました。" +
      "`sortBy(products, \"price\")` のような形です。動きます。\n\n" +
      "しばらくして、`price` という項目名を `unitPrice` に変えることになりました。" +
      "型定義を直すと、`product.price` と書いていた場所には全部赤線が出ます。順番に直していきます。\n\n" +
      "ところが `sortBy(products, \"price\")` の `\"price\"` には、赤線が出ません。" +
      "TypeScript から見れば、これはただの文字列だからです。中身が項目名かどうかなど知りません。\n\n" +
      "実行すると `product[\"price\"]` は `undefined` を返します。" +
      "`undefined` 同士を比べても大小がつかないので、並び替えボタンを押しても順番が変わりません。" +
      "エラーは出ません。画面は普通に表示されます。" +
      "気づくのは、「安い順に並べても何も起きないんですけど」と問い合わせが来たときです。\n\n" +
      "`\"prcie\"` と打ち間違えた場合もまったく同じです。文字列である限り、TypeScript は何も言いません。",
    insight:
      "`keyof Product` は「Product が実際に持っている項目名だけを集めた型」です。" +
      "世の中のあらゆる文字列ではなく、`\"name\" | \"price\" | \"inStock\"` の3つだけ。" +
      "これを引数の型にすると、`\"prcie\"` と書いた瞬間にその場で赤線が出ます。\n\n" +
      "`Product[\"price\"]` は「その項目に入っている値の型」です。`price` が数値なら `number`。" +
      "項目名から中身の型を引ける、というだけの仕組みです。\n\n" +
      "この2つを `<T, K extends keyof T>` の形で組み合わせると、" +
      "「渡したキーによって戻り値の型が変わる関数」が書けます。" +
      "`getProp(product, \"name\")` は `string` を返し、`getProp(product, \"price\")` は `number` を返す。" +
      "同じ1つの関数なのに、呼び方に応じて型が変わります。\n\n" +
      "要点は、項目名を「ただの文字列」から「その型に本当に存在する名前」へ格上げすることです。" +
      "格上げしておけば、項目名を変えたときに直し漏れた場所へ、コンパイラが赤線を引いてくれます。",
  },
  explanation:
    "`keyof T` は型 T のプロパティ名を Union リテラルとして返します。たとえば `keyof { name: string; age: number }` は `\"name\" | \"age\"` になります。" +
    "`T[K]`（Indexed Access 型）は「型 T のキー K に対応する値の型」を取り出します。`T[\"name\"]` なら `string` です。" +
    "この2つを組み合わせると `function get<T, K extends keyof T>(obj: T, key: K): T[K]` のような型安全なゲッター関数を書けます。" +
    "`Record` や Generics と組み合わせて使う、型システムの中心的な仕組みです。",

  starterCode: `// ベース型（変更しないでください）
type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

// 1. ProductKey 型を定義してください
//    Product のすべてのキーを Union 型として取り出す
//    ヒント: keyof を使います

// 2. getField 関数を実装してください
//    - 引数: obj: Product, key: ProductKey
//    - 戻り値型: Product[ProductKey]（Indexed Access型）
//    - 実装: obj[key] を返す

// 3. getProp というジェネリック版を実装してください
//    - 型引数: T, K extends keyof T
//    - 引数: obj: T, key: K
//    - 戻り値型: T[K]
//    - 実装: obj[key] を返す

// 動作確認
// const p: Product = { name: "TypeScript本", price: 3000, inStock: true };
// console.log(getField(p, "name"));   // "TypeScript本"
// console.log(getProp(p, "price"));   // 3000
`,

  modelAnswer: `type Product = {
  name: string;
  price: number;
  inStock: boolean;
};

// keyof で Product のキーを Union 型に
type ProductKey = keyof Product; // "name" | "price" | "inStock"

// Indexed Access型 で値の型を取り出す
function getField(obj: Product, key: ProductKey): Product[ProductKey] {
  return obj[key];
}

// ジェネリック版（任意の型に対応）
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const p: Product = { name: "TypeScript本", price: 3000, inStock: true };
console.log(getField(p, "name"));   // "TypeScript本"
console.log(getProp(p, "price"));   // 3000`,

  hints: [
    {
      level: 1,
      text: "`type ProductKey = keyof Product` と書くと `\"name\" | \"price\" | \"inStock\"` という Union 型になります。`getField` の引数型に使いましょう。",
    },
    {
      level: 2,
      text: "`getField` の戻り値型は `Product[ProductKey]` です。これが「Indexed Access型」で、キーに対応する値の型（`string | number | boolean`）になります。",
    },
    {
      level: 3,
      text: "`getProp<T, K extends keyof T>(obj: T, key: K): T[K]` — `K extends keyof T` の制約で、渡した obj に存在するキーしか受け付けなくなります。戻り値は `obj[key]` だけです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-23-1",
      description: "`keyof Product` で型を作り、`ProductKey` として定義できているか？",
      verify: {
        kind: "type",
        assert: `
type _c1 = Expect<Equal<ProductKey, "name" | "price" | "inStock">>;`,
      },
    },
    {
      id: "cp-23-2",
      description: "`getField` の戻り値型に Indexed Access型 `Product[ProductKey]` が使えているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<ReturnType<typeof getField>, string | number | boolean>>;
type _c2b = Expect<Equal<Parameters<typeof getField>[1], ProductKey>>;`,
      },
    },
    {
      id: "cp-23-3",
      description: "`getProp` が `<T, K extends keyof T>` の型引数を持っているか？",
      verify: {
        kind: "expect-error",
        assert: `
const _obj3 = { name: "TS本", price: 3000, inStock: true };
const _bad3 = getProp(_obj3, "missing");`,
      },
    },
    {
      id: "cp-23-4",
      description: "`getProp` の戻り値型が `T[K]` になっているか？",
      verify: {
        kind: "type",
        assert: `
const _obj4 = { name: "TS本", price: 3000, inStock: true };
const _name4 = getProp(_obj4, "name");
const _price4 = getProp(_obj4, "price");
type _c4a = Expect<Equal<typeof _name4, string>>;
type _c4b = Expect<Equal<typeof _price4, number>>;`,
      },
    },
  ],

  tags: ["keyof", "Indexed Access型", "Generics", "型安全", "ゲッター"],
  relatedIds: ["ts-11-generics-basics", "ts-21-utility-types", "ts-22-record-type"],
};
