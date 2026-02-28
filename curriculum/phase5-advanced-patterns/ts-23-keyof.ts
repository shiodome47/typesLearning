import type { Lesson } from "../types";

export const lesson23: Lesson = {
  id: "ts-23-keyof",
  order: 23,
  title: "keyof / Indexed Access型",
  category: "type-basics",
  difficulty: 3,

  goal: "`keyof T` でオブジェクト型のキー一覧を型として取り出し、`T[K]` でそのキーに対応する値の型にアクセスできるようになる",
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
    { id: "cp-23-1", description: "`keyof Product` で型を作り、`ProductKey` として定義できているか？" },
    { id: "cp-23-2", description: "`getField` の戻り値型に Indexed Access型 `Product[ProductKey]` が使えているか？" },
    { id: "cp-23-3", description: "`getProp` が `<T, K extends keyof T>` の型引数を持っているか？" },
    { id: "cp-23-4", description: "`getProp` の戻り値型が `T[K]` になっているか？" },
  ],

  tags: ["keyof", "Indexed Access型", "Generics", "型安全", "ゲッター"],
  relatedIds: ["ts-11-generics", "ts-21-utility-types", "ts-22-record-type"],
};
