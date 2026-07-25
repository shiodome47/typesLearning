import type { Lesson } from "../types";

export const lesson30: Lesson = {
  kind: "write",
  id: "ts-30-utility-returntype",
  order: 30,
  title: "ReturnType / Parameters / Awaited",
  category: "generics",
  difficulty: 3,

  goal: "`ReturnType` / `Parameters` / `Awaited` で既存の関数から型情報を取り出し、型の二重定義をなくせるようになる",

  why: {
    problem:
      "商品情報を取ってくる `fetchProduct` という関数があります。返すのは `{ id, name, price }` です。\n\n" +
      "この結果を表示するコンポーネントを作ることになりました。props の型が必要です。" +
      "そこで `type ProductView = { id: number; name: string; price: number }` と、関数の戻り値を見ながら手で書き写します。" +
      "同じ形の型が、いま2ヶ所に存在することになりました。\n\n" +
      "数週間後、仕様が変わります。海外対応で `price: number` が `price: { amount: number; currency: string }` になりました。" +
      "`fetchProduct` を直します。動作確認もします。完了です。\n\n" +
      "`ProductView` は古いままです。" +
      "そして TypeScript は何も言いません。この2つは「たまたま形が似ていた別々の型」なので、" +
      "片方が変わったからといって、もう片方に文句を言う理由がないのです。\n\n" +
      "気づくのは、画面に `[object Object] 円` と表示されたときです。" +
      "書き写した型は、書き写した瞬間から本物と切り離されます。そして切り離されたことは誰にも通知されません。",
    insight:
      "この教材で覚えるのは、型を「書き写す」代わりに「指差す」書き方です。\n\n" +
      "`ReturnType<typeof fetchProduct>` は、「`fetchProduct` が返すもの、と同じ型」という意味です。" +
      "中身が何かはここには書きません。あちらを見てくれ、と指差すだけです。" +
      "だから `fetchProduct` を直せば、指差した先も自動で新しい形になります。ズレようがありません。\n\n" +
      "`typeof fetchProduct` は「その関数そのものの型」を取り出す書き方です。" +
      "値の世界にある関数を、型の世界に持ち込むための入り口だと思ってください。\n\n" +
      "同じ発想の道具が3つあります。\n\n" +
      "・`ReturnType<...>` … 返すものは何か\n" +
      "・`Parameters<...>` … 受け取るものは何か（順番付きのリストで出てきます）\n" +
      "・`Awaited<...>` … `Promise` の包みを剥がして、中身だけ取り出す\n\n" +
      "非同期関数は `Promise<{...}>` を返すので、`Awaited<ReturnType<typeof fetchProduct>>` と重ねると" +
      "「待ったあとに手に入るもの」だけが残ります。" +
      "外部ライブラリの関数のように、型がexportされていなくて書き写すしかなかったものにも同じ手が使えます。",
  },
  explanation:
    "TypeScript には既存の関数から型情報を取り出す組み込みユーティリティ型があります。" +
    "`ReturnType<typeof fn>` は関数 `fn` の戻り値型を、`Parameters<typeof fn>` は引数型のタプルをそれぞれ取得します。" +
    "`Awaited<T>` は `Promise<T>` の解決後の型 `T` を取り出します。" +
    "これらを組み合わせると `Awaited<ReturnType<typeof fetchUser>>` で非同期関数の解決済み戻り値型が得られます。" +
    "外部ライブラリの関数型を再利用したり、ラッパー関数を型安全に書く際に毎回登場するパターンです。",

  starterCode: `// ── Part 1: ReturnType / Parameters ───────────────────────
function formatUser(id: number, name: string): { id: number; label: string } {
  return { id, label: \`[\${id}] \${name}\` };
}

// 1. FormatUserReturn 型を ReturnType で定義してください
//    → { id: number; label: string } になるはずです

// 2. FormatUserParams 型を Parameters で定義してください
//    → [number, string] になるはずです

// 型テスト（コメントを外して確認）
// const r: FormatUserReturn = { id: 1, label: "[1] Alice" }; // OK
// const p: FormatUserParams = [1, "Alice"];                   // OK

// ── Part 2: Awaited<ReturnType<...>> ──────────────────────
async function fetchProduct(
  id: number
): Promise<{ id: number; name: string; price: number }> {
  return { id, name: "Product", price: 100 };
}

// 3. FetchProductResult 型を Awaited<ReturnType<...>> で定義してください
//    → Promise が剥がれて { id: number; name: string; price: number } になるはずです

// ── Part 3: ラッパー関数 ──────────────────────────────────
// 4. withLogging<T extends (...args: any[]) => any>(fn: T) を実装してください
//    - fn と同じ引数・戻り値を持つ関数を返す
//    - 呼び出し前に console.log("calling:", fn.name) を出力する
//    - 引数型に Parameters<T>、戻り値型に ReturnType<T> を使うこと

// 動作確認
// const loggedFormat = withLogging(formatUser);
// loggedFormat(1, "Alice"); // "calling: formatUser" → { id: 1, label: "[1] Alice" }
`,

  modelAnswer: `function formatUser(id: number, name: string): { id: number; label: string } {
  return { id, label: \`[\${id}] \${name}\` };
}

// Part 1
type FormatUserReturn = ReturnType<typeof formatUser>;
// → { id: number; label: string }

type FormatUserParams = Parameters<typeof formatUser>;
// → [number, string]

// Part 2
async function fetchProduct(
  id: number
): Promise<{ id: number; name: string; price: number }> {
  return { id, name: "Product", price: 100 };
}

type FetchProductResult = Awaited<ReturnType<typeof fetchProduct>>;
// → { id: number; name: string; price: number }

// Part 3
// 制約は (...args: any[]) => any にする。unknown[] にすると引数の反変性により
// (id: number, name: string) => ... のような具体的な関数を受け取れなくなる。
function withLogging<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log("calling:", fn.name);
    return fn(...args) as ReturnType<T>;
  };
}

// 動作確認
const loggedFormat = withLogging(formatUser);
loggedFormat(1, "Alice"); // "calling: formatUser" → { id: 1, label: "[1] Alice" }`,

  hints: [
    {
      level: 1,
      text: "`ReturnType<typeof formatUser>` — `typeof` で関数の型を取り、`ReturnType<>` でその戻り値型を取り出します。`Parameters<>` は引数のタプル型になります。どちらも `typeof 関数名` をそのまま渡すだけです。",
    },
    {
      level: 2,
      text: "`Awaited<ReturnType<typeof fetchProduct>>` — まず `ReturnType` で `Promise<{...}>` を取得し、さらに `Awaited<>` で包むと `Promise` が剥がれて `{...}` だけが残ります。入れ子の順番に注意してください。",
    },
    {
      level: 3,
      text: "`withLogging` のシグネチャは `<T extends (...args: any[]) => any>(fn: T)` です。ここを `unknown[]` にすると引数の反変性で具体的な関数を渡せなくなります。返す関数の引数は `(...args: Parameters<T>)` 、戻り値型は `ReturnType<T>` とし、`fn(...args) as ReturnType<T>` でキャストして返します。",
    },
  ],

  checkpoints: [
    {
      id: "cp-30-1",
      description: "`ReturnType<typeof formatUser>` で戻り値型が取り出せているか？",
      verify: {
        kind: "type",
        assert: `
type _c1 = Expect<Equal<FormatUserReturn, { id: number; label: string }>>;`,
      },
    },
    {
      id: "cp-30-2",
      description: "`Parameters<typeof formatUser>` で引数型のタプルが取り出せているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<FormatUserParams["length"], 2>>;
type _c2b = Expect<Equal<FormatUserParams[0], number>>;
type _c2c = Expect<Equal<FormatUserParams[1], string>>;`,
      },
    },
    {
      id: "cp-30-3",
      description: "`Awaited<ReturnType<typeof fetchProduct>>` で `Promise` が剥がれた型が得られるか？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<
  Equal<FetchProductResult, { id: number; name: string; price: number }>
>;`,
      },
    },
    {
      id: "cp-30-4",
      description: "`withLogging` の返す関数の引数に `Parameters<T>`、戻り値に `ReturnType<T>` が使われているか？",
      verify: {
        kind: "type",
        assert: `
const _logged4 = withLogging(formatUser);
type _P4 = Parameters<typeof _logged4>;
type _c4a = Expect<Equal<_P4["length"], 2>>;
type _c4b = Expect<Equal<_P4[0], number>>;
type _c4c = Expect<Equal<_P4[1], string>>;
type _c4d = Expect<
  Equal<ReturnType<typeof _logged4>, { id: number; label: string }>
>;`,
      },
    },
  ],

  tags: ["ReturnType", "Parameters", "Awaited", "typeof", "Generics", "ラッパー関数", "型推論"],
  relatedIds: ["ts-11-generics-basics", "ts-12-promise", "ts-13-async-await", "ts-15-api-fetch", "ts-21-utility-types"],
};
