import type { Lesson } from "../types";

export const lesson03: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-03-object-types",
  order: 3,
  title: "オブジェクトの型注釈",
  category: "objects",
  difficulty: 1,

  goal: "オブジェクトの構造をインライン型注釈で表現できるようになる（typeエイリアス前段階）",

  why: {
    problem:
      "注文の内容を画面に出す処理を書いたとします。渡ってくるのは注文を表すオブジェクトで、" +
      "商品名と個数が入っている、と聞いています。\n\n" +
      "サーバーがまだ出来ていなかったので、自分で仮のデータを作って進めました。" +
      "`{ itemName: \"りんご\", count: 3 }`。これを使って `order.itemName` と書き、表示は完璧です。\n\n" +
      "サーバーが出来上がって、本物のデータをつなぎます。画面には「ご注文: undefined」と出ました。\n\n" +
      "本物のキーは `itemName` ではなく `item_name` だったのです。" +
      "JavaScript では、存在しないプロパティを読んでも怒られません。静かに `undefined` が返ってくるだけです。" +
      "だから間違いは、読んだ場所ではなく、`undefined` が画面に出た場所や、" +
      "`undefined.toUpperCase()` で突然落ちた場所で表面化します。原因の行からは遠く離れています。\n\n" +
      "同じことは自分の打ち間違いでも起きます。`user.name` を `user.nema` と打つ。" +
      "変数名なら「そんな変数はありません」と怒られますが、プロパティ名は怒られません。",
    insight:
      "オブジェクトに型を書くのは、「ここには、この形のものしか来ません」と先に宣言することです。\n\n" +
      "`item: { id: number; label: string }` と書いた瞬間、`item.` まで打つとエディタが `id` と `label` を候補に出してくれます。" +
      "候補から選ぶので、そもそも打ち間違えようがありません。" +
      "手で `nema` と打てば、その場で赤い線が引かれます。画面を見に行く必要はありません。\n\n" +
      "書き方は、値の見た目をほぼそのまま型にしただけです。" +
      "`{ name: \"Alice\", age: 25 }` という値に対して `{ name: string; age: number }` という型。" +
      "値では `,` で区切るところを、型では `;` で区切るのが慣例、という違いくらいです。\n\n" +
      "`count?: number` の `?` は「無いこともある」という明記です。" +
      "これを書いておくと、TypeScript は「無いかもしれないものを、有る前提で使っていないか」を見張ってくれます。" +
      "無いかもしれない、と分かっていること自体が守りになります。",
  },
  explanation:
    "オブジェクト変数には `{ プロパティ名: 型 }` の形でインライン型を書けます。" +
    "プロパティをセミコロンで区切るのが慣例です。" +
    "省略可能なプロパティは `age?: number` と書きます。" +
    "同じ型を繰り返す場合は `type` エイリアス（#04）を使うとスッキリします。",

  starterCode: `// 1. user 変数を定義してください（インライン型注釈で）
//    プロパティ: name(string), age(number), isAdmin(boolean)

// 2. getLabel 関数を定義してください
//    引数: item（プロパティ: id(number), label(string), count?(number, 省略可能)）
//    戻り値: string（"id:1 label:完了" の形式）
`,

  modelAnswer: `const user: { name: string; age: number; isAdmin: boolean } = {
  name: "Alice",
  age: 25,
  isAdmin: false,
};

function getLabel(item: { id: number; label: string; count?: number }): string {
  return "id:" + item.id + " label:" + item.label;
}

console.log(user.name);                         // "Alice"
console.log(getLabel({ id: 1, label: "完了" })); // "id:1 label:完了"`,

  hints: [
    {
      level: 1,
      text: "`const user: { name: string; age: number; isAdmin: boolean } = { ... }` の形でインライン型を書きます。`,` ではなく `;` 区切りが慣例です。",
    },
    {
      level: 2,
      text: "関数の引数も `item: { id: number; label: string; count?: number }` のようにオブジェクト型を直接書けます。",
    },
    {
      level: 3,
      text: "同じ型を何度も書くなら `type Label = { id: number; label: string }` のようにエイリアス化（#04）するとスッキリします。",
    },
  ],

  checkpoints: [
    {
      id: "cp-03-1",
      description: "変数にインライン型注釈 `{ プロパティ: 型; ... }` が書けているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<typeof user, { name: string; age: number; isAdmin: boolean }>>;`,
      },
    },
    { id: "cp-03-2", description: "プロパティを `;` で区切っているか？" },
    {
      id: "cp-03-3",
      description: "関数の引数にオブジェクト型を直接書けているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<Equal<Parameters<typeof getLabel>[0], { id: number; label: string; count?: number }>>;
type _c3b = Expect<Equal<ReturnType<typeof getLabel>, string>>;`,
      },
    },
    {
      id: "cp-03-4",
      description: "省略可能プロパティに `?:` が使えているか？",
      verify: {
        kind: "type",
        assert: `const _c4: Parameters<typeof getLabel>[0] = { id: 1, label: "完了" };`,
      },
    },
  ],

  tags: ["オブジェクト", "インライン型", "プロパティ", "optional", "型注釈"],
  relatedIds: ["ts-02-function-types", "ts-04-type-alias", "ts-05-interface"],
};
