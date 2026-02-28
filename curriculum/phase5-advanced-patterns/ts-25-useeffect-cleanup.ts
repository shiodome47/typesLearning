import type { Lesson } from "../types";

export const lesson25: Lesson = {
  id: "ts-25-useeffect-cleanup",
  order: 25,
  title: "useEffect + cleanup関数",
  category: "react-basics",
  difficulty: 3,

  goal: "`useEffect` の依存配列と cleanup 関数のパターンを型安全に書けるようになる",
  explanation:
    "`useEffect(() => { ...; return () => cleanup(); }, [deps])` の構造を体で覚えることが目標です。" +
    "戻り値として返す cleanup 関数は、コンポーネントのアンマウント時や次の effect 実行前に呼ばれます。" +
    "`setInterval` を開始したら cleanup で `clearInterval`、`addEventListener` を登録したら `removeEventListener` を返すのが基本パターンです。" +
    "依存配列 `[]` は「マウント時のみ実行」、`[count]` は「count 変化のたびに実行」を意味します。",

  starterCode: `import { useState, useEffect } from "react";

// 1秒ごとにカウントアップするタイマーコンポーネント

// 1. Timer コンポーネントを定義してください
//    - count: number の state を持つ（初期値 0）
//    - useEffect でインターバルをセットする
//      - setInterval で 1000ms ごとに count を +1 する
//      - cleanup 関数で clearInterval を呼ぶ
//      - 依存配列は [] にする（マウント時のみセット）
//    - JSX: <div>経過秒数: {count}</div> を返す

// 2. 以下のウィンドウサイズ監視 hook を完成させてください
function useWindowWidth(): number {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    // ここに書く
    // - "resize" イベントリスナーを追加（window.innerWidth を setWidth に渡す）
    // - cleanup で removeEventListener を呼ぶ
    // - 依存配列は []
  }, []);

  return width;
}
`,

  modelAnswer: `import { useState, useEffect } from "react";

// 1. インターバルタイマーコンポーネント
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <div>経過秒数: {count}</div>;
}

// 2. ウィンドウ幅監視 hook
function useWindowWidth(): number {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}`,

  hints: [
    {
      level: 1,
      text: "`useEffect` は `() => { ... }` を第1引数に取ります。cleanup は `return () => { ... }` の形で関数を返します。`setInterval` の戻り値（id）を `clearInterval` に渡して後片付けします。",
    },
    {
      level: 2,
      text: "`const id = setInterval(() => setCount(c => c + 1), 1000)` → `return () => clearInterval(id)` の流れです。依存配列 `[]` で「マウント時のみ開始、アンマウント時に停止」になります。",
    },
    {
      level: 3,
      text: "`useWindowWidth` の完成形: `const handler = () => setWidth(window.innerWidth)` → `window.addEventListener(\"resize\", handler)` → `return () => window.removeEventListener(\"resize\", handler)`。handler を変数に出してから remove に渡すのがポイントです。",
    },
  ],

  checkpoints: [
    { id: "cp-25-1", description: "`useEffect` の第1引数が `() => { ... }` の関数になっているか？" },
    { id: "cp-25-2", description: "`setInterval` の id を変数に受けて、cleanup で `clearInterval(id)` しているか？" },
    { id: "cp-25-3", description: "cleanup 関数が `return () => { ... }` の形で返されているか？" },
    { id: "cp-25-4", description: "`useWindowWidth` で addEventListener と removeEventListener がペアになっているか？" },
    { id: "cp-25-5", description: "依存配列 `[]` が正しい位置（第2引数）に書けているか？" },
  ],

  tags: ["useEffect", "cleanup", "setInterval", "addEventListener", "カスタムhook", "副作用"],
  relatedIds: ["ts-17-usestate", "ts-18-form-input", "ts-16-component-props"],
};
