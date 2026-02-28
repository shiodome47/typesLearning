import type { Lesson } from "../types";

export const lesson21: Lesson = {
  id: "ts-21-utility-types",
  order: 21,
  title: "Utility Types基礎（Partial / Pick / Omit）",
  category: "type-basics",
  difficulty: 3,

  goal: "`Partial`・`Pick`・`Omit` を使い、既存の型から派生型を作れるようになる",
  explanation:
    "TypeScript の組み込み Utility Types を使うと、既存の型を変形して新しい型を作れます。" +
    "`Partial<T>` はすべてのプロパティを省略可能にします。" +
    "`Pick<T, K>` は指定したプロパティだけを取り出します。" +
    "`Omit<T, K>` は指定したプロパティを除いた型を作ります。" +
    "DB モデルの更新API用型や、センシティブ情報を除いた公開型など、実務で頻繁に使うパターンです。",

  starterCode: `// ベースになる User 型（変更しないでください）
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

// 1. UpdateUserInput 型を定義してください
//    - id は必須のまま
//    - name / email / password / createdAt はすべて省略可能
//    ヒント: Omit + Partial を組み合わせるとシンプルに書けます

// 2. PublicUser 型を定義してください
//    - password を除いた User の型
//    ヒント: Omit を使います

// 3. LoginCredentials 型を定義してください
//    - email と password だけを持つ型
//    ヒント: Pick を使います

// 動作確認（型チェックのみ）
// const update: UpdateUserInput  = { id: 1, name: "Alice" }; // OK
// const pub:    PublicUser       = { id: 1, name: "Alice", email: "a@example.com", createdAt: new Date() }; // OK
// const creds:  LoginCredentials = { email: "a@example.com", password: "secret" }; // OK
`,

  modelAnswer: `type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

// id は必須のまま、残りを省略可能に
type UpdateUserInput = { id: number } & Partial<Omit<User, "id">>;

// password を除いた公開用型
type PublicUser = Omit<User, "password">;

// メールとパスワードだけを抽出
type LoginCredentials = Pick<User, "email" | "password">;

// 動作確認（型チェックのみ）
const update: UpdateUserInput  = { id: 1, name: "Alice" };
const pub:    PublicUser       = { id: 1, name: "Alice", email: "a@example.com", createdAt: new Date() };
const creds:  LoginCredentials = { email: "a@example.com", password: "secret" };

console.log(update, pub, creds);`,

  hints: [
    {
      level: 1,
      text: "`Partial<T>` は全プロパティを `?` に、`Omit<T, K>` は K を除いた型、`Pick<T, K>` は K だけ残した型です。`PublicUser = Omit<User, \"password\">` から始めましょう。",
    },
    {
      level: 2,
      text: "`LoginCredentials = Pick<User, \"email\" | \"password\">` — Union で複数キーを指定できます。`UpdateUserInput` は `{ id: number } & Partial<Omit<User, \"id\">>` のようにインターセクション型と組み合わせると `id` だけ必須にできます。",
    },
    {
      level: 3,
      text: "完成形: `type UpdateUserInput = { id: number } & Partial<Omit<User, \"id\">>` / `type PublicUser = Omit<User, \"password\">` / `type LoginCredentials = Pick<User, \"email\" | \"password\">`",
    },
  ],

  checkpoints: [
    { id: "cp-21-1", description: "`Partial<T>` を使って省略可能な型が作れているか？" },
    { id: "cp-21-2", description: "`Omit<T, K>` で特定プロパティを除外できているか？" },
    { id: "cp-21-3", description: "`Pick<T, K>` で必要なプロパティだけを抽出できているか？" },
    { id: "cp-21-4", description: "`UpdateUserInput` の `id` が必須で、他が省略可能になっているか？" },
  ],

  tags: ["Utility Types", "Partial", "Pick", "Omit", "型変形", "インターセクション型"],
  relatedIds: ["ts-04-type-alias", "ts-05-interface", "ts-19-discriminated-union"],
};
