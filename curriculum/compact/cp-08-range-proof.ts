import type { Lesson } from "../types";

export const cpLesson08: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-08-range-proof",
  order: 6,
  title: "⑥ 残高も住所も見せない — 「事実だけ」の作り方を3つ覚える",
  category: "zk-privacy",
  difficulty: 4,

  goal: "大小・所属・一致という3つの型の事実を、元の値を伏せたまま証明できるようになる",

  why: {
    problem:
      "⑤で「生年を伏せて18歳以上だけ示す」をやりました。\n" +
      "同じ手が使えるはずだ、と思って次の要件に取りかかります。\n\n" +
      "**「残高が10万円以上ある人だけが入札できる」**\n\n" +
      "書けます。⑤と同じ形です。\n\n" +
      "ところが、ここで**やってはいけない近道**があります。\n" +
      "「10万円以上か」を判定するだけなら、いっそ残高を `ledger` に置いて" +
      "みんなで検証できるようにすればいいのでは、と考えてしまう。\n\n" +
      "そうすると、全参加者の残高が公開台帳に並びます。" +
      "オークションの参加者は、**他人がいくら持っているかを見て入札できる**ようになります。\n\n" +
      "次の要件はもっと厄介です。\n\n" +
      "**「東京都・神奈川県・千葉県の住民だけが応募できる」**\n\n" +
      "大小比較ではありません。「3つのうちどれかである」という**所属**の話です。\n" +
      "住所そのものは伏せたい。でも対象地域内であることは示したい。\n\n" +
      "ここで手が止まります。⑤で覚えた `>=` は使えません。",
    insight:
      "実務で必要になる「事実」は、だいたい3種類しかありません。\n" +
      "**それぞれに定型があります。**\n\n" +
      "**1. 大小 — `>=` をそのまま assert に入れる**\n\n" +
      "```\n" +
      "const balance = localBalance();\n" +
      "assert(balance >= 100000, \"insufficient\");\n" +
      "```\n\n" +
      "`balance` は disclose していないので公開されません。\n" +
      "残高・年齢・スコアなど、順序があるものは全部これです。\n\n" +
      "**2. 所属 — 候補を並べて `||` でつなぐ**\n\n" +
      "```\n" +
      "const pref = localPrefCode();\n" +
      "assert(pref == 13 || pref == 14 || pref == 12, \"out of area\");\n" +
      "```\n\n" +
      "「どれかである」ことだけが公開され、**どれなのかは公開されません**。\n" +
      "地域・資格・所属組織など、集合で決まるものはこれです。\n\n" +
      "**3. 一致 — ハッシュを比べる（④でやった形）**\n\n" +
      "```\n" +
      "assert(registry == publicKey(localSecretKey()), \"not a member\");\n" +
      "```\n\n" +
      "本人確認・会員確認など、同一性を問うものはこれです。\n\n" +
      "この3つで、実務の要件はかなりの範囲が書けます。\n\n" +
      "そして最後に、**この回で一番大事な注意**があります。\n\n" +
      "**「事実」を公開しすぎないこと。**\n\n" +
      "たとえば「10万円以上か」を判定するのに、" +
      "うっかり `disclose(balance >= 100000)` の代わりに `disclose(balance)` と書けば元も子もありません。" +
      "しかしもっと巧妙な漏れ方があります。\n\n" +
      "**判定を細かくしすぎると、繰り返し呼ばれるだけで値が特定されます。**\n" +
      "「10万以上か」「20万以上か」「30万以上か」を全部公開すれば、" +
      "何度か呼ばれるうちに残高はほぼ確定します。\n\n" +
      "だから設計のときはこう問います。\n" +
      "**「この判定を100回繰り返されたら、元の値は分かってしまうか？」**\n" +
      "分かってしまうなら、その粒度は細かすぎます。\n\n" +
      "**★最後に、3つの型の決定的な違いを1つ。**\n\n" +
      "**3（一致）だけが台帳の値と突き合わせています。**\n" +
      "秘密を知らなければ一致する値を作れないので、嘘がつけません。\n\n" +
      "**1（大小）と2（所属）は、利用者が出した数字を条件に当てているだけです。**\n" +
      "`localBalance()` は witness なので、`999999999` を返す実装にすれば通ります。\n\n" +
      "**つまりこの3つは「隠したまま判定する書き方」としては全部正しいのですが、**\n" +
      "**「嘘を防ぐ仕組み」として機能しているのは3だけです。**\n\n" +
      "1と2を健全にするには、その値を知っている第三者（銀行・自治体 = issuer）に署名させ、" +
      "**署名を回路の中で検証する**必要があります。",
  },
  explanation:
    "Compact では witness の戻り値も circuit の引数も既定で private なので、" +
    "`disclose` を通さない限りチェーンには現れません。" +
    "そのため `assert` の中で行う比較は、値を公開せずに条件だけを証明できます。" +
    "実務で必要になる事実は概ね 3 種類で、順序を問う大小比較、集合への所属、ハッシュによる同一性です。" +
    "所属は `==` を `||` でつなぐことで表現でき、どの候補に一致したかは公開されません。" +
    "ただし公開する事実の粒度には注意が必要で、細かい判定を多数公開すると" +
    "それらを組み合わせることで元の値が推測できてしまいます。" +
    "選択的開示では「何を公開しないか」だけでなく「どれだけ細かく公開するか」も設計対象になります。",

  starterCode: `// auction.compact
//
// 会員制オークション。参加資格は3つあります。
//
//   1. 残高が 100000 以上ある
//   2. 東京(13) / 神奈川(14) / 千葉(12) のいずれかに住んでいる
//   3. 登録済みの会員である
//
// どれも「条件を満たすこと」だけを示し、
// 残高・居住地・秘密鍵そのものは公開しません。

pragma language_version 0.23;
import CompactStandardLibrary;

// 登録済み会員の名札（②で作ったものと同じ考え方）。
export ledger memberId: Bytes<32>;

// 入札の件数だけは公開する（誰が入札したかは分からない）。
export ledger bidCount: Counter;

// 1. 秘密の入口を3つ宣言してください。
//    localBalance():    Uint<64>   残高
//    localPrefCode():   Uint<8>    都道府県コード
//    localSecretKey():  Bytes<32>  秘密鍵


export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "auction:pk:"), sk]);
}

export circuit bid(): [] {
  // 2. 残高が 100000 以上あることを確かめてください（大小）。
  //    メッセージは "insufficient balance" とします。


  // 3. 対象地域に住んでいることを確かめてください（所属）。
  //    13 / 14 / 12 のいずれかです。
  //    メッセージは "out of area" とします。


  // 4. 登録済みの会員であることを確かめてください（一致）。
  //    memberId と、秘密鍵から作った派生値を比べます。
  //    メッセージは "not a member" とします。


  bidCount.increment(1);
}
`,

  modelAnswer: `// auction.compact
//
// 3種類の「事実」を、元の値を伏せたまま証明する。
//   大小（残高） / 所属（居住地） / 一致（会員）

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger memberId: Bytes<32>;
export ledger bidCount: Counter;

// どれも private。disclose しない限りチェーンには出ない。
witness localBalance(): Uint<64>;
witness localPrefCode(): Uint<8>;
witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "auction:pk:"), sk]);
}

export circuit bid(): [] {
  // ── 1. 大小 ──
  // 残高そのものは公開されない。
  // 公開されるのは「10万以上である」という事実だけ。
  //
  // 粒度に注意。もし「10万以上か」「20万以上か」…と
  // 細かく公開すれば、繰り返されるうちに残高が特定される。
  const balance = localBalance();
  assert(balance >= 100000, "insufficient balance");

  // ── 2. 所属 ──
  // 「3つのうちどれかである」ことだけが示され、
  // どれなのかは公開されない。
  const pref = localPrefCode();
  assert(pref == 13 || pref == 14 || pref == 12, "out of area");

  // ── 3. 一致 ──
  // ④と同じ形。鍵は回路の外に出ず、
  // 出ていくのは「一致したか」という事実だけ。
  assert(memberId == publicKey(localSecretKey()), "not a member");

  // 件数だけを公開する。
  // 誰が入札したかも、いくら持っているかも、どこに住んでいるかも残らない。
  bidCount.increment(1);
}
`,

  hints: [
    {
      level: 1,
      text: "witness を3つ宣言し、`bid` の中に assert を3つ書きます。どれにも `disclose` は出てきません。公開されるのは判定結果だけで、値そのものではないからです。",
    },
    {
      level: 2,
      text: "大小は `assert(balance >= 100000, \"insufficient balance\");`、所属は `==` を `||` でつないで `assert(pref == 13 || pref == 14 || pref == 12, \"out of area\");` です。",
    },
    {
      level: 3,
      text: "一致は④と同じ形で `assert(memberId == publicKey(localSecretKey()), \"not a member\");` です。`localBalance()` の結果を `const balance = ...` で受けてから比較すると読みやすくなります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-08-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-08-2",
      description: "残高の入口（`witness localBalance`）を宣言したか？",
      verify: { kind: "compact-witness", name: "localBalance" },
    },
    {
      id: "cp-cp-08-3",
      description: "居住地の入口（`witness localPrefCode`）を宣言したか？",
      verify: { kind: "compact-witness", name: "localPrefCode" },
    },
    {
      id: "cp-cp-08-4",
      description: "残高を公開していないか（大小の判定だけでよい）？",
      verify: {
        kind: "compact-discloses",
        value: "localBalance",
        expect: false,
      },
    },
    {
      id: "cp-cp-08-5",
      description: "受け取った残高の変数も公開していないか？",
      verify: { kind: "compact-discloses", value: "balance", expect: false },
    },
    {
      id: "cp-cp-08-6",
      description: "居住地そのものを公開していないか（所属だけ示せばよい）？",
      verify: { kind: "compact-discloses", value: "pref", expect: false },
    },
    {
      id: "cp-cp-08-7",
      description: "秘密鍵そのものを公開していないか？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-08-8",
      description: "3つの判定をすべて書いたか（assert）？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-08-9",
      description: "会員の一致はハッシュ済みの派生値で比べているか？",
      verify: { kind: "compact-calls", name: "publicKey" },
    },
    {
      id: "cp-cp-08-10",
      description:
        "「この判定を100回繰り返されたら元の値は分かるか？」を、自分の設計に対して問えるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "選択的開示",
    "範囲証明",
    "所属証明",
    "プライバシー",
  ],
  relatedIds: [
    "cp-05-selective-disclosure",
    "cp-04-authorization",
    "cp-06-diagnose-secret-leak",
  ],
};
