import type { Lesson } from "../types";

export const skLesson07: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-07-enhance",
  order: 23,
  title: "⑦ 送信を滑らかにする — use:enhance",
  category: "sveltekit",
  difficulty: 3,

  goal: "`use:enhance` を1語足すだけでフォーム送信をページ再読み込み無しにでき、それが「無くても動く」上乗せであることを説明できるようになる",

  why: {
    problem:
      "前回のフォームは正しく動きます。ただ、送信するとページ全体が読み込み直されます。\n\n" +
      "画面が一瞬白くなります。スクロール位置が先頭に戻ります。" +
      "フォームがページの下のほうにあると、送信後に自分がどこにいるのか分からなくなります。" +
      "エラーメッセージも画面の外にあって見えません。「押したけど何も起きなかった」と思われます。\n\n" +
      "ここで元のやり方に戻したくなります。`onclick` で `fetch` して、`preventDefault` して……。" +
      "でもそれをやると、前回せっかく手に入れた「JS が無くても動く」も" +
      "「サーバー側で検証される」も、全部失われます。\n\n" +
      "滑らかさを取るか、頑丈さを取るか。**ふつうはここで二者択一を迫られます。**",
    insight:
      "SvelteKit の答えは「どちらも取る」です。\n\n" +
      "`<form method=\"POST\" use:enhance>` と、1語足すだけです。\n\n" +
      "これが何をするか。JavaScript が読み込まれた**あとで**、フォームの送信を横取りして、" +
      "ページ全体の再読み込みではなく裏で送信するように差し替えます。" +
      "画面は白くならず、スクロール位置も保たれ、エラーは目の前に出ます。\n\n" +
      "大事なのは、**JS が来ていなければ何も起きない**ということです。" +
      "`use:enhance` が効いていない状態のフォームは、前回のまま、素の HTML として正しく動きます。\n\n" +
      "つまりこれは「機能を実現するための必須部品」ではなく「上乗せ」です。" +
      "**土台は素の HTML で完成していて、JS が来たら滑らかになる。** " +
      "この順番が段階的強化（progressive enhancement）です。\n\n" +
      "順番が逆——つまり「JS で作って、JS が無い場合を後から考える」——だと、" +
      "たいてい後半は永久にやってきません。" +
      "SvelteKit が `<form>` から始めさせるのは、そのためです。\n\n" +
      "`use:` という書き方は SvelteKit 専用ではなく、Svelte の一般的な仕組み（アクション）です。" +
      "「この DOM 要素ができたら、この関数に渡して好きにさせる」という意味で、" +
      "外部ライブラリを要素に取り付けるときにも同じ書き方を使います。",
  },
  explanation:
    "`use:enhance` は `$app/forms` から import して `<form>` に付ける Svelte アクションです。" +
    "付けると、フォーム送信をページ全体の再読み込みではなく非同期通信に差し替え、" +
    "結果を受け取って `form` props を更新し、`data` を再取得します。" +
    "スクロール位置とページの状態が保たれます。" +
    "重要なのは、これが「上乗せ」であることです。JavaScript が読み込まれていない状態では `use:enhance` は何もせず、" +
    "フォームは素の HTML として正常に送信されます。" +
    "つまり `use:enhance` を消しても機能は失われず、滑らかさだけが失われます。" +
    "送信前後に処理を挟みたい場合は `use:enhance={callback}` の形でコールバックを渡します" +
    "（送信直前の確認、送信後の `update()` の制御など）。",

  files: [
    {
      path: "src/routes/toiawase/+page.svelte",
      role: "前回のフォームに1語足すだけ。土台は変えない",
      starter: `<script lang="ts">
  type FormResult = {
    error?: string;
    success?: boolean;
    name?: string;
    message?: string;
  };

  // 1. $app/forms から enhance を import してください

  let { form }: { form?: FormResult } = $props();
</script>

<h1>お問い合わせ</h1>

{#if form?.success}
  <p>お問い合わせありがとうございました。</p>
{:else}
  <!--
    2. 下の <form> に use:enhance を足してください。
       method="POST" は消さないでください。

       消さない理由: use:enhance は「上乗せ」だからです。
       JS が来ていない間は use:enhance は何もせず、
       method="POST" の素の HTML として送信されます。
  -->
  <form method="POST">
    {#if form?.error}
      <p role="alert">{form.error}</p>
    {/if}

    <label>
      お名前
      <input name="name" value={form?.name ?? ""} />
    </label>

    <label>
      ご用件
      <textarea name="message">{form?.message ?? ""}</textarea>
    </label>

    <button type="submit">送信する</button>
  </form>
{/if}
`,
      model: `<script lang="ts">
  import { enhance } from "$app/forms";

  type FormResult = {
    error?: string;
    success?: boolean;
    name?: string;
    message?: string;
  };

  let { form }: { form?: FormResult } = $props();
</script>

<h1>お問い合わせ</h1>

{#if form?.success}
  <p>お問い合わせありがとうございました。</p>
{:else}
  <!--
    method="POST" が土台、use:enhance が上乗せ。

    JS が来ていない間: use:enhance は存在しないので、
                       素の HTML フォームとして正しく送信される。
    JS が来たあと:     送信を横取りして裏で送る。
                       画面は白くならず、スクロール位置も保たれる。

    だから use:enhance を消しても機能は失われない。滑らかさだけが失われる。
  -->
  <form method="POST" use:enhance>
    {#if form?.error}
      <p role="alert">{form.error}</p>
    {/if}

    <label>
      お名前
      <input name="name" value={form?.name ?? ""} />
    </label>

    <label>
      ご用件
      <textarea name="message">{form?.message ?? ""}</textarea>
    </label>

    <button type="submit">送信する</button>
  </form>
{/if}
`,
    },
    {
      path: "src/routes/toiawase/+page.server.ts",
      role: "サーバー側は一切変わりません（参照のみ）",
      readOnly: true,
      starter: `// サーバー側は前回のまま。1文字も変えていません。
//
// use:enhance はブラウザ側の上乗せなので、
// 受け取る側は「素の HTML から来たのか、enhance 経由か」を
// 気にする必要がありません。

import { fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !message) {
      return fail(400, { error: "お名前とご用件は必須です。", name, message });
    }

    return { success: true };
  },
};
`,
      model: `// サーバー側は前回のまま。1文字も変えていません。

import { fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !message) {
      return fail(400, { error: "お名前とご用件は必須です。", name, message });
    }

    return { success: true };
  },
};
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "足すのは2か所だけです。import 文を1行と、`<form>` タグの中に1語。それ以外は何も変えません。",
    },
    {
      level: 2,
      text: "`import { enhance } from \"$app/forms\";` を `<script>` の中に書きます。`$app/...` は SvelteKit が用意しているモジュールで、インストールは不要です。",
    },
    {
      level: 3,
      text: "`<form method=\"POST\" use:enhance>` です。`method=\"POST\"` を消さないでください。消すと JS が無い環境で送信できなくなり、段階的強化が崩れます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-07-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-07-2",
      description: "`$app/forms` から `enhance` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/toiawase/+page.svelte",
        source: "$app/forms",
        name: "enhance",
      },
    },
    {
      id: "cp-sk-07-3",
      description: "`<form>` に `use:enhance` が付いているか？",
      verify: {
        kind: "kit-use",
        file: "src/routes/toiawase/+page.svelte",
        name: "enhance",
      },
    },
    {
      id: "cp-sk-07-4",
      description:
        "`method=\"POST\"` を残しているか（消すと JS 無しで動かなくなる）？",
      verify: {
        kind: "kit-attr",
        file: "src/routes/toiawase/+page.svelte",
        element: "form",
        name: "method",
        value: "POST",
      },
    },
    {
      id: "cp-sk-07-5",
      description:
        "`use:enhance` を消したら何が失われて、何が失われないか説明できるか？",
    },
  ],

  tags: ["SvelteKit", "use:enhance", "$app/forms", "段階的強化", "アクション"],
  relatedIds: ["sk-06-form-actions", "sk-08-hooks-auth"],
};
