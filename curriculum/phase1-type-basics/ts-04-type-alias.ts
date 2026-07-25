import type { Lesson } from "../types";

export const lesson04: Lesson = {
  kind: "write",
  id: "ts-04-type-alias",
  order: 4,
  title: "type エイリアス",
  category: "type-basics",
  difficulty: 1,

  goal: "type を使って複雑な型に名前をつけ、再利用できるようになる",

  why: {
    problem:
      "会員情報を扱う画面が増えてきました。プロフィール画面、設定画面、管理者用の一覧画面。" +
      "どの関数も同じ会員オブジェクトを受け取ります。\n\n" +
      "前の教材のやり方で、それぞれの関数の引数に " +
      "`{ name: string; age: number; isAdmin: boolean }` と書き写しました。今は3ヶ所です。動きます。\n\n" +
      "半年後、「会員には必ずメールアドレスを持たせる」と決まりました。" +
      "あなたは `name: string; age: number` という文字列を検索して、見つかった場所を直して回ります。" +
      "そのころには3ヶ所ではなく11ヶ所になっていて、しかも改行の入れ方がバラバラなので検索に引っかからないものもあります。\n\n" +
      "さらに悪いことがあります。書き写すときに、1ヶ所だけ `age: string` と打ち間違えていたとします。" +
      "TypeScript はこれを間違いだと思いません。" +
      "その関数にとっては「年齢が文字列の会員」が正しい形なので、堂々と成立してしまうのです。" +
      "気づくのは、その画面だけ年齢の並び替えがおかしいと報告されたときです。\n\n" +
      "そして読む側の問題もあります。関数の宣言に長い `{ ... }` がベタ書きされていると、" +
      "「これは会員なのか、注文者なのか、それとも別の何かなのか」が読んでも分かりません。",
    insight:
      "`type User = { ... }` は、型に名前をつける道具です。それだけです。\n\n" +
      "名前をつけると、定義が世界に1ヶ所だけになります。" +
      "メールアドレスを足すときに直すのは、その1ヶ所です。" +
      "`User` と書いてあった場所すべてに、その変更が自動的に届きます。" +
      "探して回る作業が消えるので、探し漏れも起きません。\n\n" +
      "書き写しが無くなるので、写し間違いも起きません。" +
      "`age: string` と打ち間違える機会そのものが無くなります。\n\n" +
      "そして `user: User` と書いてあると、読んだ人に「これは会員だ」と一言で伝わります。" +
      "型の中身を目で追わなくても、名前だけで用途が分かる。これも同じくらい大事な効果です。\n\n" +
      "`type` は変数に名前をつけるのと同じ感覚で使えます。" +
      "オブジェクトの形だけでなく、このあと出てくる Union 型や関数の形にも、同じやり方で名前をつけられます。",
  },
  explanation:
    "`type` キーワードを使うと型に名前をつけられます（型エイリアス）。" +
    "同じ型を複数箇所で使う場合や、型の意味を明確にしたい場合に使います。" +
    "オブジェクト型・Union型・関数型など、あらゆる型に名前をつけられます。" +
    "プロパティはセミコロン区切りで書くのが慣例です。",

  starterCode: `// 1. User型を定義してください
//    プロパティ: name(string), age(number), isAdmin(boolean)


// 2. greetUser関数を定義してください
//    引数: User型の user
//    戻り値: string（"Hello, Alice! Age: 25" の形式）
`,

  modelAnswer: `type User = {
  name: string;
  age: number;
  isAdmin: boolean;
};

function greetUser(user: User): string {
  return "Hello, " + user.name + "! Age: " + user.age;
}

const alice: User = {
  name: "Alice",
  age: 25,
  isAdmin: false,
};

console.log(greetUser(alice)); // "Hello, Alice! Age: 25"`,

  hints: [
    {
      level: 1,
      text: "`type 型名 = { プロパティ名: 型; ... }` の形でオブジェクト型を定義できます。",
    },
    {
      level: 2,
      text: "プロパティはセミコロン区切りで書きます。定義した型名を引数の型として `user: User` のように使います。",
    },
    {
      level: 3,
      text: "`type User = { name: string; age: number; isAdmin: boolean; }` → 関数引数で `user: User` と使う",
    },
  ],

  checkpoints: [
    {
      id: "cp-04-1",
      description: "`type` キーワードで型を定義できているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<NotAny<User>>;`,
      },
    },
    {
      id: "cp-04-2",
      description: "プロパティが3つすべて正しい型で書けているか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<User, { name: string; age: number; isAdmin: boolean }>>;`,
      },
    },
    {
      id: "cp-04-3",
      description: "定義した型を関数の引数で使えているか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<Equal<Parameters<typeof greetUser>[0], User>>;
type _c3b = Expect<Equal<ReturnType<typeof greetUser>, string>>;`,
      },
    },
    {
      id: "cp-04-4",
      description: "変数宣言で `: User` と型注釈として使えているか？",
      verify: {
        kind: "type",
        assert: `type _c4 = Expect<Equal<typeof alice, User>>;`,
      },
    },
  ],

  tags: ["type", "型エイリアス", "オブジェクト型", "再利用"],
  relatedIds: ["ts-01-variable-types", "ts-05-interface"],
};
