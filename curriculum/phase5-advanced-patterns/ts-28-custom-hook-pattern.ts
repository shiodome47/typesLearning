import type { Lesson } from "../types";

export const lesson28: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-28-custom-hook-pattern",
  order: 28,
  title: "型安全なカスタムhookパターン",
  category: "react-basics",
  difficulty: 4,

  goal: "Generics `<T>` を使った型安全なカスタムフック `useLocalStorage<T>` を、白紙から再現できるようになる",

  why: {
    problem:
      "設定画面で選んだ表示モードを、次に開いたときも覚えていてほしい。" +
      "`useState` と `useEffect` と `localStorage` を組み合わせて、10行ほどで書けました。動きます。\n\n" +
      "翌週、一覧画面の並び順も覚えたくなります。さっきの10行をコピーして、キーの名前と型だけ変えます。" +
      "その次は「最近見た商品」。またコピー。気づけば同じ形のコードが3か所にあります。\n\n" +
      "ある日、利用者から「設定画面が真っ白になる」と連絡が来ます。" +
      "調べると、保存されている文字列が途中で壊れていて `JSON.parse` が例外を投げていました。" +
      "`try/catch` で囲んで、読めなければ初期値に戻すよう直します。これで解決。\n\n" +
      "——ではありません。まったく同じ欠陥が、残り2か所にもそのまま残っています。" +
      "コピーした場所を全部覚えていますか。3か所ならまだしも、10か所になっていたら。\n\n" +
      "さらに、コピーのたびに少しずつ書き方がずれていきます。" +
      "こちらは `useEffect` の依存配列に `key` を入れているのに、あちらは入れ忘れている。" +
      "こちらは SSR のガードがあるのに、あちらには無い。" +
      "同じはずのコードが少しずつ違う、というのが一番デバッグしづらい状態です。",
    insight:
      "カスタムフックは、**ただの関数**です。" +
      "名前が `use` で始まっていて、中で `useState` などを呼ぶ。それだけです。" +
      "React が用意した特別な機能ではありません。\n\n" +
      "ただの関数だと分かれば、やることは普通のリファクタリングと同じです。" +
      "3か所に散らばった同じ処理を1つの関数にまとめる。" +
      "`try/catch` も SSR のガードも、そこに1回書けば全部の呼び出し元に効きます。" +
      "壊れたデータの対処を直す場所は1か所です。\n\n" +
      "まとめるときに邪魔になるのが「保存する中身の型が場所ごとに違う」ことです。" +
      "表示モードは文字列、並び順は数値、最近見た商品は配列。" +
      "ここで `any` を使うと、`number` で保存したのに `string` として読み出すような間違いが素通りしてしまいます。\n\n" +
      "そこで `<T>` を使います。" +
      "`<T>` は「中身の型は呼ぶ側が決めてください」という宣言です。" +
      "`useLocalStorage<string>(\"mode\", \"light\")` と呼べば戻ってくるのは `string`、" +
      "`useLocalStorage<Product[]>(\"recent\", [])` と呼べば戻ってくるのは `Product[]`。\n\n" +
      "実装は1つ、型は呼ぶ側ごとにぴったり。" +
      "「共通化すると型がゆるくなる」という妥協をしなくて済むのが、Generics のありがたいところです。",
  },
  explanation:
    "この教材は Phase5 の総合演習です。" +
    "#11（Generics）・#17（useState）・#25（useEffect）・#14（try/catch）で学んだ知識をすべて組み合わせます。" +
    "`useLocalStorage<T>(key, initialValue)` は「localStorage に値を保存・復元しながら state と同期するカスタムフック」です。" +
    "Generics `<T>` により、文字列・数値・オブジェクトなど任意の型で使い回せます。" +
    "初期読み込みは `JSON.parse`（型は `as T` でキャスト）、保存は `useEffect` で `JSON.stringify`、" +
    "読み込み失敗時は `try/catch` で `initialValue` にフォールバックするパターンが基本形です。",

  starterCode: `import { useState, useEffect } from "react";

// useLocalStorage<T> カスタムフックを実装してください
//
// シグネチャ:
//   function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void]
//
// 要件:
// 1. useState<T> で value state を持つ
//    - 初期値: localStorage から key で読み込む
//      - 読み込めた場合: JSON.parse した値（as T でキャスト）
//      - 失敗した場合（try/catch）: initialValue を使う
//    - ※ SSR安全のため typeof window === "undefined" なら initialValue を返す
//
// 2. useEffect で value が変わるたびに localStorage へ保存する
//    - JSON.stringify(value) で文字列化して保存
//    - 依存配列: [key, value]
//
// 3. [value, setValue] を返す（setValue は useState の setter をそのまま使う）

// 動作確認用コンポーネント（実装後にコメントを外して確認）
// function App() {
//   const [name, setName] = useLocalStorage<string>("username", "ゲスト");
//   return (
//     <div>
//       <p>名前: {name}</p>
//       <input value={name} onChange={(e) => setName(e.target.value)} />
//     </div>
//   );
// }
`,

  modelAnswer: `import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 動作確認用コンポーネント
function App() {
  const [name, setName] = useLocalStorage<string>("username", "ゲスト");
  return (
    <div>
      <p>名前: {name}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}`,

  hints: [
    {
      level: 1,
      text: "まず `useState<T>` の初期値を関数形式 `useState<T>(() => { ... })` にします。関数内で `localStorage.getItem(key)` を試み、取れたら `JSON.parse(item) as T`、失敗したら（`try/catch` で）`initialValue` を返します。SSR対策で最初に `typeof window === \"undefined\"` をチェックします。",
    },
    {
      level: 2,
      text: "`useEffect` で `localStorage.setItem(key, JSON.stringify(value))` を呼びます。依存配列は `[key, value]` にすると、value が変わるたびに自動保存されます。",
    },
    {
      level: 3,
      text: "戻り値は `[value, setValue]` — `setValue` は `useState` のセッター関数をそのまま返せばOKです。シグネチャ全体: `function useLocalStorage<T>(key: string, initialValue: T): [T, (next: T) => void]`",
    },
  ],

  checkpoints: [
    {
      id: "cp-28-1",
      description: "関数に `<T>` の型パラメータが付いているか？",
      verify: {
        kind: "type",
        assert: `
const [_str1] = useLocalStorage<string>("k1", "a");
const [_obj1] = useLocalStorage<{ n: number }>("k2", { n: 1 });
type _c1a = Expect<Equal<typeof _str1, string>>;
type _c1b = Expect<Equal<typeof _obj1, { n: number }>>;`,
      },
    },
    { id: "cp-28-2", description: "`useState<T>` の初期値でlocalStorageを読み込み、`try/catch` でフォールバックしているか？" },
    { id: "cp-28-3", description: "`useEffect` で `JSON.stringify(value)` を保存し、依存配列が `[key, value]` になっているか？" },
    { id: "cp-28-4", description: "`typeof window === \"undefined\"` のSSRガードが入っているか？" },
    {
      id: "cp-28-5",
      description: "戻り値が `[value, setValue]` のタプル形式で返せているか？",
      verify: {
        kind: "type",
        assert: `
const _pair5 = useLocalStorage<number>("k5", 0);
type _c5a = Expect<Equal<(typeof _pair5)["length"], 2>>;
type _c5b = Expect<Equal<(typeof _pair5)[0], number>>;
const _setter5: (next: number) => void = _pair5[1];`,
      },
    },
  ],

  tags: ["カスタムhook", "Generics", "useLocalStorage", "localStorage", "JSON.parse", "SSR安全"],
  relatedIds: ["ts-11-generics-basics", "ts-14-error-handling", "ts-17-usestate", "ts-25-useeffect-cleanup"],
};
