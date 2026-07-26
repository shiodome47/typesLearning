import type { Lesson } from "../types";

export const skLesson06: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-06-form-actions",
  order: 22,
  title: "⑥ 問い合わせフォーム — form actions と fail",
  category: "sveltekit",
  difficulty: 4,

  goal: "`<form method=\"POST\">` と `actions` でフォーム送信を処理し、`fail()` で入力エラーを返して画面に出せるようになる",

  why: {
    problem:
      "問い合わせフォームを作ります。よくある作り方はこうです。\n\n" +
      "`<button onclick={send}>` を置いて、`send` の中で `fetch(\"/api/toiawase\", { method: \"POST\", body: ... })` する。" +
      "`e.preventDefault()` を書いて、`loading` を立てて、`error` を持って、成功したら画面を切り替える。" +
      "60行くらいになります。動きます。\n\n" +
      "問題が出るのは、それ以外の状況です。\n\n" +
      "1つ目。**JavaScript が読み込まれる前に送信ボタンを押されたら、何も起きません。** " +
      "回線の細い場所や古い端末では、HTML は出ているのに JS がまだ来ていない、という時間が数秒あります。" +
      "その間、フォームは「見えているのに動かない」状態です。押した人には、ただ無反応に見えます。\n\n" +
      "2つ目。送信に失敗して「メールアドレスの形式が正しくありません」と出したあと、" +
      "**利用者が入力した内容が全部消えます。** 長い問い合わせ文を書いた人は、もう一度書き直しです。" +
      "残すには、入力値を全部 `$state` で持って、エラー時に書き戻す処理を自分で書く必要があります。\n\n" +
      "3つ目。検証をブラウザ側にしか書かなかった場合、" +
      "`fetch` を直接叩かれれば検証は素通りします。" +
      "「必須項目」は、ブラウザの中でだけ必須でした。",
    insight:
      "SvelteKit は、この問題を「HTML のフォームに戻る」ことで解きます。\n\n" +
      "`<form method=\"POST\">` と書きます。ただの HTML です。" +
      "送信先は `+page.server.ts` の `actions` です。\n\n" +
      "何が変わるか。**JavaScript が1バイトも読み込まれていなくても、フォームは動きます。** " +
      "ブラウザがもともと持っている機能だからです。" +
      "JS が来ていない数秒間も、フォームは正しく送信されます。" +
      "これを「段階的強化（progressive enhancement）」と言います。" +
      "土台は素の HTML で動き、JS が来たらもっと良くなる、という考え方です。\n\n" +
      "検証は `actions` の中、つまり**サーバー側**に書きます。" +
      "ブラウザを経由しない攻撃者にも同じ検証がかかります。" +
      "「ブラウザの中でだけ必須」ということが起きません。\n\n" +
      "入力エラーを返すときは `fail(400, { ... })` を使います。" +
      "`error()` とは違います。`error()` はエラーページに飛ばして終わり。" +
      "`fail()` は**同じページに戻ってくる**ためのものです。\n\n" +
      "`fail` に渡したオブジェクトは、ページ側に `form` という props で届きます。" +
      "だからここに入力値も一緒に入れて返せば、" +
      "`<input value={form?.name ?? \"\"}>` と書くだけで入力内容が残ります。" +
      "「書いたものが消えた」がなくなります。\n\n" +
      "覚えることは、名前が2つだけです。**`actions` を export する。`form` を受け取る。** それだけです。",
  },
  explanation:
    "`+page.server.ts` から `actions` を export すると、そのページへの POST を処理できます。" +
    "ページ側は `<form method=\"POST\">` と書くだけで、JavaScript 無しでも送信できます（段階的強化）。" +
    "アクションの引数から `request` を取り、`await request.formData()` で送信内容を読みます。" +
    "入力の検証は必ずサーバー側で行います。ブラウザ側の検証は迂回できるためです。" +
    "検証に失敗したときは `@sveltejs/kit` の `fail(400, { ... })` を返します。" +
    "`error()` がエラーページへ遷移させるのに対し、`fail()` は同じページに戻り、" +
    "渡したオブジェクトがページ側の `form` props に届きます。" +
    "そこに入力値も含めて返せば、`<input value={form?.name ?? \"\"}>` で入力内容を復元できます。" +
    "アクションが複数あるときは名前を付け（`actions = { create, delete }`）、" +
    "フォーム側で `action=\"?/create\"` と指定します。",

  files: [
    {
      path: "src/routes/toiawase/+page.server.ts",
      role: "フォームの送信先。検証はここ（サーバー側）に書く",
      starter: `// src/routes/toiawase/+page.server.ts

// 1. @sveltejs/kit から fail を import してください

// 2. actions という名前で export してください
//    形は { default: async ({ request }) => { ... } } です
//    （名前を付けない場合は default）
//
//    中でやること:
//      a. const data = await request.formData();
//      b. name と message を取り出す
//      c. どちらかが空なら fail(400, { ... }) を返す
//         このとき、利用者が入力した値も一緒に返してください
//         （そうしないと、エラー時に入力内容が全部消えます）
//      d. 問題なければ { success: true } を返す
//
//    検証をブラウザ側ではなくここに書くのが大事です。
//    fetch を直接叩かれても、この検証は必ず通ります。
`,
      model: `// src/routes/toiawase/+page.server.ts

import { fail } from "@sveltejs/kit";

export const actions = {
  // 名前を付けない場合は default。
  // 複数あるときは { create: ..., delete: ... } のようにして、
  // フォーム側で action="?/create" と指定する。
  default: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    // 検証は必ずサーバー側に書く。
    // ブラウザ側の検証は fetch を直接叩けば素通りするので、
    // 「ブラウザの中でだけ必須」になってしまう。
    if (!name || !message) {
      // fail は error と違い、エラーページに飛ばさず「同じページに戻る」。
      //
      // ここで渡したものが、ページ側に form という props で届く。
      // 入力値も一緒に返すことで、エラー時に書いた内容が消えなくなる。
      return fail(400, {
        error: "お名前とご用件は必須です。",
        name,
        message,
      });
    }

    // 本番ではここでメール送信や DB 保存を行う
    return { success: true };
  },
};
`,
    },
    {
      path: "src/routes/toiawase/+page.svelte",
      role: "フォーム本体。ただの HTML の `<form>` で、JS 無しでも動く",
      starter: `<script lang="ts">
  // 1. form を $props() で受け取ってください
  //    fail() で返したオブジェクトがここに届きます
  //    （まだ何も送信していないときは undefined です）
</script>

<h1>お問い合わせ</h1>

<!-- 2. <form> を作ってください。method="POST" が必要です -->
<!--    これがあるだけで、JavaScript が無くても送信できます -->

<!--    中身:
          - エラーがあれば form.error を出す
          - name="name" の <input>
            value に form?.name を入れて、エラー時に消えないようにする
          - name="message" の <textarea>
          - 送信ボタン
          - 成功したら form.success を見てお礼を出す
-->
`,
      model: `<script lang="ts">
  type FormResult = {
    error?: string;
    success?: boolean;
    name?: string;
    message?: string;
  };

  // fail() や return で渡したものが form として届く。
  // まだ送信していないときは undefined なので、必ず form?. で触る。
  let { form }: { form?: FormResult } = $props();
</script>

<h1>お問い合わせ</h1>

{#if form?.success}
  <p>お問い合わせありがとうございました。</p>
{:else}
  <!--
    ただの HTML の <form>。
    JavaScript が 1 バイトも来ていなくても、これは送信できる。
    ブラウザがもともと持っている機能だから。
  -->
  <form method="POST">
    {#if form?.error}
      <p role="alert">{form.error}</p>
    {/if}

    <label>
      お名前
      <!--
        value に form?.name を戻すことで、
        エラーで戻ってきたときに入力内容が消えない。
      -->
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
  ],

  hints: [
    {
      level: 1,
      text: "サーバー側で export する名前は `actions` です。ページ側で受け取る props の名前は `form` です。この2つの名前が仕様なので、変えると動きません。",
    },
    {
      level: 2,
      text: "`export const actions = { default: async ({ request }) => { ... } };` と書きます。送信内容は `const data = await request.formData();` して `data.get(\"name\")` で読みます。`<input name=\"name\">` の `name` 属性がキーになります。",
    },
    {
      level: 3,
      text: "検証に失敗したら `return fail(400, { error: \"...\", name, message });`。ページ側は `let { form } = $props();` で受け取り、`<input name=\"name\" value={form?.name ?? \"\"} />` と書けば入力が残ります。`form` は最初 undefined なので必ず `form?.` で触ってください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-06-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-06-2",
      description: "`+page.server.ts` が `actions` を export しているか？",
      verify: {
        kind: "kit-export",
        file: "src/routes/toiawase/+page.server.ts",
        name: "actions",
      },
    },
    {
      id: "cp-sk-06-3",
      description: "`@sveltejs/kit` から `fail` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/toiawase/+page.server.ts",
        source: "@sveltejs/kit",
        name: "fail",
      },
    },
    {
      id: "cp-sk-06-4",
      description: "検証エラーで `fail()` を返しているか（`error()` ではなく）？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/toiawase/+page.server.ts",
        name: "fail",
      },
    },
    {
      id: "cp-sk-06-5",
      description: "`<form>` に `method=\"POST\"` が付いているか（JS 無しでも動く土台）？",
      verify: {
        kind: "kit-attr",
        file: "src/routes/toiawase/+page.svelte",
        element: "form",
        name: "method",
        value: "POST",
      },
    },
    {
      id: "cp-sk-06-6",
      description: "ページが `form` を `$props()` で受け取っているか？",
      verify: {
        kind: "kit-props",
        file: "src/routes/toiawase/+page.svelte",
        keys: ["form"],
      },
    },
  ],

  tags: ["SvelteKit", "form actions", "fail", "段階的強化", "バリデーション"],
  relatedIds: ["sk-05-layout", "sk-07-enhance", "sv-10-form-validation"],
};
