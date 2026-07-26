import type { Lesson } from "../types";

export const svLesson11: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-11-diagnose-a11y",
  order: 11,
  title: "診断: クリックできる div（コンパイラ警告を読む）",
  category: "a11y",
  difficulty: 2,

  goal: "a11y 警告を読み、セマンティックHTMLに直せるようになる。警告を「消す」のではなく「直す」判断ができるようになる",

  why: {
    problem:
      "`npm run dev` のターミナルには、ずっと黄色い文字が出ていました。" +
      "5行くらい。開発中は毎回スクロールで流れていきます。" +
      "画面は普通に動くし、赤いエラーではないので、そのうち見なくなりました。\n\n" +
      "デザイン担当から来た指示は「メニューは div で作ってください。button だとブラウザ既定のスタイルが効いて面倒なので」。" +
      "確かに `<div onclick={...}>` にすれば、余計な枠線も背景色も付きません。CSS が素直に当たります。" +
      "そのとき黄色い文字が1行増えましたが、動いているので次の作業に進みました。\n\n" +
      "途中、黄色い文字が気になって少し調べたことはあります。" +
      "`role=\"button\"` と `tabindex=\"0\"` を足せばいいらしい、という記事を見つけて足しました。" +
      "警告が1行減りました。減ったので直ったのだと思いました。\n\n" +
      "それでもメニューを開く `<div>` の警告は消えませんでした。" +
      "そこで `<!-- svelte-ignore ... -->` を書いて黙らせました。" +
      "自分が触った箇所の黄色い文字が消えて、気分よく納品しました。\n\n" +
      "納品から2週間後、連絡が来ます。" +
      "「キーボードだけで操作しているのですが、メニューが開けません」。\n\n" +
      "マウスを使わずにタブキーだけで自分のサイトを触ってみます。" +
      "ヘッダーのリンクは順番に選べます。でもメニューのところで、フォーカスの枠が止まりません。" +
      "通り過ぎてしまいます。選べないので、Enter も押せません。\n\n" +
      "そして最初の黄色い文字を読み返します。\n" +
      "`Visible, non-interactive element <div> with a click event must be accompanied by a keyboard event handler. Consider whether an interactive element such as <button type=\"button\"> might be more appropriate`\n\n" +
      "全部書いてありました。何が問題で、どう直せばいいかまで。最初の日から、ずっと。",
    insight:
      "`<button>` は、見た目のためのタグではありません。ブラウザが裏で20行分くらいの仕事をしてくれるタグです。\n\n" +
      "・タブキーでフォーカスが当たる\n" +
      "・Enter と Space で発火する\n" +
      "・読み上げソフトが「ボタン」と読む\n" +
      "・押している間の状態がブラウザから通知される\n" +
      "・フォーム内なら送信の役割が付く\n\n" +
      "`<div onclick={...}>` は、この20行分をゼロにしてマウスのクリックだけ拾う書き方です。" +
      "マウスを使う人には同じに見えます。同じに見えないのは、キーボードだけで操作する人と、画面を見ない人です。\n\n" +
      "見た目が理由なら、答えは簡単です。`<button>` に `all: unset` や `appearance: none` を当てればいい。" +
      "ブラウザ既定のスタイルは消せますが、機能は消えません。" +
      "**div を button 風にするより、button を div 風にするほうが、ずっと安全で短く済みます**。\n\n" +
      "`role=\"button\"` と `tabindex=\"0\"` は、この20行分を手で書き直す作業の入り口です。" +
      "`role` は「ボタンだと名乗る」、`tabindex` は「フォーカスを受け取る」。" +
      "でも Enter や Space で発火する処理は、自分で `onkeydown` を書かないと付いてきません。" +
      "名乗っただけで中身が伴っていない状態です。" +
      "警告が1行減るのは、名乗った分だけ判定が変わるからで、直ったからではありません。\n\n" +
      "そして `<!-- svelte-ignore -->` について。" +
      "これは「悪い道具」ではありません。誤検知はあるし、外部ライブラリの都合でどうしようもない場面もあります。\n\n" +
      "問題は、握りつぶしたこと自体ではなく、**握りつぶした記録が残らないこと**です。" +
      "`<!-- svelte-ignore a11y_click_events_have_key_events -->` とだけ書かれた行を半年後に見た人は、" +
      "「検討した上で無視したのか」「面倒だから消したのか」を判別できません。" +
      "判別できないものは、怖くて触れません。そうやってコードは硬直していきます。\n\n" +
      "だから判断軸はこうです。**無視するなら、理由を隣に書く**。\n\n" +
      "`<!-- svelte-ignore a11y_no_static_element_interactions -->`\n" +
      "`<!-- 理由: 外側は装飾のオーバーレイで、実際の操作は内側の button が受ける。#1234 -->`\n\n" +
      "こう書いてあれば、次の人は理由を読んで判断できます。" +
      "そして理由を書こうとした瞬間に、たいていは「これ、書けないな」と気づいて直すことになります。" +
      "理由を書くという手続きそのものが、握りつぶしのフィルタとして働きます。",
  },
  explanation:
    "Svelte コンパイラは a11y（アクセシビリティ）の問題を警告として出します。" +
    "`a11y_click_events_have_key_events` は「クリックできるのにキーボードで操作できない」、" +
    "`a11y_no_static_element_interactions` は「`<div>` にクリックハンドラが付いているのに役割（role）が無い」、" +
    "`a11y_missing_attribute` は「`<img>` に `alt` が無い」という指摘です。" +
    "これらはエラーではないのでビルドは通り、画面もマウスでは正常に動くため、放置されやすい種類の警告です。" +
    "多くの場合、正しい直し方は属性を足すことではなく、`<div>` を `<button type=\"button\">` などのセマンティックな要素に置き換えることです。" +
    "`<!-- svelte-ignore 警告コード -->` で個別に抑制できますが、抑制するときは必ず理由をコメントとして残します。" +
    "装飾目的の画像は `alt=\"\"`（空文字）を明示して、読み上げから除外するのが正解です。",

  symptom:
    "マウスでは問題なく動く。しかしキーボードのタブキーではメニューにフォーカスが当たらず、Enter を押しても開けない。スクリーンリーダーではメニュー項目が「ボタン」ではなくただのテキストとして読み上げられ、アイコン画像はファイル名がそのまま読み上げられる。ビルドは成功し、開発サーバーのターミナルに黄色い警告が出ているだけ。",

  brokenCode: `<script lang="ts">
  interface MenuItem {
    id: number;
    label: string;
    icon: string;
  }

  let open = $state(false);
  let selected = $state<string | null>(null);

  const items: MenuItem[] = [
    { id: 1, label: "プロフィール", icon: "/icons/user.svg" },
    { id: 2, label: "設定", icon: "/icons/gear.svg" },
    { id: 3, label: "ログアウト", icon: "/icons/exit.svg" },
  ];

  function select(item: MenuItem) {
    selected = item.label;
    open = false;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="menu-trigger" onclick={() => (open = !open)}>
  メニュー
</div>

{#if open}
  <ul class="menu">
    {#each items as item (item.id)}
      <li>
        <div class="menu-item" role="button" tabindex="0" onclick={() => select(item)}>
          <img src={item.icon} />
          {item.label}
        </div>
      </li>
    {/each}
  </ul>
{/if}

<p>選択中: {selected ?? "なし"}</p>
`,

  defects: [
    {
      id: "d-sv-11-1",
      summary: "メニューを開く操作が `<div onclick>` で書かれている",
      why:
        "`<div>` はフォーカスを受け取らず、Enter や Space でも発火しません。" +
        "マウスでクリックする人にだけ動く操作になります。" +
        "キーボードだけで操作する人はタブキーで到達できないため、メニューを開く手段が存在しません。" +
        "読み上げソフトも「ボタン」と announce できず、ただのテキストとして読み飛ばします。" +
        "ブラウザ既定のスタイルが邪魔なだけなら、`<button type=\"button\">` に `all: unset` を当てれば見た目は同じにできます。" +
        "div をボタン風にするより、button を div 風にするほうが安全です。",
      marker: "<div class=\"menu-trigger\" onclick={() => (open = !open)}>",
    },
    {
      id: "d-sv-11-2",
      summary: "`role=\"button\"` と `tabindex=\"0\"` を足しただけでキーイベントが無い",
      why:
        "`role` は「ボタンだと名乗る」宣言、`tabindex=\"0\"` は「フォーカスを受け取る」宣言で、" +
        "どちらも機能そのものは付けてくれません。" +
        "`<button>` なら自動で付いてくる「Enter / Space で発火する」処理は、" +
        "自分で `onkeydown` を書かないかぎり存在しません。" +
        "この状態はフォーカスは当たるのに押せないという、何も足さないより混乱を招く状態です。" +
        "実際、これを足すと `a11y_no_static_element_interactions` の警告だけが消えて" +
        "`a11y_click_events_have_key_events` は残ります。警告が減ったことを「直った」と読み違えやすい罠です。",
      marker: "<div class=\"menu-item\" role=\"button\" tabindex=\"0\" onclick={() => select(item)}>",
    },
    {
      id: "d-sv-11-3",
      summary: "`<img>` に `alt` が無い",
      why:
        "`alt` が無い画像は、読み上げソフトが仕方なくファイル名（`gear.svg` など）を読み上げます。" +
        "「設定」の隣で「ジー・イー・エー・アール ドット エス・ブイ・ジー」と読まれることになります。" +
        "ここでは隣にラベル文字があるのでアイコンは装飾です。" +
        "装飾画像は `alt=\"\"` と空文字を明示して、読み上げの対象から外すのが正解です。" +
        "「属性を書かない」と「空文字を書く」は、見た目は同じでも意味がまったく違います。",
      marker: "<img src={item.icon} />",
    },
    {
      id: "d-sv-11-4",
      summary: "`<!-- svelte-ignore -->` で警告を黙らせている",
      why:
        "抑制コメントそのものが悪いのではありません。誤検知もありますし、抑制が正解の場面もあります。" +
        "問題は、この行を半年後に読んだ人が「検討した上で無視した」のか「面倒だから消した」のかを" +
        "判別できないことです。判別できない箇所は誰も触れなくなり、コードが硬直します。" +
        "この例では抑制は不要で、`<button>` に直せば警告は自然に消えます。" +
        "どうしても抑制が必要なときは、抑制コメントの隣に理由と判断の根拠（issue 番号など）を必ず残します。",
      marker: "<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->",
    },
  ],

  fixedCode: `<script lang="ts">
  interface MenuItem {
    id: number;
    label: string;
    icon: string;
  }

  let open = $state(false);
  let selected = $state<string | null>(null);

  const items: MenuItem[] = [
    { id: 1, label: "プロフィール", icon: "/icons/user.svg" },
    { id: 2, label: "設定", icon: "/icons/gear.svg" },
    { id: 3, label: "ログアウト", icon: "/icons/exit.svg" },
  ];

  function select(item: MenuItem) {
    selected = item.label;
    open = false;
  }
</script>

<!-- div を button に変えるだけで、フォーカス・Enter/Space・読み上げが同時に手に入る。
     見た目が理由なら CSS 側で all: unset すればよく、機能を捨てる必要はない。
     aria-expanded を付けると、開いているかどうかが読み上げでも分かる -->
<button
  type="button"
  class="menu-trigger"
  aria-expanded={open}
  onclick={() => (open = !open)}
>
  メニュー
</button>

{#if open}
  <ul class="menu">
    {#each items as item (item.id)}
      <li>
        <button type="button" class="menu-item" onclick={() => select(item)}>
          <!-- 隣にラベル文字があるのでアイコンは装飾。
               alt="" と明示して読み上げの対象から外す。
               属性を書かないのとは意味が違う -->
          <img src={item.icon} alt="" />
          {item.label}
        </button>
      </li>
    {/each}
  </ul>
{/if}

<p>選択中: {selected ?? "なし"}</p>

<!--
  抑制がどうしても必要な場面では、svelte-ignore コメントの直後に
  もう1行コメントを足して「なぜ無視してよいのか」と判断の根拠
  （issue 番号など）を書き残す。たとえば
  「理由: 外側は装飾のオーバーレイで、実際の操作は内側の button が受ける。#1234」。

  握りつぶすこと自体が悪なのではなく、握りつぶした記録が残らないことが悪い。
  理由を書こうとした時点で「これは書けないな」と気づいて直すことが多い。
-->
`,

  hints: [
    {
      level: 1,
      text: "まず警告文を最後まで読んでください。`Consider whether an interactive element such as <button type=\"button\"> might be more appropriate` と、直し方まで書いてあります。属性を足す方向ではなく、タグそのものを変える方向で考えます。",
    },
    {
      level: 2,
      text: "クリックを受ける `<div>` は2つとも `<button type=\"button\">` にします。`role=\"button\"` と `tabindex=\"0\"` は不要になるので消します（`<button>` は最初からフォーカスも Enter/Space も持っています）。`<img>` には `alt` を付けます。",
    },
    {
      level: 3,
      text: "アイコンは隣にラベル文字があるので装飾です。`alt=\"\"`（空文字）を明示して読み上げから外します。`<!-- svelte-ignore -->` は削除します——`<button>` に直せば抑制する対象が無くなるからです。仕上げにメニューを開くボタンへ `aria-expanded={open}` を付けると、開閉状態が読み上げでも伝わります。ブラウザ既定の見た目が邪魔なら CSS で `all: unset` を当ててください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-11-1",
      description: "修正後のコンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-11-2",
      description: "クリックできる要素がキーボードでも操作できるか？（`a11y_click_events_have_key_events` が出ていないか）",
      verify: { kind: "svelte-no-warning", code: "a11y_click_events_have_key_events" },
    },
    {
      id: "cp-sv-11-3",
      description: "クリックハンドラの付いた静的要素が残っていないか？（`a11y_no_static_element_interactions` が出ていないか）",
      verify: { kind: "svelte-no-warning", code: "a11y_no_static_element_interactions" },
    },
    {
      id: "cp-sv-11-4",
      description: "`<img>` に `alt` を付けられているか？（`a11y_missing_attribute` が出ていないか）",
      verify: { kind: "svelte-no-warning", code: "a11y_missing_attribute" },
    },
    {
      id: "cp-sv-11-5",
      description: "`{#if}` によるメニューの開閉が壊れていないか？（直したあとも元の機能が動くか）",
      verify: { kind: "svelte-ast", query: "block:if" },
    },
    {
      id: "cp-sv-11-6",
      description: "`<!-- svelte-ignore -->` を消せたか？ 残す場合、理由を隣のコメントに書けているか？",
    },
    {
      id: "cp-sv-11-7",
      description: "装飾画像に `alt=\"\"`（空文字）を明示し、意味のある画像とは区別できたか？",
    },
  ],

  tags: ["a11y", "アクセシビリティ", "コンパイラ警告", "button", "セマンティックHTML", "alt", "svelte-ignore", "キーボード操作"],
  relatedIds: ["sv-10-form-validation", "sv-09-diagnose-each-key"],
};
