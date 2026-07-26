import type { Lesson } from "../types";

export const svLesson07: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-07-bindable",
  order: 7,
  title: "$bindable と bind:（親子で値を共有する）",
  category: "components",
  difficulty: 2,

  goal: "双方向バインディングを必要な場所だけに限定して書けるようになる",

  why: {
    problem:
      "入力欄をラップした `TextField` を作りました。ラベルと入力欄と、エラー文の表示。" +
      "同じ見た目を10箇所で使い回せるので、良い部品ができたと思いました。\n\n" +
      "親から `<TextField value={name} />` と渡すと、初期値はちゃんと表示されます。" +
      "画面を開いた瞬間の見た目は完璧です。フォームに文字を打ち込むと、入力欄の中の文字もちゃんと増えていきます。" +
      "どこにも異常がありません。\n\n" +
      "ところが「保存」を押すと、サーバーに飛んでいくのは常に空文字です。" +
      "打ち込んだ文字はどこへ行ったのか。ブラウザの画面には確かに映っているのに。\n\n" +
      "起きているのはこうです。`value={name}` は親から子へ値を配っただけの一方通行です。" +
      "子の中で `value` が書き換わっても、それは子の中の話で終わります。" +
      "親の `name` は最初に渡した空文字のまま、一度も更新されていません。" +
      "画面に映っている文字は、子が自分の中で持っている値です。\n\n" +
      "厄介なのは、この状態でも画面が完全に正常に見えることです。" +
      "コンパイルは通り、警告も出ず、目で見たかぎり動いています。" +
      "気づくのは保存したあと——早くて動作確認のとき、遅ければ納品後にデータベースを覗いたときです。",
    insight:
      "`bind:` は「この値、親と子で同じものを見よう」という約束です。\n\n" +
      "普通の props は郵便のようなものです。親が値を封筒に入れて子に送る。" +
      "子が中身を書き換えても、親の手元にある原本は変わりません。\n\n" +
      "`bind:` を付けると、封筒を送るのをやめて、同じ1枚の紙を2人で見ることになります。" +
      "子が書き換えれば親のほうも変わっているし、親が書き換えれば子のほうも変わります。" +
      "紙が1枚しかないので、ずれようがありません。\n\n" +
      "ただし、子の側で受け入れの意思表示が要ります。それが `$bindable()` です。\n" +
      "・`let { value } = $props()` … 受け取るだけ。書き換えても親には届かない\n" +
      "・`let { value = $bindable('') } = $props()` … 親と共有してよい。`bind:` で渡された場合は書き戻る\n\n" +
      "そして、ここが判断の分かれ目です。`bind:` は便利すぎます。" +
      "全部の props を `$bindable` にすれば確かに動きますが、そうすると" +
      "「この値は誰が書き換えたのか」がコードから読めなくなります。" +
      "画面のどこかがおかしいとき、犯人になりうる場所が一気に増えるということです。\n\n" +
      "だから原則はこうです。**フォーム部品の入力値のように「子が書き換えるのが仕事」の値だけ `$bindable` にする**。" +
      "表示用のラベル、無効フラグ、見出しの文字——子が読むだけの値は、素の `$props()` のままにしておきます。" +
      "そうしておくと、`bind:` が付いている行を探すだけで「値が書き戻る場所」の一覧になります。",
  },
  explanation:
    "Svelte の props は既定で親から子への一方通行です。子が受け取った props を書き換えても親には反映されません。" +
    "子の側で `let { value = $bindable('') } = $props()` と宣言すると、その prop は双方向バインディング可能になります。" +
    "親は `<TextField bind:value={name} />` と書くことで、自分の `name` と子の `value` を同じ値として共有できます。" +
    "`bind:` は DOM 要素にも使え、テキスト入力なら `bind:value`、チェックボックスなら `bind:checked` です。" +
    "`bind:value` のように親子で名前が同じときは `bind:value` と省略形で書けます。" +
    "便利な反面、データの流れが追いにくくなるため、双方向にするのは「子が書き換えるのが役目の値」だけに限定します。",

  starterCode: `<script lang="ts">
  // 検索フォームの部品 SearchField.svelte を作ります。
  //
  // 1. Props 型を定義してください
  //    label: string          … 見出し（子は読むだけ）
  //    value?: string         … 入力された語（子が書き換える）
  //    caseSensitive?: boolean … 大文字小文字を区別するか（子が書き換える）
  //    placeholder?: string   … プレースホルダ（子は読むだけ）

  // 2. $props() で受け取ってください
  //    value と caseSensitive だけを $bindable(...) にします
  //    label と placeholder は素の props のままにします
</script>

<!-- 3. label 要素と入力欄を for / id で結んでください -->

<!-- 4. テキスト入力に bind:value を付けてください（省略形で書けます） -->

<!-- 5. チェックボックスに bind:checked={caseSensitive} を付けてください -->

<!--
  親側ではこう使います（この教材ではコンパイルするのは子だけです）:

  <script lang="ts">
    import SearchField from "./SearchField.svelte";
    let keyword = $state("");
    let caseSensitive = $state(false);
  </script>

  <SearchField label="キーワード" bind:value={keyword} bind:caseSensitive />
  <p>検索語: {keyword} / 区別する: {caseSensitive}</p>
-->
`,

  modelAnswer: `<script lang="ts">
  interface Props {
    /** 見出し。子は表示するだけなので $bindable にしない */
    label: string;
    /** 入力された語。子が書き換えるのが役目なので $bindable にする */
    value?: string;
    /** 大文字小文字を区別するか。これも子が書き換える */
    caseSensitive?: boolean;
    /** プレースホルダ。子は読むだけ */
    placeholder?: string;
  }

  // $bindable(...) の引数は「親が bind: を使わなかったときの既定値」。
  // bind: で渡された場合は、ここでの書き換えが親側にも反映される。
  let {
    label,
    value = $bindable(""),
    caseSensitive = $bindable(false),
    placeholder = "",
  }: Props = $props();
</script>

<div class="search-field">
  <label for="search-keyword">{label}</label>

  <!-- bind:value={value} は名前が同じなので bind:value と省略できる -->
  <input id="search-keyword" type="search" {placeholder} bind:value />

  <label>
    <!-- チェックボックスは value ではなく checked を bind する -->
    <input type="checkbox" bind:checked={caseSensitive} />
    大文字小文字を区別する
  </label>

  <p class="preview">
    「{value}」を{caseSensitive ? "区別して" : "区別せず"}検索します
  </p>
</div>

<!--
  親側の使い方:

  <SearchField label="キーワード" bind:value={keyword} bind:caseSensitive />

  bind: を付けずに <SearchField label="…" value={keyword} /> と書くこともできる。
  そのときは一方通行に戻り、子の入力は親へ返らない。$bindable は
  「双方向にしてもよい」という許可であって、強制ではない。
-->
`,

  hints: [
    {
      level: 1,
      text: "親の値が変わらないのは、props が既定で一方通行だからです。子の側に「この値は親と共有してよい」という宣言を足す必要があります。全部の props に足すのではなく、子が書き換える値だけです。",
    },
    {
      level: 2,
      text: "`let { value = $bindable(\"\") } = $props();` と書きます。`$bindable(...)` の引数は「親が `bind:` を使わなかったときの既定値」です。親側は `<SearchField bind:value={keyword} />` です。",
    },
    {
      level: 3,
      text: "テキスト入力は `<input bind:value />`（`bind:value={value}` の省略形）、チェックボックスは `<input type=\"checkbox\" bind:checked={caseSensitive} />` です。`label` と `placeholder` は `$bindable` にせず、素の分割代入のままにしておきます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-07-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-07-2",
      description: "`$props()` で props を受け取れているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-07-3",
      description: "書き戻したい prop を `$bindable(...)` で宣言できているか？",
      verify: { kind: "svelte-ast", query: "rune:$bindable" },
    },
    {
      id: "cp-sv-07-4",
      description: "入力欄に `bind:` ディレクティブを付けられているか？",
      verify: { kind: "svelte-ast", query: "directive:bind" },
    },
    {
      id: "cp-sv-07-5",
      description: "チェックボックスは `bind:value` ではなく `bind:checked` を使えているか？",
    },
    {
      id: "cp-sv-07-6",
      description: "`label` や `placeholder` のような「子が読むだけ」の prop を `$bindable` にせずに済ませたか？（双方向にする範囲を絞れたか）",
    },
  ],

  tags: ["$bindable", "bind:", "双方向バインディング", "props", "コンポーネント設計", "データフロー"],
  relatedIds: ["sv-01-reactive-basics", "sv-08-snippet", "sv-10-form-validation"],
};
