import type { Lesson } from "../types";

export const lesson36: Lesson = {
  kind: "diagnose",
  language: "typescript",
  id: "ts-36-diagnose-any-leak",
  order: 36,
  title: "診断: 型はあるのに何も守っていないコード",
  category: "code-review",
  difficulty: 4,

  goal: "`any` と非nullアサーションが型の保証を無効化していることを見抜き、型が実際に効くコードに直せるようになる",

  why: {
    problem:
      "`any` や `!` は、悪意で書かれるものではありません。ほとんどの場合、赤い波線を消すために書かれます。\n\n" +
      "締め切り前です。エディタが `Object is possibly 'undefined'` と言ってきます。" +
      "でも動作確認はしていて、その場面では値がちゃんとあります。" +
      "`!` を1文字足すと赤線が消えます。コミットします。ここまでは、誰でもやります。\n\n" +
      "あるいは、外部ライブラリの戻り値の型がどうしても合わなくて、1ヶ所だけ `any` を書きます。" +
      "翌日、別の人がその関数を使います。引数が `any` なので何を渡しても通ります。" +
      "戻り値も `any` なので、そこから先で計算した値も全部 `any` です。" +
      "1文字の `any` は、そこを通るコード全体の型チェックを、静かに無効にしていきます。\n\n" +
      "そして一番の問題は、この状態でもコードが「型が付いている真面目なコード」に見えることです。" +
      "`function total(products: any): number` には型注釈が2つ書いてあります。" +
      "レビューで開いても、丁寧に型を書いている画面に見えます。" +
      "実際には、この関数に文字列を渡してもコンパイルは通ります。\n\n" +
      "生成AIが書いたコードでも同じことが起きます。" +
      "AI は「型エラーが出ないコード」を書くのが得意なので、型が合わないときに `any` や `!` で解決してくることがあります。" +
      "人間より速く、大量に。レビューする側がこれを見抜けなければ、" +
      "型注釈だけが並んでいて何も守っていないコードが積み上がります。\n\n" +
      "気づくのは本番で `Cannot read properties of undefined` が出たときです。" +
      "しかもどこで `any` が混入したのかは、エラーログには書いてありません。",
    insight:
      "見分けるための問いは「この型注釈は、何を禁止しているか？」です。\n\n" +
      "型がちゃんと仕事をしているとき、そこには必ず「書けなくなること」があります。" +
      "`products: Product[]` と書けば、文字列は渡せません。存在しないプロパティは読めません。" +
      "綴りを間違えれば赤線が出ます。禁止があるから、守られているのです。\n\n" +
      "`any` は何も禁止しません。" +
      "`any` の値には何を代入してもよく、どんなプロパティも読めて、関数として呼ぶこともできます。" +
      "型注釈の形をしているのに、禁止がゼロ。「書いてあるのに効いていない」とはこの意味です。\n\n" +
      "`!` も構造は同じです。" +
      "`find` の戻り値が `Product | undefined` になっているのは、" +
      "TypeScript が「見つからなかった場合の処理を書いてください」と要求しているということです。" +
      "`!` はその要求を取り下げさせるだけで、見つからない場合そのものは相変わらず起きます。" +
      "対処が書かれていない状態になっただけです。\n\n" +
      "だから `any` を消すと、たいてい新しい赤線がいくつも出てきます。" +
      "これはコードを壊したのではありません。`any` が隠していた本当の問題が、やっと見えたということです。" +
      "赤線が増えたら、それは前進です。",
  },
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
