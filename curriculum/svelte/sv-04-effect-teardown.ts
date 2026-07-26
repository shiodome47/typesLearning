import type { Lesson } from "../types";

export const svLesson04: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-04-effect-teardown",
  order: 4,
  title: "$effect を正しく使う（外部との接続と後始末）",
  category: "runes",
  difficulty: 2,

  goal: "Svelte の外側と繋ぐときだけ `$effect` を使い、返り値の後始末関数で接続を解除できるようになる",

  why: {
    problem:
      "ヘッダーに時計を置くことになりました。`setInterval` で1秒ごとに現在時刻を更新するだけです。" +
      "5行で書けて、期待どおりに動きます。\n\n" +
      "しばらく開発を続けていると、様子がおかしくなります。" +
      "一覧ページと詳細ページを行ったり来たりしているうちに、時計の秒数がちらつき始めました。" +
      "よく見ると、1秒に何度も書き換わっています。" +
      "ページを10往復すると、時計は1秒に10回更新されていました。\n\n" +
      "原因は、コンポーネントが消えても `setInterval` が生き残っていることです。" +
      "画面から消えたコンポーネントのタイマーが、裏で回り続けたまま2つ目、3つ目と積み上がっていきます。" +
      "止める処理を1行も書いていないので、当然です。\n\n" +
      "怖いのは、これがエラーにならないことです。" +
      "例外も警告も出ません。ただ少しずつ重くなり、電池が減り、" +
      "やがて「このページを長く開いていると重い」という漠然とした報告だけが上がってきます。" +
      "再現手順が「しばらく使っていると」なので、原因にたどり着くのに何日もかかります。\n\n" +
      "同じことは `addEventListener`、`WebSocket`、`IntersectionObserver`、購読(subscribe)全般で起きます。" +
      "外の世界に何かを繋いだのに、外しにいかなかった、という同じ形です。",
    insight:
      "`$effect` は「Svelte の世界と、外の世界をつなぐ出口」です。\n\n" +
      "タイマー、通信、`addEventListener`、ブラウザAPI、外部ライブラリの初期化——" +
      "Svelte が管理していないものに触れるとき、そのときだけ `$effect` を使います。" +
      "逆に言うと、状態から状態を計算するために使う道具ではありません（それは `$derived` の仕事です）。\n\n" +
      "そして出口には必ず「戻ってくる道」を用意します。" +
      "`$effect` の中で関数を `return` すると、Svelte はそれを覚えておいて、" +
      "・コンポーネントが画面から消えるとき\n" +
      "・依存している値が変わって effect を実行し直す直前\n" +
      "この2つのタイミングで呼んでくれます。\n\n" +
      "つまり `return () => clearInterval(id)` の1行が、" +
      "「繋いだものは必ず外れる」という保証になります。" +
      "覚え方はシンプルです。`$effect` の中で何かを開いたら、その場で閉じ方を書く。" +
      "後で書こうと思った瞬間に忘れます。\n\n" +
      "なお、`$effect` は依存している値が変わるたびに丸ごと走り直します。" +
      "「前の接続を切ってから、新しい接続を張り直す」が自動的に行われるわけです。" +
      "後始末を書いておけば、依存が変わっても接続は常に1本だけに保たれます。",
  },
  explanation:
    "`$effect(() => { ... })` は、中で読んだ `$state` / `$derived` が変わるたびに実行されます。" +
    "実行は描画の後なので、表示用の値を計算する用途には向きません（それは `$derived` の役目です）。" +
    "使いどころはタイマー・イベント購読・通信・ブラウザAPIなど「Svelte の外側」に触れるときだけです。" +
    "effect が関数を返すと、その関数は「次に effect を走らせる直前」と「コンポーネントが破棄されるとき」に呼ばれます。" +
    "この後始末（teardown）を書かないと、接続が解除されないまま積み上がっていきます。",

  starterCode: `<script lang="ts">
  let now = $state(new Date());
  let running = $state(true);

  // 1. running が true のあいだだけ、1秒ごとに now を更新する $effect を書いてください
  //    ヒント: setInterval を張り、後始末の関数を return します

  // 2. 表示用の文字列 timeLabel を $derived で作ってください
  //    （now.toLocaleTimeString("ja-JP")）
</script>

<!-- 3. timeLabel を表示し、running を切り替えるボタンを置いてください -->
`,

  modelAnswer: `<script lang="ts">
  let now = $state(new Date());
  let running = $state(true);

  // 外の世界（タイマー）に繋ぐので $effect を使う。
  // running が変わると、この effect は後始末 → 再実行の順で走り直す。
  $effect(() => {
    if (!running) return;

    const id = setInterval(() => {
      now = new Date();
    }, 1000);

    // 開いたその場で閉じ方を書く。
    // ・コンポーネントが消えるとき
    // ・running が変わって effect を張り直す直前
    // の2つのタイミングで呼ばれる
    return () => clearInterval(id);
  });

  // 表示用の文字列は計算するだけなので $derived
  let timeLabel = $derived(now.toLocaleTimeString("ja-JP"));
</script>

<p>現在時刻: {timeLabel}</p>

<button onclick={() => (running = !running)}>
  {running ? "停止" : "再開"}
</button>
`,

  hints: [
    {
      level: 1,
      text: "「開いたものを閉じる場所」がどこにあるかを先に考えてください。`$effect` はコールバックを返すことができ、Svelte がそれを片付けに使います。",
    },
    {
      level: 2,
      text: "`$effect(() => { const id = setInterval(() => { now = new Date(); }, 1000); return () => clearInterval(id); });` の形です。`id` を effect の外に置く必要はありません。",
    },
    {
      level: 3,
      text: "`running` が false のときは `if (!running) return;` で早く抜けます。この場合タイマーを張っていないので後始末も不要です。時刻の文字列は `$effect` で作らず `let timeLabel = $derived(now.toLocaleTimeString(\"ja-JP\"));` と宣言します（`$effect` で代入すると表示が1秒遅れます）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-04-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-04-2",
      description: "外部との接続を `$effect` の中で行っているか？",
      verify: { kind: "svelte-ast", query: "rune:$effect" },
    },
    {
      id: "cp-sv-04-3",
      description: "`$effect` が後始末の関数を返しているか？（`return () => clearInterval(id)`）",
      verify: { kind: "svelte-ast", query: "effect:has-teardown" },
    },
    {
      id: "cp-sv-04-4",
      description: "表示用の文字列を `$effect` ではなく `$derived` で作れているか？",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-04-5",
      description: "停止と再開を繰り返しても、タイマーが1本だけに保たれることを確認できたか？",
    },
  ],

  tags: ["$effect", "teardown", "後始末", "setInterval", "副作用", "メモリリーク"],
  relatedIds: ["sv-03-diagnose-effect-sync", "ts-25-useeffect-cleanup"],
};
