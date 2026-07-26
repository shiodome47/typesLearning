import type { Lesson } from "../types";

export const svLesson12: Lesson = {
  kind: "write",
  language: "svelte",
  id: "sv-12-shared-state-class",
  order: 12,
  title: "状態をコンポーネントの外に出す（.svelte.ts とクラス）",
  category: "runes",
  difficulty: 3,

  goal: "`.svelte.ts` にクラスと `$state` フィールドで状態を置き、複数のコンポーネントから同じ状態を共有できるようになる",

  why: {
    problem:
      "買い物かごを作っています。ヘッダーの右上にカートの個数バッジがあり、`/cart` にはカートの中身の一覧があります。" +
      "どちらも真面目に書きました。ヘッダーには `let count = $state(0)`、カートページには `let items = $state([])`。\n\n" +
      "商品を追加します。カートページの一覧は増えます。ヘッダーのバッジは 0 のままです。\n\n" +
      "当たり前です。2つの `$state` は名前が似ているだけの、まったく無関係な別の変数だからです。" +
      "`$state` はそれを宣言したコンポーネントのインスタンスにぶら下がるもので、" +
      "別のコンポーネントの `$state` と勝手に繋がったりはしません。\n\n" +
      "そこで教科書どおり「状態を持ち上げる」ことにしました。" +
      "共通の親までカートの状態を上げて、props で配ります。" +
      "ところがヘッダーとカートページの共通の親はルートのレイアウトで、" +
      "そこからバッジまでの間には `AppShell` → `Header` → `HeaderRight` → `IconGroup` → `CartBadge` と、" +
      "カートとは縁もゆかりもないコンポーネントが5つ挟まっています。" +
      "その5つ全部に `cartCount` という props を足して、ただ下に受け渡すだけのコードを書くことになりました。" +
      "レビューで「この `IconGroup` はなぜカートのことを知っているんですか」と聞かれ、答えられませんでした。\n\n" +
      "props を諦めて、共有ファイルを作ることにしました。" +
      "`cart.svelte.ts` に `export let count = $state(0)` と書きます。" +
      "今度はコンパイラに拒否されました。" +
      "`Cannot export state from a module if it is reassigned`。" +
      "動かないどころか、そもそもビルドが通りません。",
    insight:
      "`$state` は「箱に見張りを付ける」のではなく、「その式が作った1つの値に見張りを付ける」と考えてください。\n\n" +
      "`export let count = $state(0)` が拒否される理由は、コンパイラが**1ファイルずつしか見ていない**ことにあります。" +
      "`cart.svelte.ts` の中では、コンパイラは `count` の読み書きを見つけて「見張りから読む」「見張りに書く」コードに置き換えられます。" +
      "しかしそれを `import { count }` した `Header.svelte` の側では、`count` は単なる import した値です。" +
      "その値をどう置き換えればいいか、コンパイラは知りません。" +
      "`Header.svelte` をコンパイルしている時点では、`count` が `$state` だったのか普通の `let` だったのかすら分からないからです。" +
      "だからもし許してしまえば、import した側は最初の 0 を握ったまま二度と更新されない、" +
      "という最悪の形（エラーも警告も出ないのに動かない）になります。コンパイラはそれを先に止めています。\n\n" +
      "解決は拍子抜けするほど単純で、**値そのものを export するのをやめて、値を持っている入れ物を export します**。" +
      "`export const cart = new Cart()` の `cart` は一度も再代入されません。" +
      "変わるのは `cart.items` という中身のほうです。" +
      "そして `cart.items` を読むのは `cart.svelte.ts` の中で定義した `$state` フィールドへのアクセスなので、" +
      "どのファイルから読んでも同じ見張りに繋がります。" +
      "「変数を差し替える」から「オブジェクトの中身を書き換える」に変えただけで、境界を越えられるようになります。\n\n" +
      "クラスにするともう1つ得があります。データと、そのデータを正しく変える手順を同じ場所に置けることです。" +
      "「同じ商品を2回追加したら数量を足す」というルールは、カートの真横に `add()` として置いてあるべきもので、" +
      "各コンポーネントが自前で `items.find(...)` して書くべきものではありません。" +
      "`items` を直接いじるコードが画面のあちこちに散らばると、" +
      "「なぜかカートに同じ商品が2行並ぶ」といったバグの犯人を探すのに全画面を読む羽目になります。\n\n" +
      "ファイル名の `.svelte.ts` は飾りではありません。" +
      "普通の `.ts` ではルーンは処理されず、`$state` は「そんな関数は無い」という実行時エラーになります。" +
      "拡張子が、そのファイルをコンパイラに通す合図になっています。",
  },
  explanation:
    "コンポーネントをまたいで状態を共有したいときは、`.svelte.ts`（または `.svelte.js`）という名前のファイルを作ります。" +
    "この拡張子のファイルの中でだけ、`.svelte` の外でもルーンが使えます。" +
    "その中で `class Cart { items = $state<Item[]>([]); }` のようにクラスのフィールドを `$state` にし、" +
    "`export const cart = new Cart()` でインスタンスを1つだけ公開します。" +
    "`export let x = $state(...)` は再代入される変数を export することになるためコンパイルエラー（`state_invalid_export`）になります。" +
    "export してよいのは「再代入しないもの」で、変わるのはその中身、という形に必ずなります。",

  starterCode: `// src/lib/stores/cart.svelte.ts
//
// 拡張子が .svelte.ts のファイルの中でだけ、コンポーネントの外でもルーンが使えます。
// （普通の .ts では $state は動きません）

export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

// 1. class Cart を書いてください
//    - items フィールドを $state<Item[]>([]) にする
//    - count（合計個数）と total（合計金額）を $derived で書く
//    - add(item, qty = 1): 同じ id が既にあれば qty を足し、無ければ push する
//    - remove(id): その id を取り除く
//    - clear(): 空にする

// 2. インスタンスを1つだけ作って export してください
//    ヒント: export let ... = $state(...) はコンパイルエラーになります。
//    「再代入しないもの」を export する形にします。
`,

  modelAnswer: `// src/lib/stores/cart.svelte.ts
//
// 拡張子が .svelte.ts であることが重要。
// この拡張子のファイルだけ、Svelte のコンパイラがルーンを処理してくれる。

export type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

class Cart {
  // クラスのフィールドを $state にする。
  // 見張りが付くのは「Cart のインスタンスの items」なので、
  // どのファイルから読んでも同じ見張りに繋がる。
  items = $state<Item[]>([]);

  // 派生値もフィールドとして持てる。
  // 各コンポーネントで合計を計算し直す必要がなくなる。
  count = $derived(this.items.reduce((sum, i) => sum + i.qty, 0));
  total = $derived(this.items.reduce((sum, i) => sum + i.price * i.qty, 0));

  // 「同じ商品なら数量を足す」というルールはここに1回だけ書く。
  // 各画面が自前で items をいじり始めると、この判定が抜けた画面が必ず出る。
  add(item: Omit<Item, "qty">, qty = 1) {
    const found = this.items.find((i) => i.id === item.id);
    if (found) {
      found.qty += qty;
      return;
    }
    this.items.push({ ...item, qty });
  }

  remove(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  clear() {
    this.items = [];
  }
}

// export するのは「再代入しないもの」＝インスタンス。
// 変わるのは cart 自体ではなく cart.items（中身）のほう。
//
// これを export let cart = $state(...) と書くと
//   Cannot export state from a module if it is reassigned
// というコンパイルエラーになる。
export const cart = new Cart();

// ── 使う側（それぞれ別ファイル） ────────────────────────────
//
// src/lib/components/CartBadge.svelte
//   <script lang="ts">
//     import { cart } from "$lib/stores/cart.svelte";
//   </script>
//   <span class="badge">{cart.count}</span>
//
// src/routes/cart/+page.svelte
//   <script lang="ts">
//     import { cart } from "$lib/stores/cart.svelte";
//   </script>
//   <ul>
//     {#each cart.items as item (item.id)}
//       <li>
//         {item.name} x {item.qty}
//         <button onclick={() => cart.remove(item.id)}>削除</button>
//       </li>
//     {/each}
//   </ul>
//   <p>合計 {cart.total} 円</p>
//
// src/routes/products/+page.svelte
//   <button onclick={() => cart.add({ id: "p-1", name: "マグカップ", price: 1200 })}>
//     カートに入れる
//   </button>
//
// 3つのファイルは互いを知らないが、同じ cart.items を見ている。
// 商品を追加した瞬間、バッジも一覧も合計金額も同時に変わる。
`,

  hints: [
    {
      level: 1,
      text: "共有したい状態を「変数」として export しようとすると詰みます。export するものは最後まで再代入されない1つのオブジェクトにして、変わるのはその中身、という形にします。",
    },
    {
      level: 2,
      text: "`class Cart { items = $state<Item[]>([]); }` のようにクラスのフィールドを `$state` にします。派生値は `count = $derived(this.items.reduce(...))` と書けます。最後に `export const cart = new Cart();` でインスタンスを1つだけ公開します。",
    },
    {
      level: 3,
      text: "`add` は `const found = this.items.find((i) => i.id === item.id);` で既存を探し、あれば `found.qty += qty`、無ければ `this.items.push({ ...item, qty })` です。配列の中の要素のプロパティを直接書き換えても反応します（`$state` は深く見張るため）。`remove` は `this.items = this.items.filter(...)` で入れ替えます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-12-1",
      description: "ファイル名を `.svelte.ts`（普通の `.ts` ではない）にする理由を説明できるか？",
    },
    {
      id: "cp-sv-12-2",
      description: "`items` がクラスのフィールドとして `$state<Item[]>([])` で宣言できているか？",
    },
    {
      id: "cp-sv-12-3",
      description: "合計個数・合計金額を `$derived` で書けているか（各コンポーネントで計算し直していないか）？",
    },
    {
      id: "cp-sv-12-4",
      description: "公開しているのが `export const cart = new Cart()` の形になっているか？ `export let x = $state(...)` がなぜ拒否されるか説明できるか？",
    },
    {
      id: "cp-sv-12-5",
      description: "「同じ商品を2回追加したら数量を足す」というルールが `add()` の中に1ヶ所だけ書かれているか？",
    },
  ],

  tags: [
    ".svelte.ts",
    "$state",
    "$derived",
    "クラス",
    "状態共有",
    "state_invalid_export",
    "props drilling",
  ],
  relatedIds: ["sv-01-reactive-basics", "sv-02-derived-values", "sv-15-diagnose-server-shared-state"],
};
