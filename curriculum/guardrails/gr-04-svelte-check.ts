import type { Lesson } from "../types";

export const grLesson04: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-04-svelte-check",
  order: 29,
  title: "④ `.svelte` は `tsc` が見ていない — svelte-check を CI に載せる",
  category: "tooling",
  difficulty: 3,

  goal: "`.svelte` ファイルが `tsc` の検査対象外であることを理解し、`svelte-check` を npm script と CI に組み込めるようになる",

  why: {
    problem:
      "TypeScript のプロジェクトなので、`npm run build` すれば型チェックされている。" +
      "そう思っていました。実際、`.ts` ファイルの型エラーはちゃんと止まります。\n\n" +
      "ある日、詳細ページが真っ白になります。コンソールを見ると\n\n" +
      "`Cannot read properties of undefined (reading 'name')`\n\n" +
      "原因は `+page.svelte` の中の `data.itmes` でした。`items` の打ち間違いです。\n\n" +
      "**なぜビルドで止まらなかったのか。**\n\n" +
      "`tsc` は `.ts` と `.tsx` を見ます。`.svelte` は見ません。**拡張子を知らないからです。**\n" +
      "`.svelte` の中の `<script lang=\"ts\">` は、`tsc` にとっては存在しないコードです。\n\n" +
      "つまり、あなたのプロジェクトで型チェックが効いていたのは `.ts` ファイルだけ。" +
      "**画面を作っている `.svelte` ファイルは、全部素通りしていました。**\n\n" +
      "しかもこれは気づきにくい。エディタでは赤線が出ているのです。" +
      "VS Code の Svelte 拡張が見てくれているからです。" +
      "でもそれは**あなたの手元だけ**の話で、CI は何も見ていません。\n\n" +
      "だから「自分の環境では赤かったけど、直さずにコミットした」" +
      "「別の人が赤線に気づかず push した」が、そのまま本番に出ます。",
    insight:
      "`svelte-check` は `.svelte` の中身まで型チェックする専用のコマンドです。\n\n" +
      "`tsc` の代わりではなく、**`tsc` が見ない場所を見る道具**だと考えてください。\n\n" +
      "```\n" +
      '"check": "svelte-check --tsconfig ./tsconfig.json"\n' +
      "```\n\n" +
      "これを `package.json` に足して CI で走らせると、" +
      "`.svelte` の中の `data.itmes` が**ビルドを止めます**。\n\n" +
      "大事なのは「CI で走らせる」の部分です。\n" +
      "エディタの赤線は、見た人にしか効きません。" +
      "**見なくても止まる場所に置く**というのが、ガードレールの考え方です。\n\n" +
      "`svelte-check` は型だけでなく、未使用の変数、到達しないコード、" +
      "アクセシビリティの問題（`<img>` に alt が無い等）もまとめて報告します。" +
      "Svelte コンパイラの警告と同じものが、コマンドラインで出ると考えてください。\n\n" +
      "そしてもう1つ。`svelte-check` が `$types` を解決できるのは、" +
      "`svelte-kit sync` がルート情報から型を生成しているからです。" +
      "CI では `npm run build`（または明示的に `svelte-kit sync`）を先に走らせる必要があります。" +
      "ここを忘れると「`./$types` が見つかりません」で落ちます。",
  },
  explanation:
    "`tsc` の検査対象は `.ts` / `.tsx` などで、`.svelte` は含まれません。" +
    "そのため TypeScript プロジェクトであっても、コンポーネント内のコードは型チェックされていません。" +
    "`svelte-check` はコンパイラと同じ仕組みで `.svelte` を解析し、" +
    "型エラー・未使用変数・アクセシビリティ警告をまとめて報告します。" +
    "`package.json` に `\"check\": \"svelte-check --tsconfig ./tsconfig.json\"` を追加し、" +
    "CI のジョブに含めてください。" +
    "エディタの赤線は見た人にしか効かないため、CI で止めることに意味があります。" +
    "なお `./$types` の解決には `svelte-kit sync` による型生成が必要なので、" +
    "CI では `npm run build` などを先に実行するか `svelte-kit sync` を明示的に呼びます。" +
    "`--fail-on-warnings` を付けると警告も失敗扱いにできます。",

  files: [
    {
      path: "package.json",
      role: "ここに書いた script が CI から呼ばれる",
      starter: `{
  "name": "sakura-fudosan",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-svelte": "^2.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
`,
      model: `{
  "name": "sakura-fudosan",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",

    "check": "svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-check --tsconfig ./tsconfig.json --watch"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0",
    "eslint": "^9.0.0",
    "eslint-plugin-svelte": "^2.0.0",
    "svelte": "^5.0.0",
    "svelte-check": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "tsc は素通りしていた。svelte-check なら止まる箇所があります",
      starter: `<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<h1>物件一覧</h1>

<!--
  ここに打ち間違いがあります。

  この .svelte ファイルは tsc の対象外なので、
  npm run build しても止まりませんでした。
  svelte-check を入れれば止まります。

  load は何という名前で返していましたか？
-->
<ul>
  {#each data.itmes as item (item.id)}
    <li>{item.name}</li>
  {/each}
</ul>
`,
      model: `<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
</script>

<h1>物件一覧</h1>

<!--
  data.itmes → data.items

  この 1 文字が本番で真っ白な画面になっていた。
  tsc は .svelte を見ないので、TypeScript プロジェクトでも
  ここは素通りしていた。

  エディタでは赤線が出ていたが、それは自分の手元だけの話で、
  CI は何も見ていなかった。
  「見なくても止まる場所」に置くのがガードレール。
-->
<ul>
  {#each data.items as item (item.id)}
    <li>{item.name}</li>
  {/each}
</ul>
`,
    },
    {
      path: ".github/workflows/ci.yml.txt",
      role: "CI 側の書き方（参照のみ。YAML なので拡張子を変えてあります）",
      readOnly: true,
      starter: `# .github/workflows/ci.yml
#
# エディタの赤線は「見た人」にしか効かない。
# CI に置くと「見なくても止まる」。

name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci

      # $types はルート情報から生成されるので、先に作っておく。
      # これを忘れると「./$types が見つかりません」で落ちる。
      - run: npx svelte-kit sync

      - run: npm run check    # ← .svelte の中まで型チェック
      - run: npm run lint     # ← ③ で設定した Lint
      - run: npm run build
`,
      model: `# .github/workflows/ci.yml

name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npx svelte-kit sync
      - run: npm run check
      - run: npm run lint
      - run: npm run build
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`package.json` の `scripts` に1行足すだけです。`svelte-check` は既に `devDependencies` に入っています。",
    },
    {
      level: 2,
      text: "`\"check\": \"svelte-check --tsconfig ./tsconfig.json\"` です。`--tsconfig` で設定ファイルの場所を教えます。",
    },
    {
      level: 3,
      text: "`.svelte` 側は `data.itmes` を `data.items` に直します。この1文字が本番で真っ白な画面になっていました。`tsc` は `.svelte` を見ないので、これまで素通りしていた箇所です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-04-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-04-2",
      description: "`package.json` に `svelte-check` を走らせる script を足したか？",
      verify: {
        kind: "kit-contains-string",
        file: "package.json",
        value: "svelte-check --tsconfig",
      },
    },
    {
      id: "cp-gr-04-3",
      description: "`data.itmes` の打ち間違いを直したか？",
      verify: {
        kind: "kit-member",
        file: "src/routes/bukken/+page.svelte",
        object: "data",
        property: "itmes",
        expect: false,
      },
    },
    {
      id: "cp-gr-04-4",
      description: "`data.items` を使っているか？",
      verify: {
        kind: "kit-member",
        file: "src/routes/bukken/+page.svelte",
        object: "data",
        property: "items",
      },
    },
    {
      id: "cp-gr-04-5",
      description: "ページがコンパイルできるか？",
      verify: {
        kind: "svelte-compile",
        file: "src/routes/bukken/+page.svelte",
      },
    },
    {
      id: "cp-gr-04-6",
      description:
        "エディタの赤線ではなく CI で止めることに意味がある理由を説明できるか？",
    },
  ],

  tags: ["svelte-check", "CI", "tsc", "型チェック", "GitHub Actions"],
  relatedIds: ["gr-03-eslint", "gr-05-formdata-boundary", "gr-01-types-annotation"],
};
