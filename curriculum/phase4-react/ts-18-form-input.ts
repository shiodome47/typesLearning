import type { Lesson } from "../types";

export const lesson18: Lesson = {
  kind: "write",
  id: "ts-18-form-input",
  order: 18,
  title: "フォーム入力の型",
  category: "react-basics",
  difficulty: 3,

  goal: "React.ChangeEvent<HTMLInputElement>を使って、フォームの入力値を型安全に扱えるようになる",

  why: {
    problem:
      "問い合わせフォームを作ります。名前とメールアドレスを入力してもらって、送信ボタンを押す。それだけです。\n\n" +
      "入力欄に文字が打たれたことを知るには `onChange` に関数を渡します。" +
      "その関数は「何が起きたか」を表す値を1つ受け取ります。慣習で `e` と書かれるあの引数です。" +
      "ここで型を書かないと、そもそも設定によっては「`e` の型が分かりません」とエラーになって前に進めません。\n\n" +
      "型を書かずに済ませたとして、次は中身です。" +
      "入力された文字は `e.target.value` に入っているのですが、これを覚えている人は最初いません。" +
      "`e.value` と書いてしまいます。すると `undefined` が state に入り、" +
      "**入力欄に文字を打っても画面に一文字も出ない**という状態になります。" +
      "打っているのに空欄のまま。壊れているのはハンドラなのに、疑うのは input タグです。\n\n" +
      "送信のほうにも罠があります。`<form onSubmit={...}>` で `e.preventDefault()` を呼び忘れると、" +
      "ブラウザは昔ながらの動きをします。つまりページを丸ごと読み込み直します。" +
      "テスト中に送信ボタンを押した瞬間、画面が一瞬白くなって、入力した内容が全部消えます。" +
      "console.log も一緒に消えるので、何が起きたのか掴めません。\n\n" +
      "どれも「知っていれば起きない」ミスです。だからこそ、知らない状態で気づける仕組みが要ります。",
    insight:
      "`React.ChangeEvent<HTMLInputElement>` は、長いだけで難しくありません。" +
      "「input という種類の部品で、中身が変わった、という出来事」と読みます。\n\n" +
      "肝心なのは `<HTMLInputElement>` の部分です。" +
      "これが「`e.target` は input タグですよ」と伝える役目をしていて、" +
      "だから `e.target.value` が文字列だと分かります。" +
      "もしここを `<HTMLSelectElement>` にすればプルダウンの、" +
      "input のままなら `e.target.checked`（チェックの有無）も見えます。" +
      "**山カッコの中で「どの部品の話か」を指定している**、それだけの仕組みです。\n\n" +
      "型を書く一番の見返りは、エラーが出ることではなく候補が出ることです。" +
      "`e.` まで打てばエディタが `target` を出し、`e.target.` まで打てば `value` を出してくれます。" +
      "`e.value` と書きようがなくなります。`preventDefault` も同じで、覚えていなくても一覧に並びます。\n\n" +
      "submit のほうは `React.FormEvent<HTMLFormElement>`。" +
      "「form という部品で、送信された、という出来事」です。読み方は同じです。\n\n" +
      "つまりイベントの型は、暗記していた知識をエディタに肩代わりさせる仕掛けです。" +
      "長い名前を1回書くかわりに、その先を思い出さなくてよくなります。",
  },
  explanation:
    "Reactのイベントハンドラは `(e: React.ChangeEvent<HTMLInputElement>) => void` の形で型をつけます。" +
    "`e.target.value` で入力値（string）を取得できます。" +
    "フォームのsubmitは `React.FormEvent<HTMLFormElement>` 型で受け取り、`e.preventDefault()` を呼びます。" +
    "これらのイベント型は長いため、型エイリアスや引数の型注釈でよく書きます。",

  starterCode: `import { useState } from "react";

// SimpleForm コンポーネントを定義してください
// state: name(string), email(string)（両方 useState で管理）
// - name input の onChange: React.ChangeEvent<HTMLInputElement> で型付け
// - email input の onChange: 同様に型付け
// - form の onSubmit: React.FormEvent<HTMLFormElement> で型付け
//   e.preventDefault() を呼び、入力値をconsole.logする
`,

  modelAnswer: `import { useState } from "react";

function SimpleForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={handleNameChange} placeholder="名前" />
      <input value={email} onChange={handleEmailChange} placeholder="メール" />
      <button type="submit">送信</button>
    </form>
  );
}`,

  hints: [
    {
      level: 1,
      text: "inputの `onChange` ハンドラの引数型は `(e: React.ChangeEvent<HTMLInputElement>) => void` です。`e.target.value` で入力値（string）を取得します。",
    },
    {
      level: 2,
      text: "formの `onSubmit` の引数型は `React.FormEvent<HTMLFormElement>` です。必ず `e.preventDefault()` を呼んでページリロードを防ぎます。",
    },
    {
      level: 3,
      text: "ハンドラを別変数 `const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value); }` に切り出すと読みやすくなります。",
    },
  ],

  checkpoints: [
    { id: "cp-18-1", description: "`React.ChangeEvent<HTMLInputElement>` と型を書けているか？" },
    { id: "cp-18-2", description: "`e.target.value` で入力値を取得できているか？" },
    { id: "cp-18-3", description: "`React.FormEvent<HTMLFormElement>` でsubmitを型付けできているか？" },
    { id: "cp-18-4", description: "`e.preventDefault()` を呼べているか？" },
    { id: "cp-18-5", description: "`useState('')` で string stateを宣言できているか？" },
  ],

  tags: ["React", "フォーム", "ChangeEvent", "FormEvent", "onChange", "onSubmit", "イベント型"],
  relatedIds: ["ts-17-usestate", "ts-16-component-props"],
};
