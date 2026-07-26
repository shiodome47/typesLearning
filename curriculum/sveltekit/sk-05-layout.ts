import type { Lesson } from "../types";

export const skLesson05: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-05-layout",
  order: 21,
  title: "⑤ 全ページ共通のヘッダー — +layout と children",
  category: "sveltekit",
  difficulty: 3,

  goal: "`+layout.svelte` で全ページ共通の枠を作り、`{@render children()}` で中身を差し込めるようになる。`+layout.server.ts` で共通データを一度だけ取れるようになる",

  why: {
    problem:
      "ヘッダーとフッターを全ページに付けます。ページは4枚。コピーして貼り付けます。5分で終わります。\n\n" +
      "3か月後、ページは14枚になっています。" +
      "そこで「電話番号が変わったのでヘッダーを直してください」という依頼が来ます。\n\n" +
      "14か所を直します。直したつもりでした。" +
      "リリース後、問い合わせページだけ古い電話番号のままだったことが発覚します。" +
      "そのページだけ、去年べつの人がヘッダーを少し変えていて、検索で引っかからなかったからです。\n\n" +
      "しかも「間違っているページがある」ことに気づく方法がありません。" +
      "14枚を1枚ずつ目で見て確認するしかない。次に電話番号が変わったら、また同じことをします。\n\n" +
      "共通データでも同じ問題が起きます。" +
      "ヘッダーに「お気に入り 3件」と出したいとします。" +
      "各ページの `load` で毎回お気に入り件数を取る。14ページ分書きます。" +
      "そのうち何ページかで書き忘れ、そのページだけヘッダーの件数が消えます。" +
      "**エラーは出ません。数字が消えるだけです。**",
    insight:
      "`+layout.svelte` は「ページを入れる額縁」です。\n\n" +
      "額縁の中で `{@render children()}` と書いた場所に、そのときのページが入ります。" +
      "`/bukken` を開けば物件一覧が、`/toiawase` を開けば問い合わせフォームが、同じ額縁の同じ穴に入る。\n\n" +
      "ヘッダーは額縁に1回だけ書きます。14ページあっても、書く場所は1か所です。" +
      "電話番号を直すのは1か所。**「直し忘れたページ」という概念が消えます。**\n\n" +
      "しかも `+layout.svelte` は**フォルダごと**に置けます。" +
      "`src/routes/+layout.svelte` は全ページの外枠。" +
      "`src/routes/kanri/+layout.svelte` を足せば、管理画面の下だけ二重の額縁になります。" +
      "外側の額縁の中に、内側の額縁が入る。入れ子です。\n\n" +
      "共通データも同じ考え方で、`+layout.server.ts` の `load` に書きます。" +
      "ここで取ったデータは、その下の**全ページで自動的に**使えます。" +
      "各ページに書き写す必要がないので、書き忘れも起きません。\n\n" +
      "`children` は、Svelte 5 では props の1つとして渡ってきます。" +
      "`let { data, children } = $props()` で受け取り、`{@render children()}` で描く。" +
      "「関数として受け取って、呼ぶと中身が出てくる」という形なので、" +
      "呼ぶ場所を変えれば差し込み位置も変わります。",
  },
  explanation:
    "`+layout.svelte` はそのフォルダ以下の全ページを包む共通の枠です。" +
    "枠の中で `{@render children()}` と書いた位置に、実際のページの内容が差し込まれます。" +
    "`children` は Svelte 5 のスニペットとして props で渡ってくるため、`let { children } = $props()` で受け取ります。" +
    "レイアウトはフォルダごとに置けて入れ子になります（`src/routes/+layout.svelte` の中に `src/routes/kanri/+layout.svelte` が入る）。" +
    "`+layout.server.ts` の `load` で取ったデータは、そのレイアウト自身と、配下の全ページから参照できます。" +
    "ページ側の `load` で `await parent()` を呼べば、親レイアウトの `load` の結果を取り込むこともできます。" +
    "ページ遷移してもレイアウトは再構築されないため、ヘッダーの状態やスクロール位置が保たれます。",

  files: [
    {
      path: "src/routes/+layout.server.ts",
      role: "全ページ共通のデータを一度だけ取る。配下の全ページから参照できる",
      starter: `// src/routes/+layout.server.ts
//
// ここで取ったデータは、この下の全ページで使えます。
// 各ページに書き写す必要がないので、書き忘れが起きません。

const SITE = {
  name: "さくら不動産",
  tel: "03-1234-5678",
};

// 1. load を export して、{ site: SITE } を返してください
`,
      model: `// src/routes/+layout.server.ts
//
// ここで取ったデータは、この下の全ページで自動的に使える。
// 各ページの load に書き写す必要がない = 書き忘れが起きない。

const SITE = {
  name: "さくら不動産",
  tel: "03-1234-5678",
};

export const load = async () => {
  // 本番ではここで「お気に入り件数」「ログイン中のユーザー」など、
  // 全ページのヘッダーに必要なものをまとめて取る。
  return { site: SITE };
};
`,
    },
    {
      path: "src/routes/+layout.svelte",
      role: "全ページを包む額縁。`{@render children()}` の位置にページが入る",
      starter: `<!--
  src/routes/+layout.svelte

  これは「ページを入れる額縁」です。
  どのURLを開いても、この枠の中にページが入ります。
-->

<script lang="ts">
  // 1. data と children を $props() で受け取ってください
  //    children は Svelte 5 では props の 1 つとして渡ってきます
</script>

<header>
  <!-- 2. サイト名（data.site.name）と電話番号（data.site.tel）を出してください -->
  <!--    ここに 1 回書けば、全ページのヘッダーになります -->
</header>

<main>
  <!-- 3. ここにページの中身を差し込んでください -->
  <!--    {@render children()} と書きます -->
</main>

<footer>
  <small>© さくら不動産</small>
</footer>
`,
      model: `<!--
  src/routes/+layout.svelte

  ページを入れる額縁。
  /bukken を開けば物件一覧が、/toiawase を開けば問い合わせが、
  同じ額縁の同じ穴に入る。
-->

<script lang="ts">
  type Site = { name: string; tel: string };
  type Props = {
    data: { site: Site };
    // children はスニペット（呼ぶと中身が出てくる関数）として渡ってくる
    children: () => unknown;
  };

  let { data, children }: Props = $props();
</script>

<header>
  <!--
    ここに 1 回書けば全ページのヘッダーになる。
    ページが 14 枚になっても、電話番号を直す場所は 1 か所のまま。
  -->
  <a href="/"><strong>{data.site.name}</strong></a>
  <span>お問い合わせ: {data.site.tel}</span>

  <nav>
    <a href="/bukken">物件一覧</a>
    <a href="/toiawase">お問い合わせ</a>
  </nav>
</header>

<main>
  <!--
    ここが穴。そのとき開いているページがここに入る。
    呼ぶ場所を変えれば差し込み位置も変わる。
  -->
  {@render children()}
</main>

<footer>
  <small>© さくら不動産</small>
</footer>
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "物件一覧。ヘッダーを書いていないことを確認してください（参照のみ）",
      readOnly: true,
      starter: `<!--
  ページ側にはヘッダーもフッターも書かない。
  額縁は +layout.svelte が持っている。
-->
<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li><a href="/bukken/{item.id}">{item.name}</a></li>
  {/each}
</ul>
`,
      model: `<!--
  ページ側にはヘッダーもフッターも書かない。
  額縁は +layout.svelte が持っている。
-->
<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li><a href="/bukken/{item.id}">{item.name}</a></li>
  {/each}
</ul>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "レイアウトが受け取るものは2つです。共通データ（`data`）と、そこに差し込まれるページ（`children`）。どちらも `$props()` から取り出します。",
    },
    {
      level: 2,
      text: "`let { data, children } = $props();` と書きます。ページを差し込む場所には `{@render children()}` と書きます。`{@render ...}` はスニペットを描くための記法です。",
    },
    {
      level: 3,
      text: "サーバー側は `export const load = async () => { return { site: SITE }; };`。ヘッダーは `<strong>{data.site.name}</strong>` と `<span>お問い合わせ: {data.site.tel}</span>`。`<main>{@render children()}</main>` で中身が入ります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-05-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-05-2",
      description: "`+layout.server.ts` が `load` を export しているか？",
      verify: {
        kind: "kit-export",
        file: "src/routes/+layout.server.ts",
        name: "load",
      },
    },
    {
      id: "cp-sk-05-3",
      description: "`load` が `site` を返しているか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/+layout.server.ts",
        keys: ["site"],
      },
    },
    {
      id: "cp-sk-05-4",
      description: "レイアウトが `data` と `children` を `$props()` で受け取っているか？",
      verify: {
        kind: "kit-props",
        file: "src/routes/+layout.svelte",
        keys: ["data", "children"],
      },
    },
    {
      id: "cp-sk-05-5",
      description: "`{@render children()}` でページを差し込んでいるか？",
      verify: {
        kind: "svelte-ast",
        query: "render",
        file: "src/routes/+layout.svelte",
      },
    },
  ],

  tags: ["SvelteKit", "+layout.svelte", "children", "@render", "共通データ"],
  relatedIds: ["sk-04-server-boundary", "sk-06-form-actions", "sv-08-snippet"],
};
