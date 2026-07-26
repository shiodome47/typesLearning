import type { Lesson } from "../types";

export const skLesson01: Lesson = {
  kind: "project",
  language: "svelte",
  id: "sk-01-routing",
  order: 17,
  title: "① 物件サイトを作りはじめる — フォルダがURLになる",
  category: "sveltekit",
  difficulty: 2,

  goal: "フォルダを作るだけでURLが増えることを理解し、トップページと物件一覧ページの2枚を作れるようになる",

  why: {
    problem:
      "ふつうのWebアプリで新しいページを1枚増やすとき、何をするか思い出してください。\n\n" +
      "まずページの中身を書きます。次に「/bukken を開いたらこのページを出す」という対応表に1行足します。" +
      "対応表はだいたいアプリのどこか1か所にあって、ページが増えるほど長くなります。\n\n" +
      "ここで事故が起きます。ページのファイルは作ったのに、対応表に書き足すのを忘れる。" +
      "あるいは書き足したけれど、パスを `/buken` と打ち間違える。" +
      "どちらも**エラーは出ません**。ただ、そのURLを開くと「ページが見つかりません」と出るだけです。\n\n" +
      "自分では気づけません。自分は作ったばかりのページを直接開くので、正しいURLしか打たないからです。" +
      "気づくのは、お客さんがメニューをクリックして「押しても何も出ないんですけど」と連絡してきたときです。\n\n" +
      "さらに厄介なのは、対応表が育っていくことです。20ページのサイトなら20行。" +
      "半年後、そのうち3行はもう存在しないページを指しています。消したファイルの行を消し忘れたからです。" +
      "でも誰も怖くて触れません。どれが生きている行なのか、読んでも分からないからです。",
    insight:
      "SvelteKit はこの対応表そのものを無くしました。\n\n" +
      "`src/routes/` の**フォルダの形が、そのままURLの形**です。" +
      "`src/routes/bukken/+page.svelte` というファイルを置けば、`/bukken` が開けるようになります。" +
      "登録作業はありません。ファイルを置いた時点で、もう開けます。\n\n" +
      "書き忘れが起きないのは、あなたが注意深くなったからではなく、**書く場所が無くなったから**です。" +
      "打ち間違いも起きません。フォルダ名がURLなので、間違えようがない。\n\n" +
      "消すときも同じです。フォルダごと消せば、そのURLは消えます。" +
      "「どこかに残っている登録」を探す必要がありません。存在しないものは、どこにも書かれていないからです。\n\n" +
      "ファイル名の先頭の `+` は「これは SvelteKit にとって意味のあるファイルですよ」という目印です。" +
      "`+page.svelte` はページ本体。`+` が付いていないファイルは、ただの部品として無視されます。" +
      "だから `src/routes/bukken/BukkenCard.svelte` のような部品を同じフォルダに置いても、" +
      "`/bukken/BukkenCard` というURLが勝手に生えたりはしません。",
  },
  explanation:
    "SvelteKit のルーティングはファイルシステムベースです。`src/routes/` 以下のフォルダ構造がそのままURLになり、" +
    "各フォルダの `+page.svelte` がそのURLのページ本体になります。" +
    "`src/routes/+page.svelte` は `/`、`src/routes/bukken/+page.svelte` は `/bukken` です。" +
    "ルーティング表への登録は存在しません。" +
    "先頭に `+` が付くファイル名（`+page` / `+layout` / `+server` / `+error`）だけが SvelteKit にとって特別で、" +
    "それ以外のファイルは同じフォルダに置いてもURLになりません。" +
    "ページ間の移動はふつうの `<a href=\"/bukken\">` で書きます。" +
    "SvelteKit がクリックを横取りして、ページ全体を再読み込みせずに切り替えてくれます。",

  files: [
    {
      path: "src/routes/+page.svelte",
      role: "トップページ。URL でいうと `/` にあたります",
      starter: `<!--
  このファイルの場所が、そのまま URL になります。
  src/routes/+page.svelte  →  /
-->

<h1>さくら不動産</h1>

<!-- 1. 「物件を探す」というリンクを作ってください -->
<!--    行き先は /bukken です。ふつうの <a href="..."> で書きます -->
`,
      model: `<!--
  src/routes/+page.svelte  →  /

  ファイルの置き場所が URL そのもの。
  ルーティング表に登録する作業は存在しない。
-->

<h1>さくら不動産</h1>
<p>お部屋探しはこちらから。</p>

<!--
  ページ移動はふつうの <a>。
  SvelteKit がクリックを横取りして、ページ全体を読み込み直さずに切り替える。
  （だから遷移が速い。特別な <Link> コンポーネントは要らない）
-->
<a href="/bukken">物件を探す</a>
`,
    },
    {
      path: "src/routes/bukken/+page.svelte",
      role: "物件一覧ページ。フォルダ名がそのまま `/bukken` になります",
      starter: `<!--
  src/routes/bukken/+page.svelte  →  /bukken

  bukken というフォルダを作っただけで、/bukken が開けるようになります。
  どこかに登録する作業はありません。
-->

<!-- 2. 見出しを <h1> で「物件一覧」と書いてください -->

<!-- 3. トップページ（/）へ戻るリンクも置いてください -->
`,
      model: `<!--
  src/routes/bukken/+page.svelte  →  /bukken

  bukken フォルダを作った時点で /bukken は開ける。
  逆に、このフォルダごと消せば /bukken は消える。
  「どこかに残っている登録」を探す必要がない。
-->

<h1>物件一覧</h1>

<!--
  いまはまだ中身が固定。
  次の回で、この一覧をサーバーから取ってくるようにする。
-->
<ul>
  <li>さくらハイツ 101号室</li>
  <li>みどり荘 203号室</li>
</ul>

<a href="/">トップへ戻る</a>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "新しく覚える記法はありません。ふつうの HTML の `<h1>` と `<a>` だけで書けます。SvelteKit の仕事は「このファイルをどのURLで出すか」を決めることだけです。",
    },
    {
      level: 2,
      text: "リンクは `<a href=\"/bukken\">物件を探す</a>` です。React の `<Link>` のような専用コンポーネントは必要ありません。ふつうの `<a>` を SvelteKit が勝手に速くしてくれます。",
    },
    {
      level: 3,
      text: "トップは `<h1>さくら不動産</h1>` と `<a href=\"/bukken\">物件を探す</a>`。一覧側は `<h1>物件一覧</h1>` と `<a href=\"/\">トップへ戻る</a>` です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sk-01-1",
      description: "2つのページがどちらもコンパイルできるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-sk-01-2",
      description: "トップページに `/bukken` へのリンクがあるか？",
      verify: {
        kind: "kit-attr",
        file: "src/routes/+page.svelte",
        element: "a",
        name: "href",
        value: "/bukken",
      },
    },
    {
      id: "cp-sk-01-3",
      description: "一覧ページに `/` へ戻るリンクがあるか？",
      verify: {
        kind: "kit-attr",
        file: "src/routes/bukken/+page.svelte",
        element: "a",
        name: "href",
        value: "/",
      },
    },
    {
      id: "cp-sk-01-4",
      description:
        "`src/routes/bukken/BukkenCard.svelte` を置いても `/bukken/BukkenCard` というURLが生えない理由を説明できるか？",
    },
  ],

  tags: ["SvelteKit", "ルーティング", "+page.svelte", "ファイルベース"],
  relatedIds: ["sv-13-routing-layout", "sk-02-load"],
};
