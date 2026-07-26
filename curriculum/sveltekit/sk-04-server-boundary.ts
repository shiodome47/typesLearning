import type { Lesson } from "../types";

export const skLesson04: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-04-server-boundary",
  order: 20,
  title: "④ APIキーが漏れる — サーバーとブラウザの境界",
  category: "sveltekit",
  difficulty: 4,

  goal: "どのファイルがブラウザに配られるのかを判別し、秘密がブラウザ側へ渡る2つの経路（import と load の戻り値）を両方ふさげるようになる",

  why: {
    problem:
      "物件データを外部サービスから取ることになりました。APIキーを渡さないと使えません。\n\n" +
      "あなたは正しく `.env` に `BUKKEN_API_KEY=...` と書き、`$env/static/private` から読み込みました。" +
      "`private` と書いてあるので安心です。動きました。物件が出ます。デプロイしました。\n\n" +
      "3か月後、そのAPIの請求が普段の40倍になっていました。" +
      "使った覚えのないリクエストが、世界中のIPアドレスから飛んでいます。\n\n" +
      "原因はこうです。あなたは `+page.svelte` の中で、家賃の表示形式を整えるついでに、" +
      "「ここでもう一回APIを叩いたほうが早いな」と思って `$env/static/private` を import しました。" +
      "`+page.svelte` はブラウザに配られるファイルです。" +
      "その瞬間、APIキーは JavaScript ファイルの中に文字列として埋め込まれ、" +
      "サイトを開いた人全員のブラウザに配られました。\n\n" +
      "**エラーは出ませんでした。画面も正常でした。** " +
      "誰かが開発者ツールを開いて JS を検索すれば、そこにキーが平文で載っている。ただそれだけの話です。\n\n" +
      "もう1つ、もっと気づきにくい経路があります。" +
      "`+page.server.ts`（サーバー専用の、正しいファイル）の中で、こう書いた場合です。\n\n" +
      "`return { items, apiKey };`\n\n" +
      "デバッグ中に足して、消し忘れた1語です。" +
      "このファイルはブラウザに配られません。それでも漏れます。" +
      "**`load` の戻り値は、ブラウザに送るためのもの**だからです。" +
      "SvelteKit はそれを HTML の中に埋め込んで送ります。" +
      "ページのソースを表示すれば、そこに書いてあります。",
    insight:
      "覚えることは1つだけです。**ファイル名に `.server.` が入っているかどうか**。\n\n" +
      "`.server.` が入っているファイル（`+page.server.ts` / `+layout.server.ts` / `hooks.server.ts`）と、" +
      "`src/lib/server/` の中のファイルは、ビルドのときにブラウザ向けの荷物から**物理的に除外**されます。" +
      "そこに何を書いても、ブラウザには届きません。\n\n" +
      "`.server.` が入っていないファイル（`+page.svelte` / `+page.ts` / `src/lib/` 直下）は、" +
      "ブラウザに配られます。**中身は全世界に見えている**と思ってください。\n\n" +
      "判断に迷ったら、こう考えると外しません。" +
      "**「このファイルの中身をそのまま X に投稿しても平気か？」**\n" +
      "平気なら `.server.` は要りません。まずいなら `.server.` が要ります。\n\n" +
      "そして、漏れる経路は2つあるということ。\n\n" +
      "1つ目は **import**。ブラウザに配られるファイルが秘密を import したら、その時点で終わりです。" +
      "（SvelteKit はこれをビルド時に検出して止めてくれます。ただし止まるのはビルドのときで、" +
      "書いた瞬間ではありません）\n\n" +
      "2つ目は **`load` の戻り値**。こちらは誰も止めてくれません。" +
      "`load` の戻り値は「ブラウザに送る箱」です。サーバー専用ファイルの中で作った箱でも、" +
      "箱そのものはブラウザ行きです。\n" +
      "**秘密は箱に入れず、サーバーの中で使い切って、結果だけを箱に入れる。** これが原則です。\n\n" +
      "この回でやっていることは、構文の練習ではありません。" +
      "「どこに書くか」を間違えると、動いているのに全部漏れる、という種類の失敗を体で覚えることです。",
  },
  explanation:
    "SvelteKit はファイル名でサーバー専用かどうかを決めます。" +
    "`.server.` を含むファイル（`+page.server.ts` / `+layout.server.ts` / `hooks.server.ts`）と `src/lib/server/` 配下は、" +
    "クライアントバンドルから除外されるため、ブラウザに届きません。それ以外はすべてブラウザに配られます。" +
    "環境変数も同じ考え方で分かれており、`$env/static/private` と `$env/dynamic/private` はサーバー専用ファイルからしか import できません。" +
    "`$env/static/public`（`PUBLIC_` で始まる変数のみ）はブラウザからも読めます。" +
    "注意すべきは `load` の戻り値です。これはブラウザへ送るためのデータなので、" +
    "サーバー専用ファイルの中で作っていても、返した瞬間に HTML へ埋め込まれて公開されます。" +
    "秘密はサーバー内で使い切り、結果だけを返してください。",

  files: [
    {
      path: "src/routes/bukken/+page.server.ts",
      role: "サーバー専用。ここに鍵を書くのは正しい。ただし return する中身には注意",
      starter: `// src/routes/bukken/+page.server.ts
//
// .server. が付いているのでブラウザには配られません。
// ここに鍵を書くこと自体は「正しい」です。

import { BUKKEN_API_KEY } from "$env/static/private";

export const load = async ({ fetch }) => {
  const res = await fetch("https://api.example.com/bukken", {
    // 鍵をここで「使う」のは正しい。サーバーの中だから。
    headers: { Authorization: \`Bearer \${BUKKEN_API_KEY}\` },
  });
  const items = await res.json();

  // ↓ ここに問題があります。
  //    デバッグ中に足して消し忘れた、という設定です。
  //
  // 1. load の戻り値はブラウザに送られます。
  //    秘密が入っていないか確認して、直してください。
  return { items, apiKey: BUKKEN_API_KEY };
};
`,
      model: `// src/routes/bukken/+page.server.ts
//
// .server. が付いているのでブラウザには配られない。
// だから「鍵を持っていること」自体は問題ない。

import { BUKKEN_API_KEY } from "$env/static/private";

export const load = async ({ fetch }) => {
  const res = await fetch("https://api.example.com/bukken", {
    // 鍵は「サーバーの中で使い切る」。
    // 使った結果（items）だけを外に出す。
    headers: { Authorization: \`Bearer \${BUKKEN_API_KEY}\` },
  });
  const items = await res.json();

  // load の戻り値は「ブラウザに送る箱」。
  // サーバー専用ファイルの中で作った箱でも、箱そのものはブラウザ行き。
  // SvelteKit はこれを HTML に埋め込んで送るので、
  // ここに入れたものはページのソースを表示すれば誰でも読める。
  //
  // だから apiKey は入れない。items だけ。
  return { items };
};
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "ブラウザに配られるファイル。中身は全世界に見えていると考える",
      starter: `<!--
  src/routes/bukken/+page.svelte

  このファイルはブラウザに配られます。
  中身は「全世界に見えている」と思ってください。
-->

<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };

  // ↓ ここに問題があります。
  //
  // 2. ブラウザに配られるファイルが、サーバー専用の秘密を import しています。
  //    この行を消してください。
  //    （必要なデータは load から data 経由で届いています）
  import { BUKKEN_API_KEY } from "$env/static/private";

  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円
    </li>
  {/each}
</ul>
`,
      model: `<!--
  src/routes/bukken/+page.svelte

  .server. が付いていない = ブラウザに配られる。
  判断に迷ったら「この中身をそのまま X に投稿しても平気か？」と考える。
-->

<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };

  // 秘密の import は無い。
  // このファイルが知っていいのは、load が data として渡してくれたものだけ。
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>

