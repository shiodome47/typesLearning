import type { Lesson } from "../types";

export const lesson17: Lesson = {
  id: "ts-17-usestate",
  order: 17,
  title: "useState の型",
  category: "react-basics",
  difficulty: 3,

  goal: "useState<T>()で型を明示し、型推論が効かない場面でも安全にstateを宣言できるようになる",
  explanation:
    "`useState` は初期値から型を推論しますが、初期値が `null` や空配列のときは `useState<T>()` で型引数を明示する必要があります。" +
    "`useState<string>('')` は推論で省略可能ですが、`useState<User | null>(null)` は明示が必須です。" +
    "stateの型が決まると、更新関数の引数も自動的に型チェックされます。",

  starterCode: `type User = {
  id: number;
  name: string;
};

// UserCard コンポーネントを定義してください
// state として以下を持つ:
//   - count: number（初期値 0、型推論でOK）
//   - user: User | null（初期値 null、型引数を明示する）
// ボタンクリックで count を +1 する
// user が null なら "ユーザー未選択" を表示
`,

  modelAnswer: `import { useState } from "react";

type User = {
  id: number;
  name: string;
};

function UserCard() {
  // 型推論が効くケース（初期値から string と推論される）
  const [count, setCount] = useState(0);

  // 型引数を明示するケース（null だけでは User と推論できない）
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>

      <p>{user ? user.name : "ユーザー未選択"}</p>
      <button onClick={() => setUser({ id: 1, name: "Alice" })}>
        ユーザーを設定
      </button>
    </div>
  );
}`,

  hints: [
    {
      level: 1,
      text: "`useState(0)` は `number` と推論されます。`useState(null)` は `null` としか推論されないので `useState<User | null>(null)` と明示します。",
    },
    {
      level: 2,
      text: "`const [user, setUser] = useState<User | null>(null)` の形。`setUser({ id: 1, name: 'Alice' })` が型チェックされます。",
    },
    {
      level: 3,
      text: "`useState<User | null>(null)` で宣言 → `user ? user.name : '未選択'` でnullガード → `setUser({ id: 1, name: 'Alice' })` で更新",
    },
  ],

  checkpoints: [
    { id: "cp-17-1", description: "`useState(0)` のように型推論できるケースで型引数を省略できているか？" },
    { id: "cp-17-2", description: "`useState<User | null>(null)` のように型引数を明示すべきケースで明示できているか？" },
    { id: "cp-17-3", description: "`setCount(count + 1)` が型エラーなく書けているか？" },
    { id: "cp-17-4", description: "`user ? user.name : '...'` でnullガードができているか？" },
  ],

  tags: ["React", "useState", "型推論", "null", "Union型", "state"],
  relatedIds: ["ts-16-component-props", "ts-06-union-literal", "ts-18-form-input"],
};
