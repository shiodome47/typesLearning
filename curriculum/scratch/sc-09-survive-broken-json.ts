import type { Lesson } from "../types";

export const scLesson09: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-09-survive-broken-json",
  order: 58,
  title: "⑨ 壊れていても落ちない",
  category: "scratch",
  difficulty: 3,

  goal: "解析に失敗する可能性のある処理を、落とさずに扱えるようになる",

  why: {
    problem:
      "⑧で「無いとき」は片付きました。まだ危うい行が1つ残っています。\n\n" +
      "```\n" +
      "return JSON.parse(raw);\n" +
      "```\n\n" +
      "`raw` は文字列です。しかし**正しい JSON かどうかは分かりません**。\n\n" +
      "こういう文字列が入っていることがあります。\n\n" +
      "- 保存中にタブが閉じられて、途中で切れた JSON\n" +
      "- 利用者が開発者ツールで書き換えた値\n" +
      "- 別のアプリが同じキーを使って上書きした文字列\n\n" +
      "`JSON.parse` は、解析できないと**例外を投げます**。\n" +
      "そして誰も受け止めていないので、**アプリが起動しなくなります**。\n\n" +
      "しかも一度こうなると、**リロードしても直りません**。" +
      "壊れた値が保存されたままなので、毎回同じ場所で落ちます。",
    insight:
      "「失敗するかもしれない処理」は `try` で囲みます。\n\n" +
      "```\n" +
      "let parsed: unknown;\n" +
      "try {\n" +
      "  parsed = JSON.parse(raw);\n" +
      "} catch {\n" +
      "  return [];\n" +
      "}\n" +
      "```\n\n" +
      "**読み方です。**\n\n" +
      "`try { ... }` … この中で例外が起きたら、下の `catch` に飛びます\n" +
      "`catch { ... }` … 例外が起きたときにやること\n\n" +
      "ここでは `return []` にしています。**壊れていたら空から始める**という判断です。\n" +
      "起動しないより、空で起動するほうがましだからです。\n\n" +
      "**そしてもう1つ、この回の本当の要点があります。**\n\n" +
      "受け取る変数を `unknown` と書いていることに注目してください。\n\n" +
      "`JSON.parse` の戻り値は、実は **`any`** です。\n" +
      "`any` は「何でも通る」という意味なので、こう書いても**型は何も言いません**。\n\n" +
      "```\n" +
      "const list: Todo[] = JSON.parse(raw);   // 中身が何であっても通る\n" +
      "```\n\n" +
      "つまり `Todo[]` と書いてあっても、**型は一度も確かめていません**。\n" +
      "だから `unknown` で受けます。\n\n" +
      "**`unknown` は「まだ何か分からない」という型です。**\n" +
      "`any` と違って、確かめる前は使えません。`.length` も `.map` もできない。\n" +
      "**「確かめてから使え」と型が要求してくれます。**\n\n" +
      "```\n" +
      "any     … 何でも通る。型が黙る。危ない\n" +
      "unknown … 確かめるまで使えない。型が守ってくれる\n" +
      "```\n\n" +
      "この回では `unknown` で受けたあと、ひとまず `as Todo[]` で通します。\n" +
      "**`as` は「私が保証します」という宣言で、何も確かめていません。**\n" +
      "つまりまだ不完全です。それを⑩で本当に確かめる形に直します。\n\n" +
      "覚えることは2つです。\n" +
      "**失敗しうる処理は `try` で囲む。外から来たものは `unknown` で受ける。**",
  },
  explanation:
    "`JSON.parse` は解析できない文字列を渡されると例外を投げるため、`try` / `catch` で囲みます。" +
    "起動不能になるより既定値で起動する方が復帰しやすいため、失敗時は空配列を返します。" +
    "また `JSON.parse` の戻り値の型は `any` であり、代入先にどの型を書いても検査されません。" +
    "`unknown` で受け取ると、内容を確認するまで値を操作できなくなり、検証を型が要求します。" +
    "`as` による型アサーションは内容を検証しないため、この段階では暫定的な措置になります。",

  starterCode: `// todo.ts
//
// ⑧の続きです。壊れた保存データでも落ちないようにします。
// ①〜⑧のコードも、この回でもう一度書いてください。
//
// 【要件】
//
//   1. ①〜⑧と同じ型と7つの関数を書く（saveTodos まで）。
//
//   2. loadTodos を次のように直す。
//        - 何も保存されていない → 空配列（⑧のまま）
//        - 保存されているが壊れた JSON → 空配列を返す（例外を投げない）
//        - 正しく解析できた → その値を返す
//
//   3. JSON.parse の結果を受ける変数は unknown 型で宣言する。
//        （JSON.parse は any を返すので、そのままだと型が何も確かめてくれない）
//        受けたあと、この回はまだ as Todo[] で通してよい。⑩で直します。
//
// 使うのは try / catch です。

`,

  modelAnswer: `// todo.ts

type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => {
  const id = String(nextId);
  nextId = nextId + 1;
  return { id: id, text: text, done: false };
};

const addTodo = (list: Todo[], text: string): Todo[] => {
  return [...list, createTodo(text)];
};

const toggleTodo = (list: Todo[], id: string): Todo[] => {
  return list.map((t) => {
    if (t.id === id) {
      return { id: t.id, text: t.text, done: !t.done };
    }
    return t;
  });
};

const removeTodo = (list: Todo[], id: string): Todo[] => {
  return list.filter((t) => t.id !== id);
};

const activeTodos = (list: Todo[]): Todo[] => {
  return list.filter((t) => !t.done);
};

const remainingCount = (list: Todo[]): number => {
  return activeTodos(list).length;
};

const STORAGE_KEY = "todos";

const saveTodos = (list: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }

  // unknown で受けるのが要点。
  // JSON.parse の戻り値は any なので、Todo[] と書いても
  // 型は中身を一度も確かめてくれない。
  //
  // unknown は「まだ何か分からない」型。
  // 確かめるまで .length も .map もできないので、
  // 「確かめてから使え」と型が要求してくれる。
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    // 途中で切れた JSON などはここに来る。
    // 起動しないより、空で起動するほうがまし。
    return [];
  }

  // as は「私が保証します」という宣言で、何も確かめていない。
  // まだ不完全。⑩で本当に確かめる形に直す。
  return parsed as Todo[];
};
`,

  hints: [
    {
      level: 1,
      text: "⑧の `return JSON.parse(raw);` を書き換えます。`let parsed: unknown;` を先に宣言し、`try { ... } catch { ... }` で囲みます。",
    },
    {
      level: 2,
      text: "`try` の中は `parsed = JSON.parse(raw);` だけです。`catch` の中は `return [];` です（`catch (e)` のように受け取る変数は書かなくても構いません）。",
    },
    {
      level: 3,
      text: "最後は `return parsed as Todo[];` です。`parsed` は `unknown` なのでそのままでは返せません。この回は `as` で通してよく、⑩で型ガードに置き換えます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-09-1",
      description: "`loadTodos` は `Todo[]` を返す型か？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<ReturnType<typeof loadTodos>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-09-2",
      description: "正常な保存データはこれまで通り読み戻せるか？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
saveTodos(addTodo(addTodo([], "牛乳"), "パン"));
var back = loadTodos();
assertEqual(back.length, 2, "2件読み戻せない");
assertEqual(back[0].text, "牛乳", "内容が戻ってこない");`,
      },
    },
    {
      id: "cp-sc-09-3",
      description: "何も保存していないとき空配列を返すか（⑧の続き）？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
assertEqual(loadTodos().length, 0, "初回は空配列");`,
      },
    },
    {
      id: "cp-sc-09-4",
      description: "壊れた JSON が入っていても落ちないか（今回の要点）？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem("todos", '[{"id":"1","text":"途中で切れ');
var r = loadTodos();
assertTrue(Array.isArray(r), "壊れた JSON で落ちている（try / catch が無い）");
assertEqual(r.length, 0, "壊れていたら空で始める");`,
      },
    },
    {
      id: "cp-sc-09-5",
      description: "空文字列が入っていても落ちないか（境界）？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem("todos", "");
var r = loadTodos();
assertTrue(Array.isArray(r), "空文字列で落ちている");
assertEqual(r.length, 0, "空文字列なら空配列");`,
      },
    },
    {
      id: "cp-sc-09-6",
      description: "`any` と `unknown` の違いを、自分の言葉で言えるか？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "try/catch", "unknown", "any", "境界"],
  relatedIds: ["sc-08-save-and-load-basic", "sc-10-check-the-shape"],
};
