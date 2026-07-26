import type { Lesson } from "../types";

export const skLesson02: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-02-load",
  order: 18,
  title: "② 一覧をサーバーから取る — +page.server.ts と load",
  category: "sveltekit",
  difficulty: 3,

  goal: "`+page.server.ts` の `load` でデータを用意し、`+page.svelte` が `data` として受け取る流れを書けるようになる",

  why: {
    problem:
      "物件一覧を本物のデータにします。素直に書くと、こうなります。" +
      "`+page.svelte` の中で `let items = $state([])` を用意して、`$effect` の中で `fetch(\"/api/bukken\")` して、" +
      "返ってきたら `items` に入れる。動きます。ブラウザで見ると、ちゃんと一覧が出ます。\n\n" +
      "3週間後、お客さんから連絡が来ます。「Googleで『さくら不動産 物件』と検索しても、物件が1件も出てこない」。\n\n" +
      "調べると、原因はこうです。" +
      "サーバーが返している HTML には、物件が1件も入っていません。空っぽの `<ul></ul>` だけです。" +
      "物件が入るのは、ブラウザが HTML を受け取って、画面を描いて、そのあと `$effect` が走って、通信して、返ってきてからです。\n\n" +
      "人間の目には一瞬なので気づきません。でも検索エンジンのクローラは、その「空っぽの HTML」を読んで帰っていきます。" +
      "LINE や Slack にURLを貼ったときのプレビューも同じで、タイトルだけで中身が空になります。\n\n" +
      "しかもこの問題、開発中は絶対に気づけません。" +
      "自分のブラウザで見れば、ちゃんと物件が出ているからです。" +
      "「表示されている」ことと「HTML に入っている」ことは、別のことでした。",
    insight:
      "問い直すべきは「いつデータを取るか」ではなく、**どこで取るか**です。\n\n" +
      "`$effect` で取るというのは「まず空の画面を送りつけて、そのあとブラウザに取りに行かせる」という順番です。" +
      "`load` で取るというのは「サーバーの中でデータを揃えてから、中身の入った HTML を送る」という順番です。\n\n" +
      "`load` はコンポーネントより**先**に走ります。しかも最初の一回はサーバーの中で走ります。" +
      "だからサーバーが返す HTML には、最初から物件が入っています。" +
      "クローラも人間も、同じものを見ます。\n\n" +
      "書き方はとても単純です。`+page.server.ts` に `load` という名前で関数を export する。それだけです。" +
      "「この関数を load として登録する」という手続きはありません。**名前が仕様**です。\n\n" +
      "そして `load` が `return { items }` すると、その中身が `+page.svelte` に `data` という名前で届きます。" +
      "ページ側は `let { data } = $props()` の1行で受け取って、`data.items` を描くだけ。" +
      "`loading` も `error` も、ページには書きません。\n\n" +
      "ファイル名が `+page.server.ts` であることには、もう1つ重い意味があります。" +
      "`.server.` が付いたファイルは**ブラウザには絶対に配られません**。" +
      "だからこの中には、データベースのパスワードでも、APIキーでも書いていい。" +
      "この話は ④ でじっくりやります。",
  },
  explanation:
    "`+page.server.ts` から `load` という名前の関数を export すると、SvelteKit がページを表示する前にそれを実行します。" +
    "`load` の戻り値のオブジェクトが、同じフォルダの `+page.svelte` に `data` という props として渡ります。" +
    "ページ側は `let { data } = $props()` で受け取ります。" +
    "`load` は初回アクセス時はサーバーで実行されるため、サーバーが返す HTML には最初からデータが入っています（SSR）。" +
    "そのためクローラやリンクプレビューにも中身が届きます。" +
    "`.server.` が付くファイルはクライアントバンドルに含まれないので、DB接続やAPIキーなど外に出せないものを扱えます。" +
    "`load` の引数からは `params`（URL の可変部分）、`fetch`（SSR 中でも使える特別版）、`url`、`locals` などが取れます。",

  files: [
    {
      path: "src/routes/bukken/+page.server.ts",
      role: "サーバーでだけ走る。ページを描く前にデータを用意する係",
      starter: `// src/routes/bukken/+page.server.ts
//
// このファイルはサーバーでしか実行されません。
// ブラウザには配られないので、中身は外から見えません。

// 本来はデータベースから取りますが、いまは固定のデータで進めます
const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000 },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000 },
  { id: "kaede-305", name: "かえでコート 305号室", rent: 94000 },
];

// 1. load という名前で関数を export してください
//    「登録」する場所はありません。名前が仕様です。

// 2. load は { items: ... } という形のオブジェクトを return してください
//    この戻り値が +page.svelte 側の data になります
`,
      model: `// src/routes/bukken/+page.server.ts
//
// .server. が付いているので、このファイルはブラウザに配られない。
// ページが描かれる「前」に、サーバーの中だけで実行される。

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000 },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000 },
  { id: "kaede-305", name: "かえでコート 305号室", rent: 94000 },
];

// load という名前で export する。これだけで SvelteKit が拾う。
// どこかに「この関数を load として使う」と書く場所は存在しない。
export const load = async () => {
  // 本番ではここで DB や外部 API を叩く。
  // サーバーの中なので、接続情報を持っていて構わない。
  return { items: BUKKEN };
  //       ↑ この中身がそのまま +page.svelte の data になる
};
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "描くだけの係。データはもう手元に届いている",
      starter: `<!--
  src/routes/bukken/+page.svelte

  このファイルの仕事は「描くこと」だけです。
  取りに行く必要はありません。load がもう取ってくれています。
-->

<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };

  // 1. load が返した { items } を data として受け取ってください
  //    let { data } = $props(); の 1 行です
</script>

<h1>物件一覧</h1>

<!-- 2. data.items を {#each} で並べてください -->
<!--    キーは item.id を使います（index は使わない） -->
<!--    名前と家賃を出してください -->

<a href="/">トップへ戻る</a>

<!-- 注意: $effect や fetch は書きません。データはもう届いています -->
`,
      model: `<!--
  src/routes/bukken/+page.svelte

  load → data という一方通行。
  このファイルは「渡されたものを描く」だけになる。
-->

<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };

  // load の戻り値が、そのまま data として渡ってくる。
  // fetch も $effect も loading も error も、ここには書かない。
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

{#if data.items.length === 0}
  <p>いまお出しできる物件がありません。</p>
{:else}
  <ul>
    <!-- キーは id。index をキーにすると並べ替えたときに中身がずれる -->
    {#each data.items as item (item.id)}
      <li>
        {item.name} — {item.rent.toLocaleString()}円
      </li>
    {/each}
  </ul>
{/if}

<a href="/">トップへ戻る</a>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "サーバー側は「export する関数の名前」が仕様です。`load` という名前でないと SvelteKit は気づきません。ページ側は取りに行く側ではなく、受け取る側になります。",
    },
    {
      level: 2,
      text: "サーバー側は `export const load = async () => { return { items: BUKKEN }; };`。ページ側は `let { data } = $props();` で受け取り、`data.items` で読めます。",
    },
    {
      level: 3,
      text: "一覧は `{#each data.items as item (item.id)}` です。`(item.id)` の丸かっこがキーで、これが無いと並べ替えたときに表示がずれます。家賃は `{item.rent.toLocaleString()}円` と書くと 3 桁区切りになります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-02-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-02-2",
      description: "`+page.server.ts` が `load` という名前で export しているか？",
      verify: {
        kind: "kit-export",
        file: "src/routes/bukken/+page.server.ts",
        name: "load",
      },
    },
    {
      id: "cp-sk-02-3",
      description: "`load` が `items` を返しているか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/bukken/+page.server.ts",
        keys: ["items"],
      },
    },
    {
      id: "cp-sk-02-4",
      description: "ページが `data` を `$props()` で受け取っているか？",
      verify: {
        kind: "kit-props",
        file: "src/routes/bukken/+page.svelte",
        keys: ["data"],
      },
    },
    {
      id: "cp-sk-02-5",
      description: "一覧の `{#each}` にキーが付いているか？",
      verify: {
        kind: "svelte-ast",
        query: "each:keyed",
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-sk-02-6",
      description: "ページ側で `$effect` を使って取り直していないか？",
      verify: {
        kind: "svelte-ast",
        query: "rune:$effect",
        expect: false,
        file: "src/routes/bukken/+page.svelte",
      },
    },
  ],

  tags: ["SvelteKit", "load", "+page.server.ts", "SSR", "$props"],
  relatedIds: ["sk-01-routing", "sk-03-dynamic-route", "sv-14-load-data"],
};
