import type { Lesson } from "../types";

export const grLesson06: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-06-diagnose-guardrail-gap",
  order: 31,
  title: "⑥ 診断：Lintも型チェックも通った。それでも出せないコード",
  category: "code-review",
  difficulty: 4,

  goal: "機械が止められる範囲と止められない範囲を線引きし、人間が見るべき3点（秘密・認可・仕様）に絞ってレビューできるようになる",

  why: {
    problem:
      "ここまでで、あなたは3つのガードレールを立てました。\n\n" +
      "型（`$types` と `app.d.ts`）、Lint（`eslint-plugin-svelte`）、" +
      "そして `svelte-check` を CI に。\n\n" +
      "AIに「管理画面に物件の一覧と削除を足して」と頼みます。返ってきたコードを貼ります。\n\n" +
      "**`npm run check` — 通ります。**\n" +
      "**`npm run lint` — 通ります。**\n" +
      "**`npm run build` — 通ります。**\n\n" +
      "緑です。全部緑。\n\n" +
      "ここで「よし、出そう」と思うのが、いちばん危ない瞬間です。\n\n" +
      "このコードには3つの問題があります。\n\n" +
      "1つは、**APIキーがブラウザに配られます**。\n" +
      "1つは、**URLを知っていれば誰でも物件を削除できます**。\n" +
      "1つは、**削除の条件が逆になっています**。\n\n" +
      "そして、これら3つに共通する性質があります。" +
      "**どれ1つとして、機械には見つけられません。**",
    insight:
      "なぜ機械に見つけられないのか。理由ははっきりしています。\n\n" +
      "**Lint と型が知っているのは「コードの形」だけで、「何をすべきか」は知らないからです。**\n\n" +
      "`return { items, apiKey }` は、形としては完全に正しいコードです。" +
      "`apiKey` を返してはいけないと知っているのは、あなただけです。\n\n" +
      "`load` に `if (!locals.user)` が**無い**ことも、形の間違いではありません。" +
      "書いていないだけです。書いていないものを「足りない」と言うには、" +
      "「このページは管理画面である」という**仕様**を知っている必要があります。\n\n" +
      "`if (bukken.ownerId === locals.user.id)` と `!==` の取り違えも同じです。" +
      "どちらも型が通ります。どちらが正しいかは、仕様が決めます。\n\n" +
      "つまり、線はここに引かれています。\n\n" +
      "| | 機械が止める | 人間が見る |\n" +
      "|---|---|---|\n" +
      "| キー忘れ・`{@html}` | ✅ Lint | |\n" +
      "| 名前の打ち間違い | ✅ 型 | |\n" +
      "| 型の食い違い | ✅ svelte-check | |\n" +
      "| **秘密を返していないか** | | 👁 |\n" +
      "| **認可を書いたか** | | 👁 |\n" +
      "| **条件の向きは正しいか** | | 👁 |\n\n" +
      "ここまでガードレールを立てた本当の価値は、" +
      "**人間が見るべきものが3つに減ったこと**です。\n\n" +
      "「全部を注意深く読む」は不可能ですが、" +
      "「この3つだけを毎回見る」なら、200行来ても続けられます。\n\n" +
      "AIが書いたコードをレビューするというのは、そういうことです。" +
      "全部を疑うのではなく、**機械が見ない場所だけを疑う。**",
  },
  explanation:
    "このレッスンは診断です。starter のコードは Lint・型チェック・ビルドをすべて通過しますが、" +
    "3つの重大な問題を含んでいます。" +
    "（1）`load` の戻り値に秘密が含まれている（戻り値はブラウザへ送られます）。" +
    "（2）管理画面に認可チェックが無い（書いていないことは形の間違いではないため、機械には検出できません）。" +
    "（3）所有者判定の条件が反転している（`===` と `!==` はどちらも型が通ります）。" +
    "いずれも「コードの形」ではなく「何をすべきか」に関する誤りであり、" +
    "仕様を知っている人間にしか判断できません。" +
    "ガードレールを整備する目的は、機械で止まるものを機械に任せることで、" +
    "人間が見るべき対象を秘密・認可・条件の3点に絞り込むことにあります。",

  files: [
    {
      path: "src/routes/kanri/bukken/+page.server.ts",
      role: "check も lint も build も通ります。それでも3つ問題があります",
      starter: `// src/routes/kanri/bukken/+page.server.ts
//
// ── AIが生成したコード ──
// npm run check  ✅
// npm run lint   ✅
// npm run build  ✅

import { fail } from "@sveltejs/kit";
import { BUKKEN_API_KEY } from "$env/static/private";
import type { PageServerLoad, Actions } from "./$types";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", ownerId: "u1" },
  { id: "midori-203", name: "みどり荘 203号室", ownerId: "u2" },
];

// 問題 1: これは管理画面です。何かが足りません。
//         「書いていない」ことは形の間違いではないので、
//         Lint も型も気づきません。
//
// 問題 2: load の戻り値はブラウザに送られます。
//         入れてはいけないものが混ざっています。
export const load: PageServerLoad = async ({ locals }) => {
  return { items: BUKKEN, apiKey: BUKKEN_API_KEY };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = String(data.get("id") ?? "");

    const bukken = BUKKEN.find((b) => b.id === id);
    if (!bukken) return fail(404, { error: "見つかりません" });

    // 問題 3: 「自分の物件だけ削除できる」ようにしたいコードです。
    //         条件の向きを確かめてください。
    //         === も !== も型は通ります。どちらが正しいかは仕様が決めます。
    if (bukken.ownerId !== locals.user.id) {
      return { success: true }; // 削除実行
    }

    return fail(403, { error: "権限がありません" });
  },
};
`,
      model: `// src/routes/kanri/bukken/+page.server.ts
// ── 修正版 ──

import { fail, redirect } from "@sveltejs/kit";
import { BUKKEN_API_KEY } from "$env/static/private";
import type { PageServerLoad, Actions } from "./$types";

const BUKKEN = [
  { id: "sakura-101", name: "さくらハイツ 101号室", ownerId: "u1" },
  { id: "midori-203", name: "みどり荘 203号室", ownerId: "u2" },
];

export const load: PageServerLoad = async ({ locals }) => {
  // 修正 1: 認可チェックを追加。
  //
  // 元のコードは「書いていない」だけだった。
  // 書いていないものを「足りない」と言うには、
  // 「このページは管理画面である」という仕様を知っている必要がある。
  // だから Lint にも型にも見つけられない。
  if (!locals.user) {
    redirect(303, "/login");
  }

  // 修正 2: apiKey を返さない。
  //
  // return { items, apiKey } は、形としては完全に正しいコード。
  // 返してはいけないと知っているのは人間だけ。
  return { items: BUKKEN };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    // アクション側にも認可が要る。
    // load を守っても、POST は直接叩ける。
    if (!locals.user) {
      return fail(401, { error: "ログインしてください" });
    }

    const data = await request.formData();
    const id = String(data.get("id") ?? "");

    const bukken = BUKKEN.find((b) => b.id === id);
    if (!bukken) return fail(404, { error: "見つかりません" });

    // 修正 3: 条件を反転。
    //
    // 元のコードは「自分のものでなければ削除する」になっていた。
    // === と !== はどちらも型が通る。
    // どちらが正しいかを決めるのは仕様であって、機械ではない。
    if (bukken.ownerId !== locals.user.id) {
      return fail(403, { error: "権限がありません" });
    }

    return { success: true }; // 削除実行
  },
};
`,
    },
    {
      path: "src/routes/kanri/bukken/+page.svelte",
      role: "こちらは Lint も型も通り、実際に問題もありません（参照のみ）",
      readOnly: true,
      starter: `<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<!--
  こちらの画面側には問題がない。
  キーは付いているし、{@html} も使っていない。
  つまり Lint が守ってくれる範囲は、実際にちゃんと守られている。

  問題が残っているのは、機械が見ない場所だけ。
-->

<h1>物件の管理</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      {item.name}
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={item.id} />
        <button type="submit">削除</button>
      </form>
    </li>
  {/each}
</ul>
`,
      model: `<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<h1>物件の管理</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      {item.name}
      <form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={item.id} />
        <button type="submit">削除</button>
      </form>
    </li>
  {/each}
</ul>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "機械が見ない3点だけを見てください。①秘密を返していないか ②認可を書いたか ③条件の向きは正しいか。この3つ以外は Lint と型が守っています。",
    },
    {
      level: 2,
      text: "`load` の先頭に `if (!locals.user) redirect(303, \"/login\");` を足します。`return { items: BUKKEN, apiKey: BUKKEN_API_KEY };` から `apiKey` を外します。`redirect` の import も必要です。",
    },
    {
      level: 3,
      text: "削除の条件は反転しています。「自分の物件だけ削除できる」なら、`ownerId !== locals.user.id` のときに `fail(403)` を返し、そうでないときに削除します。またアクション側にも認可が要ります（`load` を守っても POST は直接叩けるため）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-06-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-06-2",
      description: "【機械が見ない①】`load` の戻り値から秘密を外したか？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/kanri/bukken/+page.server.ts",
        keys: ["items"],
        forbid: ["apiKey", "key", "token", "secret"],
      },
    },
    {
      id: "cp-gr-06-3",
      description: "【機械が見ない②】管理画面に認可チェックを足したか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/bukken/+page.server.ts",
        name: "redirect",
      },
    },
    {
      id: "cp-gr-06-4",
      description: "`@sveltejs/kit` から `redirect` を import したか？",
      verify: {
        kind: "kit-import",
        file: "src/routes/kanri/bukken/+page.server.ts",
        source: "@sveltejs/kit",
        name: "redirect",
      },
    },
    {
      id: "cp-gr-06-5",
      description: "秘密がクライアント側のファイルに漏れていないか？",
      verify: { kind: "kit-server-only", source: "$env/static/private" },
    },
    {
      id: "cp-gr-06-6",
      description:
        "【機械が見ない③】削除条件の向きを直したか（自分の物件だけ削除できるか）？",
    },
    {
      id: "cp-gr-06-7",
      description:
        "Lint と型が「止められないもの」を3つ挙げられるか？",
    },
  ],

  tags: [
    "コードレビュー",
    "ガードレール",
    "認可",
    "セキュリティ",
    "診断",
    "Lintの限界",
  ],
  relatedIds: ["gr-05-formdata-boundary", "sk-09-diagnose-review", "gr-03-eslint"],
};
