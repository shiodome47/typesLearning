import type { Lesson } from "../types";

export const lesson12: Lesson = {
  kind: "write",
  id: "ts-12-promise",
  order: 12,
  title: "Promise基礎",
  category: "async",
  difficulty: 2,

  goal: "Promise<T>の型を明示して、非同期処理の成功/失敗を型安全に扱えるようになる",

  why: {
    problem:
      "1秒かかるユーザー情報の取得を書きました。使う側は `const user = fetchUser(1)` として、" +
      "`user.name` を画面に出すだけです。\n\n" +
      "表示されるのは `undefined` です。" +
      "`console.log(user)` にしてみると `Promise { <pending> }` と出ます。" +
      "名前が入っているはずの場所に、見たことのないものが入っています。\n\n" +
      "起きているのはこういうことです。`fetchUser(1)` はユーザー情報を返しません。" +
      "「1秒後にユーザー情報をお渡しします」という**引換券**を返します。" +
      "引換券に `name` という項目は無いので `undefined` になります。\n\n" +
      "戻り値の型を書いていなければ、TypeScript もこれを見逃します。" +
      "実行してログに `undefined` が出るまで、どこが悪いのか分かりません。\n\n" +
      "`.then()` の中で `user.nmae` と綴りを間違えた場合も同じです。" +
      "1秒待った末に `undefined` が出るだけで、何も教えてもらえません。",
    insight:
      "`Promise<User>` は「今はまだ空だが、あとで `User` が入る箱」です。" +
      "箱と中身は別物、というのが最初の関門です。\n\n" +
      "中身を取り出すには `.then((user) => ...)` を通ります。この `user` が、箱から出てきた本物の `User` です。" +
      "`fetchUser(1).name` は箱に名前を聞いているので `undefined`、" +
      "`fetchUser(1).then((user) => user.name)` は中身に聞いているので取れます。\n\n" +
      "`<User>` の部分は箱に貼るラベルです。「この箱には User が入ります」。" +
      "ラベルがあるから、`.then` の中で `.` を打つと `id` と `name` が候補に出て、" +
      "`user.nmae` はその場で赤線になります。1秒待つ必要がありません。\n\n" +
      "箱の中身を決めるのが `resolve` と `reject` です。" +
      "`resolve(値)` で「成功、これが中身です」、`reject(理由)` で「失敗しました」。" +
      "失敗は `.then` を飛ばして `.catch` に届きます。\n\n" +
      "`reject` に渡すのは文字列ではなく `new Error(\"...\")` にしてください。" +
      "受け取る側が `instanceof Error` で「これはエラーだ」と確かめられるようになります（#14 でやります）。" +
      "文字列を投げると、受け取った側は何が来たのか判断できません。",
  },
  explanation:
    "`Promise<T>` は「将来Tという型の値を返す」約束を表す型です。" +
    "`.then()` で成功時の処理、`.catch()` で失敗時の処理を書きます。" +
    "`new Promise<T>()` でPromiseを手動生成することもできます。" +
    "TypeScriptでは戻り値型として `Promise<User>` のように型引数を明示します。",

  starterCode: `type User = {
  id: number;
  name: string;
};

// fetchUser関数を定義してください
// - 引数: userId: number
// - 戻り値: Promise<User>
// - 成功: 1秒後に { id: userId, name: "Alice" } を resolve
// - 失敗: userId <= 0 なら reject（"Invalid user ID"）

// 呼び出し例:
// fetchUser(1).then((user) => console.log(user.name)).catch((e) => console.error(e));
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
};

function fetchUser(userId: number): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    if (userId <= 0) {
      reject(new Error("Invalid user ID"));
      return;
    }
    setTimeout(() => {
      resolve({ id: userId, name: "Alice" });
    }, 1000);
  });
}

fetchUser(1)
  .then((user) => console.log(user.name)) // "Alice"
  .catch((error) => console.error(error));`,

  hints: [
    {
      level: 1,
      text: "`function fetchUser(userId: number): Promise<User>` の形で戻り値型を宣言します。関数内で `new Promise<User>(...)` を返します。",
    },
    {
      level: 2,
      text: "`new Promise<User>((resolve, reject) => { ... })` の中で成功時は `resolve(値)`, 失敗時は `reject(new Error(...))` を呼びます。",
    },
    {
      level: 3,
      text: "`setTimeout(() => resolve({ id: userId, name: 'Alice' }), 1000)` で遅延解決。`.then().catch()` で呼び出す。",
    },
  ],

  checkpoints: [
    {
      id: "cp-12-1",
      description: "戻り値型が `Promise<User>` と明示されているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof fetchUser>, Promise<User>>>;`,
      },
    },
    { id: "cp-12-2", description: "`new Promise<User>((resolve, reject) => {...})` の形で書けているか？" },
    { id: "cp-12-3", description: "失敗条件で `reject(new Error(...))` を呼べているか？" },
    { id: "cp-12-4", description: "`.then()` と `.catch()` で結果をハンドリングできているか？" },
  ],

  tags: ["Promise", "非同期", "resolve", "reject", "then", "catch"],
  relatedIds: ["ts-11-generics-basics", "ts-13-async-await"],
};
