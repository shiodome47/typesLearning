import type { Lesson } from "../types";

export const cpLesson03: Lesson = {
  kind: "write",
  language: "compact",
  id: "cp-03-assert-guard",
  order: 3,
  title: "③ 二重登録を止める — assert と Map",
  category: "compact",
  difficulty: 3,

  goal: "Map で会員名簿を持ち、assert で「すでに登録済みなら止める」という前提条件を書けるようになる",

  why: {
    problem:
      "②で会員登録ができるようになりました。ところが `memberId` は1つしか持てないので、" +
      "2人目が登録すると1人目が上書きされて消えます。名簿にする必要があります。\n\n" +
      "さらに困ったことが起きます。同じ人が登録ボタンを2回押しました。\n" +
      "通信が遅かっただけです。悪意はありません。\n\n" +
      "普通のWebアプリなら、DBの UNIQUE 制約が2回目を弾いてくれます。" +
      "エラーが返り、画面に「すでに登録済みです」と出て終わりです。\n\n" +
      "**コントラクトには UNIQUE 制約がありません。**\n" +
      "何も書かなければ、2回目もそのまま通ります。" +
      "投票なら二重投票、配布なら二重受け取り、抽選なら当選確率が2倍。\n" +
      "そして**取り消せません**。台帳に書かれたものは残り続けます。\n\n" +
      "「そんなミスはしない」と思うかもしれませんが、" +
      "ここで効いてくるのは利用者の善意ではなく、**回線の状態**です。",
    insight:
      "使う道具は2つです。\n\n" +
      "**`Map`** — キーと値の名簿です。`ledger members: Map<Bytes<32>, Boolean>;` のように宣言します。" +
      "操作は3つ覚えれば足ります。\n" +
      "`.member(キー)` で「居るか？」、`.insert(キー, 値)` で「入れる」、`.lookup(キー)` で「取り出す」。\n\n" +
      "**`assert`** — 前提条件です。`assert(条件, \"メッセージ\")` と書き、" +
      "**条件が偽なら、その取引はまるごと失敗します**。\n\n" +
      "ここが普通のプログラムと決定的に違う点です。\n" +
      "`if` で分岐して「何もしないで return」ではありません。**取引そのものが成立しません。**\n" +
      "途中まで書き込んで失敗する、ということが起きないので、" +
      "「半分だけ登録された会員」のような中途半端な状態が原理的に作れません。\n\n" +
      "書き方はこうなります。\n\n" +
      "```\n" +
      "assert(!members.member(id), \"already registered\");\n" +
      "members.insert(id, true);\n" +
      "```\n\n" +
      "**順番が大事です。** 先に `assert` で弾き、通った場合だけ `insert` する。\n" +
      "逆に書くと、入れてから「入ってるからダメ」と言うことになり、必ず失敗します。\n\n" +
      "そして `disclose` がまた出てきます。\n" +
      "`members` は公開台帳なので、そこに入れるキーは公開されます。\n" +
      "入れてよいのは②で作った**ハッシュ済みの名札**であって、秘密鍵ではありません。",
  },
  explanation:
    "`Map<K, V>` は ledger に置ける名簿型で、`.member(k)` で存在確認、`.insert(k, v)` で追加、`.lookup(k)` で取得します。" +
    "`assert(条件, \"メッセージ\")` は条件が偽のときトランザクション全体を失敗させます。" +
    "通常の言語の早期 return と違い、途中まで書き込まれた状態が残ることはありません。" +
    "そのため「重複を弾く」「権限が無ければ止める」といった前提条件は、分岐ではなく assert で表現します。" +
    "Map のキーや値は公開台帳に載るため、入れる値は disclose を通す必要があり、" +
    "そこに置いてよいのは秘密そのものではなくハッシュ化した派生値です。",

  starterCode: `// bboard.compact
//
// ②で作った会員登録を、名簿（Map）にして二重登録を防ぎます。

pragma language_version 0.23;
import CompactStandardLibrary;

// 1. 会員名簿を宣言してください。
//    名前は members、型は Map<Bytes<32>, Boolean> です。
//    （Bytes<32> の名札をキーに、登録済みかどうかを値に持ちます）


// 何人登録したか（公開）。
export ledger memberCount: Counter;

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "member:"), sk]);
}

export circuit register(): [] {
  const id = disclose(publicKey(localSecretKey()));

  // 2. すでに登録済みなら止めてください。
  //    assert を使い、members に id が居ないことを条件にします。
  //    メッセージは "already registered" とします。


  // 3. 名簿に追加し、人数を1増やしてください。


}
`,

  modelAnswer: `// bboard.compact
//
// 会員名簿。同じ人は2回登録できない。

pragma language_version 0.23;
import CompactStandardLibrary;

// Map はキーと値の名簿。
// キーは②で作ったハッシュ済みの名札なので、
// 台帳に並んでも本人を逆算されることはない。
export ledger members: Map<Bytes<32>, Boolean>;

export ledger memberCount: Counter;

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "member:"), sk]);
}

export circuit register(): [] {
  // 公開してよいのはハッシュ済みの名札だけ。
  const id = disclose(publicKey(localSecretKey()));

  // assert は「前提条件」。偽なら取引がまるごと失敗する。
  // if で分岐して何もせず return するのとは違い、
  // 途中まで書き込まれた状態が残らない。
  assert(!members.member(id), "already registered");

  // assert を通ったときだけここに来る。
  // 順番が逆だと、入れてから「入っている」と怒ることになり必ず失敗する。
  members.insert(id, true);
  memberCount.increment(1);
}
`,

  hints: [
    {
      level: 1,
      text: "宣言を1つと、`register` の中に2〜3行足します。中で使うのは `assert` と `members.member(...)` と `members.insert(...)` です。",
    },
    {
      level: 2,
      text: "名簿は `export ledger members: Map<Bytes<32>, Boolean>;` です。「居ないこと」を条件にするので、`members.member(id)` の前に `!` を付けます。",
    },
    {
      level: 3,
      text: "`assert(!members.member(id), \"already registered\");` を書き、その後に `members.insert(id, true);` と `memberCount.increment(1);` を続けます。assert が先、insert が後です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-03-1",
      description: "pragma があり、括弧が閉じているか？",
      verify: { kind: "compact-parse" },
    },
    {
      id: "cp-cp-03-2",
      description: "会員名簿を `Map` で宣言したか（1件しか持てない型になっていないか）？",
      verify: { kind: "compact-ledger", name: "members", type: "Map" },
    },
    {
      id: "cp-cp-03-3",
      description: "`assert` で前提条件を書いたか（分岐ではなく取引を失敗させる）？",
      verify: { kind: "compact-calls", name: "assert" },
    },
    {
      id: "cp-cp-03-4",
      description: "すでに登録済みかを `members.member(...)` で確かめたか？",
      verify: { kind: "compact-calls", name: "members.member" },
    },
    {
      id: "cp-cp-03-5",
      description: "名簿に追加したか？",
      verify: { kind: "compact-calls", name: "members.insert" },
    },
    {
      id: "cp-cp-03-6",
      description: "名簿に入れているのはハッシュ済みの名札か（秘密鍵ではないか）？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-03-7",
      description:
        "assert が失敗したとき、途中まで書き込まれた状態が残らないのはなぜか説明できるか？",
    },
  ],

  tags: ["Compact", "Midnight", "assert", "Map", "二重登録", "前提条件"],
  relatedIds: ["cp-02-witness-secret", "cp-04-authorization"],
};
