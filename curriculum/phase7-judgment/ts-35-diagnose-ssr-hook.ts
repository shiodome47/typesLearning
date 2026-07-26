import type { Lesson } from "../types";

export const lesson35: Lesson = {
  kind: "diagnose",
  language: "typescript",
  id: "ts-35-diagnose-ssr-hook",
  order: 35,
  title: "診断: サーバーでだけ落ちるカスタムhook",
  category: "code-review",
  difficulty: 3,

  goal: "型では防げない実行環境の違い（SSR）を見抜き、ブラウザ専用APIを安全に扱えるようになる",

  why: {
    problem:
      "ここまでの教材はずっと「型を正しく書けば防げる」という話でした。" +
      "この回は逆で、型を完璧に書いても一切防げない種類のバグを扱います。\n\n" +
      "手元でカスタムhookを書きます。ブラウザで開くと動きます。型エラーはゼロ。テストも通る。" +
      "コミットしてデプロイします。本番の画面が真っ白になります。\n\n" +
      "エラーは `ReferenceError: window is not defined`。" +
      "ブラウザに必ずあるはずの `window` が、無いと言われています。\n\n" +
      "理由は、いまの React アプリの多く（Next.js など）が、" +
      "最初の画面をサーバー側で組み立ててから送っているからです。" +
      "サーバーで動いているのは Node.js で、ブラウザではありません。" +
      "`window` も `localStorage` も存在しません。" +
      "そしてあなたが書いたコンポーネントの本体は、まずそのサーバーで一度実行されます。\n\n" +
      "TypeScript がなぜ黙っているのかというと、" +
      "TypeScript が読んでいる型定義の中で `window` は「常に存在するもの」として宣言されているからです。" +
      "TypeScript はコードがどこで実行されるかを知りません。" +
      "ブラウザ用の型定義を読み込んだ時点で、すべてのコードがブラウザで動く前提になります。\n\n" +
      "さらに厄介なのは、`npm run dev` では気づけないことです。" +
      "開発中の画面は既に表示されているものを更新するだけなので、サーバー側の実行を通らない場合があります。" +
      "本番ビルド、あるいはURLを直接開いた初回表示のときだけ落ちます。",
    insight:
      "見抜くのに必要な問いは1つだけです。「この行は、ブラウザではない場所で実行されうるか？」\n\n" +
      "React のコンポーネント関数の本体、つまり `return` にたどり着くまでの部分は、サーバーでも実行されます。" +
      "`useState(...)` の引数もここに含まれます。" +
      "`useState(window.innerWidth)` と書いた場合、`window.innerWidth` は `useState` を呼ぶ前に計算されるので、" +
      "サーバーの上で `window` に触ることになります。\n\n" +
      "`useEffect` の中は違います。" +
      "`useEffect` は画面が実際に DOM に描かれたあとに呼ばれるもので、DOM があるのはブラウザだけです。" +
      "つまり `useEffect` の中身はサーバーでは絶対に走りません。ここがブラウザ専用APIの安全地帯です。\n\n" +
      "だから直し方はいつも同じ形になります。" +
      "初期値はサーバーでも安全な値（`0` や `\"\"`）にしておいて、本当の値は `useEffect` の中で取ってきて `setState` で入れ直す。" +
      "画面は一瞬だけ仮の値で表示され、すぐ実測値に切り替わります。\n\n" +
      "この回で持ち帰ってほしいのは、型が守ってくれるのは「値の形」だけだ、ということです。" +
      "「そのコードがどこで動くか」は型の外側の話で、そこは自分で判断するしかありません。" +
      "型が通ることと、動くことは別問題です。",
  },
  explanation:
    "Next.js のような SSR フレームワークでは、コンポーネントの本体がまずサーバー側で実行されます。" +
    "サーバーには `window` も `localStorage` も存在しません。" +
    "これらは型定義（lib.dom）の上では常に存在することになっているため、" +
    "**型チェックはまったくエラーを出しません**。型が守ってくれない領域の代表例です。" +
    "`useState` の初期値は render 中に評価され、`useEffect` はブラウザでのみ実行される、という違いが鍵になります。",

  symptom:
    "`npm run dev` では動くが、本番ビルドやページの初回表示で `ReferenceError: window is not defined` が出る。型エラーは1件も無い。",

  brokenCode: `import { useState, useEffect } from "react";

// ウィンドウ幅を監視するカスタムhook
function useWindowWidth(): number {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

// 直前の検索条件を復元するカスタムhook
function useSavedQuery(): string {
  const saved = localStorage.getItem("query");
  return saved ?? "";
}`,

  defects: [
    {
      id: "d-35-1",
      summary: "`useState` の初期値で `window` を読んでいる",
      why:
        "`useState(window.innerWidth)` の引数は render 中に評価されます。render はサーバーでも実行されるため、" +
        "そこで `window` に触れると `ReferenceError` になります。`useEffect` の中はブラウザでしか動かないので安全です。",
      marker: "const [width, setWidth] = useState(window.innerWidth);",
    },
    {
      id: "d-35-2",
      summary: "`useSavedQuery` が render 中に `localStorage` を読んでいる",
      why:
        "こちらは hook ですらなく、ただの関数呼び出しが render 中に走ります。" +
        "サーバーでは `localStorage` が未定義なので落ちます。ブラウザ専用APIは必ず `useEffect` 以降に寄せます。",
      marker: 'const saved = localStorage.getItem("query");',
    },
    {
      id: "d-35-3",
      summary: "型チェックはこの問題を検出できない",
      why:
        "`window` も `localStorage` も lib.dom の型定義では常に存在する前提になっています。" +
        "つまり「型が通ること」と「動くこと」は別問題です。実行環境の違いはレビューで見抜くしかありません。",
    },
  ],

  fixedCode: `import { useState, useEffect } from "react";

// ウィンドウ幅を監視するカスタムhook
function useWindowWidth(): number {
  // 初期値では window に触れない（render はサーバーでも走る）
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // useEffect はブラウザでのみ実行されるので window を触ってよい
    const handler = () => setWidth(window.innerWidth);
    handler(); // マウント後に一度だけ実測値へ

    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

// 直前の検索条件を復元するカスタムhook
function useSavedQuery(): string {
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      setQuery(localStorage.getItem("query") ?? "");
    } catch {
      // プライベートブラウジング等で localStorage が使えない場合もある
      setQuery("");
    }
  }, []);

  return query;
}`,

  hints: [
    {
      level: 1,
      text: "「この行はサーバーで実行されるか？」を1行ずつ問いてください。コンポーネント本体（render）はサーバーでも走り、`useEffect` の中はブラウザでしか走りません。",
    },
    {
      level: 2,
      text: "`useState` の初期値はサーバーでも安全な値（`0` や `\"\"`）にして、実測値の取得は `useEffect` の中で行い `setState` で反映します。",
    },
    {
      level: 3,
      text: "`useWindowWidth` は `useState(0)` にして、`useEffect` 内で `handler()` を一度呼んで初期化します。`useSavedQuery` は state を持たせ、`useEffect` の中で `localStorage` を読んで `setQuery` します。localStorage は例外を投げることもあるので try/catch も入れます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-35-1",
      description: "`useWindowWidth` の戻り値型が `number` のままか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof useWindowWidth>, number>>;`,
      },
    },
    {
      id: "cp-35-2",
      description: "`useSavedQuery` の戻り値型が `string` のままか（`string | null` になっていないか）？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof useSavedQuery>, string>>;`,
      },
    },
    {
      id: "cp-35-3",
      description: "戻り値が `any` に化けていないか？",
      verify: {
        kind: "type",
        assert: `
type _c3a = Expect<NotAny<ReturnType<typeof useWindowWidth>>>;
type _c3b = Expect<NotAny<ReturnType<typeof useSavedQuery>>>;`,
      },
    },
  ],

  tags: ["SSR", "window", "localStorage", "useEffect", "カスタムhook", "実行環境", "Next.js"],
  relatedIds: ["ts-25-useeffect-cleanup", "ts-28-custom-hook-pattern"],
};
