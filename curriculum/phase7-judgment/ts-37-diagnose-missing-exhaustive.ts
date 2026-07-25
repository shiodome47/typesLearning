import type { Lesson } from "../types";

export const lesson37: Lesson = {
  kind: "diagnose",
  id: "ts-37-diagnose-missing-exhaustive",
  order: 37,
  title: "診断: 機能追加のたびに壊れる分岐",
  category: "code-review",
  difficulty: 4,

  goal: "網羅性チェックの無い分岐が「静かに壊れる」ことを見抜き、追加漏れをコンパイルエラーに変えられるようになる",
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
