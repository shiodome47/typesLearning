import type { Lesson } from "../types";

export const lesson24: Lesson = {
  id: "ts-24-mapped-types",
  order: 24,
  title: "Mapped Types基礎",
  category: "type-basics",
  difficulty: 3,

  goal: "`{ [K in keyof T]: ... }` の構文で型を変形するMapped Typesを書けるようになる",
  explanation:
    "Mapped Types は「型 T の全プロパティを一括変形する」仕組みです。" +
    "`{ [K in keyof T]: T[K] }` と書くと T と同じ型が、`{ [K in keyof T]: string }` と書くと全プロパティが string の型が作れます。" +
    "`readonly` や `?` を付けることもでき、`Partial<T>`・`Readonly<T>` などの Utility Types はこの仕組みで実装されています。" +
    "#23（keyof / Indexed Access型）の直後として、「keyof で得たキーで型を巡回する」イメージを体で掴む教材です。" +
    "次の #25（useEffect）以降の React 教材では直接使いませんが、#21 の Utility Types がなぜ動くかの理解が深まります。",

  starterCode: `// ベース型（変更しないでください）
type User = {
  id: number;
  name: string;
  email: string;
};

// 1. MyReadonly<T> 型を定義してください
//    - T の全プロパティを readonly にする Mapped Type
//    - 構文: { readonly [K in keyof T]: T[K] }
//    - 組み込みの Readonly<T> を使わずに自作すること

// 2. MyPartial<T> 型を定義してください
//    - T の全プロパティを省略可能にする Mapped Type
//    - 組み込みの Partial<T> を使わずに自作すること

// 動作確認（型チェックのみ）
// const ro: MyReadonly<User> = { id: 1, name: "Alice", email: "a@b.com" };
// ro.name = "Bob"; // ← これが型エラーになればOK

// const p: MyPartial<User> = { id: 1 }; // name/email を省略できればOK
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  email: string;
};

// Readonly<T> を自作
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Partial<T> を自作
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 動作確認
const ro: MyReadonly<User> = { id: 1, name: "Alice", email: "a@b.com" };
// ro.name = "Bob"; // 型エラー: Cannot assign to 'name' because it is a read-only property

const p: MyPartial<User> = { id: 1 }; // name/email を省略できる`,

  hints: [
    {
      level: 1,
      text: "`{ [K in keyof T]: T[K] }` が基本の Mapped Type の形です。`K in keyof T` で T のキーを一つずつ取り出し、`T[K]` でその値の型を参照します。",
    },
    {
      level: 2,
      text: "`MyReadonly<T>` は `{ readonly [K in keyof T]: T[K] }` です。プロパティの前に `readonly` を付けるだけ。`MyPartial<T>` は `[K in keyof T]?` — キー名の後ろに `?` を付けます。",
    },
    {
      level: 3,
      text: "完成形: `type MyReadonly<T> = { readonly [K in keyof T]: T[K] }` / `type MyPartial<T> = { [K in keyof T]?: T[K] }` — どちらも組み込み Utility Types の内部実装とほぼ同じ構造です。",
    },
  ],

  checkpoints: [
    { id: "cp-24-1", description: "`[K in keyof T]` の構文で型パラメータを巡回できているか？" },
    { id: "cp-24-2", description: "`T[K]`（Indexed Access）で各プロパティの値型を参照できているか？" },
    { id: "cp-24-3", description: "`MyReadonly<User>` に代入後、プロパティへの再代入が型エラーになるか確認できたか？" },
    { id: "cp-24-4", description: "`MyPartial<User>` で一部プロパティのみを持つオブジェクトが型エラーにならないか確認できたか？" },
  ],

  tags: ["Mapped Types", "keyof", "Readonly", "Partial", "型変形", "Utility Types の内部"],
  relatedIds: ["ts-23-keyof", "ts-21-utility-types", "ts-11-generics"],
};
