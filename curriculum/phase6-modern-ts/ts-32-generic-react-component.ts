import type { Lesson } from "../types";

export const lesson32: Lesson = {
  id: "ts-32-generic-react-component",
  order: 32,
  title: "ジェネリクス React コンポーネント",
  category: "react-basics",
  difficulty: 4,

  goal: "型パラメータ `<T>` を受け取る汎用 React コンポーネント `List<T>` を白紙から書けるようになる",
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
    { id: "cp-32-1", description: "`function List<T extends { id: string | number }>` の制約付き型パラメータが書けているか？" },
    { id: "cp-32-2", description: "`renderItem: (item: T) => ReactNode` の型で、T に連動したコールバック型が定義できているか？" },
    { id: "cp-32-3", description: "`emptyMessage` が省略可能（`?`）でデフォルト値が設定されているか？" },
    { id: "cp-32-4", description: "`<li key={item.id}>` で T の `id` プロパティが型安全に使えているか？" },
    { id: "cp-32-5", description: "`User[]` と `Product[]` で同じ `List` を使い回せることを確認できたか？" },
  ],

  tags: ["Generics", "React", "汎用コンポーネント", "ReactNode", "extends制約", "コンポーネントライブラリ"],
  relatedIds: ["ts-11-generics", "ts-29-generics-constraints", "ts-16-component-props", "ts-17-usestate"],
};
