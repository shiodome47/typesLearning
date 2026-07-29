import type { Lesson } from "../types";

export const cpLesson05: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-05-selective-disclosure",
  order: 5,
  title: "⑤ 生年月日を見せずに「18歳以上」だけ示す — 選択的開示",
  category: "zk-privacy",
  difficulty: 4,

  goal: "秘密の値そのものではなく、その値についての事実だけを公開する書き方ができるようになる",

  why: {
    problem:
      "掲示板に年齢制限を入れることになりました。18歳以上だけが投稿できるようにします。\n\n" +
      "普通のやり方はこうです。生年月日を入力してもらい、サーバーに保存し、" +
      "投稿のたびに計算して判定する。\n\n" +
      "このとき何が起きているか、改めて考えてみてください。\n" +
      "**サービス側は「18歳以上か」を知りたいだけなのに、生年月日を丸ごと受け取っています。**\n\n" +
      "必要なのは Yes か No の1ビットです。それなのに、" +
      "その人が何年何月何日に生まれたかという、一生変わらない個人情報を預かってしまう。\n\n" +
      "そして預かった以上、守る義務が生じます。漏れれば責任を問われます。" +
      "「使わないけど念のため持っておく」が、そのまま負債になります。\n\n" +
      "Midnight で同じことをやると、負債では済みません。" +
      "`ledger` に置いた瞬間、**全世界に公開されます**。\n" +
      "会員の生年月日一覧が、誰でも見られる場所に並ぶことになります。",
    insight:
      "ここが Midnight の一番おいしいところです。\n\n" +
      "**値を渡さずに、値についての事実だけを渡せます。**\n\n" +
      "書き方は驚くほど素直です。\n\n" +
      "```\n" +
      "// 生年は witness から受け取る（private のまま）\n" +
      "const birthYear = localBirthYear();\n" +
      "\n" +
      "// 判定は回路の中でやる。ここでは disclose しない\n" +
      "assert(currentYear - birthYear >= 18, \"under 18\");\n" +
      "```\n\n" +
      "`birthYear` はどこにも公開されていません。`disclose` を通っていないからです。\n" +
      "それでも「18歳以上である」ことは証明されました。\n" +
      "検証する側は、証明を見て「条件を満たしている」とだけ分かります。\n\n" +
      "**公開されたのは事実であって、値ではありません。**\n\n" +
      "これが Midnight の言う **selective disclosure（選択的開示）** です。\n" +
      "全部見せるか、何も見せないかの二択ではなく、" +
      "**必要な事実だけを取り出して見せる**という第三の道です。\n\n" +
      "同じ形は、あちこちで使えます。\n" +
      "- 残高を見せずに「10万円以上ある」と示す\n" +
      "- 住所を見せずに「対象地域に住んでいる」と示す\n" +
      "- 病歴を見せずに「接種済みである」と示す\n\n" +
      "コツは1つだけです。**`disclose` に入れる前に、いったん立ち止まる。**\n" +
      "「この値そのものが要るのか、それとも判定結果だけで足りるのか」。\n" +
      "たいていは後者です。",
  },
  explanation:
    "Compact では witness の戻り値も circuit の引数も既定で private なので、" +
    "`disclose` を通さない限りチェーンには現れません。" +
    "一方 `assert` による判定は回路の中で実行され、検証者には「条件を満たした」という事実だけが伝わります。" +
    "そのため「生年月日は伏せたまま 18 歳以上であることを示す」といった証明が、特別な仕掛けなしに書けます。" +
    "これが Midnight の掲げる selective disclosure（選択的開示）で、" +
    "公開と秘匿の二択ではなく、必要な事実だけを取り出して開示する設計です。" +
    "設計時は「値そのものが必要か、判定結果だけで足りるか」を毎回問うことになります。",

  starterCode: `// bboard.compact
//
// 18歳以上だけが投稿できる掲示板。
//
// ただし生年は公開してはいけません。
// 「18歳以上である」という事実だけを示してください。

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger message: Maybe<Opaque<"string">>;

// 投稿数（公開）。誰が投稿したかは分からないが、件数は分かる。
export ledger postCount: Counter;

// 1. 生年を受け取る秘密の入口を宣言してください。
//    名前は localBirthYear、戻り値は Uint<16> です。


export circuit post(newMessage: Opaque<"string">, currentYear: Uint<16>): [] {
  // 2. 生年を受け取ってください（まだ公開しません）。


  // 3. 18歳以上であることを確かめてください。
  //    disclose は使いません。判定は回路の中で完結します。
  //    メッセージは "under 18" とします。


  message = disclose(some<Opaque<"string">>(newMessage));
  postCount.increment(1);
}
`,

  modelAnswer: `// bboard.compact
//
// 生年は伏せたまま、「18歳以上である」ことだけを証明する。

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger message: Maybe<Opaque<"string">>;
export ledger postCount: Counter;

// 生年の入口。実装は DApp 側にある。
// 戻り値は private なので、disclose しない限りチェーンに出ない。
witness localBirthYear(): Uint<16>;

export circuit post(newMessage: Opaque<"string">, currentYear: Uint<16>): [] {
  // ここで受け取った時点ではまだ private。
  // この変数はどこにも公開されない。
  const birthYear = localBirthYear();

  // 判定は回路の中で行う。disclose を通していないので、
  // 生年そのものはチェーンに現れない。
  // 検証する側に伝わるのは「条件を満たした」という事実だけ。
  //
  // 公開されたのは事実であって、値ではない。
  assert(currentYear - birthYear >= 18, "under 18");

  // 投稿内容は公開してよいものなので disclose する。
  // 何を disclose するかは、毎回この粒度で決める。
  message = disclose(some<Opaque<"string">>(newMessage));
  postCount.increment(1);
}
`,

  hints: [
    {
      level: 1,
      text: "書くのは3か所です。`witness` の宣言、生年を受け取る `const`、そして `assert` による判定。どれにも `disclose` は出てきません。",
    },
    {
      level: 2,
      text: "入口は `witness localBirthYear(): Uint<16>;` です。受け取りは `const birthYear = localBirthYear();` と書きます。この時点ではまだ公開されていません。",
    },
    {
      level: 3,
      text: "判定は `assert(currentYear - birthYear >= 18, \"under 18\");` です。ここで `disclose(birthYear)` と書いてしまうと生年が公開され、この回の目的が失われます。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-05-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-05-2",
      description: "生年の入口（`witness localBirthYear`）を宣言したか？",
      verify: { kind: "compact-witness", name: "localBirthYear" },
    },
    {
      id: "cp-cp-05-3",
      description: "生年を公開していないか（これが公開されたら意味が無い）？",
      verify: {
        kind: "compact-discloses",
        value: "localBirthYear",
        expect: false,
      },
    },
    {
      id: "cp-cp-05-4",
      description: "受け取った生年の変数も公開していないか？",
      verify: { kind: "compact-discloses", value: "birthYear", expect: false },
    },
    {
      id: "cp-cp-05-5",
      description: "年齢の判定そのものは書いたか（assert）？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-05-6",
      description: "投稿内容は公開したか（伏せるべきものと分けられているか）？",
      verify: { kind: "compact-discloses", value: "some" },
    },
    {
      id: "cp-cp-05-7",
      description:
        "手元の機能を1つ挙げて「値そのものが要るか、判定結果だけで足りるか」を言えるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "選択的開示",
    "selective disclosure",
    "ゼロ知識",
    "プライバシー",
    "年齢確認",
  ],
  relatedIds: ["cp-04-authorization", "cp-06-diagnose-secret-leak"],
};
