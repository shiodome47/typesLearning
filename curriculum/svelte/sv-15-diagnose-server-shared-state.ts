import type { Lesson } from "../types";

export const svLesson15: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-15-diagnose-server-shared-state",
  order: 15,
  title: "診断: サーバーで共有されてしまった状態",
  category: "sveltekit",
  difficulty: 4,

  goal: "サーバー上のモジュールスコープに状態を置く危険を見抜き、リクエストごとに分離された置き場所へ直せるようになる",

  why: {
    problem:
      "問い合わせが来ました。「ログインしたら、他人の名前が表示されました」。\n\n" +
      "スクリーンショットが添付されています。" +
      "画面の右上に、まったく知らない人の氏名とメールアドレスが出ています。" +
      "個人情報が、無関係な利用者の画面に表示されています。\n\n" +
      "手元で再現を試みます。ログインします。正しく自分の名前が出ます。" +
      "ログアウトして別のアカウントで入ります。正しく出ます。" +
      "何度やっても正常です。当然です。`npm run dev` を開いているのは、世界にあなた1人だからです。\n\n" +
      "本番のログを見ます。深夜帯にはこの現象は起きていません。" +
      "昼のアクセスが集中する時間帯にだけ、ぽつぽつ起きています。" +
      "しかも同じ操作をした人が全員おかしくなるわけではなく、ときどきです。\n\n" +
      "再現手順が書けないので、チケットには「調査中」としか書けません。" +
      "その状態で2週間が過ぎました。" +
      "その間もアプリは動き続けていて、誰かの氏名とメールアドレスが、" +
      "ときどき別の誰かの画面に表示され続けています。\n\n" +
      "この回のコードには、型エラーもコンパイルエラーも警告もありません。" +
      "ローカルでは100%正しく動きます。テストも通ります。" +
      "それでも、本番に出した瞬間から個人情報が漏れます。",
    insight:
      "鍵になるのは、サーバー側の常識がブラウザとまったく逆だ、という一点です。\n\n" +
      "ブラウザでは、あなたのアプリは利用者ごとに別のタブで動いています。" +
      "変数は当然その人だけのものです。" +
      "サーバーでは違います。**1つの Node.js プロセスが、全員のリクエストを順番に処理しています**。" +
      "そのプロセスの上にあるモジュールスコープの変数は、アプリの起動時に1回だけ作られ、" +
      "以後すべての利用者が同じ1個を共有します。\n\n" +
      "だから `let user;` とファイルの一番上に書いて `load` の中で代入すると、" +
      "こういうことが起きます。" +
      "Aさんのリクエストが `user = Aさん` を実行し、DBの応答を待っている間に、" +
      "Bさんのリクエストが割り込んで `user = Bさん` を実行します。" +
      "Aさんの処理が再開したとき、`user` はもう B さんになっています。" +
      "そして A さんの画面に B さんの名前が返ります。\n\n" +
      "この割り込みは、リクエストが重なったときにしか起きません。" +
      "だから開発中は絶対に再現しません。" +
      "「ローカルで再現しない」は、この種のバグでは無罪の証明ではなく、むしろ典型的な症状です。\n\n" +
      "見抜くための問いは1つです。" +
      "**「この入れ物は、リクエストが終わったら消えるか？」**" +
      "消えないもの（モジュールスコープの変数、`.svelte.ts` の共有 `$state`、シングルトン）に、" +
      "そのリクエストの人だけの情報を入れてはいけません。" +
      "リクエストごとに新しく作られる入れ物は `event.locals` と `cookies` と、" +
      "そして `load` が `return` した値そのものです。この3つだけが安全地帯です。\n\n" +
      "同じ理由で、`load` は「引数を受け取って値を返すだけ」に保ちます。" +
      "`load` はページの先読みで勝手に呼ばれることがあり、ユーザーがまだクリックしていないのに実行されます。" +
      "そこにアクセスログの記録やカウンタの加算を書くと、" +
      "見てもいないページの閲覧数が増え、「読み取りのつもりが書き込みだった」という形で数字が壊れます。" +
      "書き込みは form actions や `+server.ts` の POST に置きます。",
  },
  explanation:
    "SvelteKit のサーバーは1つのプロセスで全リクエストを処理するため、" +
    "モジュールスコープ（ファイルのトップレベル）の変数はすべての利用者で共有されます。" +
    "公式ドキュメントが `let user;` の例に **NEVER DO THIS!** と書いているのはこのためで、" +
    "リクエスト由来の値をそこに入れると、同時アクセス時に他人のデータが混ざります。" +
    "`.svelte.ts` に置いた共有 `$state` も同じで、SSR 中はサーバー上の1個のオブジェクトなので、" +
    "コンポーネント本体（SSR でも実行される）から書き込むと全員に漏れます。" +
    "リクエストごとに分離されているのは `event.locals`、`cookies`、そして `load` の戻り値だけです。" +
    "また `load` はリンクのホバーによる先読みでも呼ばれるため、副作用を書かず純粋に保ちます。",

  symptom:
    "本番で、ログイン後にまれに別のユーザーの氏名とメールアドレスが表示される。アクセスが集中する時間帯にだけ起き、深夜には起きない。ローカルでは何度試しても再現せず、型エラーもコンパイル警告も1件も出ていない。",

  brokenCode: `<!--
  このページに関わる3ファイル（このエディタで編集できるのは +page.svelte だけです）

  ── src/lib/stores/session.svelte.ts ────────────────────────

  // アプリ全体で使い回すログインユーザー
  export const currentUser = $state({ name: "", email: "", plan: "free" });

  ── src/routes/account/+page.server.ts ──────────────────────

  import { db } from "$lib/server/db";
  import { sendAccessLog } from "$lib/server/analytics";

  let user;            // ログインユーザー
  let viewCount = 0;   // このページの通算表示回数

  export async function load({ cookies }) {
    user = await db.getUser(cookies.get("sessionid"));
    viewCount += 1;
    await sendAccessLog(user.id, "account");
    return { user, viewCount };
  }
-->

<script lang="ts">
  import { currentUser } from "$lib/stores/session.svelte";

  let { data } = $props();

  // 受け取ったユーザーを、アプリ全体で使えるように共有ストアへ入れておく
  currentUser.name = data.user.name;
  currentUser.email = data.user.email;
  currentUser.plan = data.user.plan;
</script>

<h1>ようこそ {currentUser.name} さん</h1>
<p>メール: {currentUser.email}</p>
<p>プラン: {currentUser.plan}</p>
<p>このページの通算表示回数: {data.viewCount}</p>`,

  defects: [
    {
      id: "d-sv-15-1",
      summary: "`+page.server.ts` のモジュールスコープ変数にリクエスト由来の値を代入している",
      why:
        "`let user;` はサーバープロセスに1個しかありません。" +
        "A さんの `load` が `db.getUser(...)` の応答を待っている間に B さんの `load` が走ると `user` は B さんに上書きされ、" +
        "A さんの画面に B さんの氏名とメールアドレスが表示されます。" +
        "公式ドキュメントがこの形に NEVER DO THIS! と明記しているのはこのためです。" +
        "リクエストごとに分離された入れ物（`event.locals` / `cookies` / `load` の戻り値）を使います。",
      marker: "let user;            // ログインユーザー",
    },
    {
      id: "d-sv-15-2",
      summary: "アプリ全体で共有される `$state` を、SSR 中に走るコンポーネント本体から書き換えている",
      why:
        "`.svelte.ts` の `export const currentUser = $state(...)` はモジュールスコープです。" +
        "ブラウザでは利用者ごとに別物ですが、SSR 中はサーバー上の1個を全員が共有します。" +
        "そしてコンポーネントの `<script>` 本体はサーバーでも実行されるため、" +
        "ここでの代入は「他人のリクエストの描画に自分の名前を書き込む」ことになります。" +
        "このページは `data.user` を直接読めば足りるので、共有ストアに移す必要がそもそもありません。",
      marker: "currentUser.name = data.user.name;",
    },
    {
      id: "d-sv-15-3",
      summary: "`load` に副作用（カウンタ加算・アクセスログ送信）がある",
      why:
        "`load` はリンクにマウスを乗せただけの先読みでも呼ばれ、ユーザーが開いていないページでも実行されます。" +
        "そこで `viewCount += 1` や `sendAccessLog(...)` を行うと、閲覧していない人の分まで数字が増えます。" +
        "しかも `viewCount` はモジュールスコープなので、サーバーを再起動した瞬間に 0 に戻り、" +
        "複数インスタンスで動かせばインスタンスごとにバラバラの値になります。" +
        "`load` は読み取り専用に保ち、書き込みは form actions や `+server.ts` の POST に置きます。",
      marker: "viewCount += 1;",
    },
    {
      id: "d-sv-15-4",
      summary: "この欠陥は開発環境では原理的に再現しない",
      why:
        "混線が起きるのはリクエストが重なったときだけで、`npm run dev` を触っているのは1人です。" +
        "型チェックもコンパイラも「モジュールスコープに代入した」ことを問題視しません。" +
        "つまり自動では一切検出されず、レビューで「この変数はリクエストが終わったら消えるか？」と問う以外に防ぐ手段がありません。",
    },
  ],

  fixedCode: `<!--
  ── src/hooks.server.ts ─────────────────────────────────────

  import { db } from "$lib/server/db";

  // リクエストごとに1回走る。結果は event.locals に入れる。
  // locals はリクエストごとに新しく作られるので、他人と混ざらない。
  export async function handle({ event, resolve }) {
    const sessionId = event.cookies.get("sessionid");
    event.locals.user = sessionId ? await db.getUser(sessionId) : null;
    return resolve(event);
  }

  ── src/routes/account/+page.server.ts ──────────────────────

  import { redirect } from "@sveltejs/kit";
  import type { PageServerLoad } from "./$types";

  // モジュールスコープに可変の変数を置かない。
  // load は「引数を受け取って値を返すだけ」の純粋な関数に保つ
  // （リンクのホバーによる先読みでも呼ばれるため）。
  export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, "/login");
    return { user: locals.user };
  };

  ── 閲覧数を数えたいなら +page.server.ts の actions か +server.ts へ ──

  export const actions = {
    view: async ({ locals }) => {
      // 書き込みはプロセスのメモリではなく DB に対して行う。
      // サーバーを再起動しても、インスタンスを増やしても壊れない。
      await db.incrementViewCount("account", locals.user.id);
      return { success: true };
    },
  };
-->

<script lang="ts">
  type User = { name: string; email: string; plan: string };
  type Props = { data: { user: User } };

  // このリクエストの分だけが入っている data を、そのまま読む。
  // コンポーネント本体は SSR 中にサーバーでも実行されるので、
  // ここからサーバー上の共有物に書き込んではいけない。
  let { data }: Props = $props();
</script>

<h1>ようこそ {data.user.name} さん</h1>
<p>メール: {data.user.email}</p>
<p>プラン: {data.user.plan}</p>`,

  hints: [
    {
      level: 1,
      text: "1つずつ問うてください。「この入れ物は、リクエストが終わったら消えるか？」 消えない入れ物に、そのリクエストの人だけの情報を入れている箇所が3つあります。",
    },
    {
      level: 2,
      text: "サーバーは1プロセスで全員のリクエストを処理します。モジュールスコープの `let user` も、`.svelte.ts` の共有 `$state` も、全員で1個です。リクエストごとに分離されているのは `event.locals`、`cookies`、`load` の戻り値だけです。",
    },
    {
      level: 3,
      text: "セッションの解決は `hooks.server.ts` で行って `event.locals.user` に入れ、`load` は `({ locals }) => ({ user: locals.user })` と返すだけにします。ページ側は共有ストアを捨てて `data.user` を直接描きます。閲覧数の加算は `load` から外し、DB への書き込みとして actions 側に移します。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-15-1",
      description: "修正後のページがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-15-2",
      description: "このリクエストのデータを `data` として `$props()` で受け取っているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-15-3",
      description: "コンポーネント側から共有 `$state` に書き込むのをやめられたか（このページは `data` を読むだけで足りる）？",
      verify: { kind: "svelte-ast", query: "rune:$state", expect: false },
    },
    {
      id: "cp-sv-15-4",
      description: "`load` から副作用（カウンタ加算・ログ送信）を取り除き、読み取り専用にできたか？",
    },
    {
      id: "cp-sv-15-5",
      description: "「この入れ物はリクエストが終わったら消えるか？」という問いで、他のコードも点検できるか？",
    },
  ],

  tags: [
    "SvelteKit",
    "SSR",
    "モジュールスコープ",
    "locals",
    "cookies",
    "hooks.server.ts",
    "情報漏えい",
    "load の純粋性",
  ],
  relatedIds: ["sv-12-shared-state-class", "sv-14-load-data", "ts-35-diagnose-ssr-hook"],
};
