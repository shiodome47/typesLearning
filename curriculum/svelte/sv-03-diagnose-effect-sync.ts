import type { Lesson } from "../types";

export const svLesson03: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-03-diagnose-effect-sync",
  order: 3,
  title: "診断: $effect で状態を同期しているコード",
  category: "runes",
  difficulty: 2,

  goal: "「値を計算するために $effect を使う」形を見抜き、`$derived` に直せるようになる",

  why: {
    problem:
      "生成AIに「入力に応じて件数を出して」と頼みました。返ってきたのは、" +
      "`$effect` の中で `count = matched.length` と代入するコードです。" +
      "貼り付けて動かすと、ちゃんと動きます。入力すれば件数も出ます。そのまま通します。\n\n" +
      "違和感に気づくのは数日後です。検索欄に「り」と打つと、リストは絞り込まれているのに件数表示だけ" +
      "1つ前の数字のままです。もう1文字打つと、さっきの数字に変わります。" +
      "表示がずっと1文字ぶん遅れて付いてきているのです。" +
      "スクリーンショットを撮って報告しようとしても、撮った瞬間には正しい数字になっていることもあります。\n\n" +
      "決定的だったのは、価格帯のスライダーを足した日でした。" +
      "「下限が上限を超えたら上限を押し上げる」「上限が下限を下回ったら下限を引き下げる」を" +
      "それぞれ `$effect` で書いた。スライダーを掴んで動かした瞬間、タブが固まりました。" +
      "2つの `$effect` が互いの結果を書き換え合って止まらなくなったのです。\n\n" +
      "ここで重要なのは、このコードにコンパイラの警告が1つも出ないことです。" +
      "型エラーも出ません。lint も通ります。" +
      "「動いているが正しくない」コードを、機械は誰も止めてくれません。\n\n" +
      "だからこの回は書く練習ではなく、読んで見抜く練習をします。" +
      "`$effect` の中に `=` があったら疑う。それだけで、この種の事故はほぼ全部防げます。",
    insight:
      "`$effect` と `$derived` は、似ているようで向きが逆です。\n\n" +
      "`$derived` は「聞かれたら計算して答える」。画面が値を必要としたその場で計算されるので、" +
      "表示と値がズレる隙間がありません。\n\n" +
      "`$effect` は「変化があったら、後から走る」。描画が終わってから実行されます。" +
      "だから `$effect` の中で表示用の値を代入すると、必ず1回ぶん遅れます。" +
      "遅れた値を見てまた別の `$effect` が走り…と繋げば、遅れは重なっていきます。\n\n" +
      "見分け方はひとつです。" +
      "・その代入の右辺が、他の状態だけで決まるなら → `$derived` にできる\n" +
      "・外の世界（タイマー、通信、localStorage、DOM API）が絡むなら → `$effect` の出番\n\n" +
      "`$effect` は「Svelte の世界の外と繋ぐための出口」であって、" +
      "状態と状態を繋ぐための道具ではありません。" +
      "出口を内側の配線に使うと、値が一周回って戻ってくる経路ができてしまいます。それが無限ループの正体です。\n\n" +
      "なお、値が交差するようなケース（下限と上限）でも、元の値を書き換える必要はありません。" +
      "`Math.min` / `Math.max` で「表示に使う値」を導けば、書き換え合いは起きません。",
  },
  explanation:
    "`$derived` は読まれたときに計算される「引く」仕組み、`$effect` は変化の後で走る「押す」仕組みです。" +
    "派生値を `$effect` の中で代入すると、描画 → effect 実行 → 再描画の順になるため表示が1テンポ遅れます。" +
    "さらに、複数の `$effect` が互いの読み書きする状態を共有すると、更新が循環して無限ループになります" +
    "（Svelte は `effect_update_depth_exceeded` で止めますが、どの組み合わせが原因かは表示されません）。" +
    "`$effect` を使ってよいのは、タイマー・通信・ブラウザAPIなど Svelte の外側と接続するときだけです。",

  symptom:
    "検索欄に文字を打つと、リストは正しく絞り込まれるのに件数の表示だけ1文字ぶん遅れて追いついてくる。" +
    "価格帯のスライダーを動かすと、ブラウザのタブが応答しなくなる。コンパイラの警告も型エラーも1件も出ていない。",

  brokenCode: `<script lang="ts">
  const items = ["りんご", "みかん", "ぶどう", "いちご", "もも"];

  let keyword = $state("");

  let matched = $state<string[]>([]);
  let count = $state(0);
  let message = $state("");

  // 入力に応じて絞り込む
  $effect(() => {
    matched = items.filter((item) => item.includes(keyword));
  });

  // 件数を数える
  $effect(() => {
    count = matched.length;
  });

  // 表示用の文を作る
  $effect(() => {
    message = count === 0 ? "該当なし" : count + " 件";
  });

  // 価格帯の下限・上限
  let min = $state(0);
  let max = $state(1000);

  // 下限が上限を超えないようにする
  $effect(() => {
    if (min > max) max = min;
  });

  // 上限が下限を下回らないようにする
  $effect(() => {
    if (max < min) min = max;
  });
</script>

<input placeholder="検索" bind:value={keyword} />

<p>{message}</p>

<ul>
  {#each matched as item (item)}
    <li>{item}</li>
  {/each}
</ul>

<label>
  下限
  <input type="range" min="0" max="1000" bind:value={min} />
</label>
<label>
  上限
  <input type="range" min="0" max="1000" bind:value={max} />
</label>
<p>{min} 円 〜 {max} 円</p>
`,

  defects: [
    {
      id: "d-sv-03-1",
      summary: "他の状態から計算できる値を `$state` で持ち、`$effect` の中で代入している",
      why:
        "`matched` も `count` も `message` も、`items` と `keyword` が決まれば一意に決まる値です。" +
        "それを独立した `$state` として持つと、「本当の値」が2ヶ所に存在することになります。" +
        "同期のコードを1ヶ所書き忘れれば、その瞬間から画面はリストと矛盾した数字を出し続けます。" +
        "`$derived` にすれば代入する場所そのものが消えるので、矛盾のしようがありません。",
      marker: "$effect(() => { matched = items.filter(...) });",
    },
    {
      id: "d-sv-03-2",
      summary: "`$effect` は描画の後に走るので、表示が1テンポ遅れる",
      why:
        "`$effect` は DOM の更新が終わってから実行されます。つまり最初の描画では古い `count` が表示され、" +
        "effect が走ってようやく正しい値になり、もう一度描き直されます。" +
        "しかもこのコードは effect が3段に繋がっているので、`keyword` の変更が `message` に届くまでに" +
        "3周ぶんの遅れが発生します。ユーザーには「入力に表示が付いてこない」と見えます。",
      marker: "$effect(() => { count = matched.length; });",
    },
    {
      id: "d-sv-03-3",
      summary: "2つの `$effect` が互いの読み書きする状態を共有していて、無限ループになる",
      why:
        "下限の effect が `max` を書き換えると、上限の effect が起きて `min` を書き換え、" +
        "それがまた下限の effect を起こします。値が一周して戻ってくる経路ができているため、" +
        "スライダーを動かした瞬間に更新が止まらなくなります。" +
        "Svelte は `effect_update_depth_exceeded` で強制停止しますが、" +
        "エラーメッセージはどの effect の組み合わせが原因かを教えてくれません。" +
        "そもそも元の値を書き換えるのではなく、表示に使う値を `Math.min` / `Math.max` で導けば循環は生まれません。",
      marker: "$effect(() => { if (min > max) max = min; });",
    },
    {
      id: "d-sv-03-4",
      summary: "この誤りはコンパイラも型チェッカーも検出しない",
      why:
        "`$effect` の中で `$state` に代入するのは文法上まったく正しく、警告も型エラーも出ません。" +
        "つまり機械は止めてくれないので、レビューで人が見抜くしかありません。" +
        "見るべき箇所は1つです。`$effect` の中に `=` があるか。あれば、その右辺が外部由来かどうかを確認します。",
    },
  ],

  fixedCode: `<script lang="ts">
  const items = ["りんご", "みかん", "ぶどう", "いちご", "もも"];

  // 自分で決める値だけが $state。ここが唯一の情報源になる
  let keyword = $state("");

  // ここから下は keyword から「導かれる」値。代入する場所は存在しない。
  // 読まれたその場で計算されるので、表示がズレる隙間が無い。
  let matched = $derived(items.filter((item) => item.includes(keyword)));
  let count = $derived(matched.length);
  let message = $derived(count === 0 ? "該当なし" : \`\${count} 件\`);

  // 価格帯。スライダーが直接触る値はそのまま $state で持つ
  let min = $state(0);
  let max = $state(1000);

  // 交差したときは「元の値を書き換え合う」のではなく、表示に使う値を導く。
  // 書き換えが起きないので、循環しようがない。
  let lower = $derived(Math.min(min, max));
  let upper = $derived(Math.max(min, max));
</script>

<input placeholder="検索" bind:value={keyword} />

<p>{message}</p>

<ul>
  {#each matched as item (item)}
    <li>{item}</li>
  {/each}
</ul>

<label>
  下限
  <input type="range" min="0" max="1000" bind:value={min} />
</label>
<label>
  上限
  <input type="range" min="0" max="1000" bind:value={max} />
</label>
<p>{lower} 円 〜 {upper} 円</p>
`,

  hints: [
    {
      level: 1,
      text: "`$effect` の中にある代入を1つずつ見て、「右辺は他の状態だけで決まるか？」と問いかけてください。決まるなら、その値は持つべきではありません。",
    },
    {
      level: 2,
      text: "`let matched = $state<string[]>([])` と `$effect(() => { matched = ... })` の2つを、`let matched = $derived(...)` の1行に置き換えます。`count` と `message` も同じ要領で連鎖的に消えていきます。",
    },
    {
      level: 3,
      text: "スライダーは元の `min` / `max` を書き換えないのがコツです。`let lower = $derived(Math.min(min, max));` `let upper = $derived(Math.max(min, max));` として、表示にはこちらを使います。書き込みが無くなれば循環も消えます。最終的に `$effect` は1つも残りません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-03-1",
      description: "修正後のコンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-03-2",
      description: "派生値を `$derived` で宣言し直せているか？",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-03-3",
      description: "`$effect` の中で状態に代入している箇所が1つも残っていないか？",
      verify: { kind: "svelte-ast", query: "effect:no-assignment" },
    },
    {
      id: "cp-sv-03-4",
      description: "入力欄が `bind:value` で状態と繋がっているか？",
      verify: { kind: "svelte-ast", query: "directive:bind" },
    },
    {
      id: "cp-sv-03-5",
      description: "下限と上限が互いを書き換え合う経路を断ち切れているか？（`Math.min` / `Math.max` で導く）",
    },
  ],

  tags: ["$effect", "$derived", "無限ループ", "同期", "コードレビュー", "AI生成コード"],
  relatedIds: ["sv-02-derived-values", "sv-04-effect-teardown"],
};
