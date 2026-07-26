import type { Lesson } from "../types";

export const svLesson06: Lesson = {
  kind: "diagnose",
  language: "svelte",
  id: "sv-06-diagnose-props-mutation",
  order: 6,
  title: "診断: props を子で書き換えているコード",
  category: "components",
  difficulty: 3,

  goal: "props の所有権を理解し、コールバック prop / `$bindable` / `$derived` に書き分けられるようになる",

  why: {
    problem:
      "TODO の一覧を親、1行ぶんを子コンポーネントに分けました。" +
      "チェックボックスを押すと完了になる処理を、子の中で `todo.done = !todo.done` と書きます。" +
      "動きます。画面もちゃんと変わります。\n\n" +
      "ただ、コンソールに見慣れない警告が出ています。" +
      "`ownership_invalid_mutation`。動いているので、とりあえず後回しにします。\n\n" +
      "同じ日に、別の場所でもっと分かりにくい症状が出ます。" +
      "編集用の入力欄を `let draft = $state(todo.text)` として持たせた行があります。" +
      "一覧の並び替えをすると、行の中身は入れ替わるのに入力欄だけ前の行の文字列が残ります。" +
      "そして保存ボタンを押すと、古い値がサーバーに送られます。\n\n" +
      "こちらにも一応、警告らしきものは出ています。" +
      "`This reference only captures the initial value of \\`todo\\`. " +
      "Did you mean to reference it inside a closure instead?`。" +
      "文面が「クロージャの中で参照したかったのでは？」なので、" +
      "画面が壊れているという実感と結びつかず、たいてい読み飛ばされます。\n\n" +
      "報告として上がってくるのは「たまに違うTODOの名前で保存される」という一文です。" +
      "再現手順が曖昧なので、まずデータベースを疑い、次に API を疑い、" +
      "最後にようやく画面のコードにたどり着きます。\n\n" +
      "2つの症状は別々のバグに見えますが、原因は同じです。" +
      "「親から借りている値」と「自分の値」の区別がついていないことです。",
    insight:
      "props は、親から借りているものだと考えてください。\n\n" +
      "借りたものを勝手に書き換えると、貸した側は知らないうちに中身が変わっていることになります。" +
      "画面上はたまたま更新されて見えることもありますが、" +
      "親は「自分が変えていないのに値が変わった」状態になり、どちらが正しいのか分からなくなります。" +
      "Svelte が `ownership_invalid_mutation` で警告するのは、まさにこの状況です。\n\n" +
      "書き換えたいときの選択肢は3つあります。\n\n" +
      "・親に「変えてください」と頼む → コールバックの prop（`ontoggle: (id) => void`）。" +
      "変更の判断も実行も親に残るので、いちばん見通しがよく、既定の選択肢です。\n" +
      "・親と1つの値を共有する → `$bindable()`。" +
      "入力欄のように、子が触るのが自然な値に限って使います。親は `bind:value={...}` で繋ぎます。\n" +
      "・子の中だけで使う表示用の値 → `$derived`。書き換えるのではなく、props から導きます。\n\n" +
      "3つ目が見落とされがちです。`let title = todo.text + \"（編集中）\"` のように" +
      "props を使ってただの変数を作ると、それは「作った瞬間の値のコピー」です。" +
      "親が新しい値を渡しても、コピーは古いままそこに残り続けます。" +
      "`$derived` にすれば、その式は必要になるたび計算し直されるので、必ず今の props と辻褄が合います。\n\n" +
      "見分ける問いは1つです。「この値の持ち主は誰か」。" +
      "親なら書き換えない。共有するなら `$bindable`。自分で導くだけなら `$derived`。",
  },
  explanation:
    "Svelte 5 の props は既定で読み取り専用です。オブジェクトの中身を子から書き換えると、" +
    "開発時に `ownership_invalid_mutation` という実行時警告が出ます（本番ビルドでは出ません）。" +
    "変更を親に伝えたいときは、関数を prop として受け取って呼び出す（コールバック prop）のが基本形です。" +
    "入力欄のように双方向で共有したい値だけ `$bindable()` を既定値に指定し、親が `bind:` で繋ぎます。" +
    "また、props から作った値を素の `let` で持つとその時点のコピーになり親の更新に追随しないため、`$derived` で宣言します。",

  symptom:
    "チェックボックスを押すと画面は変わるが、コンソールに `ownership_invalid_mutation` の警告が出る。" +
    "並び替えをすると編集欄だけ前の行の文字列が残り、保存すると古い値が送信される。" +
    "型エラーは1件も出ておらず、コンパイラの警告は「クロージャの中で参照したかったのでは？」という" +
    "症状と結びつかない文面のものが出ているだけ。",

  brokenCode: `<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  interface Props {
    todo: Todo;
  }

  let { todo }: Props = $props();

  // 親から借りている値を、その場でコピーして持っている
  let draft = $state(todo.text);
  let title = todo.done ? todo.text + "（完了）" : todo.text;

  function toggle() {
    // 親のオブジェクトを直接書き換えている
    todo.done = !todo.done;
  }

  function save() {
    // 親に伝える手段が無いので、ここで握りつぶすしかない
    todo.text = draft;
    console.log("保存しました", draft);
  }
</script>

<li>
  <input type="checkbox" checked={todo.done} onchange={toggle} />
  <span>{title}</span>
  <input value={draft} oninput={(e) => (draft = e.currentTarget.value)} />
  <button onclick={save}>保存</button>
</li>
`,

  defects: [
    {
      id: "d-sv-06-1",
      summary: "props で受け取ったオブジェクトを子から直接書き換えている",
      why:
        "`todo.done = !todo.done` は親が持っているオブジェクトの中身を、親の知らないところで変更しています。" +
        "画面が更新されるので一見うまくいっているように見えますが、" +
        "「誰がこの値を変えたのか」がコードから追えなくなります。" +
        "開発時には `ownership_invalid_mutation` の警告が出ますが、本番ビルドでは出ないため、" +
        "警告を放置するとそのまま出荷されます。",
      marker: "todo.done = !todo.done;",
    },
    {
      id: "d-sv-06-2",
      summary: "変更を親に返す手段が用意されていない",
      why:
        "この子コンポーネントは、状態を変えたいのに親に知らせる口を1つも持っていません。" +
        "だから直接書き換えるしか方法がなく、`save()` に至っては呼び出し元が何も受け取れません。" +
        "関数を prop として受け取れば（`ontoggle: (id: number) => void`）、" +
        "変更の判断と実行を親に残したまま、子は「押されました」と伝えるだけで済みます。",
      marker: "let { todo }: Props = $props();",
    },
    {
      id: "d-sv-06-3",
      summary: "props から作った値を素の `let` で持っているので、親の更新に追随しない",
      why:
        "`let title = todo.done ? ... : ...` は、コンポーネントが作られた瞬間に一度だけ評価されたコピーです。" +
        "親が別の `todo` を渡しても、この変数は古い値のまま残ります。" +
        "並び替えで行の中身が入れ替わったときに表示だけ前のまま、という症状はこれが原因です。" +
        "`$derived` で宣言すれば、必要になるたび計算し直されるので必ず今の props と一致します。" +
        "型エラーは出ません。コンパイラは `state_referenced_locally`" +
        "（「初期値しか捕まえていません」）という警告を出しますが、" +
        "文面が症状と結びつかないため読み飛ばされがちです。",
      marker: "let title = todo.done ? todo.text + \"（完了）\" : todo.text;",
    },
    {
      id: "d-sv-06-4",
      summary: "編集用の下書きが、親と共有されているのか子だけのものなのか決まっていない",
      why:
        "`draft` は子だけが触る値のようにも、親が保存時に読む値のようにも見えます。" +
        "所有者が決まっていないので、初期化のタイミングも保存の責任も曖昧なままです。" +
        "親と共有するなら `$bindable()` を既定値に指定して親が `bind:draft={...}` で繋ぎ、" +
        "子だけのものなら `$state` にして保存時にコールバックで渡す、のどちらかにはっきり決めます。" +
        "なお `$state(todo.text)` は初期値を一度コピーするだけなので、" +
        "親から別の `todo` が渡されても書き換わりません。",
      marker: "let draft = $state(todo.text);",
    },
  ],

  fixedCode: `<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  interface Props {
    /** 親が持っているデータ。ここでは読むだけ */
    todo: Todo;
    /** 編集中の下書き。親と共有するので $bindable にする */
    draft?: string;
    /** 変更したいことを親に伝える口 */
    ontoggle: (id: number) => void;
    onsave: (id: number, text: string) => void;
  }

  let { todo, draft = $bindable(""), ontoggle, onsave }: Props = $props();

  // props から導く値は $derived。todo が差し替わっても必ず追随する
  let title = $derived(todo.done ? \`\${todo.text}（完了）\` : todo.text);
  let isEdited = $derived(draft !== todo.text);
</script>

<li>
  <input
    type="checkbox"
    checked={todo.done}
    onchange={() => ontoggle(todo.id)}
  />
  <span>{title}</span>

  <!-- $bindable なので親と双方向に繋がる -->
  <input bind:value={draft} />

  {#if isEdited}
    <em>未保存</em>
  {/if}

  <button onclick={() => onsave(todo.id, draft)} disabled={!isEdited}>
    保存
  </button>
</li>
`,

  hints: [
    {
      level: 1,
      text: "書き換えている行を1つずつ見て、「この値の持ち主は誰か」を決めてください。持ち主が親なら、子は書き換えるのではなく頼むしかありません。",
    },
    {
      level: 2,
      text: "変更を頼む口は、関数の prop として受け取ります。`interface Props { ontoggle: (id: number) => void }` として `onchange={() => ontoggle(todo.id)}` と呼びます。親側で実際の書き換えを行います。",
    },
    {
      level: 3,
      text: "親と共有したい値だけ `let { draft = $bindable(\"\") }: Props = $props();` とし、親は `<TodoItem bind:draft={...} />` で繋ぎます。表示用の値は `let title = $derived(todo.done ? ... : ...);` と宣言し直します（素の `let` はコピーなので親の更新に追随しません）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sv-06-1",
      description: "修正後のコンポーネントがコンパイルできるか？",
      verify: { kind: "svelte-compile" },
    },
    {
      id: "cp-sv-06-2",
      description: "`$props()` で受け取る内容を `interface Props` として定義し直せているか？",
      verify: { kind: "svelte-ast", query: "rune:$props" },
    },
    {
      id: "cp-sv-06-3",
      description: "親と共有する値を `$bindable()` で宣言できているか？",
      verify: { kind: "svelte-ast", query: "rune:$bindable" },
    },
    {
      id: "cp-sv-06-4",
      description: "props から導く表示用の値を `$derived` で宣言できているか？",
      verify: { kind: "svelte-ast", query: "rune:$derived" },
    },
    {
      id: "cp-sv-06-5",
      description: "`$bindable` にした値を `bind:` で繋げているか？",
      verify: { kind: "svelte-ast", query: "directive:bind" },
    },
    {
      id: "cp-sv-06-6",
      description: "変更を親に伝えるためのコールバック prop（`ontoggle` / `onsave`）を受け取っているか？",
    },
  ],

  tags: ["$props", "$bindable", "$derived", "props の所有権", "ownership_invalid_mutation", "コールバック prop"],
  relatedIds: ["sv-05-component-props", "ts-16-component-props"],
};
