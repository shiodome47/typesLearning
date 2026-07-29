import type { Lesson } from "../types";

export const cpLesson07: Lesson = {
  kind: "project",
  language: "compact",
  id: "cp-07-dapp-wiring",
  order: 6,
  title: "⑥ dApp として動かす — 秘密はどのファイルに置くのか",
  category: "compact",
  difficulty: 4,

  goal: "コントラクト・witness 実装・UI の3層で責務を分け、秘密鍵を利用者の端末から出さずに dApp を組み立てられるようになる",

  why: {
    problem:
      "⑤までで、コントラクトは書けるようになりました。\n" +
      "しかし `.compact` ファイルだけでは**アプリになりません**。\n\n" +
      "②で `witness localSecretKey(): Bytes<32>;` と書きましたが、" +
      "あれは宣言だけで、中身がありません。\n" +
      "「利用者の秘密鍵を返す」と宣言はしたものの、**その鍵を実際にどこから持ってくるのかは書いていない**のです。\n\n" +
      "ここで多くの人が、素直にこう考えます。\n" +
      "「鍵はサーバーで管理して、必要なときに配ればいい」\n\n" +
      "この瞬間、Midnight を使う意味が消えます。\n\n" +
      "サーバーが鍵を持っているなら、サーバー管理者は全員になりすませます。" +
      "サーバーが落ちれば誰も本人証明できません。サーバーが侵害されれば全員の鍵が漏れます。\n" +
      "**ゼロ知識証明で必死に守ったものを、置き場所ひとつで台無しにできます。**\n\n" +
      "そしてこの失敗も、やはり動きます。テストも通ります。\n" +
      "「秘密鍵をどこに置いたか」は、動作からは分からないからです。",
    insight:
      "Compact の dApp は**3層**でできています。どの層に何を置くかが全てです。\n\n" +
      "**① `.compact`（コントラクト）** — チェーン上で動きます。" +
      "`witness` は「この値は外から来る」という**宣言だけ**を書きます。中身は書きません。\n\n" +
      "**② `witnesses.ts`（witness の実装）** — **利用者の端末で動きます**。" +
      "ここが宣言の中身にあたり、`privateState` から秘密鍵を取り出して返します。\n" +
      "**この値はチェーンにもサーバーにも送られません。** 証明を作るためだけに使われます。\n\n" +
      "**③ UI（画面）** — 利用者の端末で動きます。呼び出すだけで、鍵には触れません。\n\n" +
      "実装はこう書きます。\n\n" +
      "```ts\n" +
      "export const witnesses = {\n" +
      "  localSecretKey: ({ privateState }: WitnessContext<Ledger, BBoardPrivateState>):\n" +
      "    [BBoardPrivateState, Uint8Array] => [privateState, privateState.secretKey],\n" +
      "};\n" +
      "```\n\n" +
      "戻り値がタプルなのには理由があります。\n" +
      "**左が「更新後の private state」、右が「回路に渡す値」**です。\n" +
      "witness は値を返すだけでなく、利用者の手元の状態を書き換えることもできる。" +
      "この回では変更しないので、受け取った `privateState` をそのまま左に返します。\n\n" +
      "覚え方はこうです。\n\n" +
      "**`.compact` は「何が必要か」だけを言う。`witnesses.ts` が「どこから取るか」を答える。**\n\n" +
      "この分け方のおかげで、コントラクトは秘密の在り処を知らずに済みます。\n" +
      "知らないものは漏らせません。\n\n" +
      "判断に迷ったら、こう考えてください。\n" +
      "**「この値は利用者の端末から一歩でも外に出るか？」**\n" +
      "出てはいけないものは、`privateState` の中にだけ置きます。",
  },
  explanation:
    "Compact の dApp は、チェーン上で動くコントラクト（`.compact`）、利用者の端末で動く witness 実装（`witnesses.ts`）、" +
    "同じく端末で動く UI の3層で構成されます。" +
    "`witness` はコントラクト側では宣言のみで、実装は TypeScript 側が持ちます。" +
    "実装は `WitnessContext` から `privateState` を受け取り、`[更新後の privateState, 回路に渡す値]` というタプルを返します。" +
    "この値は証明の生成にのみ使われ、チェーンにもサーバーにも送信されません。" +
    "そのため秘密は利用者の端末から出ず、コントラクトは秘密の保管場所を知らないまま本人確認を成立させられます。" +
    "UI 層は契約を呼び出すだけで、秘密鍵を直接扱いません。",

  files: [
    {
      path: "contract/src/bboard.compact",
      role: "チェーン上で動く。witness は「宣言」だけを書く場所",
      starter: `// contract/src/bboard.compact
//
// チェーン上で動くコントラクト。
// ここに書いたものは全員が読めます。

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger owner: Bytes<32>;
export ledger message: Maybe<Opaque<"string">>;

// 1. 秘密鍵の入口を「宣言」してください。
//    名前は localSecretKey、戻り値は Bytes<32> です。
//
//    中身はここには書きません。
//    「この値は外から来る」と宣言するだけです。
//    実装は witnesses.ts 側にあります。


export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  // 2. 投稿者を記録してください。
  //    公開台帳なので、置いてよいのは派生値だけです。


  message = disclose(some<Opaque<"string">>(newMessage));
}
`,
      model: `// contract/src/bboard.compact
//
// チェーン上で動くコントラクト。
// 秘密が「どこに保管されているか」は、このファイルは知らない。
// 知らないものは漏らせない。

pragma language_version 0.23;
import CompactStandardLibrary;

export ledger owner: Bytes<32>;
export ledger message: Maybe<Opaque<"string">>;

// 宣言だけ。中身は witnesses.ts が持つ。
// このファイルが言っているのは「この値が必要だ」ということだけで、
// 「どこから取るか」は一切書いていない。
witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  // 公開台帳に載るのはハッシュ済みの派生値。
  // 秘密鍵そのものは、この行を通ってもチェーンには出ない。
  owner = disclose(publicKey(localSecretKey()));

  message = disclose(some<Opaque<"string">>(newMessage));
}
`,
    },
    {
      path: "contract/src/witnesses.ts",
      role: "利用者の端末で動く。宣言の「中身」を書く場所。秘密はここから外に出ない",
      starter: `// contract/src/witnesses.ts
//
// witness の実装。これは利用者の端末で動きます。
// ここで扱う値はチェーンにもサーバーにも送られません。

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "./managed/bboard/contract/index.cjs";

// 利用者の端末にだけ存在する状態。
export type BBoardPrivateState = {
  readonly secretKey: Uint8Array;
};

// 3. localSecretKey の中身を書いてください。
//
//    引数は { privateState } を受け取ります。
//    戻り値は [更新後の privateState, 回路に渡す値] のタプルです。
//    この回では privateState を変更しないので、受け取ったものをそのまま返します。
//
//    サーバーから取ってくる、といった実装をしてはいけません。
//    秘密鍵は利用者の端末から一歩も出さないのが原則です。
export const witnesses = {

};
`,
      model: `// contract/src/witnesses.ts
//
// witness の実装。利用者の端末で動く。
// ここで返す値は証明の生成にだけ使われ、
// チェーンにもサーバーにも送信されない。

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "./managed/bboard/contract/index.cjs";

// 利用者の端末にだけ存在する状態。
// サーバーは、この中身を一度も見ない。
export type BBoardPrivateState = {
  readonly secretKey: Uint8Array;
};

export const witnesses = {
  // 戻り値のタプルは [更新後の privateState, 回路に渡す値]。
  // witness は値を返すだけでなく、手元の状態を書き換えることもできる。
  // この回では変更しないので、受け取ったものをそのまま左に返す。
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, BBoardPrivateState>): [
    BBoardPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};
`,
    },
    {
      path: "bboard-ui/src/api.ts",
      role: "画面から呼ぶ層。すでに書かれている。鍵に触れていないことを確かめる",
      readOnly: true,
      starter: `// bboard-ui/src/api.ts
//
// 画面から契約を呼ぶ層。すでに書かれています。
// 読んで「鍵に触れていない」ことを確かめてください。

import { witnesses, type BBoardPrivateState } from "../../contract/src/witnesses";

export async function joinBoard(providers: Providers, address: ContractAddress) {
  // 契約に witnesses を渡す。
  // 実装（＝鍵の取り出し方）は witnesses.ts 側にあるので、
  // この層は鍵そのものを一度も見ない。
  return findDeployedContract(providers, {
    contractAddress: address,
    contract: new Contract(witnesses),
    privateStateId: "bboardPrivateState",
  });
}

export async function post(contract: DeployedContract, text: string) {
  // 引数は投稿内容だけ。鍵は渡さない。
  // 鍵が必要になるのは証明を作るときで、それは端末の中で完結する。
  return contract.callTx.post(text);
}
`,
      model: `// bboard-ui/src/api.ts
//
// 画面から契約を呼ぶ層。
// 鍵を引数で受け取っていないことに注目してください。

import { witnesses, type BBoardPrivateState } from "../../contract/src/witnesses";

export async function joinBoard(providers: Providers, address: ContractAddress) {
  // 契約に witnesses を渡す。
  // 実装（＝鍵の取り出し方）は witnesses.ts 側にあるので、
  // この層は鍵そのものを一度も見ない。
  return findDeployedContract(providers, {
    contractAddress: address,
    contract: new Contract(witnesses),
    privateStateId: "bboardPrivateState",
  });
}

export async function post(contract: DeployedContract, text: string) {
  // 引数は投稿内容だけ。鍵は渡さない。
  // 鍵が必要になるのは証明を作るときで、それは端末の中で完結する。
  return contract.callTx.post(text);
}
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "直す場所は3か所です。`.compact` に witness の宣言を1行、`post` の中に記録を1行、`witnesses.ts` に実装を1つ。宣言と実装がファイルをまたいで対になっている、という形を掴んでください。",
    },
    {
      level: 2,
      text: "`.compact` には `witness localSecretKey(): Bytes<32>;` と書きます。本体は書きません。`post` の中は `owner = disclose(publicKey(localSecretKey()));` です。",
    },
    {
      level: 3,
      text: "`witnesses.ts` は `localSecretKey: ({ privateState }: WitnessContext<Ledger, BBoardPrivateState>): [BBoardPrivateState, Uint8Array] => [privateState, privateState.secretKey],` を `witnesses` の中に書きます。左が更新後の状態、右が回路に渡す値です。",
    },
  ],

  checkpoints: [
    {
      id: "cp-cp-07-1",
      description: "コントラクトの構文は壊れていないか？",
      verify: { kind: "compact-parse", file: "contract/src/bboard.compact" },
    },
    {
      id: "cp-cp-07-2",
      description:
        "`.compact` 側で秘密の入口を「宣言」したか（中身は書かない）？",
      verify: {
        kind: "compact-witness",
        name: "localSecretKey",
        file: "contract/src/bboard.compact",
      },
    },
    {
      id: "cp-cp-07-3",
      description: "秘密鍵そのものを公開台帳に載せていないか？",
      verify: {
        kind: "compact-discloses",
        value: "localSecretKey",
        expect: false,
        file: "contract/src/bboard.compact",
      },
    },
    {
      id: "cp-cp-07-4",
      description: "公開しているのは派生値か？",
      verify: {
        kind: "compact-discloses",
        value: "publicKey",
        file: "contract/src/bboard.compact",
      },
    },
    {
      id: "cp-cp-07-5",
      description: "`witnesses.ts` 側に実装（`witnesses`）を書いたか？",
      verify: {
        kind: "kit-export",
        file: "contract/src/witnesses.ts",
        name: "witnesses",
      },
    },
    {
      id: "cp-cp-07-6",
      description:
        "実装は端末の `privateState` から取り出しているか（サーバーから取ってきていないか）？",
      verify: {
        kind: "kit-member",
        file: "contract/src/witnesses.ts",
        object: "privateState",
        property: "secretKey",
      },
    },
    {
      id: "cp-cp-07-7",
      description:
        "秘密の在り処（`secretKey`）が、チェーン側のファイルに漏れ出していないか？",
      verify: {
        kind: "compact-contains-string",
        file: "contract/src/bboard.compact",
        value: "secretKey",
        expect: false,
      },
    },
    {
      id: "cp-cp-07-8",
      description:
        "3層のどれかを指して「この層は秘密を見るか？」に即答できるか？",
    },
  ],

  tags: [
    "Compact",
    "Midnight",
    "dApp",
    "witness",
    "private state",
    "複数ファイル",
    "責務分担",
  ],
  relatedIds: [
    "cp-02-witness-secret",
    "cp-04-authorization",
    "cp-06-diagnose-secret-leak",
  ],
};
