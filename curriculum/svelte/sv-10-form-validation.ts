import type { Lesson } from "../types";

export const svLesson10: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-10-form-validation",
  order: 10,
  title: "フォーム（bind・検証・ラベル結合）",
  category: "a11y",
  difficulty: 2,

  goal: "入力を `bind:` で受け、送信前に検証し、`label` と `input` を正しく結びつけられるようになる",

  why: {
    problem:
      "問い合わせフォームを納品しました。お名前、メールアドレス、内容、送信ボタン。" +
      "デザインカンプ通りのピクセルパーフェクト。テストも通っています。\n\n" +
      "数日後、クライアントから連絡が来ます。" +
      "「スマホでラベルをタップしても入力欄が反応しないと言われています」。\n\n" +
      "手元の PC で試すと、入力欄をクリックすれば普通に入力できます。何が問題なのか分かりません。" +
      "スマホで開いてみて、ようやく気づきます。" +
      "「お名前」という文字をタップしても、キーボードが出てこないのです。" +
      "小さい入力欄を正確に指で狙わないと入力を始められません。\n\n" +
      "さらに数日後、別の連絡が来ます。スクリーンリーダーを使っている方から" +
      "「フォームに何を入れる欄なのか分からない」。" +
      "読み上げソフトは入力欄に到達したとき「編集テキスト」としか言いません。" +
      "画面には確かに「お名前」と書いてあるのですが、それは入力欄の**隣にある文字**であって、" +
      "その入力欄の名前だとはコンピュータには分かりません。" +
      "人間は位置関係で読み取れますが、読み上げソフトは位置では判断しないのです。\n\n" +
      "開発中、誰もこれに気づきませんでした。見た目は完璧だったからです。" +
      "「ラベルの隣に入力欄がある」ことと「ラベルが入力欄に結びついている」ことは、" +
      "画面上ではまったく同じに見えます。違いはコードにしかありません。\n\n" +
      "しかもこの件では、送信ボタンにも別の問題が潜んでいました。" +
      "検証をせずに送っていたので、空欄のまま送信された問い合わせが数十件、" +
      "「誰からか分からない問い合わせ」として溜まっていたのです。",
    insight:
      "`<label for=\"contact-name\">` と `<input id=\"contact-name\">` の組は、" +
      "「この文字はこの入力欄の名前です」という、コンピュータに読める宣言です。\n\n" +
      "これを書くと3つのことが同時に手に入ります。\n" +
      "・ラベルの文字をクリック／タップすると入力欄にフォーカスが移る（当たり判定が広がる）\n" +
      "・読み上げソフトが「お名前、編集テキスト」と読む\n" +
      "・自動テストが「お名前の欄」で要素を探せるようになる\n\n" +
      "見た目には何も起きません。だから忘れられます。" +
      "でも `for` と `id` の2語を書き忘れただけで、指の細かい操作が苦手な人と、" +
      "画面を見ずに使う人が、そのフォームを使えなくなります。\n\n" +
      "検証のほうは、`$derived` で考えると素直に書けます。" +
      "「エラーメッセージ」は、入力内容から**計算で決まる値**です。" +
      "`name` が空なら「お名前を入力してください」、埋まっていれば空文字。" +
      "入力が変わるたびに自分で再計算する必要はなく、`$derived` に式を書いておけば勝手に追随します。\n\n" +
      "送信は `onsubmit` で受けて、最初に `event.preventDefault()` を呼びます。" +
      "これを忘れるとブラウザが本来のフォーム送信を行い、ページが再読み込みされて入力が消えます。\n\n" +
      "最後に細かいけれど効く工夫を1つ。エラーは「送信ボタンを押すまで出さない」ことです。" +
      "打ち始めた瞬間から赤い「入力してください」が出るフォームは、" +
      "まだ何も間違えていない人を責めているように見えます。" +
      "`submitted` というフラグを1つ持って、押されてから表示します。",
  },
  explanation:
    "フォームの入力値は `$state` で持ち、`<input bind:value={name} />` で双方向に結びます（チェックボックスは `bind:checked`）。" +
    "検証結果は入力から計算できる値なので `$derived` で書き、入力が変わるたびに自動で更新させます。" +
    "送信は `<form onsubmit={handleSubmit}>` で受け、ハンドラの先頭で `event.preventDefault()` を呼んでブラウザ既定の送信（ページ再読み込み）を止めます。" +
    "`<label for=\"...\">` と `<input id=\"...\">` を同じ文字列で結ぶと、ラベルのクリックでフォーカスが移り、支援技術がその入力欄の名前を認識できます。" +
    "結びつけを忘れると Svelte は `a11y_label_has_associated_control` という警告を出します。" +
    "エラー文の要素を `aria-describedby` で入力欄に紐づけ、`aria-invalid` を立てると、読み上げでもエラー内容が伝わります。",

  starterCode: `<script lang="ts">
  // 問い合わせフォームを作ります。

  // 1. name / email / message を $state("") で宣言してください

  // 2. submitted を $state(false) で宣言してください（送信ボタンを押したかどうか）

  // 3. $derived で各項目のエラーメッセージを書いてください
  //    nameError    : 空なら「お名前を入力してください」、そうでなければ ""
  //    emailError   : 空なら「メールアドレスを入力してください」
  //                   "@" を含まないなら「メールアドレスの形式が正しくありません」
  //                   そうでなければ ""
  //    messageError : 10文字未満なら「お問い合わせ内容は10文字以上で入力してください」

  // 4. $derived で hasError（いずれかのエラーが空でない）を書いてください

  // 5. handleSubmit(event: SubmitEvent) を書いてください
  //    ・event.preventDefault() を最初に呼ぶ
  //    ・submitted = true にする
  //    ・hasError なら return して送信しない
</script>

<!-- 6. <form onsubmit={handleSubmit} novalidate> で囲んでください -->

<!-- 7. 各項目に label と input を置き、for と id を同じ文字列で結んでください -->

<!-- 8. 各 input に bind:value を付けてください（内容は textarea） -->

<!-- 9. submitted が true で、かつエラーがあるときだけエラー文を表示してください -->

<!-- 10. 送信ボタン（type="submit"）を置いてください -->
`,

  modelAnswer: `<script lang="ts">
  let name = $state("");
  let email = $state("");
  let message = $state("");

  // エラーを最初から赤く出すと、まだ何も間違えていない人を責めることになる。
  // 送信ボタンが押されてから表示する。
  let submitted = $state(false);

  // エラーメッセージは入力から計算で決まる値なので $derived で書く。
  // 自分で再計算する必要はなく、入力が変われば自動で追随する。
  const nameError = $derived(name.trim() === "" ? "お名前を入力してください" : "");

  const emailError = $derived(
    email.trim() === ""
      ? "メールアドレスを入力してください"
      : !email.includes("@")
        ? "メールアドレスの形式が正しくありません"
        : ""
  );

  const messageError = $derived(
    message.trim().length < 10 ? "お問い合わせ内容は10文字以上で入力してください" : ""
  );

  const hasError = $derived(nameError !== "" || emailError !== "" || messageError !== "");

  function handleSubmit(event: SubmitEvent) {
    // これを忘れるとブラウザが本来のフォーム送信を行い、
    // ページが再読み込みされて入力内容が消える
    event.preventDefault();

    submitted = true;
    if (hasError) return;

    console.log({ name, email, message });
  }
</script>

<!-- novalidate でブラウザ既定の検証UIを止め、こちら側の表示に統一する -->
<form onsubmit={handleSubmit} novalidate>
  <div class="field">
    <!-- for と id を同じ文字列で結ぶ。これだけで
         ・ラベルをタップすると入力欄にフォーカスが移る
         ・読み上げソフトが「お名前、編集テキスト」と読む -->
    <label for="contact-name">お名前</label>
    <input
      id="contact-name"
      type="text"
      bind:value={name}
      aria-invalid={submitted && nameError !== ""}
      aria-describedby={submitted && nameError !== "" ? "contact-name-error" : undefined}
    />
    {#if submitted && nameError !== ""}
      <p id="contact-name-error" class="error">{nameError}</p>
    {/if}
  </div>

  <div class="field">
    <label for="contact-email">メールアドレス</label>
    <input
      id="contact-email"
      type="email"
      bind:value={email}
      aria-invalid={submitted && emailError !== ""}
      aria-describedby={submitted && emailError !== "" ? "contact-email-error" : undefined}
    />
    {#if submitted && emailError !== ""}
      <p id="contact-email-error" class="error">{emailError}</p>
    {/if}
  </div>

  <div class="field">
    <label for="contact-message">お問い合わせ内容</label>
    <textarea
      id="contact-message"
      rows="5"
      bind:value={message}
      aria-invalid={submitted && messageError !== ""}
      aria-describedby={submitted && messageError !== "" ? "contact-message-error" : undefined}
    ></textarea>
    {#if submitted && messageError !== ""}
      <p id="contact-message-error" class="error">{messageError}</p>
    {/if}
  </div>

  <button type="submit">送信する</button>
</form>

<!--
  ラベルは入力欄を包む書き方でも結びつく:

  <label>
    お名前
    <input type="text" bind:value={name} />
  </label>

  どちらでもよいが、for / id のほうがレイアウトの自由度が高い。
  「隣に文字が置いてある」だけでは結びついていないので、必ずどちらかにする。
-->
`,

  hints: [
    {
      level: 1,
      text: "見た目は変えずにコードだけで直す部分があります。ラベルの文字と入力欄が「隣にある」だけでは、コンピュータには関係が分かりません。関係を明示する属性の組が必要です。",
    },
    {
      level: 2,
      text: "`<label for=\"contact-name\">お名前</label>` と `<input id=\"contact-name\" bind:value={name} />` のように、`for` と `id` を同じ文字列にします。検証は `const nameError = $derived(name.trim() === \"\" ? \"お名前を入力してください\" : \"\");` の形で書けます。",
    },
    {
      level: 3,
      text: "送信は `function handleSubmit(event: SubmitEvent) { event.preventDefault(); submitted = true; if (hasError) return; ... }` として `<form onsubmit={handleSubmit} novalidate>` に渡します。エラー文は `{#if submitted && nameError !== \"\"}` で囲み、その `<p>` に `id` を付けて入力欄の `aria-describedby` から指すと、読み上げでもエラー内容が伝わります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-10-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-10-2",
      description: "入力値を `$state` で持てているか？",
      verify: { kind: "svelte-ast", query: "rune:$state" },
    },
    {
      id: "cp-sv-10-3",
      description: "エラーメッセージを `$derived` で計算できているか？（自分で再代入していないか）",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-10-4",
      description: "入力欄を `bind:value` で結べているか？",
      verify: { kind: "svelte-ast", query: "directive:bind" },
    },
    {
      id: "cp-sv-10-5",
      description: "`label` と入力欄が結びついているか？（結び忘れると `a11y_label_has_associated_control` 警告が出ます）",
      verify: { kind: "svelte-no-warning", code: "a11y_label_has_associated_control" },
    },
    {
      id: "cp-sv-10-6",
      description: "エラー表示を `{#if}` で条件付きにできているか？",
      verify: { kind: "svelte-ast", query: "block:if" },
    },
    {
      id: "cp-sv-10-7",
      description: "`handleSubmit` の先頭で `event.preventDefault()` を呼び、ページが再読み込みされないことを確認できたか？",
    },
    {
      id: "cp-sv-10-8",
      description: "エラーを最初から出さず、送信ボタンを押してから表示するようにできたか？",
    },
  ],

  tags: ["form", "bind:value", "$derived", "バリデーション", "label", "for/id", "aria-describedby", "アクセシビリティ"],
  relatedIds: ["sv-07-bindable", "sv-02-derived-values", "sv-11-diagnose-a11y"],
};
