import type { Lesson } from "../types";

export const lesson24: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-24-mapped-types",
  order: 24,
  title: "Mapped Types基礎",
  category: "type-basics",
  difficulty: 3,

  goal: "`{ [K in keyof T]: ... }` の構文で型を変形するMapped Typesを書けるようになる",

  why: {
    problem:
      "会員登録フォームを作ります。" +
      "`User` は `id` `name` `email` が全部そろっている型ですが、入力途中の「下書き」はまだ空欄だらけです。" +
      "そこで全部の項目を省略可能にした `UserDraft` を、手で書き写して作りました。\n\n" +
      "半年後、`User` に `phone` を追加します。`User` の方だけ直して、`UserDraft` に足すのを忘れました。\n\n" +
      "ここが厄介なところです。`UserDraft` は `phone` を知らないだけで、型としては何も壊れていません。" +
      "だから赤線は出ません。フォームで電話番号を入力しても、下書きに保存するところで静かに捨てられます。" +
      "翌日フォームを開き直すと、電話番号の欄だけ空になっています。\n\n" +
      "同じことは表示専用の `readonly` 版でも起きます。手で書き写した型は、元の型と別々に生きています。" +
      "項目が10個あれば10行、それが3種類あれば30行。しかも元の型を触るたびに全部を追いかけて直す必要がある。" +
      "1つでも忘れると、忘れた方は「正しい型」の顔をしたまま残ります。",
    insight:
      "Mapped Types は、ひとことで言うと**型のための繰り返し処理**です。\n\n" +
      "`{ [K in keyof T]: T[K] }` を日本語にすると「T の項目名を1つずつ取り出して（`K in keyof T`）、" +
      "その項目には元と同じ中身の型を入れる（`T[K]`）」。" +
      "これだけだと元の型のコピーですが、取り出しながら札を貼れるのが肝心なところです。\n\n" +
      "・項目名の前に `readonly` を付ける → 全項目が書き換え禁止の型\n" +
      "・項目名の後ろに `?` を付ける → 全項目が省略可能な型\n\n" +
      "こうして作った型は、元の型を見に行って毎回作り直されます。" +
      "`User` に `phone` を足した瞬間、`MyPartial<User>` にも `phone` が生えます。書き写しではないので、ズレようがありません。\n\n" +
      "そして #21 で使った `Partial<T>` や `Readonly<T>` の中身も、まさにこの3行です。" +
      "魔法の組み込み機能ではなく、自分で書けるものだったと分かります。",
  },
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
    {
      id: "cp-24-1",
      description: "`[K in keyof T]` の構文で型パラメータを巡回できているか？",
      verify: {
        kind: "type",
        assert: `
type _Src1 = { a: number; b: string };
type _c1a = Expect<Equal<keyof MyReadonly<_Src1>, "a" | "b">>;
type _c1b = Expect<Equal<keyof MyPartial<_Src1>, "a" | "b">>;`,
      },
    },
    {
      id: "cp-24-2",
      description: "`T[K]`（Indexed Access）で各プロパティの値型を参照できているか？",
      verify: {
        kind: "type",
        assert: `
type _Src2 = { a: number; b: string };
type _c2a = Expect<Equal<MyReadonly<_Src2>["a"], number>>;
type _c2b = Expect<Equal<MyReadonly<_Src2>["b"], string>>;
type _c2c = Expect<Equal<MyPartial<_Src2>["a"], number | undefined>>;`,
      },
    },
    {
      id: "cp-24-3",
      description: "`MyReadonly<User>` に代入後、プロパティへの再代入が型エラーになるか確認できたか？",
      verify: {
        kind: "expect-error",
        assert: `
const _ro3: MyReadonly<{ id: number; name: string }> = { id: 1, name: "Alice" };
_ro3.name = "Bob";`,
      },
    },
    {
      id: "cp-24-4",
      description: "`MyPartial<User>` で一部プロパティのみを持つオブジェクトが型エラーにならないか確認できたか？",
      verify: {
        kind: "type",
        assert: `
const _p4: MyPartial<{ id: number; name: string; email: string }> = { id: 1 };
const _empty4: MyPartial<{ id: number; name: string }> = {};`,
      },
    },
  ],

  tags: ["Mapped Types", "keyof", "Readonly", "Partial", "型変形", "Utility Types の内部"],
  relatedIds: ["ts-23-keyof", "ts-21-utility-types", "ts-11-generics-basics"],
};
