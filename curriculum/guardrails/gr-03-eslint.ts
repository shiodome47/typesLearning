import type { Lesson } from "../types";

export const grLesson03: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-03-eslint",
  order: 28,
  title: "③ 前に目で見つけた地雷を、機械に見つけさせる — eslint-plugin-svelte",
  category: "tooling",
  difficulty: 3,

  goal: "`eslint.config.js` に Svelte 用のルールを設定し、`{#each}` のキー忘れと `{@html}` を書いた瞬間に止められるようになる",

  why: {
    problem:
      "ここまでの教材で、あなたは2つの地雷を**目で**見つけました。\n\n" +
      "1つは `{#each}` のキー忘れ（sv-09）。並べ替えたときに表示と中身がずれるやつです。\n" +
      "もう1つは `{@html}` による XSS（sk-09）。他人の入力を HTML として解釈してしまうやつです。\n\n" +
      "見つけられました。よかった。でも、ここで冷静に考えてください。\n\n" +
      "**あの2つは、教材が「ここに問題があります」と教えてくれた状態で探しました。**\n\n" +
      "実際の案件では、そうはいきません。" +
      "AIに「一覧に絞り込みを足して」と頼むと、200行が返ってきます。" +
      "1日に何回もやります。1週間で数千行になります。\n\n" +
      "そのすべてについて「`{#each}` にキーはあるか」「`{@html}` を使っていないか」を" +
      "目で確認し続けられますか。**続けられません。人間はそういう作業に向いていません。**\n\n" +
      "しかも厄介なことに、この2つは**見落としても何も起きません**。" +
      "エラーは出ない。テストも通る。動く。" +
      "気づくのは半年後、お客さんが並べ替えボタンを押したときか、" +
      "誰かが物件名に `<script>` を入れたときです。\n\n" +
      "レビューを頑張る、という解決策は、量が増えた瞬間に破綻します。",
    insight:
      "Lint は「コードの書き方に関する自動テスト」です。\n\n" +
      "`eslint-plugin-svelte` を入れて、`eslint.config.js` にルールを2行足す。それだけです。\n\n" +
      "```\n" +
      '"svelte/require-each-key": "error",\n' +
      '"svelte/no-at-html-tags": "error",\n' +
      "```\n\n" +
      "これで、キーの無い `{#each}` を書いた瞬間にエディタに赤線が出ます。" +
      "`{@html}` も同じです。**AIが書いたコードを貼り付けた瞬間に、その場で赤くなります。**\n\n" +
      "ここが本質的に重要なところです。\n" +
      "**あなたのレビュー能力は、コードの量が増えても増えません。" +
      "でも Lint は、何行来ようが同じ精度で見ます。**\n\n" +
      "AIが大量にコードを書く時代に効くのは、あなたが速く読めるようになることではなく、" +
      "読まなくても止まる仕組みを先に置いておくことです。\n\n" +
      "そして `\"error\"` にすることが大事です。`\"warn\"` にすると、警告は溜まっていき、" +
      "3か月後には200件の警告に埋もれて誰も見なくなります。" +
      "**止めるべきものは止める。それが嫌なら、そのルールは外す。** 中間はありません。\n\n" +
      "もちろん Lint は万能ではありません。" +
      "「認可の書き忘れ」や「秘密を返している」は Lint では止まりません。" +
      "止まる範囲と止まらない範囲を知っておくこと自体が、この編の目的です（⑥でやります）。",
  },
  explanation:
    "`eslint-plugin-svelte` は Svelte 専用の ESLint プラグインで、" +
    "`.svelte` ファイルのテンプレート構文まで解析できます。" +
    "設定は `eslint.config.js`（Flat Config）に `export default [...]` の形で書きます。" +
    "推奨セット（`svelte.configs[\"flat/recommended\"]`）を展開したうえで、" +
    "個別のルールを `rules` で上書きします。" +
    "`svelte/require-each-key` はキーの無い `{#each}` を、" +
    "`svelte/no-at-html-tags` は `{@html}` の使用を検出します。" +
    "重要度は `\"error\"` にしてください。`\"warn\"` は蓄積して無視されるようになり、" +
    "結果として無いのと同じになります。" +
    "どうしても `{@html}` が必要な箇所は、その行だけ " +
    "`<!-- eslint-disable-next-line svelte/no-at-html-tags -->` で意図的に外し、" +
    "「なぜ安全と言えるのか」をコメントで残します。",

  files: [
    {
      path: "eslint.config.js",
      role: "Lint の設定。ここに書いたルールが全ファイルに効く",
      starter: `// eslint.config.js
//
// ESLint の設定ファイル（Flat Config）。
// ここに書いたルールが、プロジェクト全体に効きます。

import svelte from "eslint-plugin-svelte";

export default [
  ...svelte.configs["flat/recommended"],
  {
    rules: {
      // 1. {#each} のキー忘れを止めるルールを足してください
      //    ルール名: svelte/require-each-key
      //    重要度は "error" にします（"warn" は溜まって無視されるので）

      // 2. {@html} を止めるルールを足してください
      //    ルール名: svelte/no-at-html-tags
    },
  },
];
`,
      model: `// eslint.config.js

import svelte from "eslint-plugin-svelte";

export default [
  ...svelte.configs["flat/recommended"],
  {
    rules: {
      // sv-09 で目で見つけた地雷。これでもう目で探さなくていい。
      // 並べ替えたときに表示と中身がずれる問題を、書いた瞬間に止める。
      "svelte/require-each-key": "error",

      // sk-09 で目で見つけた地雷。他人の入力を HTML として解釈する危険。
      "svelte/no-at-html-tags": "error",

      // "warn" ではなく "error" にする理由:
      // warn にすると警告は溜まっていき、3か月後には
      // 200件の警告に埋もれて誰も見なくなる。
      // 止めるべきものは止める。それが嫌ならルールごと外す。中間は無い。
    },
  },
];

// Lint が止められないもの（⑥で扱う）:
//   ・認可の書き忘れ
//   ・load が秘密を返していること
//   ・そもそもの仕様の間違い
// 止まる範囲と止まらない範囲を知っておくこと自体が大事。
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "Lint を入れると赤くなる箇所が2つあります",
      starter: `<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  <!-- 3. Lint を入れると、この {#each} が赤くなります。直してください -->
  {#each data.items as item}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>

      <!-- 4. ここも赤くなります。 -->
      <!--    description は担当者が入力する文字列です -->
      <p>{@html item.description}</p>
    </li>
  {/each}
</ul>
`,
      model: `<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  <!--
    svelte/require-each-key が止めてくれる。
    もう「キーを書いたか」を目で確認する必要がない。
  -->
  {#each data.items as item (item.id)}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>

      <!--
        svelte/no-at-html-tags が止めてくれる。
        {} なら Svelte が自動でエスケープするので、
        <b> は文字として表示されるだけで済む。
      -->
      <p>{item.description}</p>
    </li>
  {/each}
</ul>

<!--
  どうしても {@html} が必要なとき（サニタイズ済みの CMS 本文など）は、
  その行だけ意図的に外し、なぜ安全と言えるかを残す:

    <!-- eslint-disable-next-line svelte/no-at-html-tags -- >
    <!-- sanitizeHtml() を通した後の値なので許可 -- >
    {@html sanitized}

  ルールごと外すのではなく1行だけ外すのが大事。
  「例外である」ことが記録に残る。
-->
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`rules` の中に「ルール名: 重要度」を2組書くだけです。ルール名は文字列で、`svelte/` から始まります。",
    },
    {
      level: 2,
      text: "`\"svelte/require-each-key\": \"error\",` と `\"svelte/no-at-html-tags\": \"error\",` の2行です。`\"warn\"` にしないでください。",
    },
    {
      level: 3,
      text: "`.svelte` 側も直します。`{#each data.items as item}` → `{#each data.items as item (item.id)}`。`{@html item.description}` → `{item.description}`。Lint が赤くしてくれるので、直す場所を探す必要はありません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-03-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-03-2",
      description: "`eslint.config.js` に `svelte/require-each-key` を設定したか？",
      verify: {
        kind: "kit-contains-string",
        file: "eslint.config.js",
        value: "svelte/require-each-key",
      },
    },
    {
      id: "cp-gr-03-3",
      description: "`eslint.config.js` に `svelte/no-at-html-tags` を設定したか？",
      verify: {
        kind: "kit-contains-string",
        file: "eslint.config.js",
        value: "svelte/no-at-html-tags",
      },
    },
    {
      id: "cp-gr-03-4",
      description: "設定を export しているか？",
      verify: { kind: "kit-export", file: "eslint.config.js", name: "default" },
    },
    {
      id: "cp-gr-03-5",
      description: "Lint が指摘する `{#each}` のキー忘れを直したか？",
      verify: {
        kind: "svelte-ast",
        query: "each:keyed",
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-gr-03-6",
      description: "Lint が指摘する `{@html}` をやめたか？",
      verify: {
        kind: "svelte-ast",
        query: "html-tag",
        expect: false,
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-gr-03-7",
      description: "`\"warn\"` ではなく `\"error\"` にすべき理由を説明できるか？",
    },
  ],

  tags: ["ESLint", "eslint-plugin-svelte", "Lint", "ガードレール", "XSS"],
  relatedIds: ["sv-09-diagnose-each-key", "sk-09-diagnose-review", "gr-04-svelte-check"],
};
