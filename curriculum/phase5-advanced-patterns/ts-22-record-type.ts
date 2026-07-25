import type { Lesson } from "../types";

export const lesson22: Lesson = {
  kind: "write",
  id: "ts-22-record-type",
  order: 22,
  title: "Record型",
  category: "type-basics",
  difficulty: 3,

  goal: "`Record<K, V>` を使い、キーと値の型が揃った辞書型オブジェクトを安全に定義できるようになる",

  why: {
    problem:
      "通信の状態を画面に日本語で出したい。状態は「待機中」「読込中」「成功」「エラー」の4つです。\n\n" +
      "対応表を作ります。`const statusLabels = { idle: \"待機中\", loading: \"読込中\", success: \"成功\", error: \"エラー\" }`。" +
      "これで `statusLabels[status]` と書けばラベルが取れます。うまくいきました。\n\n" +
      "半年後、「キャンセル」という状態を足すことになりました。" +
      "`Status` 型に `\"canceled\"` を1つ追加します。ここまでは誰でもやります。" +
      "問題は、この対応表がアプリの中に**1つとは限らない**ことです。" +
      "画面表示用のラベル、色の対応表、アイコンの対応表、集計用の並び順。" +
      "型を直しても、これらのオブジェクトは何も言ってきません。ただの値だからです。\n\n" +
      "結果どうなるか。キャンセルされた注文の一覧を開くと、状態の欄に `undefined` と表示されます。" +
      "色の対応表のほうも漏れていれば、バッジが透明になって何も見えません。" +
      "運が悪いと `statusLabels[status].length` のような処理があって、" +
      "`undefined` にアクセスした瞬間に画面ごと落ちます。\n\n" +
      "キー名の打ち間違いも同じです。`sucess: \"成功\"` と書いても誰も止めてくれません。" +
      "成功したときだけラベルが消える、という気づきにくい不具合になります。\n\n" +
      "対応表というのは「4つの状態それぞれに必ず1つ答えがある」という約束のはずでした。" +
      "普通のオブジェクトで書くと、その約束がどこにも書かれていないのです。",
    insight:
      "`Record<Status, string>` は、「`Status` の全部のキーに対して、文字列の値が必ずある」という宣言です。\n\n" +
      "先に**表の枠**を決めてしまう、と考えてください。" +
      "行が `Status` の4つ、値の欄が `string`。枠が決まっているので、埋め残しは即座に分かります。" +
      "`error` を書き忘れれば、その `{ ... }` に赤線が出ます。" +
      "`sucess` と打ち間違えれば、「そんな行はありません」と言われます。\n\n" +
      "効き目が本当に出るのは、あとから種類が増えたときです。" +
      "`Status` に `\"canceled\"` を足した瞬間、" +
      "`Record<Status, ...>` と書いたオブジェクトが**全部いっせいに**エラーになります。" +
      "ラベルの表も、色の表も、アイコンの表も。" +
      "直すべき場所を探す必要がありません。赤いところを消していけば終わりです。\n\n" +
      "似たものに `{ [key: string]: string }` という書き方がありますが、こちらは「キーは文字列なら何でも」という意味です。" +
      "何でもいいということは、抜けを教えてもらえないということでもあります。" +
      "キーを4つに限定したからこそ、漏れが分かるのです。\n\n" +
      "そしてもう一つ。`statusLabels[status]` の戻り値が `string | undefined` ではなく `string` になります。" +
      "全部そろっていると型が知っているので、取り出したあとの `undefined` チェックが要りません。",
  },
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
    {
      id: "cp-22-1",
      description: "`Status` が Union リテラル型で定義されているか？",
      verify: {
        kind: "type",
        assert: `
type _c1 = Expect<Equal<Status, "idle" | "loading" | "success" | "error">>;`,
      },
    },
    {
      id: "cp-22-2",
      description: "`statusLabels` の型が `Record<Status, string>` になっているか？",
      verify: {
        kind: "type",
        assert: `
type _c2a = Expect<Equal<typeof statusLabels, Record<Status, string>>>;
type _c2b = Expect<Equal<(typeof statusLabels)["loading"], string>>;`,
      },
    },
    {
      id: "cp-22-3",
      description: "Status の4つのキーがすべて揃っているか（漏れがないか）？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<Equal<keyof typeof statusLabels, "idle" | "loading" | "success" | "error">>;`,
      },
    },
    {
      id: "cp-22-4",
      description: "`getLabel` が `statusLabels[status]` でラベルを返せているか？",
      verify: {
        kind: "type",
        assert: `
type _c4a = Expect<Equal<Parameters<typeof getLabel>[0], Status>>;
type _c4b = Expect<Equal<ReturnType<typeof getLabel>, string>>;
const _c4c: string = getLabel("success");`,
      },
    },
  ],

  tags: ["Record", "Utility Types", "Union リテラル", "辞書型", "インデックスアクセス"],
  relatedIds: ["ts-06-union-literal", "ts-21-utility-types", "ts-23-keyof"],
};
