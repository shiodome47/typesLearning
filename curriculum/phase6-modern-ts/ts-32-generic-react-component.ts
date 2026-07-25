import type { Lesson } from "../types";

export const lesson32: Lesson = {
  kind: "write",
  id: "ts-32-generic-react-component",
  order: 32,
  title: "ジェネリクス React コンポーネント",
  category: "react-basics",
  difficulty: 4,

  goal: "型パラメータ `<T>` を受け取る汎用 React コンポーネント `List<T>` を白紙から書けるようになる",

  why: {
    problem:
      "ユーザー一覧を表示する `UserList` を作りました。`<ul>` で回すだけの小さなコンポーネントです。\n\n" +
      "翌週、商品一覧が必要になります。中身の見た目が違うだけで、構造はまったく同じです。" +
      "コピーして `ProductList` を作ります。その次の週、注文一覧。`OrderList`。3つになりました。\n\n" +
      "1ヶ月後、「データが0件のときに『データがありません』と出したい」と言われます。" +
      "3ヶ所直します。次に「行の間に区切り線を入れたい」。また3ヶ所。" +
      "そのうち1回、注文一覧だけ直し忘れます。誰も気づきません。テストも通ります。" +
      "注文一覧だけ空のときに真っ白になる、と報告が来るのは数週間後です。\n\n" +
      "さすがに1つにまとめよう、となります。" +
      "でも中身の型が3つとも違うので、共通化するには `items: any[]` にするしかありません。" +
      "こうすれば `UserList` も `ProductList` も1つで済みます。\n\n" +
      "そして今度は、`renderItem={(u) => <span>{u.name}</span>}` の `u` が `any` になりました。" +
      "`u.` と打っても候補が出ません。`u.nmae` と綴りを間違えても赤線が出ません。" +
      "共通化した瞬間に、型の恩恵が全部消えたのです。\n\n" +
      "コピペを取るか、型を取るか。この二択に見えているのが問題です。",
    insight:
      "`<T>` は「中身の型を、使う人が決める穴」だと考えてください。\n\n" +
      "`List` は中に何が入るのかを知りません。知る必要もありません。" +
      "知らないまま「`items` の中身の型」を `T` という仮の名前で呼んでおき、" +
      "`renderItem: (item: T) => ReactNode` のように、同じ `T` を使って他の場所も書きます。\n\n" +
      "そして呼ぶ側が `<List items={users} ... />` と書いた瞬間、" +
      "TypeScript は「あ、この穴は `User` だ」と判断して、コンポーネント全体の `T` を `User` に置き換えて考えます。" +
      "`renderItem` の `item` も `User` になるので、`item.` で `name` が候補に出ますし、綴り間違いは赤線になります。" +
      "`<T>` を自分で書く必要はありません。`items` に渡したものから TypeScript が読み取ります。\n\n" +
      "`any` との違いはここです。`any` は「型を捨てて共通化する」。`<T>` は「型を呼び出し側から預かって共通化する」。" +
      "どちらも1つのコンポーネントで済みますが、後者は型が生きたままです。\n\n" +
      "`T extends { id: string | number }` は「この穴に入れていいのは、`id` を持つものだけ」という条件です。" +
      "条件を付けたおかげで、中身が何か分からないままでも `<li key={item.id}>` と書けます。" +
      "「何も知らない」のではなく「`id` があることだけは知っている」状態を作るのが `extends` の役割です。\n\n" +
      "Select、Table、Combobox。チームで使い回すコンポーネントは、たいていこの形をしています。",
  },
  explanation:
    "#11（Generics基礎）と#29（Generics制約）で型パラメータを持つ関数を学びました。React コンポーネントにも同じ仕組みが使えます。" +
    "`function List<T extends { id: string | number }>({ items, renderItem }: Props<T>)` のように書くと、`User[]` でも `Product[]` でも型安全に使い回せる汎用リストコンポーネントが作れます。" +
    "`renderItem: (item: T) => ReactNode` の型も T に連動するため、コールバック内で `item` の型補完が完全に効きます。" +
    "`T extends { id: string | number }` の制約があることで `<li key={item.id}>` の `item.id` も型安全に使えます。" +
    "チームで共有するコンポーネントライブラリ設計の基礎パターンで、実務では Select・Table・Combobox などに応用されます。",

  starterCode: `import type { ReactNode } from "react";

// ── Part 1: 汎用 List コンポーネント ──────────────────────
// List<T> コンポーネントを実装してください
//
// 型パラメータの制約: T extends { id: string | number }
//
// Props:
//   items       : T[]
//   renderItem  : (item: T) => ReactNode
//   emptyMessage: string（省略時は "データがありません"）
//
// 実装:
//   - items が空なら <p>{emptyMessage}</p> を返す
//   - items があれば <ul> で item.id を key にして renderItem を呼ぶ

// ── Part 2: 使用例（コメントを外して型チェック確認）────────
// type User    = { id: number; name: string };
// type Product = { id: string; label: string; price: number };

// const users: User[]       = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
// const products: Product[] = [{ id: "p1", label: "Pen", price: 100 }];

// User[] で使う（u が User 型として補完されることを確認）
// <List items={users} renderItem={(u) => <span>{u.name}</span>} />

// Product[] で使う
// <List items={products} renderItem={(p) => <span>{p.label}: {p.price}円</span>} />

// 空リスト
// <List<Product> items={[]} emptyMessage="商品がありません" renderItem={(p) => <span>{p.label}</span>} />
`,

  modelAnswer: `import type { ReactNode } from "react";

// Part 1: 汎用 List コンポーネント
function List<T extends { id: string | number }>({
  items,
  renderItem,
  emptyMessage = "データがありません",
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Part 2: 使用例
type User    = { id: number; name: string };
type Product = { id: string; label: string; price: number };

const users: User[]       = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
const products: Product[] = [{ id: "p1", label: "Pen", price: 100 }];

// User[] で使う（u は自動的に User 型として推論される）
// <List items={users} renderItem={(u) => <span>{u.name}</span>} />

// Product[] で使う
// <List items={products} renderItem={(p) => <span>{p.label}: {p.price}円</span>} />

// 空リスト（型を明示したい場合は <List<Product> ...> と書ける）
// <List<Product> items={[]} emptyMessage="商品がありません" renderItem={(p) => <span>{p.label}</span>} />`,

  hints: [
    {
      level: 1,
      text: "コンポーネントの型パラメータは `function List<T extends { id: string | number }>(props: ...)` のように関数名の直後に置きます。Props の型をインラインで書く場合は `{ items: T[]; renderItem: (item: T) => ReactNode; emptyMessage?: string }` です。",
    },
    {
      level: 2,
      text: "`items.length === 0` の分岐で `<p>{emptyMessage}</p>` を返します。空でない場合は `<ul>` の中で `items.map((item) => <li key={item.id}>{renderItem(item)}</li>)` を返します。`key` に `item.id` が使えるのは `T extends { id: string | number }` の制約があるからです。",
    },
    {
      level: 3,
      text: "使用側では `<List items={users} renderItem={(u) => <span>{u.name}</span>} />` のように書くと、`u` が `User` 型として自動推論されます。`<T>` を明示的に渡す必要はなく、`items` の型から TypeScript が推論します。空リストで型が推論できない場合は `<List<Product> ...>` と明示できます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-32-1",
      description: "`function List<T extends { id: string | number }>` の制約付き型パラメータが書けているか？",
      verify: {
        kind: "expect-error",
        assert: `
// id を持たない要素は制約 T extends { id: string | number } に反する
const _noId1 = [{ name: "Alice" }];
const _el1 = <List items={_noId1} renderItem={(x) => <span>{x.name}</span>} />;`,
      },
    },
    {
      id: "cp-32-2",
      description: "`renderItem: (item: T) => ReactNode` の型で、T に連動したコールバック型が定義できているか？",
      verify: {
        kind: "type",
        assert: `
type _U2 = { id: number; name: string };
const _users2: _U2[] = [{ id: 1, name: "Alice" }];
// item を any にしていると型の同一性が崩れてここで落ちる
const _el2 = (
  <List
    items={_users2}
    renderItem={(u) => {
      type _c2 = Expect<Equal<typeof u, _U2>>;
      return <span>{u.name}</span>;
    }}
  />
);`,
      },
    },
    {
      id: "cp-32-3",
      description: "`emptyMessage` が省略可能（`?`）でデフォルト値が設定されているか？",
      verify: {
        kind: "type",
        assert: `
type _U3 = { id: number; name: string };
const _users3: _U3[] = [{ id: 1, name: "Alice" }];
// 省略しても、渡してもどちらも通ること
const _omit3 = <List items={_users3} renderItem={(u) => <span>{u.name}</span>} />;
const _pass3 = (
  <List
    items={_users3}
    emptyMessage="データがありません"
    renderItem={(u) => <span>{u.name}</span>}
  />
);`,
      },
    },
    {
      id: "cp-32-4",
      description: "`<li key={item.id}>` で T の `id` プロパティが型安全に使えているか？",
      verify: {
        kind: "expect-error",
        assert: `
// id が string | number でない要素は制約で弾かれる
const _boolId4 = [{ id: true, name: "Alice" }];
const _el4 = <List items={_boolId4} renderItem={(x) => <span>{x.name}</span>} />;`,
      },
    },
    {
      id: "cp-32-5",
      description: "`User[]` と `Product[]` で同じ `List` を使い回せることを確認できたか？",
      verify: {
        kind: "type",
        assert: `
type _U5 = { id: number; name: string };
type _P5 = { id: string; label: string; price: number };
const _users5: _U5[] = [{ id: 1, name: "Alice" }];
const _products5: _P5[] = [{ id: "p1", label: "Pen", price: 100 }];
const _elU5 = (
  <List
    items={_users5}
    renderItem={(u) => {
      type _c5a = Expect<Equal<typeof u, _U5>>;
      return <span>{u.name}</span>;
    }}
  />
);
const _elP5 = (
  <List
    items={_products5}
    renderItem={(p) => {
      type _c5b = Expect<Equal<typeof p, _P5>>;
      return <span>{p.label}</span>;
    }}
  />
);`,
      },
    },
  ],

  tags: ["Generics", "React", "汎用コンポーネント", "ReactNode", "extends制約", "コンポーネントライブラリ"],
  relatedIds: ["ts-11-generics-basics", "ts-29-generics-constraints", "ts-16-component-props", "ts-17-usestate"],
};