<ul>
  {#each data.items as item (item.id)}
    <li>
      <a href="/bukken/{item.id}">{item.name}</a>
      — {item.rent.toLocaleString()}円
    </li>
  {/each}
</ul>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "直す場所は2か所です。1つは「ブラウザに配られるファイルが秘密を import している」こと。もう1つは「サーバー専用ファイルが秘密を return している」ことです。前者は分かりやすく、後者は気づきにくい。",
    },
    {
      level: 2,
      text: "`+page.svelte` の `import { BUKKEN_API_KEY } ...` の行を丸ごと消します。このファイルは `data` 経由で届いたものだけを知っていればよく、鍵を必要としていません。",
    },
    {
      level: 3,
      text: "`+page.server.ts` は `return { items, apiKey: BUKKEN_API_KEY };` を `return { items };` にします。鍵は上の `headers` の中で使い切っているので、返す必要はありません。「秘密はサーバーの中で使い切って、結果だけを箱に入れる」が原則です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-04-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-04-2",
      description:
        "サーバー専用でないファイルが `$env/static/private` を import していないか？",
      verify: { kind: "kit-server-only", source: "$env/static/private" },
    },
    {
      id: "cp-sk-04-3",
      description:
        "`load` の戻り値に鍵が混ざっていないか（戻り値はブラウザへ送られる）？",
      verify: {
        kind: "kit-load-returns",
        file: "src/routes/bukken/+page.server.ts",
        keys: ["items"],
        forbid: ["apiKey", "key", "token", "secret"],
      },
    },
    {
      id: "cp-sk-04-4",
      description: "サーバー側は鍵を使うこと自体はやめていないか（消すのではなく、使い切る）？",
      verify: {
        kind: "kit-import",
        file: "src/routes/bukken/+page.server.ts",
        source: "$env/static/private",
      },
    },
    {
      id: "cp-sk-04-5",
      description:
        "手元のファイルを1つ挙げて「これはブラウザに配られるか？」を即答できるか？",
    },
  ],

  tags: [
    "SvelteKit",
    "セキュリティ",
    "$env/static/private",
    "サーバー境界",
    ".server.ts",
  ],
  relatedIds: ["sk-03-dynamic-route", "sk-05-layout", "sk-09-diagnose-review"],
};
