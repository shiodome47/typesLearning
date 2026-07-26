import type { Lesson } from "../types";

export const svLesson05: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-05-component-props",
  order: 5,
  title: "コンポーネントに分ける（$props と型）",
  category: "components",
  difficulty: 2,

  goal: "`interface Props` と `let { ... }: Props = $props()` で値を受け取り、デフォルト値と残りの属性を扱えるようになる",

  why: {
    problem:
      "管理画面を1ファイルで書き始めました。最初は快適です。" +
      "全部その場にあるので、探す必要がありません。" +
      "気がつくと600行になっていました。それでも、まだ動いています。\n\n" +
      "ある日「ボタンの角丸を 4px から 8px にしてほしい」という依頼が来ます。" +
      "5分の仕事のはずでした。開いてみると、同じクラス指定が7ヶ所にコピペされています。" +
      "検索して1つずつ直し、6ヶ所直したところで集中が切れました。" +
      "納品後、削除確認ダイアログのボタンだけが四角いまま残っていました。\n\n" +
      "同じことは文言でも起きます。" +
      "「保存」を「登録」に変える依頼で、5ヶ所直して1ヶ所が「保存」のまま残る。" +
      "レビューでも気づきません。差分に出てくるのは直した5ヶ所だけで、" +
      "直さなかった1ヶ所は差分に現れないからです。\n\n" +
      "根本の問題は、ボタンという概念がコードのどこにも存在しないことです。" +
      "存在するのは、ボタンらしく見える7つの `<button>` タグです。" +
      "「ボタンの仕様」を書いた場所が無いので、直す場所も1ヶ所に決まりません。\n\n" +
      "さらに、そのうち「危険な操作は赤くしたい」と言われます。" +
      "7ヶ所のうち2ヶ所だけ色を変える——ここから先は、増やすたびに散らかっていきます。",
    insight:
      "コンポーネントに切り出すというのは、「ボタンとは何か」を1ヶ所に書き留めることです。\n\n" +
      "`Button.svelte` を作った瞬間、角丸を直す場所は1ヶ所になります。" +
      "7ヶ所を探して回る仕事が消えるのではなく、探すという行為自体が不要になります。\n\n" +
      "そのとき「呼び出す側が何を渡せるのか」を決めるのが `$props()` です。" +
      "`interface Props` に書いた内容が、そのままこのコンポーネントの取扱説明書になります。" +
      "・`label: string` → 必ず渡す\n" +
      "・`variant?: 'primary' | 'danger'` → 省略できて、渡すならこの2つのどちらか\n" +
      "書いてある以外のものは渡せません。タイプミスをすればエディタが赤くします。\n\n" +
      "デフォルト値は分割代入にそのまま書きます。`variant = 'primary'` と書けば、" +
      "呼び出し側は普段どおり `<Button label=\"保存\" />` と書くだけで済み、" +
      "赤くしたいときだけ `variant=\"danger\"` を足せばよくなります。" +
      "「よくある使い方は短く、特別な使い方だけ長く」が自然に実現します。\n\n" +
      "残りの `...rest` は「自分が関心を持たない属性はそのまま素通しする」という意味です。" +
      "`disabled` や `type=\"submit\"`、`aria-label` のような HTML 標準の属性をいちいち Props に書き足さなくても、" +
      "呼び出し側が普通の `<button>` と同じ感覚で使えるようになります。",
  },
  explanation:
    "Svelte 5 では、親から渡された値を `let { ... } = $props()` という分割代入で受け取ります。" +
    "型は `interface Props { ... }` を定義して `let { ... }: Props = $props()` と注釈するのが標準的な書き方です。" +
    "デフォルト値は `let { variant = \"primary\" }: Props = $props()` のように分割代入の中に書きます。" +
    "`...rest` で受け取らなかった属性をまとめ、`<button {...rest}>` と展開すれば HTML 標準の属性をそのまま通せます。" +
    "`svelte/elements` の `HTMLButtonAttributes` を `extends` すると、素通しできる属性まで型で守られます。",

  starterCode: `<script lang="ts">
  // 汎用ボタンコンポーネントを作ります。

  // 1. interface Props を定義してください
  //    - label: string（必須）
  //    - variant?: "primary" | "danger"
  //    - size?: "sm" | "md"
  //    - HTML の button 属性（disabled, type, aria-* など）も受け取れるようにする
  //      ヒント: import type { HTMLButtonAttributes } from "svelte/elements";

  // 2. $props() で受け取ってください
  //    variant は "primary"、size は "md" をデフォルト値にする
  //    残りの属性は ...rest にまとめる
</script>

<!-- 3. <button> を書いてください -->
<!--    ・rest を展開する -->
<!--    ・class に variant と size を反映する -->
<!--    ・中身に label を表示する -->
`,

  modelAnswer: `<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  // このコンポーネントの取扱説明書。
  // ここに書いてあるものだけが渡せる（タイプミスはエディタが赤くする）。
  interface Props extends HTMLButtonAttributes {
    /** ボタンの文言。必須 */
    label: string;
    /** 見た目。省略時は primary */
    variant?: "primary" | "danger";
    /** 大きさ。省略時は md */
    size?: "sm" | "md";
  }

  // デフォルト値は分割代入の中に書く。
  // 自分が関心を持たない属性（disabled, type, aria-label ...）は rest に流す。
  let { label, variant = "primary", size = "md", ...rest }: Props = $props();
</script>

<button {...rest} class="btn btn--{variant} btn--{size}">
  {label}
</button>

<style>
  .btn {
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }
</style>
`,

  hints: [
    {
      level: 1,
      text: "まず「このボタンに渡せるものは何か」を型として書き出します。必須なのは文言だけで、見た目は省略できるようにします。",
    },
    {
      level: 2,
      text: "`interface Props extends HTMLButtonAttributes { label: string; variant?: \"primary\" | \"danger\"; }` と定義し、`let { label, variant }: Props = $props();` で受け取ります。`$props()` はコンポーネントにつき1回だけ呼びます。",
    },
    {
      level: 3,
      text: "デフォルト値と rest は分割代入に書きます: `let { label, variant = \"primary\", size = \"md\", ...rest }: Props = $props();`。テンプレート側は `<button {...rest} class=\"btn btn--{variant}\">{label}</button>` です。`{...rest}` を class より先に置くと、こちらの class が上書きされずに済みます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-05-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-05-2",
      description: "`$props()` で親からの値を受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-05-3",
      description: "`interface Props` を定義し、`let { ... }: Props = $props()` と型注釈できているか？",
    },
    {
      id: "cp-sv-05-4",
      description: "`variant` に省略時の値（デフォルト値）を分割代入の中で与えているか？",
    },
    {
      id: "cp-sv-05-5",
      description: "`...rest` で受け取った属性を `<button {...rest}>` で素通しできているか？",
    },
  ],

  tags: ["$props", "コンポーネント", "デフォルト値", "rest props", "interface", "再利用"],
  relatedIds: ["sv-06-diagnose-props-mutation", "ts-16-component-props"],
};
