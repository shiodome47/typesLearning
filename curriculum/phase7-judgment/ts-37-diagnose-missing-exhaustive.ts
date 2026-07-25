import type { Lesson } from "../types";

export const lesson37: Lesson = {
  kind: "diagnose",
  id: "ts-37-diagnose-missing-exhaustive",
  order: 37,
  title: "診断: 機能追加のたびに壊れる分岐",
  category: "code-review",
  difficulty: 4,

  goal: "網羅性チェックの無い分岐が「静かに壊れる」ことを見抜き、追加漏れをコンパイルエラーに変えられるようになる",

  why: {
    problem:
      "これから読むコードには、今この瞬間、バグが1つもありません。" +
      "注文ステータスは3種類で、3種類とも正しく処理されています。" +
      "テストは全部通ります。動かしても正しい結果が出ます。\n\n" +
      "だからこそレビューで指摘しにくいのです。" +
      "「今は正しい」ものを「将来壊れます」と言わなければならないからです。\n\n" +
      "壊れ方はこうです。半年後、返金機能を追加することになり、ステータスに「返金済み」を1つ足します。" +
      "足した人は、当然その周りのコードは直します。" +
      "ですが一覧のラベルを作る関数と売上を集計する関数は別のファイルにあって、その人は存在すら知りません。\n\n" +
      "そして TypeScript は何も言いません。" +
      "`default` で空文字を返す行と、最後に `return 0` する行があるので、コンパイルは通ります。" +
      "テストも通ります。既存のテストは既存の3ステータスしか使っていないからです。" +
      "レビューに出てくる差分も、型定義の1行と返金画面だけ。誰も気づきません。\n\n" +
      "本番に出ます。一覧画面で返金済みの注文だけラベルが空欄になります。" +
      "そして売上集計から返金済みの金額が黙って抜け落ちます。\n\n" +
      "表示が崩れているほうは、まだましです。見た人が報告してくれます。" +
      "集計の数字は「間違っている」ことが誰にも見えません。" +
      "月末に経理から「先月の売上が合わないのですが」と言われて、そこから原因を探し始めることになります。",
    insight:
      "ここで問うべきは「このコードは今正しいか」ではありません。" +
      "「このコードは、間違ったときに教えてくれるか」です。\n\n" +
      "`default: return \"\"` は、知らない値が来たときの答えを、勝手に決めてしまう書き方です。" +
      "「知らない値なら空文字にする」。それが本当に決めた仕様ならいいのですが、" +
      "たいていの場合これは「まだ考えていない」だけです。" +
      "考えていないことを、コードは「空文字でよい」と表明してしまっています。\n\n" +
      "`assertNever` はその正反対です。" +
      "「ここに知らない値が来ることはありえない」と表明します。" +
      "ありえないと言い切ったので、ありえてしまった瞬間——つまり誰かがステータスを1つ足した瞬間——" +
      "コンパイラが赤線を出します。\n\n" +
      "この一手で何が変わるかというと、" +
      "「将来の誰かが気づけるかどうか」が、人間の注意力からコンパイラの仕事に移ります。" +
      "半年後にステータスを足す人は、あなたのことも、この関数の存在も知りません。" +
      "その人に向けて置いておける唯一の合図が、この赤線です。\n\n" +
      "だからレビューでの問いは、こう言い換えられます。" +
      "「この Union に値を1つ足したら、どこか1ヶ所でもコンパイルエラーが出るか？」" +
      "1件も出ないなら、その分岐は静かに壊れる準備ができています。",
  },
  explanation:
    "`switch` で Union を分岐するとき、`default` で握りつぶすか何も書かないと、" +
    "後から Union に値を追加しても**コンパイルエラーが1件も出ません**。" +
    "そのため「型を増やしたのに一部の画面だけ対応漏れ」という事故が、レビューも型チェックもすり抜けて本番に出ます。" +
    "`default: return assertNever(x)` を置くと、追加漏れが必ずコンパイルエラーとして表面化します。" +
    "保守フェーズのある受託案件では、この一手の有無が後の事故率を大きく変えます。",

  symptom:
    "注文ステータスに `refunded`（返金済み）を追加したところ、一覧のラベルだけ空欄になり、集計にも含まれなかった。追加時に型エラーは1件も出ていなかった。",

  brokenCode: `type OrderStatus = "pending" | "paid" | "shipped";

type Order = {
  id: number;
  status: OrderStatus;
  amount: number;
};

// ステータスの表示ラベル
function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "未払い";
    case "paid":
      return "支払い済み";
    case "shipped":
      return "発送済み";
    default:
      return "";
  }
}

// 売上として計上する金額
function salesAmount(order: Order): number {
  if (order.status === "paid") return order.amount;
  if (order.status === "shipped") return order.amount;
  return 0;
}`,

  defects: [
    {
      id: "d-37-1",
      summary: "`default` が空文字を返して分岐漏れを隠している",
      why:
        "`OrderStatus` に新しい値を足しても、`default` があるためコンパイルは通り、実行時に静かに空文字が出ます。" +
        "「エラーにならない」ことが最悪で、気づくのは画面を見た人がいたときだけです。",
      marker: 'default:\n      return "";',
    },
    {
      id: "d-37-2",
      summary: "`salesAmount` の `return 0` も同じ穴になっている",
      why:
        "`if` の連鎖で最後に `return 0` すると、新しいステータスは自動的に「売上0」に分類されます。" +
        "金額に関わる分岐が静かに間違うため、影響は表示崩れより深刻です。",
      marker: "return 0;",
    },
    {
      id: "d-37-3",
      summary: "網羅性チェック（`assertNever`）が使われていない",
      why:
        "`default: return assertNever(status)` を置くと、Union に値が増えた瞬間に `status` が `never` でなくなり、" +
        "その場でコンパイルエラーになります。追加漏れを人間の注意力ではなく型で検出できます。",
    },
  ],

  fixedCode: `type OrderStatus = "pending" | "paid" | "shipped";

type Order = {
  id: number;
  status: OrderStatus;
  amount: number;
};

// 到達しないはずの分岐に来たらコンパイルエラーにする
function assertNever(x: never): never {
  throw new Error("未対応のステータス: " + JSON.stringify(x));
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "未払い";
    case "paid":
      return "支払い済み";
    case "shipped":
      return "発送済み";
    default:
      // OrderStatus に値を追加すると、ここで status が never でなくなり
      // コンパイルエラーになる = 追加漏れに必ず気づける
      return assertNever(status);
  }
}

function salesAmount(order: Order): number {
  switch (order.status) {
    case "paid":
    case "shipped":
      return order.amount;
    case "pending":
      return 0;
    default:
      return assertNever(order.status);
  }
}`,

  hints: [
    {
      level: 1,
      text: "「`OrderStatus` に1つ値を足したら、このコードのどこがコンパイルエラーになるか？」を考えてください。1件も出ないなら、それが欠陥です。",
    },
    {
      level: 2,
      text: "`assertNever(x: never): never` を定義し、`default` で呼びます。`if` の連鎖も `switch` に書き換えると、すべての分岐を尽くしたことを型で表現できます。",
    },
    {
      level: 3,
      text: "`salesAmount` は `switch (order.status)` にして、`case \"paid\":` と `case \"shipped\":` をフォールスルーでまとめ、`case \"pending\": return 0`、`default: return assertNever(order.status)` とします。すべての値を明示的に書くのが要点です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-37-1",
      description: "`assertNever` が `never` を受け取る形で定義されているか？",
      verify: {
        kind: "type",
        assert: `type _c1 = Expect<Equal<Parameters<typeof assertNever>[0], never>>;`,
      },
    },
    {
      id: "cp-37-2",
      description: "`statusLabel` の戻り値型が `string` のままか？",
      verify: {
        kind: "type",
        assert: `type _c2 = Expect<Equal<ReturnType<typeof statusLabel>, string>>;`,
      },
    },
    {
      id: "cp-37-3",
      description: "`OrderStatus` に無い値を渡すと型エラーになるか？",
      verify: {
        kind: "expect-error",
        assert: `statusLabel("refunded");`,
      },
    },
    {
      id: "cp-37-4",
      description: "`assertNever` に `never` 以外を渡すと型エラーになるか（網羅性チェックが本当に効くか）？",
      verify: {
        kind: "expect-error",
        assert: `
const _s: OrderStatus = "paid";
assertNever(_s);`,
      },
    },
    {
      id: "cp-37-5",
      description: "`salesAmount` の戻り値型が `number` のままか？",
      verify: {
        kind: "type",
        assert: `type _c5 = Expect<Equal<ReturnType<typeof salesAmount>, number>>;`,
      },
    },
  ],

  tags: ["assertNever", "網羅性チェック", "never", "switch", "保守性", "コードレビュー"],
  relatedIds: ["ts-20-exhaustive-check", "ts-19-discriminated-union", "ts-06-union-literal"],
};
