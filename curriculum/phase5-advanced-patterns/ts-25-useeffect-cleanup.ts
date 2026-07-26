import type { Lesson } from "../types";

export const lesson25: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-25-useeffect-cleanup",
  order: 25,
  title: "useEffect + cleanup関数",
  category: "react-basics",
  difficulty: 3,

  goal: "`useEffect` の依存配列と cleanup 関数のパターンを型安全に書けるようになる",

  why: {
    problem:
      "クイズアプリの回答画面に、経過時間を表示することにしました。" +
      "`useEffect` の中で `setInterval` を仕掛けて、1秒ごとに数字を増やします。" +
      "画面を開くと数字が動きます。完成です。\n\n" +
      "ところが、`setInterval` は React のものではありません。ブラウザのものです。" +
      "利用者が「一覧に戻る」を押すと、React は回答画面を消しますが、ブラウザのタイマーは何も知らずに動き続けます。" +
      "止めてくれと誰も頼んでいないからです。\n\n" +
      "利用者は問題を解いては一覧に戻り、また次の問題を開きます。" +
      "そのたびにタイマーが1本ずつ増えていきます。20問解けば20本。" +
      "しかも消えたはずの画面の数字を更新しようとし続けます。" +
      "スマホが熱くなり、電池が減り、操作がだんだんもたつく。\n\n" +
      "`addEventListener` も同じです。ウィンドウ幅の監視を登録したまま画面を離れると、" +
      "画面を出入りした回数だけハンドラが積み上がり、ウィンドウを少し動かすだけで何十回も実行されます。\n\n" +
      "厄介なのは、開発中はまず気づかないことです。" +
      "自分は画面を1回開いて、数字が動くのを見て、それで確認を終えるからです。" +
      "困るのは、1時間アプリを使い続けた利用者の方です。",
    insight:
      "`useEffect` の中から返す関数は、**後片付け係**です。\n\n" +
      "React は「この効果はもう要らない」と判断した瞬間に、この関数を呼んでくれます。" +
      "呼ばれるのは2つの場面。コンポーネントが画面から消えるときと、" +
      "依存配列の中身が変わって effect をやり直す直前です。\n\n" +
      "だから考え方は「対にする」だけです。\n\n" +
      "・`setInterval` で始めた → `clearInterval` で止める\n" +
      "・`addEventListener` で登録した → `removeEventListener` で外す\n" +
      "・接続を開いた → 閉じる\n\n" +
      "第2引数の依存配列は「いつやり直すか」の指定です。" +
      "`[]` なら「最初の1回だけ」、`[userId]` なら「userId が変わるたびにやり直す」。" +
      "やり直すときは、その前に必ず後片付けが走ります。" +
      "つまり古いタイマーを止めてから新しいタイマーを仕掛けてくれる、ということです。\n\n" +
      "`useEffect` は「画面の外の世界に手を出す場所」だと思ってください。" +
      "手を出したものは、自分で引っ込める。それを書くのが cleanup です。",
  },
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
  // 注意: 初期値に window を直接読まない（SSR では window が存在しない）
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // ここに書く
    // - マウント後に一度 setWidth(window.innerWidth) で初期化
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
  // SSR（Next.js など）では window が存在しないため、初期値では触らない。
  // useEffect はブラウザでのみ実行されるので、そこで実測値に更新する。
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    handler(); // マウント後に一度だけ実測値へ初期化

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
