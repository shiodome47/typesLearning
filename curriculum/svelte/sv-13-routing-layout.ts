import type { Lesson } from "../types";

export const svLesson13: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-13-routing-layout",
  order: 13,
  title: "SvelteKit のルーティングと +layout.svelte",
  category: "sveltekit",
  difficulty: 2,

  goal: "ファイルの置き場所そのものが URL になることを理解し、`+layout.svelte` で全ページ共通の枠をくくり出せるようになる",

  why: {
    problem:
      "前の案件で、ルーター設定のファイルが200行を超えていました。" +
      "上から100行が `import` の羅列、その下が `path` と `component` の対応表です。\n\n" +
      "ページを1つ足すたびに、直す場所が3ヶ所ありました。" +
      "(1) ファイル冒頭に `import About from './pages/About'` を足す。" +
      "(2) 対応表に `{ path: '/about', component: About }` を足す。" +
      "(3) ヘッダーのナビに `<Link to=\"/about\">会社概要</Link>` を足す。\n\n" +
      "3ヶ所のうち1ヶ所を忘れても、アプリはビルドできます。エラーも出ません。" +
      "ナビだけ足してルート定義を忘れると、リンクは表示されるのに押すと真っ白になります。" +
      "実際にそれが本番に出て、客から「会社概要が真っ白なんですが」と連絡が来ました。" +
      "こちらは `/about` のことなど誰も見ていなかったので、指摘されるまで数日気づきませんでした。\n\n" +
      "さらに、ヘッダーとフッターをどこに置くかで揉めました。" +
      "全ページに書くのは論外なので `Layout` コンポーネントを作ったのですが、" +
      "今度は各ページが自分で `<Layout>...</Layout>` に包む決まりになりました。" +
      "包み忘れたページが1枚あり、そのページだけヘッダーが消えていました。" +
      "これもビルドは通ります。",
    insight:
      "SvelteKit の答えは「対応表を無くす」です。**ファイルを置いた場所が、そのまま URL になります**。\n\n" +
      "`src/routes/about/+page.svelte` を作れば `/about` が生えます。" +
      "import 文も、ルート定義も、書く場所がありません。書く場所が無いので、忘れようがありません。" +
      "逆にファイルを消せばそのURLは消えます。" +
      "「コードには残っているのにどこからも使われていないページ」が発生しません。\n\n" +
      "`+` で始まる名前は SvelteKit の予約語です。" +
      "`+page.svelte` が「このURLの中身」、`+layout.svelte` が「ここから下の全ページを包む枠」、" +
      "`+error.svelte` が「ここから下で失敗したときに出す画面」。" +
      "`[slug]` のように角括弧のフォルダを作れば、そこは可変部分になります。" +
      "URL の構造とフォルダの構造が同じ形をしているので、" +
      "「この画面のコードはどこ？」に URL を見るだけで答えられます。\n\n" +
      "レイアウトも「各ページが包む」のではなく「上から被さる」向きです。" +
      "`+layout.svelte` は自分の下にあるすべてのページを勝手に包みます。ページ側は何も書きません。" +
      "だから包み忘れは起こりません。" +
      "包まれる中身は `let { children } = $props()` で受け取り、置きたい場所で `{@render children()}` と書きます。" +
      "この2行がレイアウトの本体です。\n\n" +
      "そして画面遷移は素の `<a href=\"/about\">` です。" +
      "`<Link>` のような専用コンポーネントはありません。" +
      "SvelteKit が `<a>` のクリックを引き取って、ページ全体を再読込せずに中身だけ差し替えます。" +
      "JavaScript が動かない環境でも、ただのリンクとしてちゃんと動きます。",
  },
  explanation:
    "SvelteKit は `src/routes/` 以下のディレクトリ構造をそのまま URL にします。" +
    "`+page.svelte` がそのURLの本体、`[slug]` のような角括弧のディレクトリが可変部分、" +
    "`+layout.svelte` がそのディレクトリ以下の全ページを包む枠、`+error.svelte` が失敗時の画面です。" +
    "レイアウトは包む中身を `let { children } = $props()` で受け取り、`{@render children()}` の位置に描画します。" +
    "リンクは専用コンポーネントではなく素の `<a href>` を使い、現在地は `$app/state` の `page.url.pathname` で判定します。" +
    "（このエディタは1ファイルなので、ここでは `+layout.svelte` の1枚だけを書きます。他のファイルはコメントで構成を示しています。）",

  starterCode: `<!--
  想定するファイル構成（このエディタでは +layout.svelte の1枚だけを書きます）

  src/routes/
  ├── +layout.svelte        ← いま書くファイル。すべてのページを包む
  ├── +page.svelte          → /
  ├── +error.svelte         → この下で失敗したときの画面
  ├── about/
  │   └── +page.svelte      → /about
  └── blog/
      ├── +page.svelte      → /blog
      └── [slug]/
          └── +page.svelte  → /blog/hello-world など
-->

<script lang="ts">
  // 1. 現在のURLを知るために $app/state の page を import してください

  // 2. 包む中身を children として $props() から受け取ってください

  // 3. ナビに出すリンクの一覧を配列で定義してください
  //    （href と label を持つオブジェクトの配列）
</script>

<!-- 4. header を書き、ナビのリンクを {#each} で並べてください -->
<!--    リンクは <Link> ではなく素の <a href={...}> です -->
<!--    現在地のリンクには aria-current="page" を付けてください -->

<!-- 5. main の中に、包まれる中身を描画してください -->

<!-- 6. footer を書いてください -->
`,

  modelAnswer: `<!--
  src/routes/
  ├── +layout.svelte        ← このファイル。/ 以下すべてのページを包む
  ├── +page.svelte          → /
  ├── +error.svelte         → この下で失敗したときの画面
  ├── about/
  │   └── +page.svelte      → /about
  └── blog/
      ├── +layout.svelte    → /blog 以下だけをさらに包む（入れ子にできる）
      ├── +page.svelte      → /blog
      └── [slug]/
          └── +page.svelte  → /blog/hello-world（slug = "hello-world"）

  ファイルを置けばURLが生える。ルート定義の表も import 文も書く場所が無い。
-->

<script lang="ts">
  // page.url で「いまどこを見ているか」が分かる。
  // Svelte 5 では $app/stores（$page）ではなく $app/state（page）を使う。
  import { page } from "$app/state";

  // 包まれる中身（= 下位の +layout.svelte や +page.svelte）が children として渡ってくる。
  let { children } = $props();

  // ナビの定義はここ1ヶ所だけ。ページの追加時に直すのはここだけで、
  // ルート定義と import は存在しないので忘れようがない。
  const links = [
    { href: "/", label: "ホーム" },
    { href: "/blog", label: "ブログ" },
    { href: "/about", label: "会社概要" },
  ];
</script>

<header>
  <a href="/" class="logo">MyShop</a>

  <nav>
    {#each links as link (link.href)}
      <!-- 素の <a href>。SvelteKit がクリックを引き取って中身だけ差し替える -->
      <a
        href={link.href}
        aria-current={page.url.pathname === link.href ? "page" : undefined}
      >{link.label}</a>
    {/each}
  </nav>
</header>

<main>
  <!-- ここに各ページの中身が入る。ページ側は何も書かなくてよい -->
  {@render children()}
</main>

<footer>
  <small>2026 MyShop</small>
</footer>
`,

  hints: [
    {
      level: 1,
      text: "レイアウトがやることは2つだけです。「包む中身を受け取る」ことと「それをどこに置くかを指定する」こと。受け取りは props、置く場所はテンプレートに書きます。",
    },
    {
      level: 2,
      text: "`let { children } = $props();` で受け取り、置きたい場所に `{@render children()}` と書きます。現在地は `import { page } from \"$app/state\";` の `page.url.pathname` で分かります。",
    },
    {
      level: 3,
      text: "ナビは `{#each links as link (link.href)}` で回し、`<a href={link.href} aria-current={page.url.pathname === link.href ? \"page\" : undefined}>{link.label}</a>` と書きます。`<Link>` のような専用コンポーネントは SvelteKit にはありません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-13-1",
      description: "レイアウトがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-13-2",
      description: "包む中身を `$props()` から受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-13-3",
      description: "受け取った中身を `{@render children()}` で描画できているか？",
      verify: { kind: "svelte-ast", query: "render" },
    },
    {
      id: "cp-sv-13-4",
      description: "リンクが `<Link>` ではなく素の `<a href={...}>` になっているか？",
    },
    {
      id: "cp-sv-13-5",
      description: "`src/routes/blog/[slug]/+page.svelte` がどのURLになるか、`+page` / `+layout` / `+error` の役割の違いを説明できるか？",
    },
  ],

  tags: [
    "SvelteKit",
    "ルーティング",
    "+layout.svelte",
    "children",
    "@render",
    "$app/state",
    "+error.svelte",
  ],
  relatedIds: ["sv-14-load-data", "sv-15-diagnose-server-shared-state"],
};
