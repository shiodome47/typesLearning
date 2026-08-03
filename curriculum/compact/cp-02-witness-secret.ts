import type { Lesson } from "../types";

export const cpLesson02: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-02-witness-secret",
  order: 2,
  title: "② 会員登録 — 秘密を受け取り、名前を付けずに identify する",
  category: "zk-privacy",
  difficulty: 3,

  goal: "witness で秘密を受け取り、ハッシュ化した派生値だけを公開して「誰であるか」を扱えるようになる",

  why: {
    problem:
      "掲示板に会員制を入れることになりました。「登録した人だけが投稿できる」ようにしたい。\n\n" +
      "普通のWebアプリなら、メールアドレスとパスワードを受け取ってDBに保存します。" +
      "5分で終わります。\n\n" +
      "Midnight には**それができません**。\n" +
      "`ledger` に書いたものは全員に見えるからです。" +
      "メールアドレスを保存すれば、会員全員のメールアドレスが公開台帳に並びます。\n\n" +
      "では会員を区別しないのかというと、そうではありません。" +
      "「同じ人が2回登録していないか」「投稿を消そうとしているのは書いた本人か」は判定したい。\n" +
      "**個人を特定せずに、同一人物であることだけ分かればいい。**\n\n" +
      "ここで手が止まります。名前も番号も保存できないのに、どうやって区別するのか。",
    insight:
      "答えは「**本人しか作れないが、本人を特定できない値**」を1つ作って、それを名札にすることです。\n\n" +
      "材料は2つあります。\n\n" +
      "**`witness`** — 秘密の入口です。`witness localSecretKey(): Bytes<32>;` と宣言すると、" +
      "「この値は利用者の手元から来る」という意味になります。中身は**チェーンに乗りません**。" +
      "実装は TypeScript 側（DApp）にあり、コントラクトは受け取るだけです。\n\n" +
      "**★そしてこれは「利用者が自由に書き換えられる」という意味でもあります。**\n" +
      "witness の実装は回路の外で動くので、**暗号的に検証されません**。\n" +
      "witness は「利用者からの申告」であって、検証済みの事実ではありません。\n" +
      "この回は鍵そのものを扱うので問題になりませんが、**⑤以降で効いてきます**。\n\n" +
      "**`persistentHash`** — 一方向のハッシュです。" +
      "同じ入力からは必ず同じ結果が出ますが、**結果から入力は逆算できません**。\n\n" +
      "この2つを組み合わせます。\n\n" +
      "```\n" +
      "memberId = disclose(publicKey(localSecretKey()));\n" +
      "```\n\n" +
      "こうすると、\n" +
      "- 同じ人が来れば同じ `memberId` になる → **同一人物だと分かる**\n" +
      "- `memberId` から秘密鍵は復元できない → **誰なのかは分からない**\n\n" +
      "これが Midnight の「名前を付けずに identify する」やり方です。\n\n" +
      "**注意すべきは `disclose` の位置です。**\n" +
      "`disclose(localSecretKey())` と書けば秘密鍵そのものが公開され、事故になります。\n" +
      "`disclose(publicKey(localSecretKey()))` なら、公開されるのはハッシュ済みの値だけです。\n" +
      "**同じ1行の中で、括弧の内側か外側かだけが違う。** ここが Compact で最も高くつく場所です。\n\n" +
      "`pad(32, \"member:\")` を混ぜているのは、用途ごとに違うハッシュにするためです。" +
      "こうしておくと、同じ鍵から作った会員IDと投稿者IDが別の値になり、" +
      "片方が漏れてももう片方と結び付けられません。",
  },
  explanation:
    "`witness` は利用者の手元にある秘密の入口を宣言する構文で、実装はコントラクトではなく DApp 側（TypeScript）が持ちます。" +
    "witness の戻り値は private なので、そのままではチェーンに現れません。" +
    "`persistentHash<Vector<N, Bytes<32>>>([...])` は一方向ハッシュで、同じ入力からは同じ結果が出る一方、結果から入力は復元できません。" +
    "そのため「同一性の判定はできるが、本人の特定はできない」識別子を作れます。" +
    "この識別子を `disclose` して `ledger` に置くことで、公開台帳の上で会員を区別できます。" +
    "`pad(32, \"...\")` で用途ごとの目印を混ぜるのは、同じ秘密から作った別用途の識別子どうしが結び付かないようにするためです。",

  starterCode: `// bboard.compact
//
// 会員制の掲示板。まずは「登録」だけを作ります。
//
// 名前もメールアドレスも保存できません（ledger は全員に見えるため）。
// 「同じ人かどうか」だけが分かる名札を作ってください。

pragma language_version 0.23;
import CompactStandardLibrary;

// 登録した会員の名札を1つ記録しておく場所（公開）。
export ledger memberId: Bytes<32>;

// 1. 秘密の入口を宣言してください。
//    名前は localSecretKey、戻り値は Bytes<32> です。
//    実装は DApp 側にあるので、ここでは宣言だけします。


// 2. 秘密鍵から「名札」を作る circuit を書いてください。
//    名前は publicKey、引数は sk: Bytes<32>、戻り値は Bytes<32>。
//    中身は persistentHash で、pad(32, "member:") と sk を混ぜます。
//
//    return persistentHash<Vector<2, Bytes<32>>>([pad(32, "member:"), sk]);


// 3. 登録の入口を書いてください。名前は register、引数なし、戻り値なし。
//    memberId に「名札」を入れます。
//
//    注意: disclose の位置を間違えると秘密鍵そのものが公開されます。
//    公開してよいのはハッシュ済みの値だけです。

`,

  modelAnswer: `// bboard.compact
//
// 会員登録。名前を保存せずに「同じ人か」だけを分かるようにする。

pragma language_version 0.23;
import CompactStandardLibrary;

// 公開台帳に載る名札。
// ここから本人を逆算することはできない。
export ledger memberId: Bytes<32>;

// 秘密の入口。実装は DApp 側（TypeScript）にある。
// 戻り値は private なので、このままではチェーンに乗らない。
witness localSecretKey(): Bytes<32>;

// 秘密鍵から「名札」を作る。
// persistentHash は一方向なので、結果から鍵は逆算できない。
// pad(32, "member:") を混ぜるのは用途を分けるため。
// こうしておくと、同じ鍵から作った別用途の識別子と結び付かない。
export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "member:"), sk]);
}

export circuit register(): [] {
  // disclose の位置が全て。
  //   disclose(localSecretKey())            → 秘密鍵が公開される（事故）
  //   disclose(publicKey(localSecretKey())) → ハッシュ済みの値だけが公開される
  // 括弧の内側か外側か、それだけの違いで結果が変わる。
  memberId = disclose(publicKey(localSecretKey()));
}
`,

  hints: [
    {
      level: 1,
      text: "書くのは3つです。`witness` の宣言が1行、ハッシュを作る `circuit publicKey`、登録する `circuit register`。witness は宣言だけで、中身は書きません（実装は DApp 側にあります）。",
    },
    {
      level: 2,
      text: "`witness localSecretKey(): Bytes<32>;` と書きます。本体（`{}`）は要りません。セミコロンで終わります。",
    },
    {
      level: 3,
      text: "`register` の中は `memberId = disclose(publicKey(localSecretKey()));` です。`disclose(localSecretKey())` と書かないよう注意してください。それでは秘密鍵そのものが公開台帳に載ります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-02-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-02-2",
      description: "秘密の入口（`witness localSecretKey`）を宣言したか？",
      verify: { kind: "compact-witness", name: "localSecretKey" },
    },
    {
      id: "cp-cp-02-3",
      description: "名札を作る `circuit publicKey` を書いたか？",
      verify: { kind: "compact-circuit", name: "publicKey" },
    },
    {
      id: "cp-cp-02-4",
      description: "ハッシュ（`persistentHash`）で作っているか？",
      verify: { kind: "compact-calls", name: "persistentHash" },
    },
    {
      id: "cp-cp-02-5",
      description: "秘密鍵そのものを disclose していないか（括弧の内側か外側か）？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-02-6",
      description: "公開しているのはハッシュ済みの名札か？",
      verify: { kind: "compact-discloses", value: "publicKey" },
    },
    {
      id: "cp-cp-02-7",
      description: "登録の入口（`circuit register`）を書いたか？",
      verify: { kind: "compact-circuit", name: "register" },
    },
    {
      id: "cp-cp-02-8",
      description:
        "「同一人物だと分かる」のに「誰かは分からない」のはなぜか、説明できるか？",
    },
  ],

  tags: ["Compact", "Midnight", "witness", "persistentHash", "disclose", "ゼロ知識"],
  relatedIds: ["cp-01-ledger-circuit", "cp-03-assert-guard", "cp-06-diagnose-secret-leak"],
};
