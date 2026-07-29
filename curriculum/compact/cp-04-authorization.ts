import type { Lesson } from "../types";

export const cpLesson04: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-04-authorization",
  order: 4,
  title: "④ 本人だけが消せる — 鍵を渡さずに本人だと証明する",
  category: "zk-privacy",
  difficulty: 4,

  goal: "秘密鍵を公開せずに「書いた本人である」ことだけを証明し、認可を成立させられるようになる",

  why: {
    problem:
      "投稿を消せるようにします。条件は「書いた本人だけ」。\n\n" +
      "普通のWebアプリなら1行です。`if (post.userId !== session.userId) return 403;`\n" +
      "サーバーがセッションを持っていて、誰がログインしているか知っているからです。\n\n" +
      "**Midnight にはサーバーもセッションもログインもありません。**\n" +
      "あるのは、利用者の手元にある秘密鍵だけ。\n\n" +
      "ここで、多くの人が同じ道を通ります。\n" +
      "「投稿するとき鍵を記録しておいて、消すとき照合すればいい」。\n\n" +
      "動きます。本人しか消せません。要件を満たします。テストも通ります。\n" +
      "そして**全員の秘密鍵が公開台帳に並びます**。\n\n" +
      "厄介なのは、この失敗が**バグとして現れない**ことです。" +
      "エラーも出ない、動作も正しい、テストも緑。" +
      "気づくのは、誰かの鍵が使われて、なりすまし投稿をされたときです。\n\n" +
      "しかも被害は掲示板の中で終わりません。" +
      "その鍵は他のアプリでも本人証明に使われているかもしれないからです。",
    insight:
      "考え方を1つ入れ替えるだけで解けます。\n\n" +
      "**照合したいのは「鍵そのもの」ではなく「同じ鍵から作られたか」です。**\n\n" +
      "②で作った `publicKey(sk)` を思い出してください。\n" +
      "同じ鍵からは必ず同じ値が出て、その値から鍵は逆算できませんでした。\n\n" +
      "だったら、台帳に置くのはその**派生値**でいい。\n\n" +
      "```\n" +
      "// 投稿するとき: 派生値を記録する\n" +
      "owner = disclose(publicKey(localSecretKey()));\n" +
      "\n" +
      "// 消すとき: 手元の鍵から同じ計算をして、一致するか見る\n" +
      "assert(owner == publicKey(localSecretKey()), \"not the owner\");\n" +
      "```\n\n" +
      "消す側の `assert` を見てください。**`disclose` が付いていません。**\n" +
      "これが肝心です。比較は回路の中だけで行われ、鍵は一歩も外に出ません。\n" +
      "外に出ていくのは「**一致したかどうか**」という事実だけです。\n\n" +
      "これがゼロ知識証明の実務的な姿です。難しい数学の話ではなく、\n" +
      "**「鍵を見せる」のではなく「鍵を知っていることを示す」** という置き換えにすぎません。\n\n" +
      "見分け方は簡単です。`disclose` の**中**にあるものは公開されます。" +
      "`assert` の中だけにあるものは公開されません。\n\n" +
      "実務ではこう考えると外しません。\n" +
      "**「この値がブロックエクスプローラに表示されても平気か？」**\n" +
      "平気なものだけ `disclose` に入れてください。",
  },
  explanation:
    "Compact では circuit の中の計算は既定で private であり、`disclose` を通した値だけが公開されます。" +
    "そのため `assert(owner == publicKey(localSecretKey()), ...)` のような比較は、秘密鍵を公開せずに実行できます。" +
    "公開されるのは比較の成否だけで、鍵そのものは回路の外に出ません。" +
    "認可を作るときは「秘密を台帳に置いて突き合わせる」のではなく、" +
    "「秘密から作った派生値を台帳に置き、照合は回路の中で行う」形にします。" +
    "これにより、本人確認は成立したまま、秘密は一度も公開されません。",

  starterCode: `// bboard.compact
//
// 投稿と削除。削除できるのは書いた本人だけ。
//
// 秘密鍵を公開せずに「本人である」ことだけを示してください。

pragma language_version 0.23;
import CompactStandardLibrary;

export enum State { VACANT, OCCUPIED }

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;

// 投稿者を示す値を置く場所（公開台帳）。
// ここに置いてよいのは何か、よく考えてください。
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
}

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "occupied");

  // 1. 投稿者を owner に記録してください。
  //    ここは公開台帳です。秘密鍵そのものを置いてはいけません。


  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): [] {
  assert(state == State.OCCUPIED, "empty");

  // 2. 書いた本人かどうか確かめてください。
  //    手元の鍵から同じ計算をして、owner と一致するか見ます。
  //    ここでは disclose を使いません（比較は回路の中だけで済むため）。


  state = State.VACANT;
  message = none<Opaque<"string">>();
}
`,

  modelAnswer: `// bboard.compact
//
// 鍵を渡さずに、鍵を知っていることだけを示す。

pragma language_version 0.23;
import CompactStandardLibrary;

export enum State { VACANT, OCCUPIED }

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;

// 台帳に載るのは「鍵から作った派生値」であって、鍵ではない。
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
}

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "occupied");

  // 公開するのはハッシュ済みの派生値。
  // 同じ鍵からは同じ値が出るので後で照合できるが、
  // この値から鍵を逆算することはできない。
  owner = disclose(publicKey(localSecretKey()));

  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): [] {
  assert(state == State.OCCUPIED, "empty");

  // disclose が付いていないことが肝心。
  // 比較は回路の中だけで行われ、鍵は一歩も外に出ない。
  // 外に出るのは「一致したか」という事実だけ。
  assert(owner == publicKey(localSecretKey()), "not the owner");

  state = State.VACANT;
  message = none<Opaque<"string">>();
}
`,

  hints: [
    {
      level: 1,
      text: "書くのは2行だけです。1つは owner に記録する行、もう1つは本人か確かめる assert の行。どちらも `publicKey(localSecretKey())` を使います。",
    },
    {
      level: 2,
      text: "記録する側は `owner = disclose(publicKey(localSecretKey()));` です。`disclose(localSecretKey())` と書くと秘密鍵そのものが公開されます。括弧の位置に注意してください。",
    },
    {
      level: 3,
      text: "確かめる側は `assert(owner == publicKey(localSecretKey()), \"not the owner\");` です。ここに `disclose` は要りません。比較は回路の中で完結し、公開されるのは成否だけだからです。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-04-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-04-2",
      description: "秘密鍵そのものを disclose していないか？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-04-3",
      description: "公開しているのは派生値（publicKey の結果）か？",
      verify: { kind: "compact-discloses", value: "publicKey" },
    },
    {
      id: "cp-cp-04-4",
      description: "本人確認そのものは書いたか（assert）？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-04-5",
      description: "秘密の入口は残っているか（消して回避していないか）？",
      verify: { kind: "compact-witness", name: "localSecretKey" },
    },
    {
      id: "cp-cp-04-6",
      description:
        "`assert` の中の `publicKey(localSecretKey())` に disclose が要らないのはなぜか説明できるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "認可",
    "disclose",
    "ゼロ知識",
    "なりすまし",
    "セキュリティ",
  ],
  relatedIds: ["cp-02-witness-secret", "cp-05-selective-disclosure", "cp-06-diagnose-secret-leak"],
};
