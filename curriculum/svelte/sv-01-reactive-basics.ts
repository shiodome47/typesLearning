import type { Lesson } from "../types";

export const svLesson01: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-01-reactive-basics",
  order: 1,
  title: "画面が動く最小単位",
  category: "runes",
  difficulty: 1,

  goal: "`$state` で宣言した値をイベントハンドラで更新し、画面に反映できるようになる",

  why: {
    problem:
      "はじめて Svelte のコンポーネントを書いたとします。`let count = 0` と宣言して、" +
      "ボタンに `count++` を繋いで、`<p>{count}</p>` で表示する。3行です。動かないはずがありません。\n\n" +
      "ところがボタンを押しても、画面の数字は 0 のままです。" +
      "壊れているのかと思って `console.log(count)` を足してもう一度押すと、コンソールには 1, 2, 3 と正しく出ます。" +
      "値は確かに増えています。増えていないのは画面だけです。\n\n" +
      "ここで多くの人が「イベントが2回登録されているのか」「再描画を呼ぶ関数がどこかにあるのか」と、" +
      "見当違いの方向を調べ始めます。実際に起きているのはもっと単純なことです。" +
      "`count` はただの JavaScript の変数なので、誰も見張っていないのです。" +
      "書き換えても、それを画面に伝える人がいません。\n\n" +
      "さらにやっかいなのは、この間違いをコンパイラが教えてくれないことです。" +
      "`let count = 0` は完全に正しい JavaScript です。エラーも警告も出ません。" +
      "「文法は正しいのに動かない」という、いちばん時間を溶かす形のバグになります。",
    insight:
      "`$state(0)` は「この値は画面に映っている」という印です。\n\n" +
      "普通の変数は、値が変わっても誰も気づきません。" +
      "`$state` で包むと、Svelte がその変数に見張りを付けます。" +
      "`{count}` と書いた場所は「この見張りが動いたら描き直す担当」として登録され、" +
      "`count++` した瞬間に、その場所だけが自動的に更新されます。\n\n" +
      "大事なのは、書き方が普通の変数と何も変わらないことです。" +
      "`count++` でいいし、`items.push(x)` でいい。" +
      "setState のような専用の更新関数を呼ぶ必要はありません。" +
      "宣言のときに一度 `$state(...)` と書くだけで、あとは素の JavaScript として扱えます。\n\n" +
      "イベントの書き方も素の HTML に寄せてあります。`onclick={...}` です。" +
      "React の `onClick` のような大文字ではなく、Svelte 4 までの `on:click` でもありません。" +
      "小文字でコロン無し。HTML の属性名そのままだと覚えてください。",
  },
  explanation:
    "Svelte 5 では、画面に反映したい値を `$state(...)` で宣言します。これを「ルーン（rune）」と呼びます。" +
    "`$state` はインポート不要のコンパイラ組み込みの記号で、`let count = $state(0)` と書くと、" +
    "`count` の読み書きを Svelte が追跡し、変更された場所だけを描き直します。" +
    "更新は `count++` や `count = 5` のように普通の代入で行い、テンプレート側は `{count}` で埋め込みます。" +
    "イベントは `onclick={handler}` のように小文字の属性として書きます（`on:click` は Svelte 4 までの旧記法です）。",

  starterCode: `<script lang="ts">
  // 1. count を $state で 0 として宣言してください

  // 2. count を 1 増やす関数 increment を書いてください

  // 3. count を 0 に戻す関数 reset を書いてください
</script>

<!-- 4. count を表示してください -->

<!-- 5. increment を呼ぶボタンと reset を呼ぶボタンを置いてください -->
<!--    イベントは onclick={...}（小文字・コロン無し）です -->
`,

  modelAnswer: `<script lang="ts">
  // $state で包むと「この値は画面に映っている」という印になる。
  // 以降は普通の変数と同じように読み書きしてよい。
  let count = $state(0);

  function increment() {
    count++;
  }

  function reset() {
    count = 0;
  }
</script>

<p>現在のカウント: {count}</p>

<button onclick={increment}>+1</button>
<button onclick={reset}>リセット</button>

<!-- インラインで書いてもよい -->
<button onclick={() => (count += 10)}>+10</button>
`,

  hints: [
    {
      level: 1,
      text: "`let count = 0` のままでは Svelte が変更に気づけません。宣言のときだけ書き方を変えます。値の更新側（`count++`）はいじりません。",
    },
    {
      level: 2,
      text: "`let count = $state(0);` と書きます。`$state` はインポート不要です。テンプレート側では `{count}` と波括弧で埋め込みます。",
    },
    {
      level: 3,
      text: "ボタンは `<button onclick={increment}>+1</button>` です。`onClick`（大文字）でも `on:click`（Svelte 4 の旧記法）でもありません。インラインなら `onclick={() => count++}` と書けます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-01-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-01-2",
      description: "画面に映す値を `$state(...)` で宣言できているか？",
      verify: { kind: "svelte-ast", query: "rune:$state" },
    },
    {
      id: "cp-sv-01-3",
      description: "イベントを `onclick={...}`（小文字・コロン無し）で書けているか？ `on:click` は Svelte 4 までの旧記法です",
    },
    {
      id: "cp-sv-01-4",
      description: "`{count}` でテンプレートに値を埋め込み、ボタンを押すと表示が変わることを確認できたか？",
    },
  ],

  tags: ["$state", "ルーン", "リアクティビティ", "onclick", "イベントハンドラ", "Svelte 5"],
  relatedIds: ["sv-02-derived-values", "ts-17-usestate"],
};
