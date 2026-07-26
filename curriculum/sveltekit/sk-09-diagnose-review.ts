import type { Lesson } from "../types";

export const skLesson09: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-09-diagnose-review",
  order: 25,
  title: "⑨ 診断：AIが書いたこの物件サイト、納品してよいか",
  category: "code-review",
  difficulty: 4,

  goal: "動いてしまうSvelteKitコードから、秘密の漏洩・XSS・キー欠落・保護漏れを自力で見つけて直せるようになる",

  why: {
    problem:
      "AIに「物件一覧ページを作って」と頼みました。5秒で返ってきました。" +
      "貼り付けて動かすと、ちゃんと動きます。物件が並びます。見た目もきれいです。\n\n" +
      "**エラーは1つも出ていません。**\n\n" +
      "これが今のあなたが置かれている状況です。" +
      "そして受託開発でお金をもらうというのは、この状態のコードに対して" +
      "「納品してよい」と判断する責任を引き受けることです。\n\n" +
      "このコードには4つの問題があります。すべて動きます。すべてエラーが出ません。\n\n" +
      "そのうち1つは、放置すると**APIキーが全世界に公開されます**。\n" +
      "1つは、物件名に細工をされると**訪問者のブラウザで任意のコードが動きます**。\n" +
      "1つは、並べ替えたときに**表示と中身がずれます**。\n" +
      "1つは、**ログインしていない人が管理画面を開けます**。\n\n" +
      "どれも、動かして目で見ても分かりません。" +
      "「動いた」は、何の保証にもなっていませんでした。",
    insight:
      "この回でやることは、新しい構文を覚えることではありません。" +
      "**①〜⑧で見た地雷が、実際のコードの中でどう見えるかを知ること**です。\n\n" +
      "チェックの順番を決めておくと、抜けにくくなります。\n\n" +
      "**1. まずファイル名を見る。** " +
      "`.server.` が付いていないファイルが、秘密を import していないか。" +
      "ここは一瞬で見られて、被害が一番大きい場所です。\n\n" +
      "**2. 次に `load` の `return` を見る。** " +
      "戻り値はブラウザ行きの箱です。中に鍵が入っていないか。" +
      "import は SvelteKit がビルド時に止めてくれますが、**こちらは誰も止めてくれません**。\n\n" +
      "**3. `{@html}` を探す。** " +
      "これは「文字列を HTML として解釈しろ」という命令です。" +
      "他人が入れた文字列に使うと、`<script>` を書かれた時点で相手の勝ちです。" +
      "物件名は不動産会社の担当者が入力します。悪意がなくても、コピペした文字列に何が混ざっているかは分かりません。\n\n" +
      "**4. `{#each}` にキーがあるか見る。** " +
      "無くても動きます。並べ替えるまでは。\n\n" +
      "**5. `/kanri` のような守るべきURLに、保護があるか見る。** " +
      "ログイン中に開発していると、絶対に気づけない種類の穴です。\n\n" +
      "この5つは、AIが書いたコードに対してあなたが持てる**最初の武器**です。" +
      "全部を覚える必要はありません。この順に見る、という手順だけ覚えてください。",
  },
  explanation:
    "このレッスンは診断です。starter に入っているのが「AIが書いてきたコード」で、すべて実行時エラーを起こしません。" +
    "確認すべき順番は、被害の大きさ順です。" +
    "（1）サーバー専用でないファイルが `$env/static/private` などを import していないか。" +
    "（2）`load` の戻り値に秘密が混ざっていないか（戻り値は HTML に埋め込まれてブラウザへ送られます）。" +
    "（3）他人が入力しうる文字列に `{@html}` を使っていないか（XSS）。" +
    "（4）`{#each}` にキーがあるか（無いと並べ替えで表示と中身がずれます）。" +
    "（5）保護すべきルートに認証チェックがあるか。" +
    "いずれも型チェックでもコンパイルでも検出されないため、読んで気づくしかありません。",

  files: [
    {
      path: "src/routes/bukken/+page.server.ts",
      role: "問題が2つあります（秘密の扱い）",
      starter: `// src/routes/bukken/+page.server.ts
// ── AIが生成したコード。動きます。エラーは出ません ──

import { BUKKEN_API_KEY } from "$env/static/private";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000, description: "<b>駅徒歩3分</b>" },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000, description: "南向き" },
];

export const load = async () => {
  // 問題 1: この戻り値はブラウザに送られます。
  //         ページのソースを表示すれば誰でも読めます。
  //         入れてはいけないものが混ざっていないか確認して直してください。
  return {
    items: BUKKEN,
    apiKey: BUKKEN_API_KEY,
  };
};
`,
      model: `// src/routes/bukken/+page.server.ts
// ── 修正版 ──

import { BUKKEN_API_KEY } from "$env/static/private";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", rent: 82000, description: "<b>駅徒歩3分</b>" },
  { id: "midori-203", name: "みどり荘 203号室", rent: 65000, description: "南向き" },
];

export const load = async () => {
  // 修正: apiKey を返さない。
  //
  // load の戻り値は「ブラウザに送る箱」。
  // .server.ts の中で作った箱でも、箱そのものはブラウザ行きで、
  // SvelteKit が HTML に埋め込んで送る。
  //
  // 鍵はサーバーの中で使い切り、結果だけを返す。
  // import 側は SvelteKit がビルド時に止めてくれるが、
  // こちら（戻り値）は誰も止めてくれない。
  return { items: BUKKEN };
};
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "問題が3つあります（import・XSS・キー）",
      starter: `<!-- ── AIが生成したコード。動きます。エラーは出ません ── -->

<script lang="ts">
  // 問題 2: このファイルはブラウザに配られます。
  //         この import は何を意味するか考えて、直してください。
  import { BUKKEN_API_KEY } from "$env/static/private";

  type Bukken = { id: string; name: string; rent: number; description: string };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  <!-- 問題 3: この {#each} には足りないものがあります。 -->
  <!--         いまは動きます。並べ替えるまでは。 -->
  {#each data.items as item}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円

      <!-- 問題 4: description は不動産会社の担当者が入力する文字列です。 -->
      <!--         この書き方が何を許してしまうか考えて、直してください。 -->
      <p>{@html item.description}</p>
    </li>
  {/each}
</ul>
`,
      model: `<!-- ── 修正版 ── -->

<script lang="ts">
  // 修正 2: 秘密の import を削除。
  //
  // .server. が付いていないファイルはブラウザに配られる。
  // 判断に迷ったら「この中身をそのまま X に投稿しても平気か」で考える。
  // このファイルが知っていいのは data 経由で届いたものだけ。

  type Bukken = { id: string; name: string; rent: number; description: string };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  <!--
    修正 3: キー (item.id) を追加。
    キーが無いと Svelte は「何番目か」で対応づけるため、
    並べ替えや削除をしたときに DOM の使い回しがずれ、
    表示と中身が食い違う。動きはするので気づきにくい。
  -->
  {#each data.items as item (item.id)}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円

      <!--
        修正 4: {@html} をやめて、ふつうの {} にした。

        {@html} は「この文字列を HTML として解釈しろ」という命令。
        description は人間が入力する欄なので、
        <script> や onerror 付きの <img> を入れられた時点で
        訪問者のブラウザで任意のコードが動く（XSS）。

        {} で書けば、Svelte が自動でエスケープするので
        <b> はただの文字として表示される。

        どうしても太字を使わせたいなら、
        サーバー側でサニタイズしてから {@html} に渡す。
        「入力を信用して {@html} に渡す」だけは絶対にしない。
      -->
      <p>{item.description}</p>
    </li>
  {/each}
</ul>
`,
    },
    {
      path: "src/routes/kanri/+page.server.ts",
      role: "問題が1つあります（保護漏れ）",
      starter: `// src/routes/kanri/+page.server.ts
// ── AIが生成したコード。動きます。エラーは出ません ──

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室" },
];

// 問題 5: これは管理画面です。物件の編集と削除ができます。
//         ログイン中に開発していると絶対に気づけない穴があります。
//
//         ヒント: locals.user を使います。
//         @sveltejs/kit の redirect を import してください。
export const load = async ({ locals }) => {
  return { items: BUKKEN };
};
`,
      model: `// src/routes/kanri/+page.server.ts
// ── 修正版 ──

import { redirect } from "@sveltejs/kit";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室" },
];

export const load = async ({ locals }) => {
  // 修正 5: 未ログインを弾く。
  //
  // これが無いと、URL を知っているだけで誰でも管理画面を開ける。
  // 開発中は自分がログインしているので、絶対に気づけない。
  //
  // hooks.server.ts が locals.user を用意してくれているので、
  // ここでは cookie を読み直す必要はなく、判断するだけでよい。
  if (!locals.user) {
    redirect(303, "/login");
  }

  return { items: BUKKEN };
};

// より強くするなら、この判定自体を hooks.server.ts に寄せる。
//
//   if (event.url.pathname.startsWith("/kanri") && !event.locals.user) {
//     redirect(303, "/login");
//   }
//
// こうすれば /kanri の下に新しいページを足した瞬間から守られる。
// 「書き忘れる場所」が無くなる。
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "被害の大きい順に見てください。①ブラウザに配られるファイルが秘密を import していないか ②`load` の戻り値に秘密が入っていないか ③`{@html}` を他人の入力に使っていないか ④`{#each}` にキーがあるか ⑤守るべきURLに保護があるか。",
    },
    {
      level: 2,
      text: "`+page.svelte` の `import { BUKKEN_API_KEY }` は削除します（このファイルは鍵を必要としていません）。`+page.server.ts` は `return { items: BUKKEN };` にします。`{#each data.items as item}` は `{#each data.items as item (item.id)}` にします。",
    },
    {
      level: 3,
      text: "`{@html item.description}` は `{item.description}` にします。`{}` なら Svelte が自動でエスケープするので `<b>` は文字として表示されます。管理画面は `import { redirect } from \"@sveltejs/kit\";` を足して、`load` の先頭で `if (!locals.user) redirect(303, \"/login\");` とします。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-09-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-09-2",
      description:
        "【最重要】ブラウザに配られるファイルが秘密を import していないか？",
      verify: { kind: "kit-server-only", source: "$env/static/private" },
    },
    {
      id: "cp-sk-09-3",
      description: "`load` の戻り値に鍵が混ざっていないか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/bukken/+page.server.ts",
        keys: ["items"],
        forbid: ["apiKey", "key", "token", "secret"],
      },
    },
    {
      id: "cp-sk-09-4",
      description: "他人が入力する文字列に `{@html}` を使っていないか（XSS）？",
      verify: {
        kind: "svelte-ast",
        query: "html-tag",
        expect: false,
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-sk-09-5",
      description: "`{#each}` にキーが付いているか？",
      verify: {
        kind: "svelte-ast",
        query: "each:keyed",
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-sk-09-6",
      description: "管理画面が未ログインを `redirect()` で弾いているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/+page.server.ts",
        name: "redirect",
      },
    },
    {
      id: "cp-sk-09-7",
      description:
        "管理画面が `@sveltejs/kit` から `redirect` を import しているか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/kanri/+page.server.ts",
        source: "@sveltejs/kit",
        name: "redirect",
      },
    },
  ],

  tags: [
    "SvelteKit",
    "コードレビュー",
    "XSS",
    "セキュリティ",
    "診断",
    "{@html}",
  ],
  relatedIds: ["sk-08-hooks-auth", "sk-04-server-boundary", "sv-09-diagnose-each-key"],
};
