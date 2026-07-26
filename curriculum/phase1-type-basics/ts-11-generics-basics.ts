import type { Lesson } from "../types";

export const lesson11: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-11-generics-basics",
  order: 11,
  title: "Generics基礎",
  category: "generics",
  difficulty: 3,

  goal: "型パラメータ<T>を使って、型安全な汎用関数・型を作れるようになる",

  why: {
    problem:
      "サーバーから何かを取ってくる関数が増えてきました。商品を取る、ユーザーを取る、注文を取る。\n\n" +
      "返ってくる形はどれも同じです。`{ success: true, data: 中身 }`、失敗したら `{ success: false, error: \"...\" }`。" +
      "共通の型を1つ作りたくなります。\n\n" +
      "そこで `data: any` と書きました。中身は毎回違うのだから仕方ない、と思ったのです。" +
      "これで商品でもユーザーでも注文でも受け取れます。\n\n" +
      "ここから守りが消えます。`any` は「何が入っているか調べません」という意味なので、" +
      "`res.data.titel` と打ち間違えても赤い線は出ません。" +
      "`res.data` が1件のオブジェクトなのに `res.data.map(...)` と配列のつもりで書いても通ります。" +
      "落ちるのは実行したときです。しかも「map は関数ではありません」という、原因が分かりにくい落ち方をします。\n\n" +
      "「じゃあ `any` をやめて、`ProductResponse` `UserResponse` `OrderResponse` を別々に作ろう」" +
      "——これも苦しい道です。`data` の1行以外はまったく同じ型が、種類の数だけ増えていきます。" +
      "共通部分に項目を足すたびに、全部を直して回ることになります。\n\n" +
      "守りを取るか、書き写しを取るか。この二択に見えているのが問題です。",
    insight:
      "Generics は、型に空欄を1つ用意しておく仕組みです。埋めるのは、使う人です。\n\n" +
      "`type ApiResponse<T>` の `T` がその空欄です。" +
      "`ApiResponse<Product>` と書いた瞬間、`data` は `Product` になります。" +
      "`ApiResponse<User[]>` と書けば `data` は `User[]` です。型は1つのまま、中身だけが呼ぶたびに変わります。\n\n" +
      "`any` との違いはここです。" +
      "`any` は「調べません」。`T` は「あなたが入れた型を覚えていて、そのまま持ち回ります」。" +
      "覚えているので、`res.data.titel` と打ち間違えれば、ちゃんと赤い線が出ます。\n\n" +
      "`function identity<T>(value: T): T` も同じ読み方をします。" +
      "引数と戻り値に同じ `T` が書いてあるのは、「入れたものと同じ型が出てきます」という約束です。" +
      "文字列を入れれば文字列が、商品を入れれば商品が出てくる、と型の上で保証されます。\n\n" +
      "実はもう毎日使っています。`Array<string>` は「中身が文字列の配列」、" +
      "`Promise<User>` は「あとで User が入る箱」。どちらも同じ「空欄を埋める」書き方です。" +
      "自分でも書けるようになる、というのがこの回の話です。",
  },
  explanation:
    "Genericsは「型を引数として受け取る」仕組みです。" +
    "`<T>`と書くことで、呼び出し時に型が決まる柔軟な関数・型を作れます。" +
    "`Array<T>`, `Promise<T>` もGenericsで作られており、" +
    "APIレスポンスの型や汎用ユーティリティによく使います。",

  starterCode: `// 1. identity関数を定義してください
//    任意の型Tの値を受け取り、そのまま返す（引数と同じ型を返す）


// 2. ApiResponse型を定義してください
//    プロパティ: success(boolean), data(T), error?(string)


// 3. wrap関数を定義してください
//    値を受け取り、ApiResponse でラップして返す
//    例: wrap("hello") → { success: true, data: "hello" }
`,

  modelAnswer: `// 1. identity: 受け取った値をそのまま返す汎用関数
function identity<T>(value: T): T {
  return value;
}

const str = identity("hello"); // 型: string
const num = identity(42);      // 型: number

// 2. ApiResponse: 任意の型をラップするレスポンス型
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// 3. wrap: 値をApiResponseでラップする
function wrap<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

const result = wrap<string[]>(["Alice", "Bob"]);
// result.data の型は string[]`,

  hints: [
    {
      level: 1,
      text: "関数名の後に `<T>` をつけると型パラメータを宣言できます。引数と戻り値で同じ `T` を使えます。",
    },
    {
      level: 2,
      text: "`function identity<T>(value: T): T` / `type ApiResponse<T> = { data: T; ... }` の形です。",
    },
    {
      level: 3,
      text: "`function wrap<T>(data: T): ApiResponse<T> { return { success: true, data }; }` — Tが呼び出し元から伝搬することを意識する",
    },
  ],

  checkpoints: [
    {
      id: "cp-11-1",
      description: "`<T>` を関数名の後に書けているか？",
      verify: {
        kind: "type",
        assert: `
const _c1 = identity<number>(42);
type _c1a = Expect<Equal<typeof _c1, number>>;`,
      },
    },
    {
      id: "cp-11-2",
      description: "引数と戻り値で同じ型パラメータ `T` を使えているか？",
      verify: {
        kind: "type",
        assert: `
let _c2v = "hello";
const _c2 = identity(_c2v);
type _c2a = Expect<Equal<typeof _c2, string>>;
const _c2b = identity({ id: 1 });
type _c2c = Expect<Equal<typeof _c2b, { id: number }>>;`,
      },
    },
    {
      id: "cp-11-3",
      description: "`type ApiResponse<T>` のようにtype定義にも `<T>` がつけられているか？",
      verify: {
        kind: "type",
        assert: `type _c3 = Expect<Equal<ApiResponse<number>, { success: boolean; data: number; error?: string }>>;`,
      },
    },
    {
      id: "cp-11-4",
      description: "`wrap<string[]>(...)` のように型引数を明示して呼び出せるか？",
      verify: {
        kind: "type",
        assert: `
const _c4 = wrap<string[]>(["Alice", "Bob"]);
type _c4a = Expect<Equal<typeof _c4, ApiResponse<string[]>>>;
type _c4b = Expect<Equal<(typeof _c4)["data"], string[]>>;`,
      },
    },
  ],

  tags: ["Generics", "型パラメータ", "汎用関数", "ApiResponse", "再利用"],
  relatedIds: ["ts-04-type-alias", "ts-13-async-await"],
};
