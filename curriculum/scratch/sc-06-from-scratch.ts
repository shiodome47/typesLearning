import type { Lesson } from "../types";

export const scLesson06: Lesson = {
  kind: "write",
  language: "typescript",
  id: "sc-06-from-scratch",
  order: 55,
  title: "⑥ 卒業試験 — 手本なしで、もう一度ゼロから",
  category: "scratch",
  difficulty: 4,

  goal: "要件だけを渡された状態から、ToDoアプリのロジック一式を手本なしで組み立てられるようになる",

  why: {
    problem:
      "①から⑤まで通してきました。それぞれの回では書けたはずです。\n\n" +
      "しかし「作れる」と言えるかどうかは、まだ分かりません。\n\n" +
      "各回には**足場がありました**。要件が1〜2個に絞られていて、" +
      "前の回で何を書いたか覚えていて、ヒントも手本もありました。\n\n" +
      "実際の仕事では、そのどれもありません。\n" +
      "**「ToDoアプリ作って」の一言**があり、白紙のファイルがあるだけです。\n\n" +
      "そして、ここで初めて分かることがあります。\n" +
      "**順番を自分で決められるか。**\n\n" +
      "①〜⑤では、私が順番を決めていました。型 → 追加 → 変更 → 集計 → 保存。" +
      "この順番自体が答えの一部でした。\n\n" +
      "今回はそれも渡しません。要件を全部並べます。どこから手を付けるかは、あなたが決めます。",
    insight:
      "順番の決め方には、はっきりした指針があります。\n\n" +
      "**依存の少ないものから書く。**\n\n" +
      "型は何にも依存しません。だから最初です。\n" +
      "`createTodo` は型に依存します。次です。\n" +
      "`addTodo` は `createTodo` に依存します。その次です。\n" +
      "`remainingCount` は `activeTodos` に依存します。\n" +
      "`loadTodos` は型に依存しますが、他の関数には依存しません。だから独立して書けます。\n\n" +
      "この順番で書くと、**書いている途中で「まだ無いもの」を呼ばずに済みます**。\n\n" +
      "もう1つの指針は、**動く状態を保ちながら進める**ことです。\n" +
      "型 → `createTodo` まで書けたら、その時点で1件作れます。" +
      "そこで一度採点を押してよい。全部書き終えてから採点すると、" +
      "どこが間違っているのか分からなくなります。\n\n" +
      "**部分点があります。** 少しずつ通してください。\n\n" +
      "そして、この回で本当に確かめてほしいのは1つだけです。\n\n" +
      "**手本を開かずに書き切れるか。**\n\n" +
      "開いてしまっても構いません。ただし開いたら、閉じてもう一度書いてください。" +
      "**2回目に手本なしで書けたなら、それは「作れる」ということです。**\n\n" +
      "最後に1つ、実務の話をします。\n" +
      "この回でやっていることは、いまなら AI が数秒で出力します。" +
      "**それでも自分で一度組み立てる価値があるのは、" +
      "AI が出してきた構造を疑えるようになるためです。**\n\n" +
      "「なぜ件数を状態で持っているのか」「なぜ index で消しているのか」" +
      "「なぜ `as Todo[]` で済ませているのか」。\n" +
      "自分で組み立てたことがなければ、この3つは指摘できません。",
  },
  explanation:
    "実装の順番は、依存関係の少ないものから決めます。" +
    "型は他に依存しないため最初に置き、生成関数、それを使う操作、" +
    "さらにそれを使う導出関数という順に進めると、未定義のものを参照せずに書けます。" +
    "保存と読み込みは型にのみ依存するため、他の操作とは独立して実装できます。" +
    "また各段階で採点できる状態を保つと、誤りの位置を切り分けられます。" +
    "この回の内容は生成AIでも短時間で出力できますが、自分で組み立てた経験があると、" +
    "生成されたコードに含まれる「派生値を状態として持っている」" +
    "「位置で要素を特定している」「境界で型アサーションを使っている」といった" +
    "設計上の問題を指摘できるようになります。",

  starterCode: `// todo.ts
//
// 卒業試験です。手本を開かずに、ここに全部書いてください。
//
// 【要件】ToDoアプリのロジック一式
//
//   型
//     Todo                                  id: string / text: string / done: boolean
//
//   作る
//     createTodo(text)          -> Todo     done は false。id は毎回違う値
//
//   一覧を操作する（どれも元の配列とその中身を変更しない）
//     addTodo(list, text)       -> Todo[]   末尾に1件足す
//     toggleTodo(list, id)      -> Todo[]   id が一致する1件の done を反転
//     removeTodo(list, id)      -> Todo[]   id が一致する1件を除く
//     ※ 一致する id が無いときは、何も変わらない配列を返す
//
//   数える
//     activeTodos(list)         -> Todo[]   未完だけ
//     remainingCount(list)      -> number   未完の件数
//     ※ 件数は状態として持たない
//
//   保存する
//     saveTodos(list)           -> void     localStorage のキー "todos" に JSON で
//     loadTodos()               -> Todo[]   次のどの場合も例外を投げない
//                                             未保存 / 壊れた JSON / 配列でない → 空配列
//                                             不正な要素が混ざる → その要素だけ除く
//
// 進め方: 依存の少ないものから書いてください（型 → createTodo → addTodo → ...）。
// 途中で採点を押して構いません。部分点があります。

`,

  modelAnswer: `// todo.ts
//
// ToDoアプリのロジック一式。
// 依存の少ないものから並べてある。

// ── 型（何にも依存しない。だから最初） ──
type Todo = { id: string; text: string; done: boolean };

// ── 作る ──
// 採番は関数の中に閉じ込め、呼ぶ側に考えさせない。
let nextId = 1;

const createTodo = (text: string): Todo => ({
  id: String(nextId++),
  text,
  done: false,
});

// ── 一覧を操作する ──
// どれも新しい配列を返す。元を壊すと画面が更新されない。
const addTodo = (list: Todo[], text: string): Todo[] => [
  ...list,
  createTodo(text),
];

// 位置ではなく id で探す。絞り込みや並べ替えを入れても壊れない。
const toggleTodo = (list: Todo[], id: string): Todo[] =>
  list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));

// 「id が違うものを残す」と書くと削除になる。
// 無い id を渡されても全部残るだけで、例外にならない。
const removeTodo = (list: Todo[], id: string): Todo[] =>
  list.filter((t) => t.id !== id);

// ── 数える ──
// 「未完とは何か」の定義はここだけ。
const activeTodos = (list: Todo[]): Todo[] => list.filter((t) => !t.done);

// 件数は持たない。毎回導く。だからズレない。
const remainingCount = (list: Todo[]): number => activeTodos(list).length;

// ── 保存する（型にだけ依存するので独立して書ける） ──
const STORAGE_KEY = "todos";

const saveTodos = (list: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// as ではなく型ガード。実際に中身を確かめている。
const isTodo = (v: unknown): v is Todo =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as Todo).id === "string" &&
  typeof (v as Todo).text === "string" &&
  typeof (v as Todo).done === "boolean";

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  // 初回アクセスは異常ではない。
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  // 不正な要素だけを落とす。1件のために全部捨てない。
  return parsed.filter(isTodo);
};

export {
  createTodo,
  addTodo,
  toggleTodo,
  removeTodo,
  activeTodos,
  remainingCount,
  saveTodos,
  loadTodos,
};
export type { Todo };
`,

  hints: [
    {
      level: 1,
      text: "順番だけ渡します。型 → `createTodo` → `addTodo` → `toggleTodo` → `removeTodo` → `activeTodos` → `remainingCount` → `saveTodos` → `loadTodos`。この順なら、書いている途中で「まだ無いもの」を呼ばずに済みます。",
    },
    {
      level: 2,
      text: "詰まっている箇所だけ思い出してください。追加は `[...list, x]`、変更は `map` で `{ ...t, done: !t.done }`、削除は `filter` で `!==`、絞り込みは `filter(!t.done)`、件数は `activeTodos(list).length`。読み込みは「無い → 壊れている → 配列でない → 形が違う」の4段階です。",
    },
    {
      level: 3,
      text: "ここまで来たら、手本を開いて構いません。ただし**開いたら閉じて、もう一度ゼロから書いてください**。2回目に手本なしで書けたなら「作れる」ということです。それがこの回の目的です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-sc-06-1",
      description: "型と関数の形が揃っているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Todo, { id: string; text: string; done: boolean }>>;
type _c2 = Expect<Equal<ReturnType<typeof addTodo>, Todo[]>>;
type _c3 = Expect<Equal<ReturnType<typeof remainingCount>, number>>;
type _c4 = Expect<Equal<ReturnType<typeof loadTodos>, Todo[]>>;`,
      },
    },
    {
      id: "cp-sc-06-2",
      description: "作って足せるか（id が重複しないか）？",
      verify: {
        kind: "run",
        assert: `assertEqual(createTodo("x").done, false, "作った直後は未完");
var list = addTodo(addTodo([], "A"), "B");
assertEqual(list.length, 2, "2件足せる");
assertTrue(list[0].id !== list[1].id, "id が重複している");`,
      },
    },
    {
      id: "cp-sc-06-3",
      description: "1件だけ変えられるか（他は変わらないか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
var after = toggleTodo(list, list[1].id);
assertEqual(after[1].done, true, "指定した1件が完了になる");
assertEqual(after[0].done, false, "指定していない項目まで変わっている");
assertEqual(toggleTodo(after, list[1].id)[1].done, false, "2回で元に戻らない");`,
      },
    },
    {
      id: "cp-sc-06-4",
      description: "1件だけ消せるか（無い id でも壊れないか）？",
      verify: {
        kind: "run",
        assert: `var list = addTodo(addTodo([], "A"), "B");
assertEqual(removeTodo(list, list[0].id).length, 1, "1件だけ減る");
assertEqual(removeTodo(list, list[0].id)[0].text, "B", "残る項目が違う");
assertEqual(removeTodo(list, "無い").length, 2, "無い id で消えてしまっている");`,
      },
    },
    {
      id: "cp-sc-06-5",
      description: "元の配列とその中身を壊していないか？",
      verify: {
        kind: "run",
        assert: `var list = addTodo([], "A");
addTodo(list, "B");
toggleTodo(list, list[0].id);
removeTodo(list, list[0].id);
assertEqual(list.length, 1, "元の配列が変わっている");
assertEqual(list[0].done, false, "元のオブジェクトが書き換えられている");`,
      },
    },
    {
      id: "cp-sc-06-6",
      description: "件数が状態とズレないか（操作を重ねても一致するか）？",
      verify: {
        kind: "run",
        assert: `var list = [];
for (var i = 0; i < 5; i++) list = addTodo(list, "T" + i);
list = toggleTodo(list, list[0].id);
list = toggleTodo(list, list[3].id);
list = removeTodo(list, list[4].id);
assertEqual(remainingCount(list), 2, "件数がズレている");
assertEqual(activeTodos(list).length, remainingCount(list), "件数と一覧が食い違っている");
assertEqual(remainingCount([]), 0, "空のとき 0 にならない");`,
      },
    },
    {
      id: "cp-sc-06-7",
      description: "保存して読み戻せるか？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
var list = addTodo(addTodo([], "牛乳"), "パン");
saveTodos(list);
var back = loadTodos();
assertEqual(back.length, 2, "読み戻せない");
assertEqual(back[0].text, "牛乳", "内容が戻ってこない");`,
      },
    },
    {
      id: "cp-sc-06-8",
      description: "壊れた入力でも落ちないか（未保存・壊れたJSON・配列でない）？",
      verify: {
        kind: "run",
        assert: `localStorage.clear();
assertEqual(loadTodos().length, 0, "未保存のとき空配列にならない");
localStorage.setItem("todos", "[{壊れて");
assertEqual(loadTodos().length, 0, "壊れた JSON で落ちている");
localStorage.setItem("todos", '{"not":"array"}');
assertEqual(loadTodos().length, 0, "配列でないものを受け取って落ちている");`,
      },
    },
    {
      id: "cp-sc-06-9",
      description: "形が違う要素だけを除けるか（正しい要素は残すか）？",
      verify: {
        kind: "run",
        assert: `localStorage.setItem(
  "todos",
  JSON.stringify([
    { id: "1", text: "正しい", done: false },
    { id: 2, text: "id が数値", done: false },
    { id: "3", text: "done が無い" },
    null,
    { id: "5", text: "これも正しい", done: true }
  ])
);
var r = loadTodos();
assertEqual(r.length, 2, "不正な要素を除けていない");
assertEqual(r.map(function (t) { return t.text; }), ["正しい", "これも正しい"], "残る要素が違う");`,
      },
    },
    {
      id: "cp-sc-06-10",
      description:
        "手本を開かずに書き切れたか（開いたなら、閉じてもう一度書いたか）？",
    },
  ],

  tags: ["スクラッチ", "ToDoアプリ", "卒業試験", "設計", "組み立て"],
  relatedIds: ["sc-01-decide-the-type", "sc-05-save-and-load"],
};
