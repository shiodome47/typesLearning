import type { Lesson } from "../types";

export const lesson22: Lesson = {
  id: "ts-22-record-type",
  order: 22,
  title: "Record型",
  category: "type-basics",
  difficulty: 3,

  goal: "`Record<K, V>` を使い、キーと値の型が揃った辞書型オブジェクトを安全に定義できるようになる",
  explanation:
    "`Record<K, V>` は「キーが K 型、値が V 型のオブジェクト」を表す組み込み Utility Type です。" +
    "`{ [key: string]: number }` のようなインデックスシグネチャより、キーを Union リテラルで絞れるのが利点です。" +
    "例: `Record<\"en\" | \"ja\" | \"zh\", string>` とすれば、3言語ぶんのキーが必須になり、漏れをコンパイル時に検出できます。" +
    "ステータス表示・設定マップ・翻訳テーブルなど、実務で頻出のパターンです。",

  starterCode: `// 1. Status 型を定義してください（Union リテラル）
//    値: "idle" | "loading" | "success" | "error"

// 2. statusLabels 定数を定義してください
//    型: Record<Status, string>
//    各ステータスに対応する日本語ラベルを割り当ててください
//    例: idle → "待機中", loading → "読込中", success → "成功", error → "エラー"

// 3. getLabel 関数を実装してください
//    引数: status: Status
//    戻り値: string（statusLabels から取り出す）

// 動作確認
// console.log(getLabel("loading")); // "読込中"
// console.log(getLabel("error"));   // "エラー"
`,

  modelAnswer: `type Status = "idle" | "loading" | "success" | "error";

const statusLabels: Record<Status, string> = {
  idle:    "待機中",
  loading: "読込中",
  success: "成功",
  error:   "エラー",
};

function getLabel(status: Status): string {
  return statusLabels[status];
}

console.log(getLabel("loading")); // "読込中"
console.log(getLabel("error"));   // "エラー"`,

  hints: [
    {
      level: 1,
      text: "`type Status = \"idle\" | \"loading\" | \"success\" | \"error\"` の Union リテラル型を定義してから、`Record<Status, string>` でオブジェクトの型を指定します。",
    },
    {
      level: 2,
      text: "`const statusLabels: Record<Status, string> = { idle: \"待機中\", ... }` と書きます。Status のメンバーをすべて書かないと型エラーになります（漏れ検出！）。",
    },
    {
      level: 3,
      text: "`getLabel` は `return statusLabels[status]` だけで完成です。`status` が `Status` 型なので、`statusLabels` のキーとして安全にアクセスできます。",
    },
  ],

  checkpoints: [
    { id: "cp-22-1", description: "`Status` が Union リテラル型で定義されているか？" },
    { id: "cp-22-2", description: "`statusLabels` の型が `Record<Status, string>` になっているか？" },
    { id: "cp-22-3", description: "Status の4つのキーがすべて揃っているか（漏れがないか）？" },
    { id: "cp-22-4", description: "`getLabel` が `statusLabels[status]` でラベルを返せているか？" },
  ],

  tags: ["Record", "Utility Types", "Union リテラル", "辞書型", "インデックスアクセス"],
  relatedIds: ["ts-06-union-literal", "ts-21-utility-types", "ts-23-keyof"],
};
