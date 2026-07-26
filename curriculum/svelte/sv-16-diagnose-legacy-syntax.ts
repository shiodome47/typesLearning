import type { Lesson } from "../types";

export const svLesson16: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-16-diagnose-legacy-syntax",
  order: 16,
  title: "診断: AIが書いた「Svelte 5 風」コードとガードレールの設置",
  category: "runes",
  difficulty: 4,

  goal: "Svelte 4 の記法の混入を見抜いてルーンに統一し、さらに同じ混入を機械が自動で検出する仕組みを設置できるようになる",

  why: {
    problem:
      "生成AIに「Svelte でカウンターのコンポーネントを作って」と頼みました。" +
      "10秒で出てきました。読んでみるとそれらしい。貼り付けます。動きます。\n\n" +
      "そのままコミットしようとして、`npm run check` を通したら12件エラーが出ました。" +
      "`npm run dev` のターミナルには黄色い警告が並んでいます。" +
      "同僚が pull したら、その人の環境ではビルドが落ちました。\n\n" +
      "なぜこうなるのか。" +
      "世に出ている Svelte のコードの大半は、まだ Svelte 4 で書かれています。" +
      "ブログ記事も、Stack Overflow の回答も、GitHub のサンプルも、その多くが `export let` と `$:` の時代のものです。" +
      "AI はそれを学習しています。" +
      "「Svelte のコードを書け」と言われたら、統計的に多数派である Svelte 4 を書くのが自然な振る舞いです。\n\n" +
      "本当に厄介なのは、Svelte 5 が互換モードを持っていることです。" +
      "1つもルーンを使っていないファイルは「これは Svelte 4 のコードだな」と判定され、旧記法のまま動いてしまいます。" +
      "つまり**半分だけ動く**。" +
      "動いてしまうので、レビューでも見落とされ、そのままマージされます。\n\n" +
      "そして、あるとき誰かがそのファイルに `$state` を1つ足します。" +
      "その瞬間、ファイル全体がルーンモードに切り替わり、" +
      "それまで平気だった `export let` と `$:` が一斉にコンパイルエラーになります。" +
      "1行足しただけの人が、身に覚えのない大量の赤を踏むことになります。\n\n" +
      "1回直すだけでは終わりません。次に AI に頼んだときも、また Svelte 4 が出てきます。" +
      "人間の注意力で毎回止めるのは無理です。",
    insight:
      "Svelte 5 のファイルには「ルーンモード」と「レガシーモード」の2つの状態があり、" +
      "**ルーンを1つでも使った時点でそのファイルはルーンモードになります**。" +
      "モードはファイル単位で、混ぜることはできません。" +
      "だから旧記法と新記法が同居したコードは、いずれ必ず折れます。\n\n" +
      "対応表は短いので覚えてしまうのが早いです。\n\n" +
      "・`export let x` → `let { x } = $props()`\n" +
      "・`$: doubled = c * 2` → `const doubled = $derived(c * 2)`\n" +
      "・`on:click={fn}` → `onclick={fn}`\n" +
      "・`<slot />` → `{@render children?.()}`\n" +
      "・`createEventDispatcher()` → ただの関数を props で受け取る（`onchange?.(value)`）\n\n" +
      "前の2つは**エラー**（`legacy_export_invalid` / `legacy_reactive_statement_invalid`）、" +
      "後ろの2つは**警告**（`event_directive_deprecated` / `slot_element_deprecated`）です。" +
      "警告のほうがたちが悪いことに注意してください。エラーは止まりますが、警告は流れていきます。\n\n" +
      "ここからが本題です。この回で本当に持ち帰ってほしいのは対応表ではありません。" +
      "**「気をつける」を「検出される」に置き換える**という発想です。\n\n" +
      "同じ指摘を2回するはめになったら、それは人間がやる仕事ではありません。" +
      "`svelte-check` を CI で走らせれば旧記法も型の食い違いも落ちます。" +
      "`eslint-plugin-svelte` の `svelte/valid-compile` を使えば、" +
      "コンパイラの警告そのものを ESLint のエラーとして扱えます。" +
      "つまり `on:click` や `<slot />` が「黄色い文字」ではなく「マージできない赤」になります。" +
      "`svelte/require-each-key` はキー無しの `{#each}` を、" +
      "`svelte/no-at-html-tags` は `{@html}` による XSS の入口を止めてくれます。\n\n" +
      "AI にコードを書かせる時代のレビューは、1件のコードを直すことではなく、" +
      "**次の1000件が自動で止まる仕掛けを1回だけ置くこと**です。" +
      "設置は10分で終わり、効果はプロジェクトが続く限り続きます。",
  },
  explanation:
    "Svelte 5 のファイルは、ルーンを1つでも使うと「ルーンモード」になります。" +
    "ルーンモードでは `export let`（`legacy_export_invalid`）と `$:`（`legacy_reactive_statement_invalid`）が**コンパイルエラー**、" +
    "`on:click`（`event_directive_deprecated`）と `<slot />`（`slot_element_deprecated`）が**警告**になります。" +
    "`createEventDispatcher` はエラーにも警告にもなりませんが、非推奨で、コールバックを props として受け取る形に置き換えます。" +
    "混入を人間の目で止め続けるのは不可能なので、`svelte-check` を CI に入れ、" +
    "`eslint-plugin-svelte` の `svelte/valid-compile`（コンパイラ警告をエラー化）、" +
    "`svelte/require-each-key`、`svelte/no-at-html-tags` を有効にして、機械が止める形にします。",

  symptom:
    "生成AIに書かせたコンポーネントは画面上は動くが、`npm run check` が12件エラーを出し、`npm run dev` のターミナルに警告が並ぶ。誰かがこのファイルに `$state` を1つ足した瞬間、`export let` と `$:` が一斉にコンパイルエラーになる。",

  brokenCode: `<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label = "カウント";
  export let step = 1;

  let count = 0;

  $: doubled = count * 2;

  const dispatch = createEventDispatcher();

  function increment() {
    count += step;
    dispatch("change", count);
  }
</script>

<div class="counter">
  <slot name="title" />

  <p>{label}: {count} / 2倍: {doubled}</p>

  <button on:click={increment}>+{step}</button>

  <slot />
</div>`,

  defects: [
    {
      id: "d-sv-16-1",
      summary: "`export let` で props を受け取っている（ルーンモードではコンパイルエラー）",
      why:
        "ルーンモードでは `export let` は使えず、" +
        "`Cannot use export let in runes mode`（`legacy_export_invalid`）で止まります。" +
        "`let { label = \"カウント\", step = 1 } = $props()` に置き換えます。" +
        "分割代入なので、既定値も型注釈もこの1行にまとまります。",
      marker: 'export let label = "カウント";',
    },
    {
      id: "d-sv-16-2",
      summary: "`$:` で派生値を作っている（ルーンモードではコンパイルエラー）",
      why:
        "`$: doubled = count * 2` はルーンモードでは `legacy_reactive_statement_invalid` エラーになります。" +
        "`const doubled = $derived(count * 2)` に置き換えます。" +
        "`$:` は「どの値に依存しているか」が実行してみるまで確定しない曖昧な仕組みでしたが、" +
        "`$derived` は式そのものが依存関係なので、読んだだけで分かります。",
      marker: "$: doubled = count * 2;",
    },
    {
      id: "d-sv-16-3",
      summary: "`on:click` を使っている（警告 `event_directive_deprecated`）",
      why:
        "Svelte 5 のイベントは素の HTML と同じ `onclick={...}` です。" +
        "`on:click` は動きはしますが警告が出ます。" +
        "エラーではなく警告なので、ターミナルの黄色い文字として流れていき、そのままマージされます。" +
        "「動くが警告」がいちばん残りやすい欠陥です。",
      marker: "<button on:click={increment}>",
    },
    {
      id: "d-sv-16-4",
      summary: "`<slot>` で子要素を受け取っている（警告 `slot_element_deprecated`）",
      why:
        "Svelte 5 では子要素はスニペットとして props で渡ってきます。" +
        "`let { children, title } = $props()` で受け取り、`{@render children?.()}` の位置に描画します。" +
        "名前付き `<slot name=\"title\" />` は `title` という props に対応します。" +
        "`?.()` を付けると、渡されなかったときに何も描かれません。",
      marker: '<slot name="title" />',
    },
    {
      id: "d-sv-16-5",
      summary: "`createEventDispatcher` でイベントを飛ばしている（非推奨）",
      why:
        "`createEventDispatcher` は Svelte 5 では非推奨で、将来削除されます。" +
        "`CustomEvent` を作る分だけ遅く、型も付きにくい仕組みでした。" +
        "`onchange?: (value: number) => void` のようにただの関数を props で受け取り、" +
        "`onchange?.(count)` と呼ぶだけで済みます。引数の型がそのまま効きます。",
      marker: 'dispatch("change", count);',
    },
    {
      id: "d-sv-16-6",
      summary: "同じ混入を次から自動で止める仕組みが無い",
      why:
        "AI に頼むたびに Svelte 4 のコードが出てくるので、人間のレビューで止め続けるのは不可能です。" +
        "`svelte-check` を CI に入れて型と旧記法を落とし、" +
        "`eslint-plugin-svelte` の `svelte/valid-compile` でコンパイラの警告をエラーに昇格させます" +
        "（`on:click` と `<slot />` が「黄色い文字」から「マージできない赤」になります）。" +
        "併せて `svelte/require-each-key` と `svelte/no-at-html-tags` も有効にしておきます。" +
        "1回設置すれば、以後すべての混入が自動で止まります。",
    },
  ],

  fixedCode: `<script lang="ts">
  import type { Snippet } from "svelte";

  // props は分割代入で受け取る。既定値も型もこの1ヶ所にまとまる。
  // 子要素（旧 <slot>）は Snippet 型の props として渡ってくる。
  type Props = {
    label?: string;
    step?: number;
    /** 旧 dispatch("change", n) の代わり。ただの関数を受け取る */
    onchange?: (value: number) => void;
    /** 旧 <slot name="title" /> */
    title?: Snippet;
    /** 旧 <slot /> */
    children?: Snippet;
  };

  let {
    label = "カウント",
    step = 1,
    onchange,
    title,
    children,
  }: Props = $props();

  let count = $state(0);

  // $: ではなく $derived。式そのものが依存関係なので、読めば分かる。
  const doubled = $derived(count * 2);

  function increment() {
    count += step;
    // CustomEvent を作らず、渡された関数をそのまま呼ぶ。
    // 渡されていなければ ?. で何も起きない。
    onchange?.(count);
  }
</script>

<div class="counter">
  {@render title?.()}

  <p>{label}: {count} / 2倍: {doubled}</p>

  <!-- イベントは素の HTML と同じ小文字・コロン無し -->
  <button onclick={increment}>+{step}</button>

  {@render children?.()}
</div>

<!--
  ── 使う側 ──────────────────────────────────────────────────

  <Counter step={5} onchange={(n) => console.log(n)}>
    {#snippet title()}
      <h2>売上カウンター</h2>
    {/snippet}

    <p>ボタンを押すと 5 ずつ増えます</p>
  </Counter>

  ── 次から機械に止めさせる（1回だけ設置する） ───────────────

  # 1. 型と旧記法を CI で落とす
  #    package.json:  "check": "svelte-check --tsconfig ./tsconfig.json"
  #    CI:            npm run check

  # 2. コンパイラの警告をエラーに昇格させる
  #    eslint.config.js:
  #      import svelte from "eslint-plugin-svelte";
  #      export default [
  #        ...svelte.configs["flat/recommended"],
  #        {
  #          rules: {
  #            // on:click / <slot /> などコンパイラ警告を ESLint エラーにする
  #            "svelte/valid-compile": "error",
  #            // キーの無い {#each} を禁止（並べ替えで中身がずれる）
  #            "svelte/require-each-key": "error",
  #            // {@html} を禁止（XSS の入口）
  #            "svelte/no-at-html-tags": "error",
  #          },
  #        },
  #      ];
-->`,

  hints: [
    {
      level: 1,
      text: "このファイルには Svelte 4 の書き方が5種類混ざっています。props の受け取り方、派生値の作り方、イベントの書き方、子要素の受け取り方、親へのイベントの返し方。それぞれ Svelte 5 での対応物があります。",
    },
    {
      level: 2,
      text: "`export let x` → `let { x } = $props()`、`$: y = ...` → `const y = $derived(...)`、`on:click` → `onclick`、`<slot />` → `{@render children?.()}`、`createEventDispatcher` → コールバックを props で受け取る、です。前2つはエラー、次2つは警告になります。",
    },
    {
      level: 3,
      text: "`import type { Snippet } from \"svelte\";` して `type Props = { label?: string; step?: number; onchange?: (value: number) => void; title?: Snippet; children?: Snippet }` を定義し、`let { label = \"カウント\", step = 1, onchange, title, children }: Props = $props();` と書きます。`count` は `$state(0)`、`doubled` は `$derived(count * 2)`、`dispatch(\"change\", count)` は `onchange?.(count)` です。名前付きスロットは `{@render title?.()}` になります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-16-1",
      description: "ルーンモードでコンパイルが通るか（`export let` と `$:` が残っていないか）？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-16-2",
      description: "props を `$props()` で受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-16-3",
      description: "派生値を `$derived` で書けているか？",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-16-4",
      description: "子要素を `{@render ...}` で描画できているか（`<slot>` を置き換えられたか）？",
      verify: { kind: "svelte-ast", query: "render" },
    },
    {
      id: "cp-sv-16-5",
      description: "イベントが `onclick`（小文字・コロン無し）になっているか？",
      verify: { kind: "svelte-no-warning", code: "event_directive_deprecated" },
    },
    {
      id: "cp-sv-16-6",
      description: "`<slot>` が1つも残っていないか？",
      verify: { kind: "svelte-no-warning", code: "slot_element_deprecated" },
    },
    {
      id: "cp-sv-16-7",
      description: "`svelte-check` と `eslint-plugin-svelte`（`svelte/valid-compile` など）を設置して、次の混入を機械が止める形にできるか？",
    },
  ],

  tags: [
    "Svelte 5 移行",
    "ルーンモード",
    "export let",
    "createEventDispatcher",
    "slot",
    "svelte-check",
    "eslint-plugin-svelte",
    "AI生成コードのレビュー",
  ],
  relatedIds: ["sv-12-shared-state-class", "sv-13-routing-layout", "ts-37-diagnose-missing-exhaustive"],
};
