import type { Lesson } from "../types";

export const lesson09: Lesson = {
  kind: "write",
  id: "ts-09-optional",
  order: 9,
  title: "Optional / ? / undefined / ?? / ?.",
  category: "type-basics",
  difficulty: 2,

  goal: "optional chaining（?.）と nullish coalescing（??）を使い、null/undefinedを安全に扱えるようになる",

  why: {
    problem:
      "会員情報の画面です。住所は任意入力なので、登録していない人がいます。\n\n" +
      "`user.address.city` と書きました。手元のテストデータは3人とも住所を入れてあったので、完璧に動きます。\n\n" +
      "リリース後、住所を登録していない利用者だけ、マイページが真っ白になります。" +
      "`Cannot read properties of undefined (reading 'city')`。" +
      "`address` が無い人の `address` は `undefined` で、`undefined` から `city` を読もうとした瞬間に、" +
      "その先の処理が全部止まります。名前も注文履歴も表示されません。市区町村ひとつのために。\n\n" +
      "別の日、今度は「今月の購入回数」を出すことにしました。" +
      "まだ取得できていないときは「データなし」と出したいので、`count || \"データなし\"` と書きます。\n\n" +
      "すると、今月まだ買っていない人——`count` が `0` の人——にも「データなし」と表示されます。" +
      "`0` は正しく取れているのに、JavaScript が `0` を「無い」の仲間として扱うからです。" +
      "0回と未取得は別のことなのに、画面では見分けがつきません。",
    insight:
      "`?.` は「左側が `null` か `undefined` なら、そこで止まって `undefined` を返す」という書き方です。\n\n" +
      "`user.address?.city` は「`address` があれば `city` を読む、無ければ何もせず `undefined`」。" +
      "落ちません、止まるだけです。画面全体を巻き込んで死ぬ代わりに、その1項目が `undefined` になります。\n\n" +
      "`??` は「左側が `null` か `undefined` のときだけ、右側を使う」。" +
      "`user.address?.city ?? \"不明\"` で「住所があれば市区町村、無ければ 不明」になります。" +
      "`?.` が空欄を作り、`??` がそこを埋める、という組み合わせです。\n\n" +
      "`||` との違いはここです。`||` は `0` も `\"\"` も `false` も「無い」の仲間に入れてしまいます。" +
      "`??` が見るのは `null` と `undefined` だけ。だから `0 ?? \"データなし\"` は `0` のままです。" +
      "**迷ったら `??`** で構いません。\n\n" +
      "型の側では、`address?:` の `?` が「この項目は無いかもしれない」という申告です。" +
      "この `?` があるから TypeScript は `user.address.city` に赤線を引いてくれます。" +
      "逆に言えば、無いかもしれないものは型にそう書いておくことが出発点です。",
  },
  explanation:
    "`?.` はプロパティやメソッド呼び出しの前につけ、nullやundefinedなら `undefined` を返します（エラーにならない）。" +
    "`??` は左辺が `null` または `undefined` のときだけ右辺の値を返します（`||` との違い: `0` や `''` は通す）。" +
    "APIレスポンスや `find` の結果など「値があるかもしれない」状況で頻繁に使います。",

  starterCode: `type User = {
  id: number;
  name: string;
  address?: {
    city: string;
  };
};

// 1. getCity 関数を定義してください
//    引数: user(User)
//    address?.city を使って city を返す
//    city がなければ "不明" を返す（?? を使う）

// 2. getUserName 関数を定義してください
//    引数: user(User | null | undefined)
//    ?. と ?? を組み合わせて name を返す
//    user が null/undefined なら "ゲスト" を返す
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  address?: {
    city: string;
  };
};

function getCity(user: User): string {
  return user.address?.city ?? "不明";
}

function getUserName(user: User | null | undefined): string {
  return user?.name ?? "ゲスト";
}

const alice: User = { id: 1, name: "Alice", address: { city: "Tokyo" } };
const bob: User = { id: 2, name: "Bob" }; // address なし

console.log(getCity(alice)); // "Tokyo"
console.log(getCity(bob));   // "不明"
console.log(getUserName(alice)); // "Alice"
console.log(getUserName(null));  // "ゲスト"`,

  hints: [
    {
      level: 1,
      text: "`user.address?.city` と書くと、`address` が `undefined` のとき全体が `undefined` になります（エラーにならない）。",
    },
    {
      level: 2,
      text: "`user.address?.city ?? '不明'` は「cityがundefinedなら'不明'を使う」という意味です。`??` は `null/undefined` のときだけ右辺を返します（`0` や `''` は左辺をそのまま返す）。",
    },
    {
      level: 3,
      text: "`return user?.name ?? 'ゲスト'` — `user` 自体が null/undefined の場合は `?.` が `undefined` を返し、`??` が 'ゲスト' を返します。",
    },
  ],

  checkpoints: [
    {
      id: "cp-09-1",
      description: "`?.` でnull/undefinedを安全にチェーンできているか？",
      verify: {
        kind: "type",
        assert: `
// address を持たない User を渡せる（= address が optional）ことを確認
const _noAddress: User = { id: 1, name: "Bob" };
const _city = getCity(_noAddress);
type _c1a = Expect<Equal<Parameters<typeof getCity>[0], User>>;
type _c1b = Expect<Equal<typeof _city, string>>;`,
      },
    },
    {
      id: "cp-09-2",
      description: "`??` で `null/undefined` の場合のデフォルト値を設定できているか？",
      verify: {
        kind: "type",
        // ?? を書き忘れると string | undefined になるので Equal が落ちる
        assert: `type _c2 = Expect<Equal<ReturnType<typeof getCity>, string>>;`,
      },
    },
    { id: "cp-09-3", description: "`||` ではなく `??` を使っている（0や''を誤って置き換えない）か？" },
    {
      id: "cp-09-4",
      description: "`user: User | null | undefined` のような型で `?.` を使えているか？",
      verify: {
        kind: "type",
        assert: `
type _c4a = Expect<Equal<Parameters<typeof getUserName>[0], User | null | undefined>>;
type _c4b = Expect<Equal<ReturnType<typeof getUserName>, string>>;`,
      },
    },
  ],

  tags: ["Optional", "?.", "??", "optional chaining", "nullish coalescing", "null", "undefined"],
  relatedIds: ["ts-08-array-types", "ts-10-crud-basics", "ts-15-api-fetch"],
};
