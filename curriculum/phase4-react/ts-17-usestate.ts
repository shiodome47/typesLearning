import type { Lesson } from "../types";

export const lesson17: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-17-usestate",
  order: 17,
  title: "useState の型",
  category: "react-basics",
  difficulty: 3,

  goal: "useState<T>()で型を明示し、型推論が効かない場面でも安全にstateを宣言できるようになる",

  why: {
    problem:
      "ユーザー情報を表示する画面を作ります。情報はサーバーから取ってくるので、" +
      "画面が開いた瞬間はまだ何もありません。だから最初は `null` にしておきます。\n\n" +
      "`const [user, setUser] = useState(null)` と書きました。" +
      "そして取得できたら `setUser(data)` で入れる——のはずが、その行に赤線が出ます。" +
      "TypeScript は初期値の `null` だけを見て「この箱には null しか入らないんだな」と受け取ったからです。\n\n" +
      "ここで多くの人がやってしまうのが `useState<any>(null)` です。赤線は消えます。" +
      "そして `user.nmae` と打ち間違えても、`user.emial` と書いても、もう何も言われません。" +
      "画面には何も出ず、原因が分からないまま時間だけが過ぎます。\n\n" +
      "もう一つの落とし穴は `null` そのものです。" +
      "取得が終わったあとのつもりで `user.name` と書くと、手元では動きます。" +
      "本番でネットが遅い人の環境では、まだ `null` の状態で表示処理が走り、" +
      "`Cannot read properties of null` でアプリ全体が真っ白になります。\n\n" +
      "「最初は空っぽ、あとから入る」という状態は、アプリを作れば必ず出てきます。" +
      "その空っぽの期間をどう扱うかを、書いた本人の記憶に頼るのが危ないのです。",
    insight:
      "`useState<User | null>(null)` の `<User | null>` は、" +
      "「この箱に入るのは User か null のどちらか。それ以外は入らない」という宣言です。\n\n" +
      "初期値だけを見せて察してもらうのではなく、最終的にどうなるかを先に伝えている、と考えてください。" +
      "だから `setUser({ id: 1, name: \"Alice\" })` も通りますし、" +
      "`setUser(\"Alice\")` のような間違いはきちんと止まります。\n\n" +
      "そして `null` を候補に残したことには、もう一つ効き目があります。" +
      "TypeScript は `user.name` をそのままでは書かせてくれません。" +
      "「null かもしれないよ」と言ってくるからです。" +
      "`user ? user.name : \"未選択\"` のように確認を書いて初めて先に進めます。" +
      "読み込み中の真っ白を、書いている最中に防いでくれているわけです。\n\n" +
      "逆に `useState(0)` や `useState(\"\")` で型を書かないのは、手抜きではありません。" +
      "初期値だけで答えが決まる場合は、TypeScript がすでに正しく理解しています。" +
      "書く必要があるのは、`null` や `[]` のように**初期値からは将来の中身が分からない**ときだけです。\n\n" +
      "判断基準はシンプルです。「この初期値だけを見て、他人は中身を当てられるか？」当てられないなら、型で教えてあげます。",
  },
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
