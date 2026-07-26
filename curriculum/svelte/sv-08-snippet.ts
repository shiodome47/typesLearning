import type { Lesson } from "../types";

export const svLesson08: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-08-snippet",
  order: 8,
  title: "snippet と {@render}（マークアップを渡す）",
  category: "components",
  difficulty: 3,

  goal: "`children` snippet と引数付き snippet を使って、マークアップの再利用ができるようになる",

  why: {
    problem:
      "カードの枠を作りました。角丸、影、余白、見出しの下線。デザイン通りにできました。\n\n" +
      "翌日、「中に画像を入れたカード」が必要になりました。枠は同じです。中身だけ違います。" +
      "`Card.svelte` をコピーして `CardWithImage.svelte` を作りました。2分で済みました。\n\n" +
      "その次は「ボタンを置くカード」、その次は「表を入れるカード」、その次は「見出しに丸いバッジを付けるカード」。" +
      "気づくと `CardWithTitle` `CardWithImage` `CardWithButton` `CardWithTable` `CardWithBadge` の5ファイルが並んでいます。" +
      "どれも中身が10行違うだけで、外側の枠のコードは完全に同じです。\n\n" +
      "そしてデザイナーから連絡が来ます。「見出しの下の余白、8px 詰めてください」。\n\n" +
      "5ファイル開いて、同じ数字を5回書き換えます。しかも4つ目で気が緩んで、1ファイルだけ 8px ではなく 6px にしてしまいます。" +
      "この間違いは誰も気づきません。カードは別々の画面に置かれているので、並べて比べる人がいないからです。\n\n" +
      "問題は、枠と中身がくっついたまま複製されたことです。" +
      "変えたいのは中身だけなのに、中身を変えるにはファイルごと複製するしかなかった。",
    insight:
      "snippet は「マークアップの切れ端に名前を付けたもの」です。" +
      "関数が処理に名前を付けるように、snippet はタグの並びに名前を付けます。\n\n" +
      "普通の props で渡せるのは値だけです。文字列、数値、配列。" +
      "でもカードに渡したいのは値ではなく `<img>` や `<table>` そのもの——つまりマークアップです。" +
      "snippet はそれを渡せるようにします。\n\n" +
      "使い方は2つ揃いです。\n" +
      "・渡す側: `{#snippet header(t)}<h2>{t}</h2>{/snippet}` でマークアップに名前を付ける\n" +
      "・受ける側: `{@render header('売上')}` でその場所に展開する\n\n" +
      "特別扱いされる名前が1つだけあります。`children` です。" +
      "`<Card>ここに書いたもの</Card>` のようにタグの中に直接書いたマークアップは、" +
      "自動的に `children` という snippet になって子に届きます。" +
      "子は `{@render children()}` と書くだけで、それを好きな位置に置けます。\n\n" +
      "snippet は引数を取れるのが強力なところです。`Snippet<[string]>` は「文字列を1つ受け取る snippet」という型です。" +
      "受け取る側は `{@render header(title)}` のように、自分が持っているデータを渡して描いてもらえます。" +
      "枠は枠の都合（余白やレイアウト）だけを知り、中身は中身の都合だけを知る、という分担ができます。\n\n" +
      "なお Svelte 4 では同じことを `<slot>` でやっていましたが、**Svelte 5 で `<slot>` は非推奨**です。" +
      "使うと `slot_element_deprecated` という警告が出ます。" +
      "AI に Svelte のコードを書かせると Svelte 4 の書き方が混ざることがよくあるので、" +
      "`<slot>` を見かけたら「これは古い記法だ」と気づけるようにしておいてください。",
  },
  explanation:
    "snippet は再利用できるマークアップの断片で、`{#snippet name(引数)}...{/snippet}` で定義し、`{@render name(値)}` で描画します。" +
    "コンポーネントのタグの中に直接書いたマークアップは `children` という名前の snippet として props に届き、`{@render children()}` で好きな位置に置けます。" +
    "型は `import type { Snippet } from \"svelte\"` で取得し、引数なしなら `Snippet`、文字列を1つ取るなら `Snippet<[string]>` と書きます。" +
    "省略可能な snippet は `{@render footer?.()}` のようにオプショナル呼び出しで安全に描画できます。" +
    "Svelte 4 の `<slot>` は Svelte 5 では非推奨（`slot_element_deprecated`）で、snippet に置き換わりました。",

  starterCode: `<script lang="ts">
  // 汎用のカード枠 Card.svelte を作ります。
  // 中身が違うだけのコンポーネントを量産しないための部品です。

  // 1. Snippet 型をインポートしてください
  //    import type { Snippet } from "svelte";

  // 2. Props 型を定義してください
  //    title: string                 … 既定の見出しに使う文字
  //    header?: Snippet<[string]>    … 見出しを差し替えたいときだけ渡す（title を引数で受け取る）
  //    children: Snippet             … カードの中身（必須）
  //    footer?: Snippet              … 下部（任意）

  // 3. $props() で受け取ってください
</script>

<!-- 4. {#snippet defaultHeader(text)} で既定の見出し <h2> を定義してください -->

<!-- 5. カードの枠を書き、その中で
       ・見出し: header が渡されていればそれを、無ければ defaultHeader を title 付きで描画
       ・中身:   {@render children()}
       ・下部:   footer があるときだけ描画
     を行ってください -->

<!--
  親側ではこう使います:

  <Card title="今月の売上">
    {#snippet header(t)}
      <h2 class="accent">{t}<span class="badge">確定</span></h2>
    {/snippet}

    <p>1,200,000円</p>

    {#snippet footer()}
      <a href="/reports">詳細を見る</a>
    {/snippet}
  </Card>
-->
`,

  modelAnswer: `<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /** 既定の見出しに使う文字 */
    title: string;
    /** 見出しを丸ごと差し替えたいときだけ渡す。title を引数で受け取れる */
    header?: Snippet<[string]>;
    /** タグの中に書いたマークアップが自動的にここへ届く */
    children: Snippet;
    /** 下部。渡されないこともある */
    footer?: Snippet;
  }

  let { title, header, children, footer }: Props = $props();
</script>

<!-- header が渡されなかったときの既定の見出し。
     ここに名前を付けておけば、下の {@render} を条件分岐だらけにしなくて済む -->
{#snippet defaultHeader(text: string)}
  <h2 class="card-title">{text}</h2>
{/snippet}

<section class="card">
  <div class="card-header">
    <!-- 渡された header があればそれを、無ければ defaultHeader を使う。
         どちらも「文字列を1つ受け取る snippet」なので同じ呼び方でよい -->
    {@render (header ?? defaultHeader)(title)}
  </div>

  <div class="card-body">
    <!-- <Card>...</Card> のタグの中に書かれたものがここに展開される -->
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</section>

<!--
  footer のように省略可能な snippet は、if で囲まずに
  {@render footer?.()} と書いてもよい。
  枠（div.card-footer）ごと消したいなら {#if} を使い、
  中身だけ空にしてよいなら ?.() を使う、と使い分ける。

  Svelte 4 では <slot /> や <slot name="header" /> でこれを書いていたが、
  Svelte 5 では非推奨で slot_element_deprecated という警告が出る。
-->
`,

  hints: [
    {
      level: 1,
      text: "コンポーネントを増やすのではなく、枠だけを1つ作って「中身」を外から受け取ります。値ではなくマークアップを渡す仕組みが snippet です。まず `import type { Snippet } from \"svelte\";` から始めます。",
    },
    {
      level: 2,
      text: "`children` は特別な名前で、`<Card>…</Card>` のタグの中身が自動的に入ってきます。受け取り側は `let { children }: { children: Snippet } = $props();` とし、置きたい位置に `{@render children()}` と書きます。",
    },
    {
      level: 3,
      text: "引数付きは `header?: Snippet<[string]>` と型を書き、`{@render header(title)}` のように呼びます。既定値を用意するには `{#snippet defaultHeader(text: string)}<h2>{text}</h2>{/snippet}` を定義して `{@render (header ?? defaultHeader)(title)}` とします。任意の snippet は `{@render footer?.()}` で安全に描けます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-08-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-08-2",
      description: "`$props()` で `children` などの snippet を受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-08-3",
      description: "`{#snippet ...}` でマークアップに名前を付けられているか？",
      verify: { kind: "svelte-ast", query: "snippet" },
    },
    {
      id: "cp-sv-08-4",
      description: "`{@render ...}` で snippet を描画できているか？",
      verify: { kind: "svelte-ast", query: "render" },
    },
    {
      id: "cp-sv-08-5",
      description: "Svelte 4 の `<slot>` を使っていないか？（使うと `slot_element_deprecated` 警告が出ます）",
      verify: { kind: "svelte-no-warning", code: "slot_element_deprecated" },
    },
    {
      id: "cp-sv-08-6",
      description: "省略可能な snippet を `{#if}` か `?.()` で安全に扱えているか？",
      verify: { kind: "svelte-ast", query: "block:if" },
    },
    {
      id: "cp-sv-08-7",
      description: "`Snippet<[string]>` のように、snippet が受け取る引数を型で表せたか？",
    },
  ],

  tags: ["snippet", "@render", "children", "Snippet型", "slot", "コンポーネント設計", "Svelte 5"],
  relatedIds: ["sv-07-bindable", "sv-09-diagnose-each-key"],
};
