import type { Lesson } from "../types";

export const svLesson14: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-14-load-data",
  order: 14,
  title: "+page.ts の load とデータの受け渡し",
  category: "sveltekit",
  difficulty: 3,

  goal: "ページに必要なデータを `load` で先に取り、`let { data } = $props()` で受け取れるようになる。`+page.ts` と `+page.server.ts` を使い分けられるようになる",

  why: {
    problem:
      "記事一覧ページを作りました。素直に書きました。" +
      "`let posts = $state([])` を用意して、`$effect` の中で `fetch(\"/api/posts\")` して、返ってきたら `posts` に入れる。" +
      "ローディング用に `let loading = $state(true)`、失敗用に `let error = $state(null)` も足しました。動きます。\n\n" +
      "問題が3つ出ました。\n\n" +
      "1つ目。ページを開いた瞬間、ほんの一瞬だけ画面が空になります。" +
      "人間には「ちらつき」程度ですが、検索エンジンのクローラや SNS のリンクプレビューは" +
      "その一瞬の状態を読んで帰っていきます。" +
      "OGP のタイトルが空のまま Slack に貼られ、記事の中身が検索結果に出てきません。" +
      "`$effect` はブラウザで画面が描かれた後に走るので、サーバーが返す HTML には何も入っていないからです。\n\n" +
      "2つ目。一覧から記事を開いて、ブラウザの戻るボタンで一覧に帰ると、また全件取り直します。" +
      "戻るたびに1秒待たされます。さっき見たばかりのデータです。\n\n" +
      "3つ目。`loading` の分岐と `error` の分岐を、ページを作るたびに手で書いていることに気づきました。" +
      "6ページ目で `error` の分岐を書き忘れ、通信が失敗したときに永久に「読み込み中...」と出続ける画面ができました。" +
      "テストでは通信が失敗しないので、誰も気づきませんでした。",
    insight:
      "問い直すべきは「いつデータを取るか」です。\n\n" +
      "`$effect` で取るということは「まず空の画面を作り、それから取りに行く」という順番です。" +
      "`load` で取るということは「データが揃ってから画面を作る」という順番です。" +
      "`load` はコンポーネントより**先に**走り、しかもサーバー側でも走ります。" +
      "だからサーバーが返す HTML には最初から中身が入っていて、クローラも人間も同じものを見ます。\n\n" +
      "順番が変わると、待ち時間の扱いも変わります。" +
      "一覧のリンクにマウスを乗せた時点で SvelteKit は次のページの `load` を先読みし始めるので、" +
      "クリックした頃には取得が終わっています。" +
      "戻るときはキャッシュから返るので取り直しません。" +
      "「毎回1秒待つ」が消えるのは、あなたが速くしたからではなく、取りに行く場所を移しただけです。\n\n" +
      "ページ側の書き方は驚くほど短くなります。`let { data } = $props()` の1行です。" +
      "`load` が返したオブジェクトが、そのまま `data` として渡ってきます。" +
      "`loading` も `error` も、もうページには書きません。" +
      "遷移中の表示は上位の `+layout.svelte` に1回だけ、失敗時の表示は `+error.svelte` に1回だけ置けば、" +
      "全ページに自動で効きます。「書き忘れたページ」という概念が消えます。\n\n" +
      "`+page.ts` と `+page.server.ts` の違いは1つだけ、**ブラウザでも走るかどうか**です。" +
      "`+page.ts` はサーバーで一度走り、その後の遷移ではブラウザでも走ります。だから中身は誰にでも見えます。" +
      "`+page.server.ts` はサーバーでしか走りません。" +
      "APIキー、DBへの直接アクセス、他人に見せてはいけない条件分岐は、必ずこちら側に置きます。" +
      "迷ったら「このコードが GitHub の公開リポジトリに載っても平気か」と考えると、だいたい合っています。",
  },
  explanation:
    "SvelteKit ではページに必要なデータを `+page.ts`（または `+page.server.ts`）の `load` 関数で取得します。" +
    "`load` はコンポーネントより先に、初回はサーバー側で実行されるため、返された HTML には最初からデータが入っています。" +
    "`load` が返したオブジェクトはページ側に `data` という props で渡り、`let { data } = $props()` で受け取ります。" +
    "`load` の引数からは `params`（`[slug]` の中身）、`fetch`（SSR 中でも使える特別な fetch）、" +
    "`url`、`parent` などが取り出せます。" +
    "APIキーやDB接続など外に出せないものを触る場合は、ブラウザでは決して実行されない `+page.server.ts` を使います。" +
    "（このエディタは1ファイルなので、ここでは `+page.svelte` の側を書きます。`+page.ts` の中身はコメントで併記しています。）",

  starterCode: `<!--
  src/routes/blog/+page.ts  （別ファイル。ここでは書きませんが、これが先に走ります）

  import type { PageLoad } from "./$types";

  export const load: PageLoad = async ({ fetch }) => {
    // SSR 中でも使える特別な fetch（cookie を引き継ぎ、内部APIなら通信せず直接呼ぶ）
    const res = await fetch("/api/posts");
    if (!res.ok) throw error(res.status, "記事一覧を取得できませんでした");

    const posts = await res.json();
    return { posts };   // ← この戻り値が、下の data になる
  };
-->

<script lang="ts">
  type Post = { slug: string; title: string; publishedAt: string };

  // 1. load が返した { posts } を data として $props() で受け取ってください
  //    型は { data: { posts: Post[] } } です
</script>

<h1>ブログ</h1>

<!-- 2. data.posts が空のときは「記事はまだありません。」と出してください -->

<!-- 3. そうでなければ {#each} で一覧を出してください -->
<!--    キーは post.slug（index は使わない） -->
<!--    各記事は /blog/{slug} へのリンクにしてください -->

<!-- 注意: $effect の中で fetch してはいけません。データはもう手元にあります -->
`,

  modelAnswer: `<!--
  ファイル構成

  src/routes/blog/
  ├── +page.ts          ← 一覧のデータを取る（サーバーでもブラウザでも走る）
  ├── +page.svelte      ← このファイル。data を受け取って描くだけ
  └── [slug]/
      ├── +page.ts      ← 記事1件を取る
      └── +page.svelte

  ── src/routes/blog/+page.ts ────────────────────────────────

  import { error } from "@sveltejs/kit";
  import type { PageLoad } from "./$types";

  export const load: PageLoad = async ({ fetch }) => {
    // この fetch は SSR 中でも使える特別版。cookie を引き継ぎ、
    // 自分のアプリ内のAPIなら実際の通信をせずに直接呼んでくれる。
    const res = await fetch("/api/posts");
    if (!res.ok) throw error(res.status, "記事一覧を取得できませんでした");

    const posts = await res.json();
    return { posts };   // ← この戻り値が data になる
  };

  ── src/routes/blog/[slug]/+page.ts ─────────────────────────

  export const load: PageLoad = async ({ params, fetch }) => {
    // params.slug に URL の可変部分が入っている
    const res = await fetch(\`/api/posts/\${params.slug}\`);
    if (res.status === 404) throw error(404, "記事が見つかりません");

    const post = await res.json();
    return { post };
  };

  ── APIキーを使うなら +page.server.ts ───────────────────────

  import { CMS_API_KEY } from "$env/static/private";  // private はサーバー限定
  import type { PageServerLoad } from "./$types";

  export const load: PageServerLoad = async ({ params, fetch }) => {
    // このファイルはブラウザでは絶対に実行されないので、鍵を書いてよい
    const res = await fetch(\`https://cms.example.com/posts/\${params.slug}\`, {
      headers: { Authorization: \`Bearer \${CMS_API_KEY}\` },
    });
    return { post: await res.json() };
  };
-->

<script lang="ts">
  type Post = { slug: string; title: string; publishedAt: string };
  type Props = { data: { posts: Post[] } };

  // load の戻り値がそのまま data として渡ってくる。
  // ページ側の仕事は「受け取って描く」だけになり、
  // loading も error もここには書かない
  // （遷移中の表示は +layout.svelte、失敗時は +error.svelte に1回だけ置く）。
  let { data }: Props = $props();
</script>

<h1>ブログ</h1>

{#if data.posts.length === 0}
  <p>記事はまだありません。</p>
{:else}
  <ul>
    {#each data.posts as post (post.slug)}
      <li>
        <a href="/blog/{post.slug}">{post.title}</a>
        <time datetime={post.publishedAt}>{post.publishedAt}</time>
      </li>
    {/each}
  </ul>
{/if}
`,

  hints: [
    {
      level: 1,
      text: "ページのコンポーネントは、もうデータを「取りに行く」側ではありません。渡されたものを描くだけです。`$effect` も `fetch` もこのファイルには出てきません。",
    },
    {
      level: 2,
      text: "`let { data }: Props = $props();` で受け取ります。`load` が `return { posts }` していれば `data.posts` で読めます。",
    },
    {
      level: 3,
      text: "空判定は `{#if data.posts.length === 0}` 、一覧は `{#each data.posts as post (post.slug)}` です。キーは `post.slug` で、index は使いません。リンクは `<a href=\"/blog/{post.slug}\">{post.title}</a>` のように属性の中にも `{}` を書けます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-14-1",
      description: "ページがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-14-2",
      description: "`load` の結果を `data` として `$props()` で受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-14-3",
      description: "`$effect` の中で取得し直していないか（データはもう手元にある）？",
      verify: { kind: "svelte-ast", query: "rune:$effect", expect: false },
    },
    {
      id: "cp-sv-14-4",
      description: "一覧の `{#each}` に `(post.slug)` のキーが付いているか？",
      verify: { kind: "svelte-ast", query: "each:keyed" },
    },
    {
      id: "cp-sv-14-5",
      description: "`+page.ts` と `+page.server.ts` のどちらに何を置くべきか、判断基準を説明できるか？",
    },
  ],

  tags: [
    "SvelteKit",
    "load",
    "+page.ts",
    "+page.server.ts",
    "$props",
    "SSR",
    "データ取得",
  ],
  relatedIds: ["sv-13-routing-layout", "sv-15-diagnose-server-shared-state"],
};
