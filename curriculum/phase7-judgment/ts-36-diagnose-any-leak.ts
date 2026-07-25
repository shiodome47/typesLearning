import type { Lesson } from "../types";

export const lesson36: Lesson = {
  kind: "diagnose",
  id: "ts-36-diagnose-any-leak",
  order: 36,
  title: "診断: 型はあるのに何も守っていないコード",
  category: "code-review",
  difficulty: 4,

  goal: "`any` と非nullアサーションが型の保証を無効化していることを見抜き、型が実際に効くコードに直せるようになる",
  explanation:
    "生成AIが書くコードや、急いで書かれたコードには「型注釈は付いているのに、実質どの保証もない」ものが混ざります。" +
    "`any` は代入も呼び出しもプロパティアクセスもすべて素通しにし、そこから先の型推論も汚染します。" +
    "`!`（非nullアサーション）は「絶対に null ではない」と宣言するだけで、実行時には何も確認しません。" +
    "型注釈があること と 型が守ってくれること は別です。レビューではこの2つを区別して見る必要があります。",

  symptom:
    "型定義もあるし型エラーも出ていないのに、`undefined is not a function` や `Cannot read properties of undefined` が本番で頻発する。",

  brokenCode: `type Product = {
  id: number;
  name: string;
  price: number;
};

// 商品一覧から条件に合うものを探して整形する
function findAndFormat(products: any[], id: number): string {
  const found = products.find((p) => p.id === id);
  return \`\${found!.name}: \${found!.price}円\`;
}

// 合計金額を計算する
function total(products: any): number {
  return products.reduce((sum: any, p: any) => sum + p.price, 0);
}

const list: Product[] = [{ id: 1, name: "ペン", price: 100 }];
console.log(findAndFormat(list, 999));
console.log(total(list));`,

  defects: [
    {
      id: "d-36-1",
      summary: "引数が `any[]` なので中身の型が完全に失われている",
      why:
        "`products: any[]` にすると `p.id` も `p.name` も `any` になり、綴り間違い（`p.nmae`）すら通ります。" +
        "`Product[]` と書けば、存在しないプロパティはコンパイル時に弾けます。",
      marker: "function findAndFormat(products: any[], id: number): string",
    },
    {
      id: "d-36-2",
      summary: "`!` で `undefined` の可能性を握りつぶしている",
      why:
        "`find` は見つからなければ `undefined` を返します。`found!` は「絶対にある」と宣言するだけで実行時には何も確認しません。" +
        "この例では id=999 が存在しないため、その場で落ちます。型は警告する機会を持っていたのに、`!` がそれを消しました。",
      marker: "return `${found!.name}: ${found!.price}円`;",
    },
    {
      id: "d-36-3",
      summary: "`any` が戻り値の型推論まで汚染している",
      why:
        "`reduce((sum: any, p: any) => ...)` の結果は `any` です。`total` は `number` を返すと宣言していますが、" +
        "実際には何が返っても型チェックは通ります。`any` は境界を越えて周囲の型安全性を溶かします。",
      marker: "return products.reduce((sum: any, p: any) => sum + p.price, 0);",
    },
  ],

  fixedCode: `type Product = {
  id: number;
  name: string;
  price: number;
};

// 見つからない可能性を型で表現し、呼び出し側に処理を強制する
function findAndFormat(products: Product[], id: number): string | undefined {
  const found = products.find((p) => p.id === id);
  if (!found) return undefined;
  return \`\${found.name}: \${found.price}円\`;
}

// any を排除すると sum も p も推論が効く
function total(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price, 0);
}

const list: Product[] = [{ id: 1, name: "ペン", price: 100 }];

const formatted = findAndFormat(list, 999);
console.log(formatted ?? "該当する商品がありません");
console.log(total(list));`,

  hints: [
    {
      level: 1,
      text: "まず `any` をすべて具体的な型に置き換えてください。`any` を消すと、これまで隠れていた本当の問題（`find` の戻り値が `undefined` になりうること）が型エラーとして浮かび上がります。",
    },
    {
      level: 2,
      text: "`!` は使わずに `if (!found) return undefined;` で早期リターンします。すると以降のコードでは `found` が `Product` に絞り込まれます。関数の戻り値型は `string | undefined` になります。",
    },
    {
      level: 3,
      text: "`total` は `products: Product[]` にすれば `reduce` のコールバックの `sum` と `p` は型注釈なしで正しく推論されます。呼び出し側は `formatted ?? \"該当する商品がありません\"` のように `undefined` を処理します。",
    },
  ],

  checkpoints: [
    {
      id: "cp-36-1",
      description: "`findAndFormat` の第1引数が `Product[]` になっているか（`any[]` を排除したか）？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Parameters<typeof findAndFormat>[0], Product[]>>;`,
      },
    },
    {
      id: "cp-36-2",
      description: "見つからない可能性が戻り値の型に表れているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof findAndFormat>, string | undefined>>;`,
      },
    },
    {
      id: "cp-36-3",
      description: "`total` の戻り値が `any` でなく `number` になっているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<NotAny<ReturnType<typeof total>>>;
type _c3b = Expect<Equal<ReturnType<typeof total>, number>>;`,
      },
    },
    {
      id: "cp-36-4",
      description: "`total` に `Product[]` 以外を渡すと型エラーになるか？",
      verify: {
        kind: "expect-error",
        assert: `total("これは配列ではない");`,
      },
    },
    {
      id: "cp-36-5",
      description: "存在しないプロパティへのアクセスが型エラーになるか（`any[]` が残っていないか）？",
      verify: {
        kind: "expect-error",
        assert: `
const _p: Product = { id: 1, name: "x", price: 1 };
const _typo = _p.nmae;`,
      },
    },
  ],

  tags: ["any", "非nullアサーション", "型推論", "コードレビュー", "AI生成コード", "undefined"],
  relatedIds: ["ts-09-optional", "ts-07-type-guards", "ts-08-array-types"],
};
