import type { Lesson } from "../types";

export const skLesson08: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-08-hooks-auth",
  order: 24,
  title: "⑧ 管理画面にログインを付ける — hooks.server.ts と locals",
  category: "sveltekit",
  difficulty: 4,

  goal: "`hooks.server.ts` で全リクエストの手前にログイン判定を置き、`locals` 経由で各ページに渡して `redirect` できるようになる",

  why: {
    problem:
      "管理画面を作ります。物件の登録・編集・削除ができるページです。" +
      "当然、ログインしていない人には見せられません。\n\n" +
      "各ページの `load` の先頭に、こう書きます。\n\n" +
      "`const user = await getUser(cookies.get(\"session\")); if (!user) redirect(303, \"/login\");`\n\n" +
      "管理画面は5ページなので、5か所に同じ3行を書きます。動きます。\n\n" +
      "半年後、管理画面は12ページになっています。" +
      "そして「物件の削除」ページだけ、その3行がありません。\n\n" +
      "書き忘れたのではありません。" +
      "そのページは急ぎで別の人が作り、既存ページからコピーせず新規に書いたからです。" +
      "**エラーは出ません。テストも通ります。** 開発中はログインした状態で触るので、誰も気づきません。\n\n" +
      "URLさえ知っていれば、ログインせずに物件を削除できるページが、半年間公開されていました。\n\n" +
      "この種の事故の本質は「書き忘れ」ではありません。" +
      "**「書かなければ守られない」という構造そのもの**です。" +
      "12か所に正しく書き続けることを人間に要求している限り、いつか必ず抜けます。",
    insight:
      "`hooks.server.ts` は、**すべてのリクエストが必ず最初に通る場所**です。\n\n" +
      "ページごとではありません。1か所です。" +
      "`/bukken` でも `/toiawase` でも `/kanri/delete` でも、まずここを通ります。" +
      "新しく作ったページも、作った瞬間から通ります。**通らないページを作る方法がありません。**\n\n" +
      "だからここでログイン判定をします。" +
      "cookie を見て、ログイン中なら誰なのかを調べ、その結果を `event.locals.user` に置く。\n\n" +
      "`locals` は「このリクエストの間だけ有効なメモ帳」です。" +
      "ここに置いたものは、その後に走る全部の `load` から `locals.user` で読めます。" +
      "各ページが自分で cookie を解析し直す必要はありません。\n\n" +
      "そして各ページの `load` は、こう書くだけになります。\n\n" +
      "`if (!locals.user) redirect(303, \"/login\");`\n\n" +
      "1行です。しかも「調べる」処理は消えていて、「判断する」だけが残っています。\n\n" +
      "**さらに踏み込むなら、この1行すら `hooks.server.ts` に寄せられます。** " +
      "`event.url.pathname.startsWith(\"/kanri\")` なら弾く、と書けば、" +
      "`/kanri` の下に新しいページを作った時点で、そのページは自動的に守られています。" +
      "書き忘れる場所が存在しません。\n\n" +
      "`redirect()` は `error()` や `fail()` と並ぶ3つ目の道具です。" +
      "`error()` はエラーページ、`fail()` は同じページに戻る、`redirect()` は別のURLへ送る。" +
      "どれも「呼んだらそこで終わり」で、後ろの処理は走りません。",
  },
  explanation:
    "`src/hooks.server.ts` から `handle` を export すると、すべてのサーバーリクエストがその関数を通ります。" +
    "`handle` は `{ event, resolve }` を受け取り、最後に `resolve(event)` を返します。" +
    "`resolve` を呼ぶ前に書いた処理は全リクエストの前処理になります。" +
    "`event.locals` はそのリクエストの間だけ有効な入れ物で、ここに置いた値は" +
    "各ページの `load` やアクションから `locals` として読めます（認証済みユーザーの保持に使うのが定番です）。" +
    "アクセス制御は `event.url.pathname` を見て `hooks.server.ts` 側で完結させると、" +
    "新規ページを追加しても自動的に保護されます。" +
    "別のURLへ送りたいときは `@sveltejs/kit` の `redirect(303, \"/login\")` を呼びます。" +
    "`error()`（エラーページへ）、`fail()`（同じページへ戻る）と使い分けます。",

  files: [
    {
      path: "src/hooks.server.ts",
      role: "すべてのリクエストが必ず最初に通る場所。1か所しかない",
      starter: `// src/hooks.server.ts
//
// このファイルは、すべてのリクエストが必ず通ります。
// /bukken でも /kanri/delete でも、まずここを通ります。
// 新しく作ったページも、作った瞬間から通ります。
// 「通らないページ」を作る方法がありません。

// 本番ではセッションストアや DB を見ます
const SESSIONS: Record<string, { name: string; role: string }> = {
  "valid-session-token": { name: "管理者", role: "admin" },
};

// 1. handle という名前で export してください
//    形は async ({ event, resolve }) => { ... } です
//
//    中でやること:
//      a. event.cookies.get("session") でトークンを読む
//      b. SESSIONS から利用者を引く（無ければ null）
//      c. その結果を event.locals.user に入れる
//         → こうすると、この後の全 load から locals.user で読める
//      d. 最後に return resolve(event);
//
//    d を忘れるとリクエストが先に進まず、画面が返りません。
`,
      model: `// src/hooks.server.ts
//
// すべてのリクエストが必ず通る唯一の場所。
// ここに置いた処理は「書き忘れる場所が存在しない」。

const SESSIONS: Record<string, { name: string; role: string }> = {
  "valid-session-token": { name: "管理者", role: "admin" },
};

export const handle = async ({ event, resolve }) => {
  // cookie を読むのはここ 1 回だけ。
  // 各ページが自分で解析し直す必要がなくなる。
  const token = event.cookies.get("session");
  event.locals.user = token ? (SESSIONS[token] ?? null) : null;

  // locals は「このリクエストの間だけ有効なメモ帳」。
  // ここに置いたものは、この後に走る全部の load から locals.user で読める。

  // resolve を呼ぶと、実際のページ処理へ進む。
  // これを忘れるとリクエストが返らない。
  return resolve(event);
};
`,
    },
    {
      path: "src/routes/kanri/+page.server.ts",
      role: "管理画面。cookie を自分で調べる処理はもう要らない",
      starter: `// src/routes/kanri/+page.server.ts

// 1. @sveltejs/kit から redirect を import してください

// 2. load を export してください。引数から locals を受け取ります
//
//    中でやること:
//      a. locals.user が無ければ redirect(303, "/login")
//      b. あれば { user: locals.user } を返す
//
//    cookie を読む処理がここに無いことに注目してください。
//    hooks.server.ts が済ませて locals に置いてくれています。
`,
      model: `// src/routes/kanri/+page.server.ts

import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  // cookie を読む処理はここに無い。hooks.server.ts が済ませてある。
  // 残っているのは「調べる」ではなく「判断する」だけ。
  if (!locals.user) {
    // redirect も error / fail と同じく「呼んだらそこで終わり」。
    // この後の行は走らない。
    //
    //   error()    → エラーページを出す
    //   fail()     → 同じページに戻る（フォームの入力エラー）
    //   redirect() → 別のURLへ送る
    redirect(303, "/login");
  }

  return { user: locals.user };
};

// なお、より強くするならこの 1 行すら hooks.server.ts に寄せられる。
//
//   if (event.url.pathname.startsWith("/kanri") && !event.locals.user) {
//     redirect(303, "/login");
//   }
//
// こう書くと、/kanri の下に新しいページを作った時点で自動的に守られる。
// 「書き忘れる場所」が無くなる。
`,
    },
    {
      path: "src/routes/kanri/+page.svelte",
      role: "管理画面の見た目。ログイン判定は書かない（参照のみ）",
      readOnly: true,
      starter: `<script lang="ts">
  type User = { name: string; role: string };
  let { data }: { data: { user: User } } = $props();
</script>

<!--
  ここに「ログインしていなければ〜」という分岐は書かない。
  load が redirect で止めているので、ここまで来た時点で必ずログイン済み。

  分岐を 2 か所に書かないので、片方だけ直して食い違う事故が起きない。
-->

<h1>管理画面</h1>
<p>{data.user.name} さんとしてログイン中</p>
`,
      model: `<script lang="ts">
  type User = { name: string; role: string };
  let { data }: { data: { user: User } } = $props();
</script>

<h1>管理画面</h1>
<p>{data.user.name} さんとしてログイン中</p>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`hooks.server.ts` で export する名前は `handle` です。`load` や `actions` と同じで、名前が仕様です。最後に `resolve(event)` を返すのを忘れないでください。",
    },
    {
      level: 2,
      text: "`export const handle = async ({ event, resolve }) => { ... return resolve(event); };` の形です。cookie は `event.cookies.get(\"session\")` で読み、結果は `event.locals.user` に入れます。",
    },
    {
      level: 3,
      text: "ページ側は `import { redirect } from \"@sveltejs/kit\";` して、`export const load = async ({ locals }) => { if (!locals.user) redirect(303, \"/login\"); return { user: locals.user }; };` です。303 は「POST のあとに GET で移動させる」ときの標準的な番号です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-08-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-08-2",
      description: "`hooks.server.ts` が `handle` を export しているか？",
      verify: { kind: "kit-export", file: "src/hooks.server.ts", name: "handle" },
    },
    {
      id: "cp-sk-08-3",
      description: "`handle` の中で `resolve()` を呼んでいるか（忘れると画面が返らない）？",
      verify: { kind: "kit-calls", file: "src/hooks.server.ts", name: "resolve" },
    },
    {
      id: "cp-sk-08-4",
      description: "管理画面の `load` が `@sveltejs/kit` から `redirect` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/kanri/+page.server.ts",
        source: "@sveltejs/kit",
        name: "redirect",
      },
    },
    {
      id: "cp-sk-08-5",
      description: "未ログインのとき `redirect()` で送り返しているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/+page.server.ts",
        name: "redirect",
      },
    },
    {
      id: "cp-sk-08-6",
      description: "`load` が `user` を返しているか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/kanri/+page.server.ts",
        keys: ["user"],
      },
    },
  ],

  tags: ["SvelteKit", "hooks.server.ts", "locals", "redirect", "認証"],
  relatedIds: ["sk-07-enhance", "sk-09-diagnose-review", "sk-04-server-boundary"],
};
