import type { Lesson } from "../types";

export const lesson10: Lesson = {
  id: "ts-10-crud-basics",
  order: 10,
  title: "CRUDデータ操作",
  category: "crud",
  difficulty: 2,

  goal: "配列を使ったCreate/Read/Update/Deleteの基本パターンを型安全に書けるようになる",
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
    { id: "cp-10-5", description: "`getTodo` の戻り値型が `Todo | undefined` になっているか？" },
  ],

  tags: ["CRUD", "配列", "map", "filter", "スプレッド", "イミュータブル", "Todo", "useState準備"],
  relatedIds: ["ts-08-array-types", "ts-09-optional", "ts-17-usestate"],
};
