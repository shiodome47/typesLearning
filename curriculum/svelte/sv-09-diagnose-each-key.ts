import type { Lesson } from "../types";

export const svLesson09: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-09-diagnose-each-key",
  order: 9,
  title: "診断: {#each} にキーが無いリスト",
  category: "template",
  difficulty: 2,

  goal: "キー無し `{#each}` の症状を特定し、一意なキーを与えられるようになる",

  why: {
    problem:
      "TODOアプリを作りました。項目を足す、チェックを付ける、削除する。よくあるやつです。" +
      "動作確認もしました。追加できる。チェックできる。削除できる。問題なし。\n\n" +
      "納品後、利用者から報告が来ます。「2番目を削除したら、3番目のチェックが勝手に外れた」。\n\n" +
      "手元で再現してみます。確かに外れます。ただし文字のほうは正しいのです。" +
      "「牛乳を買う」「請求書を送る」「歯医者を予約する」の2番目を消すと、" +
      "画面には「牛乳を買う」「歯医者を予約する」と正しく2件だけ残ります。表示は完璧です。" +
      "外れているのはチェックボックスのチェックだけ。\n\n" +
      "しばらく触っていると、もっと気味の悪いことが起きます。" +
      "3行目のテキスト欄に入力している途中で別の行を削除すると、" +
      "**打ちかけの文字が2行目に移動する**のです。カーソルごと。\n\n" +
      "そしてターミナルを見ます。コンパイルは成功しています。警告は0件です。" +
      "`npm run build` も通ります。TypeScript も何も言いません。" +
      "つまり、この不具合を教えてくれる仕組みは、開発中どこにも存在しませんでした。\n\n" +
      "気づけるのは、実際に「途中の行を削除する」という操作をした人だけです。" +
      "そして開発中のテストデータは、たいてい末尾から消すか、全部消すかのどちらかです。",
    insight:
      "画面に見えているものは2つあります。**中身**と**入れ物**です。\n\n" +
      "中身は `{todo.text}` のように Svelte が描いた文字です。これはデータから毎回作り直せるので、いつでも正しくなります。\n\n" +
      "入れ物は DOM 要素そのものです。`<input>` の中でカーソルがどこにあるか、" +
      "チェックボックスが押されているか、IME で変換中の文字は何か——" +
      "これらは JavaScript のデータのどこにも書かれていません。ブラウザが要素の中に持っている状態です。\n\n" +
      "キーが無いと、Svelte はリストが変わったときに**位置で**合わせにいきます。" +
      "「1番目のDOMは1番目のデータに、2番目のDOMは2番目のデータに」。" +
      "3件が2件になったら、余った最後の1個を捨てます。" +
      "残った2個の DOM は使い回され、中の文字だけが書き換わります。\n\n" +
      "結果、**中身は正しく、入れ物だけが1つ前にずれます**。" +
      "だから「文字は合っているのにチェックだけ違う」という、原因が想像しにくい壊れ方をします。\n\n" +
      "`{#each todos as todo (todo.id)}` のキーは、Svelte への「位置ではなく、この印で対応を取ってくれ」という指示です。" +
      "id 2 が消えたら、id 2 の DOM を消す。id 3 の DOM はそのまま残る。ずれません。\n\n" +
      "そして注意すべき罠が `(i)` です。index をキーにすると、書いた本人は「キーを付けた」つもりになりますが、" +
      "index は「先頭から何番目か」なので、削除や並べ替えのたびに別のデータを指します。" +
      "キーが無いのと同じ壊れ方をします。**キーは、そのデータに一生ついて回る印でなければ意味がありません**。\n\n" +
      "最後にもう一段。この回で本当に持ち帰ってほしいのは、" +
      "「コンパイラが見てくれない領域がある」という事実のほうです。" +
      "型もコンパイラも、書いてあることが正しいかは見ますが、書いてないことは指摘しません。" +
      "その隙間を埋めるのが lint です。`eslint-plugin-svelte` の `svelte/require-each-key` を入れておくと、" +
      "キー無しの `{#each}` をコードを書いた時点で赤くしてくれます。" +
      "コンパイラで足りない分は、道具を足して補うという判断です。",
  },
  explanation:
    "`{#each list as item}` にキーを付けないと、Svelte はリスト更新時に DOM を**位置**で対応付けます。" +
    "テキストなどの描画内容は毎回作り直されるため常に正しくなりますが、DOM 要素そのものが持つ状態" +
    "（チェック状態、フォーカス、入力途中の文字、アニメーションの進行、コンポーネントの内部 state）は使い回された要素に残り、別の行にずれます。" +
    "`{#each list as item (item.id)}` のようにキーを与えると、Svelte は位置ではなくキーで対応を取るため、要素と状態が正しく付いていきます。" +
    "キーには「そのデータ固有で、生存中に変わらない値」を使います。配列の index は削除・並べ替えで指すデータが変わるため、公式ドキュメントでも使ってはいけないとされています。" +
    "キーが重複していると実行時に `each_key_duplicate` エラーになります。" +
    "コンパイラはキー無しを警告しないので、`eslint-plugin-svelte` の `svelte/require-each-key` で検出するのが実務的です。",

  symptom:
    "TODOの2番目を削除すると、3番目のチェックボックスのチェックが外れる。文字（テキスト表示）は正しく消えていて、残る2件の内容も正しい。入力途中だった文字がカーソルごと別の行に移動することもある。コンパイルは成功し、警告もエラーも1件も出ていない。",

  brokenCode: `<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
    tag: string;
  }

  let todos = $state<Todo[]>([
    { id: 1, text: "牛乳を買う", done: false, tag: "買い物" },
    { id: 2, text: "請求書を送る", done: true, tag: "仕事" },
    { id: 3, text: "歯医者を予約する", done: false, tag: "仕事" },
  ]);

  let steps = $state([
    { id: 101, label: "材料をそろえる" },
    { id: 102, label: "下ごしらえをする" },
    { id: 103, label: "オーブンで焼く" },
  ]);

  function remove(id: number) {
    todos = todos.filter((t) => t.id !== id);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...steps];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    steps = next;
  }
</script>

<h2>今日のTODO</h2>
<ul>
  {#each todos as todo}
    <li>
      <input type="checkbox" bind:checked={todo.done} />
      <input type="text" bind:value={todo.text} />
      <button onclick={() => remove(todo.id)}>削除</button>
    </li>
  {/each}
</ul>

<h2>手順（並べ替えできる）</h2>
<ol>
  {#each steps as step, i (i)}
    <li>
      <input type="text" bind:value={step.label} />
      <button onclick={() => moveUp(i)}>上へ</button>
    </li>
  {/each}
</ol>

<h2>使われているタグ</h2>
<ul>
  {#each todos as todo (todo.tag)}
    <li>{todo.tag}</li>
  {/each}
</ul>
`,

  defects: [
    {
      id: "d-sv-09-1",
      summary: "TODOリストの `{#each}` にキーが無い",
      why:
        "キーが無いと Svelte は DOM を位置で対応付けます。2番目を削除すると、" +
        "1番目・2番目の `<li>` はそのまま使い回され、中の文字だけが書き換わります。" +
        "その結果、`<input type=\"checkbox\">` のチェック状態や、テキスト欄のカーソル位置・IME 変換中の文字といった" +
        "「DOM が持っている状態」が1つ前の行に残ります。表示は最後まで正しいので、" +
        "テストでも目視でも見つかりません。`(todo.id)` を付けるだけで直ります。",
      marker: "{#each todos as todo}",
    },
    {
      id: "d-sv-09-2",
      summary: "並べ替えできるリストのキーに配列の index を使っている",
      why:
        "`(i)` は一見キーが付いているように見えますが、index は「先頭から何番目か」でしかなく、" +
        "そのデータ固有の印ではありません。並べ替えると、同じ `i` が別の手順を指すようになります。" +
        "Svelte から見ればキーは変わっていないので DOM を使い回し、キー無しとまったく同じずれ方をします。" +
        "しかも「キーを付けた」という見た目のせいでレビューを通過しやすく、キー無しより厄介です。" +
        "公式ドキュメントでも index をキーに使うことは明確に禁じられています。`(step.id)` を使います。",
      marker: "{#each steps as step, i (i)}",
    },
    {
      id: "d-sv-09-3",
      summary: "キーが一意でない（tag は重複する）",
      why:
        "`tag` は「仕事」が2件あります。キーは一意でなければならず、重複すると Svelte は実行時に " +
        "`each_key_duplicate` エラーを投げてその場でリストの描画が止まります。" +
        "しかもデータ次第で起きたり起きなかったりするため、開発中のサンプルデータでは再現せず、" +
        "本番のデータで初めて落ちる、という形になりがちです。" +
        "そもそもここでやりたいのは「使われているタグの一覧」なので、" +
        "重複を取り除いた配列を作ってから回すのが正しい直し方です。",
      marker: "{#each todos as todo (todo.tag)}",
    },
    {
      id: "d-sv-09-4",
      summary: "キー無しをコンパイラが検出してくれない状態のまま放置している",
      why:
        "この3つの欠陥はどれもコンパイルを通り、警告も出ません。型チェックも通ります。" +
        "つまり「気をつける」以外の防御手段が無い状態です。" +
        "`eslint-plugin-svelte` を導入して `svelte/require-each-key` を有効にすると、" +
        "キー無しの `{#each}` を書いた時点でエディタ上に赤線が出ます。" +
        "コンパイラが見てくれない領域があると分かったら、道具を足して埋めるという判断が要ります。",
    },
  ],

  fixedCode: `<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
    tag: string;
  }

  let todos = $state<Todo[]>([
    { id: 1, text: "牛乳を買う", done: false, tag: "買い物" },
    { id: 2, text: "請求書を送る", done: true, tag: "仕事" },
    { id: 3, text: "歯医者を予約する", done: false, tag: "仕事" },
  ]);

  let steps = $state([
    { id: 101, label: "材料をそろえる" },
    { id: 102, label: "下ごしらえをする" },
    { id: 103, label: "オーブンで焼く" },
  ]);

  // 「使われているタグの一覧」は重複を除いてから作る。
  // キーを一意にするためにデータ側を直す、というのが本筋の修正。
  const uniqueTags = $derived([...new Set(todos.map((t) => t.tag))]);

  function remove(id: number) {
    todos = todos.filter((t) => t.id !== id);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...steps];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    steps = next;
  }
</script>

<h2>今日のTODO</h2>
<ul>
  <!-- (todo.id) で対応を取るので、途中の行を消しても
       残った行の DOM（チェック状態・カーソル・変換中の文字）はそのまま付いていく -->
  {#each todos as todo (todo.id)}
    <li>
      <input type="checkbox" bind:checked={todo.done} />
      <input type="text" bind:value={todo.text} />
      <button onclick={() => remove(todo.id)}>削除</button>
    </li>
  {/each}
</ul>

<h2>手順（並べ替えできる）</h2>
<ol>
  <!-- index の i は「何番目か」でしかないのでキーには使えない。
       並べ替えても変わらない step.id をキーにする。
       i そのものは moveUp の引数として使うだけなら問題ない -->
  {#each steps as step, i (step.id)}
    <li>
      <input type="text" bind:value={step.label} />
      <button onclick={() => moveUp(i)}>上へ</button>
    </li>
  {/each}
</ol>

<h2>使われているタグ</h2>
<ul>
  <!-- 重複を除いた配列なので、値そのものをキーにしてよい -->
  {#each uniqueTags as tag (tag)}
    <li>{tag}</li>
  {/each}
</ul>
`,

  hints: [
    {
      level: 1,
      text: "「文字は正しいのにチェックだけずれる」は、データではなく DOM 要素の使い回しが原因です。`{#each}` を3つとも見比べて、リストの各行と DOM の対応をどう取っているかを確認してください。",
    },
    {
      level: 2,
      text: "`{#each list as item (キー)}` の丸括弧がキーです。1つ目には括弧そのものがありません。2つ目は括弧がありますが中身が index です。3つ目は括弧の中の値が重複しています。",
    },
    {
      level: 3,
      text: "1つ目は `(todo.id)`、2つ目は `(step.id)`（`i` はキーには使わず `moveUp(i)` の引数としてだけ残す）、3つ目は `const uniqueTags = $derived([...new Set(todos.map((t) => t.tag))])` を作って `{#each uniqueTags as tag (tag)}` にします。仕上げに `eslint-plugin-svelte` の `svelte/require-each-key` を有効にしておくと、次からは書いた時点で気づけます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-09-1",
      description: "修正後のコンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-09-2",
      description: "すべての `{#each}` にキーが付いているか？",
      verify: { kind: "svelte-ast", query: "each:keyed" },
    },
    {
      id: "cp-sv-09-3",
      description: "キーに配列の index を使っていないか？",
      verify: { kind: "svelte-ast", query: "each:not-index-key" },
    },
    {
      id: "cp-sv-09-4",
      description: "重複しうる値をキーにしていないか？（タグ一覧は重複を除いた配列から回せているか）",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-09-5",
      description: "「表示は正しいのに DOM 側の状態だけがずれる」という症状の形を説明できるか？",
    },
    {
      id: "cp-sv-09-6",
      description: "コンパイラが検出しない欠陥を lint（`svelte/require-each-key`）で補うという判断ができたか？",
    },
  ],

  tags: ["{#each}", "key", "リスト描画", "DOM状態", "index キー", "eslint-plugin-svelte", "コードレビュー"],
  relatedIds: ["sv-02-derived-values", "sv-08-snippet", "sv-11-diagnose-a11y"],
};
