import type { Lesson } from "../types";

export const grLesson01: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-01-types-annotation",
  order: 26,
  title: "① `$types` で load に型を付ける — フォルダ名の打ち間違いを型で止める",
  category: "tooling",
  difficulty: 3,

  goal: "`./$types` の `PageServerLoad` / `PageData` を使い、`params` のキー名や `data` の中身の間違いを実行前に止められるようになる",

  why: {
    problem:
      "SvelteKit編の③で、動的ルートを書きました。フォルダは `[id]`、コードは `params.id`。合っています。\n\n" +
      "半年後、AIに「この詳細ページに賃料の絞り込みを足して」と頼みます。" +
      "返ってきたコードの中に、こう書いてありました。\n\n" +
      "`const bukken = await getBukken(params.slug);`\n\n" +
      "`slug` です。`id` ではありません。" +
      "AIは世の中に大量にある `[slug]` のサンプルを学習しているので、こう書くほうが自然なのです。\n\n" +
      "**これは動きます。** `params.slug` は `undefined` になるだけで、例外は出ません。" +
      "`getBukken(undefined)` が何も見つけられず、`error(404)` に落ちる。" +
      "つまり画面には「この物件は見つかりませんでした」と出ます。\n\n" +
      "あなたはこれを見て「データが入っていないのかな」と思います。" +
      "DBを確認します。物件はあります。おかしい。1時間溶けます。\n\n" +
      "同じことがページ側でも起きます。" +
      "`load` が `{ bukken }` を返しているのに、ページ側が `data.property.name` と書いている。" +
      "これも書いた時点では何も言われず、開いたときに真っ白になります。",
    insight:
      "SvelteKit は、**あなたが作ったフォルダ構造から型を自動生成しています。**\n\n" +
      "`src/routes/bukken/[id]/` というフォルダを作った瞬間、" +
      "「このページの `params` は `{ id: string }` である」という型がどこかに書き出されています。" +
      "その置き場所が `./$types` です。\n\n" +
      "`import type { PageServerLoad } from \"./$types\";` と書いて、\n" +
      "`export const load: PageServerLoad = ...` と型を付けるだけで、" +
      "`params.slug` は**書いた瞬間に赤くなります**。存在しないキーだからです。\n\n" +
      "ページ側も同じです。`PageData` を使うと、`data` の中身が `load` の戻り値そのものになります。" +
      "`load` が `{ bukken }` を返しているなら、`data.property` は赤くなります。\n\n" +
      "ここが面白いところなのですが、**この型はあなたが書いたものではありません。** " +
      "フォルダ名と `load` の戻り値から、勝手に導かれたものです。" +
      "だから `load` の返すものを変えれば、ページ側の型も自動で変わります。" +
      "両方を手で直す必要がありません。\n\n" +
      "AIが大量にコードを書く時代に、この1行が効く理由はここにあります。" +
      "**AIは「よくある書き方」を書きます。あなたのフォルダ名は知りません。** " +
      "その食い違いを、人間のレビューではなく型に見つけさせる、という話です。",
  },
  explanation:
    "SvelteKit はルートごとに型定義を自動生成し、`./$types` から import できるようにしています。" +
    "`+page.server.ts` では `PageServerLoad`、`+page.ts` では `PageLoad`、" +
    "`+layout.server.ts` では `LayoutServerLoad` を使います。" +
    "型を付けると `params` のキーはフォルダ名（`[id]` なら `id`）に限定され、" +
    "`fetch` や `locals` などの引数にも正しい型が付きます。" +
    "ページ側では `PageData` を使うと、`data` の型が `load` の戻り値から自動的に導かれます。" +
    "これらは手書きの型定義ではなくフォルダ構造とコードから生成されるため、" +
    "ルートを変更すれば型も追随し、二重管理になりません。" +
    "生成は `svelte-kit sync`（`npm run dev` / `npm run build` の際に自動実行）で行われます。",

  files: [
    {
      path: "src/routes/bukken/[id]/+page.server.ts",
      role: "フォルダ名は [id]。params のキーも id のはず",
      starter: `// src/routes/bukken/[id]/+page.server.ts
//
// AIが書いてきたコードです。動きます。エラーは出ません。
// ただし「見つかりません」しか出ません。

import { error } from "@sveltejs/kit";

// 1. ./$types から PageServerLoad を型として import してください
//    import type { ... } from "./$types";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000 },
];

// 2. load に PageServerLoad の型注釈を付けてください
//    export const load: PageServerLoad = ...
//
// 3. 型を付けると、下の params.slug が間違いだと分かるはずです。
//    フォルダ名は [id] なので、正しいキーは何でしょうか。
export const load = async ({ params }) => {
  const bukken = BUKKEN.find((b) => b.id === params.slug);
  if (!bukken) error(404, "この物件は見つかりませんでした");
  return { bukken };
};
`,
      model: `// src/routes/bukken/[id]/+page.server.ts

import { error } from "@sveltejs/kit";
// この型は自分で書いたものではない。
// src/routes/bukken/[id]/ というフォルダを作った時点で、
// SvelteKit が「params は { id: string } である」と書き出している。
import type { PageServerLoad } from "./$types";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000 },
];

// 型を付けた瞬間、params.slug は赤くなる。存在しないキーだから。
//
// AI は世の中に大量にある [slug] のサンプルを学習しているので、
// params.slug と書くほうがむしろ自然。
// その食い違いを、人間のレビューではなく型に見つけさせる。
export const load: PageServerLoad = async ({ params }) => {
  const bukken = BUKKEN.find((b) => b.id === params.id);
  if (!bukken) error(404, "この物件は見つかりませんでした");
  return { bukken };
};
`,
    },
    {
      path: "src/routes/bukken/[id]/+page.svelte",
      role: "PageData を使うと data の中身が load の戻り値そのものになる",
      starter: `<script lang="ts">
  // 1. ./$types から PageData を型として import してください

  // 2. data に PageData の型を付けてください
  //    let { data }: { data: PageData } = $props();
  let { data } = $props();
</script>

<!-- 3. 型を付けると、下の data.property が間違いだと分かるはずです。 -->
<!--    load は何という名前で返していましたか？ -->
<h1>{data.property.name}</h1>
<p>{data.property.rent}円</p>

<a href="/bukken">一覧へ戻る</a>
`,
      model: `<script lang="ts">
  // PageData は load の戻り値から自動的に導かれる型。
  // load が return { bukken } なら、data は { bukken: ... } になる。
  //
  // 手書きの型定義ではないので、load の返すものを変えれば
  // こちら側の型も自動で変わる。二重管理にならない。
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<!-- data.property は赤くなる。load が返しているのは bukken だから。 -->
<h1>{data.bukken.name}</h1>
<p>{data.bukken.rent.toLocaleString()}円</p>

<a href="/bukken">一覧へ戻る</a>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`$types` は自分で作るファイルではありません。フォルダ構造から SvelteKit が自動生成しているので、`import type { ... } from \"./$types\";` と書けばもう使えます。",
    },
    {
      level: 2,
      text: "サーバー側は `import type { PageServerLoad } from \"./$types\";` して `export const load: PageServerLoad = async ({ params }) => {...}`。ページ側は `import type { PageData } from \"./$types\";` して `let { data }: { data: PageData } = $props();` です。",
    },
    {
      level: 3,
      text: "型を付けたら2か所直します。`params.slug` → `params.id`（フォルダ名が `[id]` だから）。`data.property` → `data.bukken`（`load` が `return { bukken }` しているから）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-01-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-01-2",
      description: "`./$types` から `PageServerLoad` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/bukken/[id]/+page.server.ts",
        source: "./$types",
        name: "PageServerLoad",
      },
    },
    {
      id: "cp-gr-01-3",
      description: "`load` に `PageServerLoad` の型注釈が付いているか？",
      verify: {
        kind: "kit-annotated",
        file: "src/routes/bukken/[id]/+page.server.ts",
        name: "load",
        type: "PageServerLoad",
      },
    },
    {
      id: "cp-gr-01-4",
      description: "`params.slug` をやめたか（フォルダ名は `[id]` なので存在しないキー）？",
      verify: {
        kind: "kit-member",
        file: "src/routes/bukken/[id]/+page.server.ts",
        object: "params",
        property: "slug",
        expect: false,
      },
    },
    {
      id: "cp-gr-01-5",
      description: "`params.id` を使っているか？",
      verify: {
        kind: "kit-member",
        file: "src/routes/bukken/[id]/+page.server.ts",
        object: "params",
        property: "id",
      },
    },
    {
      id: "cp-gr-01-6",
      description: "ページ側が `./$types` から `PageData` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/bukken/[id]/+page.svelte",
        source: "./$types",
        name: "PageData",
      },
    },
    {
      id: "cp-gr-01-7",
      description: "ページ側が `data.bukken` を見ているか（`data.property` ではなく）？",
      verify: {
        kind: "kit-member",
        file: "src/routes/bukken/[id]/+page.svelte",
        object: "data",
        property: "bukken",
      },
    },
    {
      id: "cp-gr-01-8",
      description: "ページがコンパイルできるか？",
      verify: {
        kind: "svelte-compile",
        file: "src/routes/bukken/[id]/+page.svelte",
      },
    },
  ],

  tags: ["SvelteKit", "$types", "PageServerLoad", "PageData", "型生成"],
  relatedIds: ["sk-03-dynamic-route", "gr-02-app-d-ts", "sk-02-load"],
};
