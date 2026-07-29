import type { Lesson } from "../types";

export const cpLesson09: Lesson = {
  kind: "diagnose",
  language: "compact",
  id: "cp-09-diagnose-over-disclosure",
  order: 7,
  title: "⑦ 診断: 秘密は漏れていない。それでも特定される",
  category: "zk-privacy",
  difficulty: 4,

  goal: "秘密そのものを公開していないコードから、開示の粒度と識別子の使い回しによる特定リスクを見抜けるようになる",

  symptom:
    "オークションのコントラクトです。⑥で習ったとおりに書かれています。" +
    "残高も生年も住所も、秘密鍵も、**どれ一つ公開していません**。" +
    "レビューでも「`disclose` の中身は全部ハッシュか判定結果だけ」と確認済みで、指摘は出ませんでした。\n\n" +
    "リリース後、あるユーザーから連絡がありました。" +
    "「入札しただけなのに、自分の年収帯と居住地を言い当てるダイレクトメールが届いた」。\n\n" +
    "さらに調べると、そのユーザーが**別のサービスで使っている匿名アカウント**と、" +
    "このオークションでの入札履歴が、第三者によって同一人物として結び付けられていました。",

  why: {
    problem:
      "「秘密を `disclose` しない」を守っただけでは足りません。\n\n" +
      "⑤と⑥で「値ではなく事実だけを公開する」を学びました。これは正しい。\n" +
      "しかし**事実にも情報量があります**。そして事実は積み上がります。\n\n" +
      "残高を公開しなくても、「10万以上か」を公開すれば1ビット漏れます。\n" +
      "「20万以上か」も公開すれば2ビット。「30万以上か」も…と続ければ、" +
      "**残高そのものを公開したのとほとんど変わらなくなります**。\n\n" +
      "1回の取引で見れば「たった1ビット」です。だから見逃されます。\n" +
      "でもオークションは何度も入札されます。**回数がそのまま情報量になる**。\n\n" +
      "もう1つ、もっと気づきにくい経路があります。\n\n" +
      "会員の識別子はハッシュなので、そこから鍵は復元できません。" +
      "しかし**同じ鍵から同じ計算で作れば、いつでも同じ値になります**。\n" +
      "それは「別のアプリでも同じ値になる」ということです。\n\n" +
      "つまり、こちらのアプリの入札履歴と、あちらのアプリの投稿履歴が、" +
      "**同じ識別子を鍵にして突き合わせられます**。\n" +
      "どちらのアプリも個人情報を1バイトも公開していないのに、です。\n\n" +
      "この失敗の質が悪いのは、**レビューのチェックリストを通過してしまう**ことです。" +
      "「`disclose` の中身は秘密そのものではないか？」という問いには、全部「はい」で答えられてしまう。",
    insight:
      "見るべき問いが2つ増えます。⑥までの「何を公開したか」に加えて、こうです。\n\n" +
      "**問い1: この公開を100回繰り返されたら、元の値は残るか。**\n\n" +
      "公開してよいのは、**繰り返されても意味が増えない事実**だけです。\n\n" +
      "```\n" +
      "assert(balance >= 100000, \"...\");        // 判定するだけ。台帳に何も残らない\n" +
      "balanceTier = disclose(balance / 100000); // 段階が残る。積み上がる\n" +
      "```\n\n" +
      "上は「条件を満たした取引が成立した」以上のことを残しません。\n" +
      "下は毎回1つずつ数字を積み上げます。**同じ「10万以上か」でも、" +
      "判定に使うのと台帳に残すのとでは全く違う**。\n\n" +
      "原則はこうです。**判定は `assert` の中で済ませ、`ledger` には残さない。**\n" +
      "「後で分析に使えるかも」で残した値が、そのまま漏洩経路になります。\n\n" +
      "**問い2: この識別子は、他のアプリでも同じ値になるか。**\n\n" +
      "なるなら、そこが名寄せの鍵になります。防ぎ方は1行です。\n\n" +
      "```\n" +
      "persistentHash<Vector<2, Bytes<32>>>([pad(32, \"auction:pk:\"), sk])\n" +
      "                                       ^^^^^^^^^^^^^^^^^^^^^^^\n" +
      "```\n\n" +
      "**用途ごとに違う文字列を混ぜる**（ドメイン分離）。\n" +
      "こうすると同じ鍵から作っても、オークション用の識別子と掲示板用の識別子が" +
      "**まったく別の値**になり、突き合わせられません。\n\n" +
      "混ぜ忘れても動きます。テストも通ります。本人確認も成立します。\n" +
      "**足りないのは1つの文字列だけ**で、それが名寄せされるかどうかを決めます。\n\n" +
      "まとめると、選択的開示の設計で見るのは3点です。\n\n" +
      "1. **秘密そのもの**を公開していないか（⑤⑥でやった）\n" +
      "2. **公開した事実が積み上がらないか**（粒度）\n" +
      "3. **識別子が用途ごとに分かれているか**（ドメイン分離）\n\n" +
      "1だけ見て安心するのが、この回で一番避けたいことです。",
  },
  explanation:
    "選択的開示では、秘密そのものを公開しないことに加えて、公開する事実の粒度と識別子の設計も検討対象になります。" +
    "「条件を満たすか」の判定を `assert` の中だけで行えば台帳には何も残りませんが、" +
    "判定結果や段階値を `ledger` に書くと、取引のたびに情報が蓄積します。" +
    "個々の値の情報量が小さくても、繰り返しによって元の値を絞り込めるため、" +
    "「この公開が何度も繰り返されたときに何が分かるか」を基準に判断する必要があります。" +
    "また、同じ秘密から同じ手順で作った識別子は、どのアプリでも同じ値になります。" +
    "`persistentHash` の入力に `pad(32, \"用途名:\")` のような用途ごとの文字列を混ぜること（ドメイン分離）で、" +
    "同一の秘密鍵から作られた識別子どうしが結び付けられるのを防げます。",

  brokenCode: `// auction.compact
//
// オークション。⑤⑥で習ったとおりに書いてある。
// 残高も居住地も秘密鍵も、どれも disclose していない。
// レビューでも指摘は出なかった。

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger memberId: Bytes<32>;
export ledger bidCount: Counter;

// 「分析に使えるので、残高の段階だけ記録しておきます」と言われた項目。
// 10万円ごとの段階なので、残高そのものではない。
export ledger balanceTier: Uint<8>;

// 「地域別の傾向を見たいので」と言われた項目。
export ledger areaCode: Uint<8>;

witness localBalance(): Uint<64>;
witness localPrefCode(): Uint<8>;
witness localSecretKey(): Bytes<32>;

// 会員の識別子。ハッシュなので鍵は復元できない。
export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<1, Bytes<32>>>([sk]);
}

export circuit bid(): [] {
  const balance = localBalance();
  assert(balance >= 100000, "insufficient balance");

  const pref = localPrefCode();
  assert(pref == 13 || pref == 14 || pref == 12, "out of area");

  assert(memberId == publicKey(localSecretKey()), "not a member");

  // 残高そのものではなく「段階」なので大丈夫、という判断。
  balanceTier = disclose(balance / 100000);

  // 3つのうちどれか、はもう assert で確認済みなので、
  // どれだったかを記録しても問題ない、という判断。
  areaCode = disclose(pref);

  bidCount.increment(1);
}
`,

  defects: [
    {
      id: "d-cp-09-1",
      summary:
        "残高の「段階」を台帳に残しており、入札のたびに情報が積み上がる（`balanceTier = disclose(balance / 100000)`）",
      why:
        "1回分では「10万円単位でどのあたりか」しか分かりませんが、この値は取引ごとに更新されます。" +
        "残高が変動しながら何度も入札されれば、その系列から実際の残高はかなり正確に絞り込めます。" +
        "`assert(balance >= 100000, ...)` は判定するだけで台帳に何も残しませんが、" +
        "段階値を `ledger` に書いた瞬間に、繰り返しが情報量に変わります。" +
        "「分析に使えるかもしれない」という理由で残した値が、そのまま漏洩経路になっています。",
      marker: "balanceTier = disclose(balance / 100000);",
    },
    {
      id: "d-cp-09-2",
      summary:
        "居住地コードそのものを公開している（`areaCode = disclose(pref)`）",
      why:
        "参加資格として必要なのは「対象地域のいずれかに住んでいる」という事実だけで、" +
        "それは `assert` の時点ですでに確認できています。" +
        "どの県かを公開すると、3分の1に絞られていた候補が1つに確定します。" +
        "さらに残高の段階と組み合わせれば、対象者はごく少数まで絞り込めます。" +
        "「もう assert で確認済みだから記録しても同じ」という判断は誤りで、" +
        "確認することと公開することは別の行為です。",
      marker: "areaCode = disclose(pref);",
    },
    {
      id: "d-cp-09-3",
      summary:
        "識別子にドメイン分離が無く、同じ鍵を使う他のアプリと同じ値になる（`persistentHash([sk])`）",
      why:
        "ハッシュなので鍵は復元できませんが、同じ鍵から同じ手順で作れば必ず同じ値になります。" +
        "つまりこの識別子は、同じ秘密鍵を使う別のコントラクトでも同一の値として現れます。" +
        "その結果、このオークションでの入札履歴と、他アプリでの活動履歴を" +
        "同一人物のものとして突き合わせられます（名寄せ）。" +
        "`pad(32, \"auction:pk:\")` のような用途ごとの文字列を混ぜれば、" +
        "同じ鍵から作っても別の値になり、結び付けられなくなります。",
      marker: "persistentHash<Vector<1, Bytes<32>>>([sk])",
    },
  ],

  fixedCode: `// auction.compact
//
// 見る点は3つ。
//   1. 秘密そのものを公開していないか
//   2. 公開した事実が積み上がらないか（粒度）
//   3. 識別子が用途ごとに分かれているか（ドメイン分離）

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger memberId: Bytes<32>;

// 台帳に残すのは件数だけ。
// 誰が、いくら持っていて、どこに住んでいるかは一切残らない。
export ledger bidCount: Counter;

witness localBalance(): Uint<64>;
witness localPrefCode(): Uint<8>;
witness localSecretKey(): Bytes<32>;

// 用途ごとに違う文字列を混ぜる（ドメイン分離）。
// これがあると、同じ鍵から作っても
// 掲示板用の識別子とオークション用の識別子が別の値になり、
// 履歴どうしを突き合わせられなくなる。
export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "auction:pk:"), sk]);
}

export circuit bid(): [] {
  // 判定は assert の中で済ませる。台帳には何も残らない。
  // 「10万以上か」を assert で確認するのと、
  // その段階を ledger に書くのとでは、残るものが全く違う。
  const balance = localBalance();
  assert(balance >= 100000, "insufficient balance");

  // 「3つのうちどれか」だけを確認する。
  // どれだったかは確認する必要がないので、記録もしない。
  // 確認することと公開することは別の行為。
  const pref = localPrefCode();
  assert(pref == 13 || pref == 14 || pref == 12, "out of area");

  assert(memberId == publicKey(localSecretKey()), "not a member");

  // 公開するのは「条件を満たす入札が1件あった」という事実だけ。
  // これは何度繰り返されても、それ以上の意味を持たない。
  bidCount.increment(1);
}
`,

  hints: [
    {
      level: 1,
      text: "`disclose(...)` の中身に秘密そのものは入っていません。そこは正しいので、見る場所を変えてください。「この公開が100回繰り返されたら何が分かるか」と「この識別子は他のアプリでも同じ値になるか」の2つを問います。",
    },
    {
      level: 2,
      text: "`balanceTier` と `areaCode` は、判定に必要な情報ではなく「記録しておくと便利そう」という理由で残された値です。`assert` はすでに通っているので、この2つの `ledger` と代入は丸ごと消せます。",
    },
    {
      level: 3,
      text: "`publicKey` は `persistentHash<Vector<1, Bytes<32>>>([sk])` になっており、用途を混ぜていません。`persistentHash<Vector<2, Bytes<32>>>([pad(32, \"auction:pk:\"), sk])` に直すと、同じ鍵でもアプリごとに別の識別子になります。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-09-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-09-2",
      description:
        "残高の段階を台帳に残していないか（繰り返されると積み上がる）？",
      verify: { kind: "compact-ledger", name: "balanceTier", expect: false },
    },
    {
      id: "cp-cp-09-3",
      description: "残高から作った値を公開していないか？",
      verify: { kind: "compact-discloses", value: "balance", expect: false },
    },
    {
      id: "cp-cp-09-4",
      description: "居住地を記録する場所を残していないか？",
      verify: { kind: "compact-ledger", name: "areaCode", expect: false },
    },
    {
      id: "cp-cp-09-5",
      description: "居住地そのものを公開していないか（所属の確認だけで足りる）？",
      verify: { kind: "compact-discloses", value: "pref", expect: false },
    },
    {
      id: "cp-cp-09-6",
      description:
        "識別子に用途を混ぜたか（ドメイン分離。他アプリと同じ値にならないか）？",
      verify: { kind: "compact-calls", name: "pad" },
    },
    {
      id: "cp-cp-09-7",
      description: "混ぜているのはこのアプリ専用の文字列か？",
      verify: { kind: "compact-contains-string", value: "auction:pk:" },
    },
    {
      id: "cp-cp-09-8",
      description: "参加資格の判定そのものは残っているか（消して回避していないか）？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-09-9",
      description: "秘密鍵そのものは公開していないか（ここは元から正しい）？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-09-10",
      description:
        "自分が今まで書いた `ledger` を1つ挙げて、「これは繰り返されても意味が増えないか」を言えるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "コード診断",
    "選択的開示",
    "ドメイン分離",
    "名寄せ",
    "プライバシー",
  ],
  relatedIds: [
    "cp-08-range-proof",
    "cp-05-selective-disclosure",
    "cp-06-diagnose-secret-leak",
  ],
};
