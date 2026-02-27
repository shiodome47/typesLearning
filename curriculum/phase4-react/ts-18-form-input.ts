import type { Lesson } from "../types";

export const lesson18: Lesson = {
  id: "ts-18-form-input",
  order: 18,
  title: "フォーム入力の型",
  category: "react-basics",
  difficulty: 3,

  goal: "React.ChangeEvent<HTMLInputElement>を使って、フォームの入力値を型安全に扱えるようになる",
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
