import type { Lesson } from "../types";

export const lesson35: Lesson = {
  kind: "diagnose",
  id: "ts-35-diagnose-ssr-hook",
  order: 35,
  title: "診断: サーバーでだけ落ちるカスタムhook",
  category: "code-review",
  difficulty: 3,

  goal: "型では防げない実行環境の違い（SSR）を見抜き、ブラウザ専用APIを安全に扱えるようになる",
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
