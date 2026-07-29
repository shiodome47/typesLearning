import type { Lesson } from "../types";

export const cpLesson06: Lesson = {
  kind: "diagnose",
  language: "compact",
  id: "cp-06-diagnose-secret-leak",
  order: 8,
  title: "⑧ 診断: 納品してよいか — 秘密鍵が台帳に載っている",
  category: "zk-privacy",
  difficulty: 4,

  goal: "witness で受け取った秘密を、そのまま公開してよいものと、派生値にしてからでないと公開できないものに切り分けられるようになる",

  symptom:
    "掲示板コントラクトが完成し、テストも通り、投稿も削除も正しく動いています。" +
    "「投稿した本人だけが削除できる」という要件も満たしています。\n\n" +
    "しかしデプロイ後、ある利用者が自分の秘密鍵を第三者に使われ、なりすまし投稿をされました。" +
    "その利用者は誰にも鍵を教えていません。コントラクトは正常に動作していました。",

  why: {
    problem:
      "掲示板を作りました。「投稿した本人だけが削除できる」ようにしたい。\n\n" +
      "普通のWebアプリなら、ログインさせて `session.userId` と投稿者を突き合わせます。" +
      "Midnight にはログインがありません。あるのは**本人だけが持つ秘密鍵**だけです。\n\n" +
      "そこであなたは、素直にこう書きました。" +
      "「投稿するとき、その人の鍵を台帳に記録しておく。削除するとき、同じ鍵を持っているか照合する」。\n\n" +
      "動きます。本人しか削除できません。要件を完全に満たしています。テストも通ります。\n\n" +
      "そして**全利用者の秘密鍵が、公開台帳に平文で並びました。**\n\n" +
      "`ledger` はチェーン上です。全員が見られます。" +
      "誰かがブロックエクスプローラを開けば、そこに他人の鍵が載っている。ただそれだけの話です。\n\n" +
      "エラーは出ません。テストも通ります。**照合ロジックは1文字も間違っていません。**" +
      "間違っているのは「何を台帳に置いたか」だけです。",
    insight:
      "Compact は**すべての引数と witness が private から始まる**言語です。" +
      "何もしなければ、値は回路の中に閉じたままチェーンには出ません。\n\n" +
      "`disclose(...)` を通したものだけが公開されます。" +
      "**`disclose` は「公開してよい」という宣言であり、公開の境界そのもの**です。\n\n" +
      "だから見るべき場所は1か所しかありません。**`disclose` の中身は何か。**\n\n" +
      "ここで肝心なのは「照合したいなら鍵そのものが要る」わけではない、ということです。\n" +
      "**ハッシュを比べれば済みます。**\n\n" +
      "`publicKey(sk, seq)` のようにハッシュ化した**派生値**を台帳に置けば、\n" +
      "- 削除のときに同じ計算をして一致を確認できる（＝本人確認はできる）\n" +
      "- ハッシュから元の鍵は復元できない（＝鍵は漏れない）\n\n" +
      "これがゼロ知識の実務的な使い方です。" +
      "**「鍵を知っていること」だけを証明し、「鍵そのもの」は渡さない。**\n\n" +
      "見分け方はこうです。\n" +
      "`disclose(localSecretKey())` — 生の秘密。**事故**。\n" +
      "`disclose(publicKey(localSecretKey(), seq))` — ハッシュ済みの派生値。**正しい**。\n\n" +
      "`witness` に書いてあるから安全、ではありません。" +
      "`witness` は「秘密の入口」であって、出口を塞ぐのは `disclose` の側です。",
  },
  explanation:
    "Compact では circuit の引数と witness の戻り値は既定で private であり、そのままではチェーンに現れません。" +
    "`disclose(...)` を通した値だけが公開状態（ledger）に書き込めます。" +
    "つまり `disclose` は「この値は公開してよい」と開発者が明示的に宣言する場所であり、公開範囲を決める唯一の境界です。" +
    "本人確認のように「同一性だけ確かめたい」場合は、秘密そのものではなく `persistentHash` などで作った派生値を公開します。" +
    "派生値どうしを比較すれば同一性は確認でき、かつ派生値から元の秘密は復元できません。" +
    "公式の example-bboard も、秘密鍵を直接ではなく `publicKey(localSecretKey(), sequence)` の結果を台帳に置いています。",

  brokenCode: `// bboard.compact
//
// 掲示板。投稿した本人だけが削除できる。
// 要件は満たしていて、テストも通る。それでも事故になっている。

pragma language_version 0.23;
import CompactStandardLibrary;

export enum State {
  VACANT,
  OCCUPIED
}

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger sequence: Counter;

// 投稿者を記録しておく場所。
// 削除のときに「本人か」を照合するために使う。
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
  sequence.increment(1);
}

// 本人だけが持つ秘密鍵。実装は TypeScript 側にある。
witness localSecretKey(): Bytes<32>;

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "Attempted to post to an occupied board");

  // 削除のときに照合できるよう、投稿者を記録しておく。
  // 本人確認はこれで確実に動く。
  owner = disclose(localSecretKey());

  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): Opaque<"string"> {
  assert(state == State.OCCUPIED, "Attempted to take down post from an empty board");

  // 記録しておいた鍵と照合する。本人以外は通らない。
  assert(owner == localSecretKey(), "Attempted to take down post, but not the current owner");

  const formerMsg = message.value;
  state = State.VACANT;
  sequence.increment(1);
  message = none<Opaque<"string">>();
  return formerMsg;
}
`,

  defects: [
    {
      id: "d-cp-06-1",
      summary:
        "秘密鍵そのものを disclose して公開台帳に書き込んでいる（`owner = disclose(localSecretKey())`）",
      why:
        "`ledger owner` はチェーン上の公開状態なので、書き込んだ値は全員が読めます。" +
        "`witness` で受け取った時点では private ですが、`disclose` を通した瞬間に公開されます。" +
        "結果として、投稿した全利用者の秘密鍵が平文で台帳に並びます。" +
        "鍵を手に入れた第三者はその人になりすませるため、被害は掲示板の中に留まりません。",
      marker: "owner = disclose(localSecretKey());",
    },
    {
      id: "d-cp-06-2",
      summary:
        "本人確認に必要なのは鍵そのものではなく、ハッシュ化した派生値の一致だけ",
      why:
        "`publicKey(localSecretKey(), sequence as Field as Bytes<32>)` のように派生値を作って台帳に置けば、" +
        "削除時に同じ計算をして一致を確認でき、本人確認は成立します。" +
        "一方でハッシュから元の鍵は復元できないため、鍵は漏れません。" +
        "「鍵を知っていることを証明する」ことと「鍵を渡すこと」は別物であり、" +
        "この区別がゼロ知識アプリ設計の核心です。",
      marker: "assert(owner == localSecretKey(), ...)",
    },
  ],

  fixedCode: `// bboard.compact
//
// 公式 example-bboard と同じ設計。
// 「鍵を知っていること」だけを証明し、「鍵そのもの」は渡さない。

pragma language_version 0.23;
import CompactStandardLibrary;

export enum State {
  VACANT,
  OCCUPIED
}

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger sequence: Counter;

// 台帳に載るのは「鍵から作った派生値」であって、鍵ではない。
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
  sequence.increment(1);
}

witness localSecretKey(): Bytes<32>;

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "Attempted to post to an occupied board");

  // 鍵そのものではなく、鍵から作ったハッシュを公開する。
  // ハッシュからは元の鍵を復元できないので、公開しても安全。
  // それでいて「同じ鍵から作られたか」は後から確認できる。
  owner = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));

  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): Opaque<"string"> {
  assert(state == State.OCCUPIED, "Attempted to take down post from an empty board");

  // 手元の鍵から同じ計算をして、台帳の値と一致するか見る。
  // 鍵は回路の中から一歩も出ない。出ていくのは「一致したか」だけ。
  assert(owner == publicKey(localSecretKey(), sequence as Field as Bytes<32>),
    "Attempted to take down post, but not the current owner");

  const formerMsg = message.value;
  state = State.VACANT;
  sequence.increment(1);
  message = none<Opaque<"string">>();
  return formerMsg;
}

// 秘密鍵と連番から、公開してよい識別子を作る。
// persistentHash は一方向なので、結果から鍵は逆算できない。
export circuit publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "bboard:pk:"), sequence, sk]);
}
`,

  hints: [
    {
      level: 1,
      text: "照合ロジックは正しいので、そこは見なくて構いません。見るべきは `disclose(...)` の中身です。Compact で公開されるのは disclose を通ったものだけなので、公開事故は必ずそこに現れます。",
    },
    {
      level: 2,
      text: "`owner = disclose(localSecretKey());` は、秘密鍵そのものを公開台帳に書いています。本人確認をやめる必要はありません。台帳に置く値を変えれば済みます。",
    },
    {
      level: 3,
      text: "`publicKey(sk, sequence)` という circuit を足し、`disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>))` を台帳に置きます。照合側も同じ計算に揃えれば、鍵は回路の外に出ません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-06-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-06-2",
      description:
        "秘密鍵そのものを disclose していないか（台帳に載れば全員が読める）？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-06-3",
      description: "公開しているのはハッシュ化した派生値か？",
      verify: { kind: "compact-discloses", value: "publicKey" },
    },
    {
      id: "cp-cp-06-4",
      description: "派生値を作る circuit を用意したか？",
      verify: { kind: "compact-circuit", name: "publicKey" },
    },
    {
      id: "cp-cp-06-5",
      description: "秘密の入口（witness）自体は残っているか（消して回避していないか）？",
      verify: { kind: "compact-witness", name: "localSecretKey" },
    },
    {
      id: "cp-cp-06-6",
      description: "本人確認そのものは残っているか？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-06-7",
      description:
        "「鍵を知っていることの証明」と「鍵を渡すこと」の違いを説明できるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "セキュリティ",
    "disclose",
    "witness",
    "ゼロ知識",
    "選択的開示",
  ],
  relatedIds: ["cp-02-witness-secret", "cp-04-authorization", "cp-05-selective-disclosure"],
};
