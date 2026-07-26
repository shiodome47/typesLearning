import type { Lesson } from "../types";

export const skLesson03: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-03-dynamic-route",
  order: 19,
  title: "③ 物件の詳細ページ — [id] という名前のフォルダ",
  category: "sveltekit",
  difficulty: 3,

  goal: "`[id]` という名前のフォルダで1つのページを何千件分にも使い回し、見つからない場合に 404 を返せるようになる",

  why: {
    problem:
      "物件が3件なら、詳細ページを3枚作れば済みます。" +
      "`bukken/sakura-101/+page.svelte`、`bukken/midori-203/+page.svelte`、`bukken/kaede-305/+page.svelte`。\n\n" +
      "物件が800件になった時点で、この方法は破綻します。" +
      "800個のフォルダを手で作ることはできません。" +
      "しかも物件は毎週入れ替わります。新しい物件が来るたびにフォルダを作り、決まったら消す。" +
      "そんな運用は不可能です。\n\n" +
      "ここで多くの人が最初に思いつくのは「1枚のページにして、`?id=sakura-101` のように後ろに付ける」という方法です。" +
      "動きはします。でも `/bukken?id=sakura-101` というURLをお客さんに渡すのは、" +
      "`/bukken/sakura-101` に比べて明らかに見栄えが悪い。検索エンジンの扱いも落ちます。\n\n" +
      "そしてもう1つ、忘れられがちな問題があります。" +
      "**存在しない物件のURLを開かれたとき**です。" +
      "契約が決まって消した物件のURLが、まだ誰かのブックマークに残っています。" +
      "そこを開かれると、`item` が `undefined` のまま画面が描かれ、" +
      "`item.name` を読もうとして真っ白な画面になります。" +
      "お客さんには「壊れているサイト」に見えます。",
    insight:
      "フォルダ名を `[id]` にします。角かっこ付きの名前です。\n\n" +
      "こう書くと、SvelteKit はそこを「なんでも入る穴」として扱います。" +
      "`/bukken/sakura-101` でも `/bukken/midori-203` でも、同じ1枚のページが応えます。" +
      "そして穴に入っていた文字列が `params.id` として渡ってきます。" +
      "**フォルダ名の `[id]` と、`params.id` の `id` は同じ名前**です。ここが繋がっています。\n\n" +
      "ページは1枚。物件は何千件でもいい。増えても減っても、ファイルは1枚のままです。\n\n" +
      "見つからなかったときは、`error(404, \"...\")` を呼びます。" +
      "これは「エラーを投げる」のではなく「404 のページを出して、ここで終わりにする」という合図です。" +
      "呼んだ時点で `load` は止まり、SvelteKit が用意した 404 ページに切り替わります。\n\n" +
      "大事なのは、**これをサーバー側でやる**ことです。" +
      "ページ側で `{#if !item}見つかりません{/if}` と書いても画面は出せますが、" +
      "それは中身が空の 200 OK です。検索エンジンには「そのURLは正常に存在する」と伝わってしまい、" +
      "消したはずの物件が検索結果に残り続けます。" +
      "`error(404)` はステータスコードごと 404 にします。人間にも機械にも同じことを言う、という違いです。",
  },
  explanation:
    "フォルダ名を角かっこで囲む（`src/routes/bukken/[id]/`）と動的ルートになり、URL のその部分が可変になります。" +
    "可変部分の値は `load` の引数 `params` から取り出せます。フォルダ名 `[id]` と `params.id` のキー名は対応しています。" +
    "存在しないリソースを要求された場合は `@sveltejs/kit` の `error(404, メッセージ)` を呼びます。" +
    "呼んだ時点で `load` は中断され、HTTP ステータス 404 とともに `+error.svelte`（無ければ既定のエラーページ）が表示されます。" +
    "ページ側で「見つかりません」と描くのとは違い、ステータスコード自体が 404 になるため、" +
    "検索エンジンにも正しく「このURLはもう無い」と伝わります。" +
    "複数階層にもできます（`[category]/[id]`）。また `[...rest]` で残り全部を受けることもできます。",

  files: [
    {
      path: "src/routes/bukken/[id]/+page.server.ts",
      role: "URL の可変部分（params.id）を受け取って、その物件を探す",
      starter: `// src/routes/bukken/[id]/+page.server.ts
//
// フォルダ名が [id] なので、/bukken/なんとか がすべてここに来ます。
// 「なんとか」の部分は params.id で受け取れます。

// 1. @sveltejs/kit から error を import してください

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000, address: "世田谷区" },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000, address: "杉並区" },
  { id: "kaede-305", name: "かえでコート 305号室", rent: 94000, address: "目黒区" },
];

// 2. load を export してください。引数から params を受け取ります
//    ヒント: async ({ params }) => { ... }

// 3. params.id と一致する物件を探してください

// 4. 見つからなければ error(404, "この物件は見つかりませんでした") を呼んでください
//    ページ側で {#if} を書くのではなく、ここで止めるのが大事です

// 5. 見つかったら { bukken: ... } を return してください
`,
      model: `// src/routes/bukken/[id]/+page.server.ts
//
// フォルダ名 [id] が「なんでも入る穴」になる。
// /bukken/sakura-101 も /bukken/midori-203 も、このファイル 1 枚で応える。

import { error } from "@sveltejs/kit";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000, address: "世田谷区" },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000, address: "杉並区" },
  { id: "kaede-305", name: "かえでコート 305号室", rent: 94000, address: "目黒区" },
];

export const load = async ({ params }) => {
  // フォルダ名の [id] と params.id の id は同じ名前。ここが繋がっている。
  const bukken = BUKKEN.find((b) => b.id === params.id);

  if (!bukken) {
    // これは「例外を投げる」というより「404 を出してここで終わる」という合図。
    //
    // ページ側で {#if !bukken}見つかりません{/if} と書いても画面は出せるが、
    // それは中身が空の 200 OK。検索エンジンには「このURLは正常にある」と
    // 伝わってしまい、消した物件が検索結果に残り続ける。
    error(404, "この物件は見つかりませんでした");
  }

  return { bukken };
};
`,
    },
    {
      path: "src/routes/bukken/[id]/+page.svelte",
      role: "詳細ページ。物件が無い場合の分岐は書かなくていい",
      starter: `<script lang="ts">
  type Bukken = { id: string; name: string; rent: number; address: string };

  // 1. data を $props() で受け取ってください
</script>

<!-- 2. 物件の名前を <h1> で出してください -->

<!-- 3. 住所と家賃を出してください -->

<!-- 4. 一覧（/bukken）へ戻るリンクを置いてください -->

<!--
  注意: 「物件が見つからないとき」の分岐は書きません。
  load 側で error(404) を呼んでいるので、ここには必ず物件があります。
-->
`,
      model: `<script lang="ts">
  type Bukken = { id: string; name: string; rent: number; address: string };

  let { data }: { data: { bukken: Bukken } } = $props();
</script>

<!--
  「見つからないとき」の分岐がここに無いことが大事。
  load が error(404) で止めてくれているので、
  ここまで来た時点で data.bukken は必ずある。

  分岐を 2 か所（サーバーとページ）に書かないので、
  片方だけ直して食い違う、という事故が起きない。
-->

<h1>{data.bukken.name}</h1>

<dl>
  <dt>住所</dt>
  <dd>{data.bukken.address}</dd>

  <dt>家賃</dt>
  <dd>{data.bukken.rent.toLocaleString()}円</dd>
</dl>

<a href="/bukken">一覧へ戻る</a>
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "一覧ページ。詳細へのリンクを張ってあります（参照のみ）",
      readOnly: true,
      starter: `<!-- 一覧側。ここは書き換えなくて構いません -->
<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      <!--
        属性の中にも {} を書ける。
        item.id が "sakura-101" なら href は /bukken/sakura-101 になり、
        [id] フォルダのページが応える。
      -->
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円
    </li>
  {/each}
</ul>

<a href="/">トップへ戻る</a>
`,
      model: `<!-- 一覧側。ここは書き換えなくて構いません -->
<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円
    </li>
  {/each}
</ul>

<a href="/">トップへ戻る</a>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`load` の引数はオブジェクトで、そこから必要なものを取り出します。今回欲しいのは `params` です。`async ({ params }) => { ... }` と書きます。",
    },
    {
      level: 2,
      text: "`import { error } from \"@sveltejs/kit\";` して、見つからないときに `error(404, \"...\")` を呼びます。`throw` は不要です（付けても動きます）。呼んだ時点で `load` は止まります。",
    },
    {
      level: 3,
      text: "`const bukken = BUKKEN.find((b) => b.id === params.id);` で探し、`if (!bukken) error(404, \"この物件は見つかりませんでした\");` で止め、`return { bukken };` で返します。ページ側は `let { data } = $props();` して `data.bukken.name` を出すだけです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-03-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-03-2",
      description: "`[id]/+page.server.ts` が `load` を export しているか？",
      verify: {
        kind: "kit-export",
        file: "src/routes/bukken/[id]/+page.server.ts",
        name: "load",
      },
    },
    {
      id: "cp-sk-03-3",
      description: "`@sveltejs/kit` から `error` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/bukken/[id]/+page.server.ts",
        source: "@sveltejs/kit",
        name: "error",
      },
    },
    {
      id: "cp-sk-03-4",
      description: "見つからない場合に `error()` を呼んでいるか（ページ側の分岐で誤魔化していないか）？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/bukken/[id]/+page.server.ts",
        name: "error",
      },
    },
    {
      id: "cp-sk-03-5",
      description: "`load` が `bukken` を返しているか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/bukken/[id]/+page.server.ts",
        keys: ["bukken"],
      },
    },
    {
      id: "cp-sk-03-6",
      description: "詳細ページが `data` を `$props()` で受け取っているか？",
      verify: {
        kind: "kit-props",
        file: "src/routes/bukken/[id]/+page.svelte",
        keys: ["data"],
      },
    },
  ],

  tags: ["SvelteKit", "動的ルート", "params", "error", "404"],
  relatedIds: ["sk-02-load", "sk-04-server-boundary"],
};
