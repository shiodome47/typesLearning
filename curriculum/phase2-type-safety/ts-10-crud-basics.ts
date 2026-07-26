import type { Lesson } from "../types";

export const lesson10: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-10-crud-basics",
  order: 10,
  title: "CRUDデータ操作",
  category: "crud",
  difficulty: 2,

  goal: "配列を使ったCreate/Read/Update/Deleteの基本パターンを型安全に書けるようになる",

  why: {
    problem:
      "Todo アプリの完了チェックです。クリックしたら `done` を反転させる。素直に書きました。" +
      "`todo.done = !todo.done` として、`setTodos(todos)` で画面に反映させる。\n\n" +
      "チェックボックスが動きません。クリックしても見た目が変わらない。" +
      "`console.log` を入れると `done` はちゃんと `true` になっています。" +
      "データは変わっているのに、画面だけが変わらないのです。\n\n" +
      "原因は、React が「配列の中身」を1件ずつ見比べたりしないことです。" +
      "見ているのは「渡された配列が、さっきと**別の**配列かどうか」だけ。" +
      "中身をこっそり書き換えても配列そのものは同じものなので、" +
      "React は「何も変わっていない」と判断して描き直しません。\n\n" +
      "似た事故はもう一つあります。並び替え機能で `todos.sort(...)` と書いたら、" +
      "その画面だけでなく、同じ配列を使っていた別の画面の順番まで変わってしまう。" +
      "`sort` や `push` は元の配列を直接書き換えるので、その配列を持っている全員に影響が出ます。" +
      "しかも、どこが書き換えたのかコードを読んでも分かりません。",
    insight:
      "解き方は一つです。**元を触らず、毎回新しい配列を作る。**\n\n" +
      "・追加 … `[...todos, newTodo]`。`...` は「中身を全部並べ直す」という意味。並べ直した末尾に1件足した、別の配列ができます\n" +
      "・更新 … `todos.map((t) => t.id === id ? { ...t, done: !t.done } : t)`。1件ずつ見て、対象だけ差し替え、他はそのまま\n" +
      "・削除 … `todos.filter((t) => t.id !== id)`。条件に合うものだけ集めた別の配列\n\n" +
      "どれも元の `todos` は無傷のまま、別の配列が返ります。" +
      "だから React は「別物が来た」と気づいて描き直します。\n\n" +
      "更新の `{ ...t, done: !t.done }` も同じ考え方です。" +
      "「`t` の中身を全部写して、`done` だけ違う値にした新しいオブジェクト」。後ろに書いたものが勝ちます。\n\n" +
      "毎回作り直すのは無駄に見えますが、見返りがあります。" +
      "ある配列を受け取ったら、その中身は誰にも書き換えられないと保証されます。" +
      "「いつのまにか値が変わっていた」という、原因を追いにくいバグが起きなくなります。",
  },
  explanation:
    "配列ベースのCRUD操作は、Reactのstateでデータを管理するときの基礎パターンです。" +
    "Create: `[...todos, newTodo]`（スプレッド）" +
    "Update: `todos.map(t => t.id === id ? { ...t, ...changes } : t)`（map + スプレッド）" +
    "Delete: `todos.filter(t => t.id !== id)`（filter）" +
    "いずれも元の配列を変更せず新しい配列を返す「イミュータブルな操作」が基本です。",

  starterCode: `type Todo = {
  id: number;
  title: string;
  done: boolean;
};

// 以下の4つの関数を定義してください（元の配列を変更しない）

// addTodo: todos に新しい todo を追加した新しい配列を返す
// getTodo: id で todo を検索して返す（見つからなければ undefined）
// toggleTodo: id の todo の done を反転した新しい配列を返す
// deleteTodo: id の todo を除いた新しい配列を返す
`,

  modelAnswer: `type Todo = {
  id: number;
  title: string;
  done: boolean;
};

function addTodo(todos: Todo[], title: string): Todo[] {
  const newTodo: Todo = {
    id: Date.now(),
    title,
    done: false,
  };
  return [...todos, newTodo];
}

function getTodo(todos: Todo[], id: number): Todo | undefined {
  return todos.find((t) => t.id === id);
}

function toggleTodo(todos: Todo[], id: number): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

function deleteTodo(todos: Todo[], id: number): Todo[] {
  return todos.filter((t) => t.id !== id);
}

// 動作確認
let list: Todo[] = [];
list = addTodo(list, "TypeScriptを学ぶ");
console.log(list.length);              // 1
list = toggleTodo(list, list[0].id);
console.log(list[0].done);             // true
list = deleteTodo(list, list[0].id);
console.log(list.length);              // 0`,

  hints: [
    {
      level: 1,
      text: "追加は `[...todos, newTodo]`、削除は `todos.filter(t => t.id !== id)`。元の配列を直接変更しないのがポイントです。",
    },
    {
      level: 2,
      text: "更新は `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)` の形。`{ ...t }` でコピーしてから変更します。",
    },
    {
      level: 3,
      text: "`toggleTodo`: `t.id === id` のとき `{ ...t, done: !t.done }` を返し、それ以外は `t` をそのまま返す。これがReact stateの標準的な更新パターンです。",
    },
  ],

  checkpoints: [
    { id: "cp-10-1", description: "追加をスプレッド `[...todos, newTodo]` で書けているか？" },
    { id: "cp-10-2", description: "更新を `map + スプレッド` でイミュータブルに書けているか？" },
    { id: "cp-10-3", description: "削除を `filter` で書けているか？" },
    { id: "cp-10-4", description: "いずれの関数も元の `todos` 配列を変更していないか？" },
    {
      id: "cp-10-5",
      description: "`getTodo` の戻り値型が `Todo | undefined` になっているか？",
      verify: {
        kind: "type",
        assert: `type _c5 = Expect<Equal<ReturnType<typeof getTodo>, Todo | undefined>>;`,
      },
    },
  ],

  tags: ["CRUD", "配列", "map", "filter", "スプレッド", "イミュータブル", "Todo", "useState準備"],
  relatedIds: ["ts-08-array-types", "ts-09-optional", "ts-17-usestate"],
};
