import type { Lesson } from "../types";

export const svLesson02: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-02-derived-values",
  order: 2,
  title: "計算した値は書かずに宣言する",
  category: "runes",
  difficulty: 1,

  goal: "状態から導かれる値を `$derived` で宣言し、元の値が変わったら自動で追随させられるようになる",

  why: {
    problem:
      "買い物カゴを作ったとします。合計金額は `let total = $state(0)` で持ち、" +
      "商品を追加する関数の中で `total += price` と足していました。" +
      "テストしても合っています。合計はちゃんと出ます。\n\n" +
      "翌週「数量を減らす」ボタンを追加することになりました。" +
      "ここで気づきます。足し算を書いた場所は、実は3ヶ所ありました。" +
      "商品追加、まとめ買い、クーポン適用。引き算はそのうち2ヶ所に書き、1ヶ所を忘れました。\n\n" +
      "しばらくして問い合わせが来ます。「カゴを空にしたのに合計が 3,200 円のまま表示されています」。" +
      "商品リストは空、画面の合計だけが 3,200 円。" +
      "どちらが正しいのか、コードを見ても分かりません。合計は独立した変数なので、" +
      "リストと食い違っていても誰も文句を言わないからです。\n\n" +
      "この手のバグの厄介なところは、原因が「間違って書いた行」ではなく「書かなかった行」であることです。" +
      "差分レビューにも出てきません。減らす処理を足したときの差分に、忘れた1ヶ所は登場しないのです。\n\n" +
      "そしてこの後、割引額、税込金額、送料無料までの残額…と派生する値が増えるたびに、" +
      "更新し忘れる可能性のある場所が掛け算で増えていきます。",
    insight:
      "`$derived` は「この値は自分で更新しない。元の値から毎回計算し直す」という宣言です。\n\n" +
      "`let total = $derived(items.reduce((s, i) => s + i.price * i.qty, 0))` と書いた瞬間、" +
      "`total` に代入する場所はコードから消えます。" +
      "`items` がどう変わろうと、増えようと減ろうと空になろうと、`total` は必ず `items` と辻褄が合います。" +
      "食い違いようがありません。計算式が1本しかないからです。\n\n" +
      "考え方としては、状態を2種類に分けることになります。" +
      "・自分で決める値（何が入っているか）→ `$state`\n" +
      "・そこから決まる値（合計、件数、表示メッセージ、ボタンを押せるかどうか）→ `$derived`\n\n" +
      "迷ったら「この値は他の値から計算できるか？」と考えてください。" +
      "計算できるなら `$state` にしてはいけません。持たせた瞬間、ズレる可能性が生まれます。\n\n" +
      "式が1行に収まらないときは `$derived.by(() => { ... })` を使います。" +
      "中身は普通の関数なので、途中に変数を置いても `if` を書いても構いません。最後に `return` するだけです。",
  },
  explanation:
    "`$derived(式)` は、式の中で読んだ `$state` が変わったときに自動で再計算される値を宣言します。" +
    "宣言は `let` ですが、自分で代入することはありません（代入するとコンパイルエラーになります）。" +
    "1行の式で書けないときは `$derived.by(() => { ...; return 値; })` を使います。中身は普通の関数です。" +
    "再計算は「必要になったとき」に行われるので、使われていない `$derived` の計算コストはかかりません。" +
    "画面に出す合計・件数・判定フラグは、原則としてすべて `$derived` にします。",

  starterCode: `<script lang="ts">
  interface CartItem {
    id: number;
    name: string;
    price: number;
    qty: number;
  }

  let items = $state<CartItem[]>([
    { id: 1, name: "コーヒー豆", price: 1200, qty: 2 },
    { id: 2, name: "フィルター", price: 400, qty: 1 },
  ]);

  // 1. 合計金額 total を $derived で宣言してください
  //    （items から reduce で計算する。自分で加算しないこと）

  // 2. 合計点数 count を $derived で宣言してください

  // 3. 送料込みの案内文 shipping を $derived.by で宣言してください
  //    3000円以上なら "送料無料"、それ未満なら "あと〇〇円で送料無料"

  function addQty(id: number) {
    // ここでは items だけを更新する。total には触れないこと
  }
</script>

<!-- 4. items を {#each} で一覧表示し、total / count / shipping を表示してください -->
`,

  modelAnswer: `<script lang="ts">
  interface CartItem {
    id: number;
    name: string;
    price: number;
    qty: number;
  }

  // 自分で決める値だけを $state にする
  let items = $state<CartItem[]>([
    { id: 1, name: "コーヒー豆", price: 1200, qty: 2 },
    { id: 2, name: "フィルター", price: 400, qty: 1 },
  ]);

  // ここから下は「items から決まる値」。代入する場所は存在しない
  let total = $derived(items.reduce((sum, item) => sum + item.price * item.qty, 0));
  let count = $derived(items.reduce((sum, item) => sum + item.qty, 0));

  // 1行に収まらないときは $derived.by。中身は普通の関数
  let shipping = $derived.by(() => {
    const FREE_LINE = 3000;
    if (total >= FREE_LINE) return "送料無料";
    return \`あと \${FREE_LINE - total} 円で送料無料\`;
  });

  function addQty(id: number) {
    // items を変えるだけでよい。total も count も shipping も勝手に追いつく
    const item = items.find((i) => i.id === id);
    if (item) item.qty++;
  }

  function removeQty(id: number) {
    const item = items.find((i) => i.id === id);
    if (item && item.qty > 0) item.qty--;
  }
</script>

<ul>
  {#each items as item (item.id)}
    <li>
      {item.name} × {item.qty} = {item.price * item.qty} 円
      <button onclick={() => addQty(item.id)}>+</button>
      <button onclick={() => removeQty(item.id)}>-</button>
    </li>
  {/each}
</ul>

<p>点数: {count}</p>
<p>合計: {total} 円</p>
<p>{shipping}</p>
`,

  hints: [
    {
      level: 1,
      text: "`total` に代入する行を1行も書かないつもりで考えてください。合計は `items` から毎回計算し直せば、ズレようがありません。",
    },
    {
      level: 2,
      text: "`let total = $derived(items.reduce((sum, item) => sum + item.price * item.qty, 0));` の形です。`$derived` の中で読んだ `$state` が変わると自動で再計算されます。",
    },
    {
      level: 3,
      text: "条件分岐を挟みたいときは `let shipping = $derived.by(() => { if (total >= 3000) return \"送料無料\"; return ...; });` と書きます。`$derived` した値には代入できません（コンパイルエラーになります）。数量の増減は `items` 側だけを書き換えてください。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-02-1",
      description: "コンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-02-2",
      description: "自分で決める値（items）を `$state` で持てているか？",
      verify: { kind: "svelte-ast", query: "rune:$state" },
    },
    {
      id: "cp-sv-02-3",
      description: "そこから決まる値（合計・点数など）を `$derived` で宣言できているか？",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-02-4",
      description: "一覧を `{#each}` で描画できているか？",
      verify: { kind: "svelte-ast", query: "block:each" },
    },
    {
      id: "cp-sv-02-5",
      description: "合計に代入している行が1つも無いか？（`total +=` や `total =` を書いていないか）",
    },
  ],

  tags: ["$derived", "$derived.by", "派生値", "単一の情報源", "each", "Svelte 5"],
  relatedIds: ["sv-01-reactive-basics", "sv-03-diagnose-effect-sync"],
};
