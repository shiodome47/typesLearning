import type { Lesson } from "../types";

export const cpLesson01: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-01-ledger-circuit",
  order: 1,
  title: "① 誰でも数えられるカウンター — public state を宣言する",
  category: "compact",
  difficulty: 2,

  goal: "Compact で公開状態（ledger）と入口（circuit）を宣言し、チェーン上の状態を更新する最小のコントラクトを書けるようになる",

  why: {
    problem:
      "「参加人数をカウントするだけ」の、何の秘密もない機能を作ることになりました。\n\n" +
      "普通のWebアプリなら、データベースに数値を1つ持って `count = count + 1` するだけです。" +
      "5分で終わります。\n\n" +
      "ところが Compact では、その数値をどこに置くか最初に宣言しなければ、コードが1行も書けません。" +
      "`ledger` と書けばチェーン上（全員が見える場所）、書かなければ存在しない。" +
      "中間がありません。\n\n" +
      "これは不便な仕様に見えますが、逆です。" +
      "普通のアプリでは「この値、誰まで見えるんだっけ？」が**コードを読んでも分からない**。" +
      "DBのテーブルを見て、APIのレスポンスを追って、フロントのstateを確認して、" +
      "ようやく分かる。だから漏れます。\n\n" +
      "Compact では、その答えが**宣言の1語**に書いてあります。",
    insight:
      "覚えることは2語だけです。\n\n" +
      "**`ledger`** — チェーン上に置かれる公開状態。ネットワーク参加者**全員が見ます**。" +
      "隠せません。永続します。\n\n" +
      "**`circuit`** — 外から呼べる入口。関数のようなものですが、" +
      "コンパイラがこれをゼロ知識回路に変換します。" +
      "`export` を付けたものだけが外から呼べます。\n\n" +
      "この回で書くカウンターには、秘密が1つもありません。" +
      "数える対象も、数えた結果も、全部公開してよいものです。\n" +
      "だから `ledger` に置いて終わりです。**これが Compact の一番簡単な形**です。\n\n" +
      "次の回から「隠したいものが出てくる」ようになります。" +
      "そのとき初めて `witness` と `disclose` が必要になる。\n" +
      "**まずは「全部公開でよい世界」を書けるようにしておくと、" +
      "何が増えたのかがはっきり見えます。**",
  },
  explanation:
    "Compact のファイルは `pragma language_version` で始まり、多くの場合 `import CompactStandardLibrary;` を続けます。" +
    "`export ledger <名前>: <型>;` で公開状態を宣言します。" +
    "`Counter` は標準ライブラリが提供する型で、`increment(n)` で増やせます。" +
    "`export circuit <名前>(引数): <戻り値>` が外から呼べる入口で、戻り値が無い場合は `[]` と書きます。" +
    "circuit の中で ledger に代入したり、`Counter` のメソッドを呼んだりすると、チェーン上の状態が更新されます。" +
    "この回のコードには秘密が登場しないため、`witness` も `disclose` も出てきません。",

  starterCode: `// counter.compact
//
// 誰でも増やせる、公開のカウンターを作ります。
// 秘密は1つもありません。全部公開してよい世界です。

pragma language_version >= 0.20;
import CompactStandardLibrary;

// 1. 公開状態を宣言してください。
//    名前は round、型は Counter です。
//    ledger を付けるとチェーン上に置かれ、全員から見えます。


// 2. 外から呼べる入口を作ってください。
//    名前は increment、引数なし、戻り値なし（[]）です。
//    中で round を 1 増やしてください（round.increment(1);）。

`,

  modelAnswer: `// counter.compact
//
// 公式の example-counter とほぼ同じ、Compact の最小形。

pragma language_version >= 0.20;
import CompactStandardLibrary;

// ledger = チェーン上の公開状態。
// ネットワーク参加者全員が見る。隠す手段は無い。
// ここに置いてよいのは「見られて困らないもの」だけ。
export ledger round: Counter;

// circuit = 外から呼べる入口。
// コンパイラはこれをゼロ知識回路に変換する。
// 戻り値が無いときは [] と書く。
export circuit increment(): [] {
  // Counter 型は increment(n) で増やせる。
  // ここでチェーン上の状態が変わる。
  round.increment(1);
}
`,

  hints: [
    {
      level: 1,
      text: "書くのは2つです。`ledger` で始まる宣言が1行と、`circuit` で始まるブロックが1つ。どちらも外から使うので `export` を付けます。",
    },
    {
      level: 2,
      text: "公開状態は `export ledger round: Counter;` の形です。型注釈は TypeScript と同じく `名前: 型` の順で書きます。",
    },
    {
      level: 3,
      text: "入口は `export circuit increment(): [] { round.increment(1); }` です。`[]` は「何も返さない」という意味の戻り値型です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-01-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-01-2",
      description: "`ledger round` を宣言しているか（公開状態の置き場所）？",
      verify: { kind: "compact-ledger", name: "round" },
    },
    {
      id: "cp-cp-01-3",
      description: "`circuit increment` を宣言しているか（外から呼べる入口）？",
      verify: { kind: "compact-circuit", name: "increment" },
    },
    {
      id: "cp-cp-01-4",
      description: "circuit の中で状態を増やしているか？",
      verify: { kind: "compact-calls", name: "round.increment" },
    },
    {
      id: "cp-cp-01-5",
      description:
        "この回のコードに秘密が1つも無い理由を説明できるか（次の回との差が分かるか）？",
    },
  ],

  tags: ["Compact", "Midnight", "ledger", "circuit", "public state"],
  relatedIds: ["cp-02-witness-secret", "cp-06-diagnose-secret-leak"],
};
