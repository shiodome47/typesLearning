import type { Lesson } from "../types";

export const lesson13: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-13-async-await",
  order: 13,
  title: "async / await",
  category: "async",
  difficulty: 2,

  goal: "async/awaitを使って非同期処理を型安全に書けるようになる",

  why: {
    problem:
      "サーバーからユーザー情報を取ってきて、名前を画面に出す。それだけの処理です。\n\n" +
      "普通に書きます。`const user = fetchUser(1);` そして `console.log(user.name);`。" +
      "これまで書いてきた関数と同じ書き方です。\n\n" +
      "実行すると `undefined` と出ます。名前が空欄です。" +
      "`fetchUser` の中を何度読んでも、ちゃんと名前を返しているように見えます。\n\n" +
      "サーバーへの問い合わせは一瞬では終わりません。回線の向こうまで行って帰ってくるのに、速くても数十ミリ秒かかります。" +
      "その間コンピュータを止めておくわけにはいかないので、`fetchUser` は" +
      "**データを待たずに、先に戻ってきている**のです。" +
      "手元にあるのはユーザー情報ではなく、「あとでユーザー情報が入る」という約束の紙切れです。" +
      "紙切れに `name` は書かれていないので `undefined` になります。\n\n" +
      "「じゃあ結果が届いたときに実行してほしい処理を、後ろに渡せばいいのか」と `.then(...)` を使い始めます。" +
      "ところがユーザーを取ってから、その人の注文を取って、さらにその注文の商品を取る、と続けると、" +
      "`.then` の中に `.then`、その中にまた `.then` と入れ子が深くなっていきます。" +
      "そのうえ途中で回線が切れたときのエラー処理をどこに書けばいいのかも分からなくなります。",
    insight:
      "`Promise<User>` は「今はまだ空だが、あとで User が入る箱」という意味の型です。" +
      "`fetchUser` が返しているのは User ではなく、この箱です。\n\n" +
      "`await` は「箱が開くまで、ここで待つ」と書く言葉です。" +
      "`const user = await fetchUser(1)` と書くと、中身が届くまでその行で待ってから先へ進みます。" +
      "型のうえでも `Promise<User>` の皮が1枚めくれて、`user` はただの `User` になります。" +
      "だから `user.name` が普通に書けます。\n\n" +
      "`async` は「この関数の中では待っていいですよ」という宣言です。" +
      "その代わり、待つ関数は結果をすぐ返せないので、戻り値は必ず箱に入って返ります。" +
      "`async function fetchUser(...): Promise<User>` の `Promise<...>` は、そのための表記です。" +
      "呼ぶ側もまた `await` で受け取ります。\n\n" +
      "書き心地が肝心なところです。`await` で書くと、上から下へ順番に並んだ、これまでと同じ形のコードになります。" +
      "入れ子は増えません。エラー処理も、`await` した行で例外が飛んでくるので、" +
      "普通の `try/catch` で丸ごと囲めば済みます。\n\n" +
      "そして `await` を書き忘れると、TypeScript が気づいてくれます。" +
      "`Promise<User>` に `name` というプロパティは無いからです。" +
      "戻り値型を `Promise<User>` と書いておくことが、そのまま見張り役になります。",
  },
  explanation:
    "`async` をつけた関数は必ず `Promise` を返します。" +
    "`await` で Promise の解決を待ち、結果を変数に受け取れます。" +
    "TypeScriptでは `async function fetchUser(): Promise<User>` のように戻り値型を明示します。" +
    "`try/catch` と組み合わせてエラーも型安全に処理できます。",

  starterCode: `type User = {
  id: number;
  name: string;
};

// fetchUser関数を定義してください
// - 引数: userId: number
// - 戻り値: Promise<User>
// - 実装: 1秒後に { id: userId, name: "Alice" } を返す
// - エラー処理: userId が 0 以下なら Error をthrow する
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
};

async function fetchUser(userId: number): Promise<User> {
  if (userId <= 0) {
    throw new Error("Invalid user ID");
  }

  // 1秒後にデータを返すモック
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  return { id: userId, name: "Alice" };
}

// 呼び出し側
async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(user.name); // "Alice"
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

main();`,

  hints: [
    {
      level: 1,
      text: "`async function 関数名(): Promise<戻り値の型>` の形で書きます。関数内で `await` が使えます。",
    },
    {
      level: 2,
      text: "Promiseを使った待機は `await new Promise<void>((resolve) => setTimeout(resolve, 1000))` のように書けます。",
    },
    {
      level: 3,
      text: "戻り値型 `Promise<User>` を明示 → `await` で待機 → `try/catch` でエラーを `error instanceof Error` で型絞り込み",
    },
  ],

  checkpoints: [
    {
      id: "cp-13-1",
      description: "`async` キーワードが関数につけられているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<ReturnType<typeof fetchUser> extends Promise<unknown> ? true : false>;`,
      },
    },
    {
      id: "cp-13-2",
      description: "戻り値型が `Promise<User>` と明示されているか？",
      verify: {
        kind: "type",
        assert: `
type _c2 = Expect<Equal<ReturnType<typeof fetchUser>, Promise<User>>>;
type _c2a = Expect<Equal<Parameters<typeof fetchUser>[0], number>>;`,
      },
    },
    { id: "cp-13-3", description: "`await` で非同期処理の完了を待てているか？" },
    { id: "cp-13-4", description: "呼び出し側で `try/catch` が書けているか？" },
    { id: "cp-13-5", description: "`error instanceof Error` で型を絞り込んでから `.message` を読んでいるか？" },
  ],

  tags: ["async", "await", "Promise", "非同期", "try-catch"],
  relatedIds: ["ts-11-generics-basics"],
};
