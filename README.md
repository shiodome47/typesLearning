# 判断力トレーニング（TypeScript / Svelte / Compact / Effect）

手本を見てゼロから書く「白紙練習」と、**欠陥のあるコードを読んで危険を見抜く「診断」** を行う学習アプリ。
TypeScript 48件（スクラッチ編 11件を含む）・Svelte 31件（SvelteKit 編 9件・ガードレール編 6件を含む）・
Compact 9件・Effect 5件を1つのアプリで扱い、一覧で切り替えられる。

## 学習コンセプト

書けることは出発点であって、ゴールではありません。実務で価値になるのは
**書かれたコードを信用してよいか判断できること**です。本アプリは2種類の練習を用意しています。

| モード | 流れ | 鍛えるもの |
|--------|------|-----------|
| **白紙練習**（write） | 読む → 理解する → 手本を隠す → ゼロから書く → 自動採点 | 型を自分で構築する力 |
| **診断**（diagnose） | 症状を読む → 欠陥コードを読む → 危険を見抜く → 修正して自動採点 | 書かれたコードを評価する力 |
| **複数ファイル**（project） | ファイルタブを切り替えながら1本のアプリを作り上げる | **どのファイルに書くか**を判断する力 |

診断モードが扱うのは「**型チェックは通るのに本番で落ちる**」コードです。
`as` による偽りの型付け、SSR で存在しない `window`、`any` の漏洩、網羅性チェックの欠落など、
型が守ってくれない領域を意図的に扱います。

## 学習の手引き（`/guide`）

`/guide` に「どの順番で、何時間かけると、何ができるようになるか」をまとめてあります。
8段階のロードマップで、各段階に **到達点** と **次へ進む目安** を置いています。

件数と所要時間は `TIER_LESSONS` から計算しているため、教材を追加しても数字がずれません。

## 「なぜ必要か」を先に置く

各レッスンは `why` を必須で持ちます。仕組みの説明（`explanation`）より**前**、画面の最上部に表示されます。

```ts
why: {
  problem: string;  // その道具が無いと何が起きるのか。具体的な失敗の物語
  insight: string;  // その道具は結局なにをしてくれるのか。定義ではなく直感で
}
```

正しいだけの説明は理解を生みません。「`never` は到達できない値の型です」は定義であって直感ではなく、
読んでも「なぜこれを使うのか」が分かりません。そこで仕組みを説明する前に、
**その仕組みが無いと実際に何が起きるのか**を具体的な場面で伝えます。

執筆の原則:

- **抽象的なまとめを書かない** — ×「分岐漏れが生じやすい」 ○「レシートの支払い方法が空欄のまま客に渡り、問い合わせが来て初めて気づく」
- **problem は具体的な場面で** — 誰が何をして、何が起きて、いつ気づくのか
- **用語は定義ではなく直感で** — ×「到達できない値の型」 ○「もう何も残っていない、という意味の型」
- 段落は `\n\n` で区切る。コード片はバッククォートで囲む
- 強調は `**...**`、複数行のコードは ``` で囲む（`why` のみ対応）

見本は `curriculum/phase5-advanced-patterns/ts-20-exhaustive-check.ts` と
`curriculum/phase3-real-app/ts-15-api-fetch.ts` にあります。

## 4つの言語、4つの目的

同じアプリですが、力を入れる場所が違います。

| | TypeScript | Svelte | Compact | Effect |
|---|---|---|---|---|
| 目的 | **読んで判断できる**こと＋**白紙から組み立てられる**こと | **手が覚えている**こと（AIが使えないときの保険） | **公開してよいか判断できる**こと | **握りつぶしを見抜ける**こと |
| 構文の暗記 | 不要 | 中核だけは必要 | 不要（構文は小さい） | 不要（核だけ） |
| 診断の比率 | 5/48 | 8/31（「動くが間違っている」が多いため） | 2/9 | 2/5 |
| 件数 | 37 + スクラッチ編 11 | 16 + SvelteKit 編 9 + ガードレール編 6 | 9 | 5 |

Compact だけ目的が違うのは、**間違いが取り消せない**からです。
型の誤りは直せば済み、画面の崩れは作り直せますが、公開台帳に載った秘密は消せません。

## スクラッチ編（starter にコードが1行も無い）

他の章はすべて `starter` に穴埋めの枠を用意しています。これは「白紙のファイルを前にして
何も書けない」という壁を越えられません。構文を全部知っていても起きる壁で、
教材が扱ってこなかった領域です。

そこでこの章だけは **`starter` に要件のコメントしか書かず、コードを1行も置きません**。

**各回で新しいことは1つだけ**にしてあります。

| 回 | 書くもの | その回の新しいこと |
|---|---|---|
| ① | `Todo` 型 | 最初の1行を何にするか |
| ② | `createTodo`（id は固定） | アロー関数でオブジェクトを返す（`return` が要る） |
| ③ | id を毎回変える | 関数の外に変数を置く / `let` / `String()` |
| ④ | `addTodo` | スプレッド構文 `[...list, x]`。元を壊さない |
| ⑤ | `toggleTodo` | `map` で1件だけ差し替える |
| ⑥ | `removeTodo` | `filter` は「残す条件」を書く |
| ⑦ | `activeTodos` / `remainingCount` | 計算できる値は持たない |
| ⑧ | `saveTodos` / `loadTodos` | `localStorage` / 早期 return |
| ⑨ | 壊れても落ちない | `try` / `catch` / `unknown` |
| ⑩ | 形を確かめる | 型ガード `v is Todo` |
| ⑪ | **卒業試験** | 要件だけ。順番も渡さない |

最初は6件でしたが、①が「型」と「関数」を同時に要求し、しかも
**説明していない書き方**（`=> ({...})` / 省略記法 / `++` / `export`）を使っていたため
**手本すら読めない**状態でした。刻み直した結果が11件です。

手本では省略記法を使いません。`text: text` と書き、`return` を省きません。
**短く書けることは知識として要らず、読めることが要る**という判断です。

⑪が本番です。①〜⑩では順番をこちらが決めていましたが、⑪では要件を全部並べるだけです。
**手本を開かずに書き切れたら「作れる」ということ**、というのがこの章の到達点です。

### 実行して採点する（`kind: "run"`）

この章では型だけでは採点になりません。

```ts
const addTodo = (list: Todo[], text: string): Todo[] => list;  // 型は合う。何もしない
```

型検査は通ります。つまり型だけを見る採点は**嘘をつきます**。
そこで学習者コードを JS に変換して実行し、挙動を確かめます。

```ts
{ kind: "run", assert: `var r = addTodo([], "牛乳");
assertEqual(r.length, 1, "1件になる");` }
```

`assertEqual` / `assertTrue` / `assertThrows` と `localStorage` のシムは
`RUN_PRELUDE`（`curriculum/verifySupport.ts`）に置き、ブラウザと Node で共有します。
ブラウザは Monaco の `getEmitOutput`、Node は `ts.transpileModule` + `vm` で走らせるため、
CI で通れば実際の採点でも同じ結果になります。

検証ハーネスは実行採点についても **「模範解答で通り、starter では落ちる」** の両側を見ます。

### SvelteKit 編（連続チュートリアル）

Svelte 本体の 16 件とは性質が違い、**1つの物件サイトを ①→⑨ で作り上げる連続チュートリアル**です。

案件で実際に詰まるのは Svelte の文法ではなく「どのファイルに書くか」です。
特に `.server.` の有無で決まる**サーバー / ブラウザの境界**は、間違えても
エラーが出ないまま API キーが全世界に配られるため、1画面のエディタでは原理的に練習できません。
そのため `ProjectLesson`（複数ファイル）という第3のモードを用意しています。

| 回 | 作るもの | 扱う仕組み |
|---|---|---|
| ① | 物件サイトの2ページ | ファイルベースルーティング |
| ② | 一覧をサーバーから取得 | `+page.server.ts` / `load` / SSR |
| ③ | 物件詳細ページ | 動的ルート `[id]` / `params` / `error(404)` |
| ④ | **APIキーが漏れる事故** | サーバー境界（import と `load` の戻り値の2経路） |
| ⑤ | 共通ヘッダー | `+layout.svelte` / `{@render children()}` |
| ⑥ | 問い合わせフォーム | form actions / `fail` / 段階的強化 |
| ⑦ | 送信を滑らかに | `use:enhance` |
| ⑧ | 管理者ログイン | `hooks.server.ts` / `locals` / `redirect` |
| ⑨ | 診断：納品してよいか | 秘密の漏洩・XSS・キー欠落・保護漏れ |

### ガードレール編（連続チュートリアル）

SvelteKit 編で **目で** 見つけた地雷を、今度は **機械に** 見つけさせる章です。

AIが1日に数百行書く前提に立つと「レビュー能力を上げる」戦略は量が増えた時点で破綻します。
人間の精度はコード量に対して一定ですが、型と Lint は何行来ても同じ精度で見ます。

| 回 | 作るもの | どの回の回収か |
|---|---|---|
| ① | `$types` で `load` に型を付ける | sk-02 / sk-03（引数を手書きしていた） |
| ② | `app.d.ts` で `locals` に型を付ける | sk-08（`locals.usre` が素通りする） |
| ③ | ESLint でキー忘れと `{@html}` を止める | sv-09 / sk-09（目で探していた） |
| ④ | `svelte-check` を CI に載せる | `.svelte` が `tsc` の対象外である話 |
| ⑤ | `formData` の値を検証してから使う | ts-15（境界の検証） |
| ⑥ | 診断：Lintも型も通るのに残る問題 | 総合 |

⑥の到達点は **「機械が止められないものが3つに絞られる」** ことです（秘密・認可・仕様）。
「全部を注意深く読む」は不可能でも、「この3つだけを毎回見る」なら200行来ても続きます。

## Compact 編（Midnight / 現 LFDT Minokawa）

Compact は Midnight のスマートコントラクト言語です。
言語自体は Linux Foundation Decentralized Trust に移管され、プロジェクト名は **Minokawa** になりましたが、
コード中のキーワードは `ledger` / `circuit` / `witness` / `disclose` のまま変わりません。

①→⑨で会員制の掲示板とオークションを作り上げる連続チュートリアルです。

| 回 | 作るもの | 扱う仕組み |
|---|---|---|
| ① | 公開カウンター | `ledger` / `circuit`（全部公開でよい世界） |
| ② | 会員登録 | `witness` / `persistentHash`（名前を付けずに identify する） |
| ③ | 二重登録の防止 | `assert` / `Map`（前提条件は分岐ではなく assert） |
| ④ | **本人だけが消せる** | 鍵を渡さずに本人だと証明する |
| ⑤ | 年齢制限 | 選択的開示（生年は伏せて「18歳以上」だけ示す） |
| ⑥ | **dApp として動かす** | 3層の責務分担（`.compact` / `witnesses.ts` / UI） |
| ⑦ | 診断：納品してよいか | 秘密鍵が台帳に載っている |

①で「全部公開でよい世界」を書いてから②で秘密が登場するので、**何が増えたのか**が差分で見えます。
④で教えた認可の作法を⑨の診断で回収する構造は、SvelteKit 編の sk-04 → sk-09 と同じです。

⑧は複数ファイル教材（`ProjectLesson`）です。`witness` は `.compact` では**宣言だけ**で、
実装は利用者の端末で動く `witnesses.ts` にあります。この分離が Midnight の要で、
秘密鍵をサーバーに置いた瞬間に ZK の意味が消えるため、「どのファイルに置くか」を練習させます。
1 レッスンの中で `compact-*` と `kit-*` の採点仕様を混ぜて使えます。

診断が2つあるのは、**見落とす層が2つある**からです。
⑨は「秘密そのものを公開した」という分かりやすい事故ですが、
⑦は**秘密を1バイトも公開していないのに特定される**という話を扱います。

| | ⑦ 開示しすぎ | ⑨ 秘密の漏洩 |
|---|---|---|
| `disclose` の中身 | 正しい（事実だけ） | 誤り（生の秘密） |
| レビューで気づくか | **通過してしまう** | 指摘できる |
| 何が起きるか | 繰り返しと名寄せで特定される | 直接なりすまされる |

⑦の要点は2つです。**判定は `assert` で済ませ `ledger` に残さない**（残すと取引のたびに積み上がる）ことと、
**識別子に用途を混ぜる**（`pad(32, "auction:pk:")`）ことです。
後者が無いと、同じ鍵から作った識別子が他アプリでも同じ値になり、履歴を突き合わせられます。

この編を入れた理由は、SvelteKit 編と**同じ構図が言語仕様のレベルで現れる**からです。

| | SvelteKit 編 | Compact 編 |
|---|---|---|
| 事故 | APIキーがブラウザに配られる | 秘密鍵が公開台帳に載る |
| 境界 | ファイル名の `.server.` | `disclose(...)` |
| 気づけるか | エラーは出ない | エラーは出ない |

Compact は **引数と `witness` が既定で private** で、`disclose(...)` を通したものだけが公開されます。
つまり公開事故は必ず `disclose` の位置に現れます。見る場所が1か所に定まるので、
「何を公開し、何を秘匿し、何を証明するか」という判断そのものを教材にできます。

肝は「秘密を渡すこと」と「秘密を知っていると証明すること」の区別です。

```
owner = disclose(localSecretKey());                   // 生の鍵が台帳に載る = 事故
owner = disclose(publicKey(localSecretKey(), seq));   // ハッシュ済みの派生値 = 正しい
```

どちらも本人確認は成立し、テストも通ります。違うのは鍵が漏れるかどうかだけです。

### 採点はコンパイラ無しの構造チェック

Compact は TypeScript としても Svelte としてもパースできず、ブラウザで動くコンパイラもありません。
しかし採点したいのは文法の暗記ではなく境界の設計判断なので、構造で十分に問えます。

```ts
{ kind: "compact-ledger", name: "round" }                          // public state を宣言したか
{ kind: "compact-witness", name: "localSecretKey" }                // 秘密の入口が残っているか
{ kind: "compact-discloses", value: "localSecretKey", expect: false } // 生の秘密を公開していないか
{ kind: "compact-discloses", value: "publicKey" }                  // 派生値なら公開してよい
```

`compact-discloses` は**入れ子の深さ**を見ます。`disclose(publicKey(sk, seq))` の `sk` は
「公開されていない」と判定されるため、正解を誤って落とすことがありません。
教材コードは公式の [example-counter](https://github.com/midnightntwrk/example-counter) と
[example-bboard](https://github.com/midnightntwrk/example-bboard) を土台にしています。

## Effect 編

一覧では独立した言語タブとして扱います（採点は TypeScript の型診断をそのまま使いますが、
学習の目的も進め方も TypeScript 編とは別物なので、混ぜると埋もれます）。

Effect は学習コストが高く、全体を手で覚えるのは割に合いません。
そこで**白紙練習では攻めず、診断に寄せて核だけ**を扱います。

Effect を使う理由は結局1つで、`Effect<成功する値, 起きうるエラー, 必要な依存>` の
**2つ目の型引数**に尽きます。`Promise<User>` が「User が返る」しか言わないのに対し、
`Effect<User, NetworkError | ParseError>` は「2通りに失敗する」まで言い、
処理しなければコンパイルが通りません。

逆に言えば **Effect を使いながらエラー型を `never` に潰す**書き方が存在します。

```ts
Effect.tryPromise(() => fetch(url))                  // catch 無し → UnknownException
Effect.catchAll(self, () => Effect.succeed(null))    // 握りつぶし → エラー型が never
```

どちらもコンパイルは通り、`Effect.gen` も型注釈もあるので、レビューでは正しく見えます。
**型を通すために型を弱めるのは AI が最も自然にやる修正**なので、診断の題材として強い。
だからこの編は5件で、②と⑤の診断2件が本命です。

| 回 | 扱うもの | 型がどう動くか |
|---|---|---|
| ① | 失敗を型に出す | `Promise<User>` → `Effect<User, NetworkError \| ParseError>` |
| ② | **診断：失敗が消えている** | `never` / `UnknownException` を探す |
| ③ | 依存を型に出す | 3番目が埋まるまで実行できない |
| ④ | リトライとタイムアウト | リトライは型が**変わらず**、タイムアウトは**増える** |
| ⑤ | **診断：依存が型から消えている** | `never` が「埋めた結果」か「消した結果」か |

④の要点は型の動き方の差です。リトライしても失敗は消えない（＝型が変わらない）のに対し、
タイムアウトは「時間切れ」という失敗を新しく生むのでエラー型が増えます。
`Promise` ではどちらも `Promise<User>` のままで、この差が見えません。

⑤が問うのは `R` が空の Effect を見たときの判断です。**「この空は、埋めた結果か、消した結果か」**。
モジュール外の値を直接使えば `R` は最初から空のまま本物に繋がり、
`R` を `any` にしたり `as any` を付ければ安全装置ごと消えます。
どちらも `never` に見えるので区別がつきません。
`never` は「依存が無い」ではなく「もう全部渡した」という意味である、というのが到達点です。

### effect 本体は持ち込まない

`effect` パッケージは数百ファイルあるためブラウザには入れず、
React シムと同じ考え方で**最小の型シム**（`EFFECT_SHIM`）を置いています。
問うのは API の網羅ではなく「失敗と依存が型に出ているか」の1点なので、これで足ります。
採点は既存の TypeScript 型診断をそのまま使い、新しいエンジンは要りません。

```ts
{ kind: "type", assert: `type _c = Expect<Equal<ReturnType<typeof getUser>,
  Effect.Effect<User, NetworkError | ParseError>>>;` }
```

## 自動採点

確認ポイントは自己申告ではなく、**機械的に判定**されます。サーバーも外部APIも使わず、ブラウザ内で完結します。
ただし判定方法は言語で根本的に違います。

### TypeScript: 型について型で問う

学習者のコードに「隠しアサーション」を連結し、Monaco 同梱の TypeScript ワーカーで診断を取得します。

```ts
// 例: getTodo の戻り値が Todo | undefined になっているか
type _c = Expect<Equal<ReturnType<typeof getTodo>, Todo | undefined>>;
```

2種類の判定があります。

- `kind: "type"` … 診断が出なければ合格（意図した型になっている）
- `kind: "expect-error"` … 診断が**出れば**合格（不正な使い方を型で弾けている）

> **注意**: `any` の検出は「値が使えるか」では判定できません。`any` は何でも通すためです。
> 必ず `Expect<Equal<typeof x, 具体型>>` のように**型の同一性そのもの**を問う必要があります。

### Svelte: AST とコンパイラ警告で問う

Svelte で確かめたいこと（`$state` を使ったか、`$derived` の代わりに `$effect` で同期していないか、
`{#each}` に key があるか）は**型では一切問えません**。`svelte/compiler` の AST と警告で判定します。

```ts
{ kind: "svelte-ast", query: "each:keyed" }          // 全ての {#each} に key があるか
{ kind: "svelte-ast", query: "effect:no-assignment" } // $effect の中で代入していないか
{ kind: "svelte-no-warning", code: "a11y_missing_attribute" }
{ kind: "svelte-compile" }                            // コンパイルが通るか
```

Svelte はコンパイラが a11y の問題を**警告として出す**ため、React には無い採点材料が最初からあります。
これがそのまま「ガードレール」の教材になります。

## 技術スタック

- **Next.js 15** (App Router)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v3**
- **Monaco Editor**（エディタ兼、採点用の型チェッカー）
- 進捗保存: **localStorage**（サーバー不要・env不要）

## セットアップ

```bash
npm install
npm run dev     # http://localhost:3000
```

### 検証コマンド

```bash
npm run type-check         # アプリ本体の型チェック
npm run verify:curriculum  # 教材コードの検証 + 採点仕様の検証（全言語）
npm run audit:diagrams     # 図解リンクの整合性
npm run build              # 本番ビルド

# 実ブラウザ確認（playwright が必要。CI には入れていない）
npm run smoke:e2e          # TypeScript 側
npm run smoke:svelte       # Svelte 側
npm run smoke:sveltekit    # SvelteKit / ガードレール 側（複数ファイル採点）
npm run smoke:compact      # Compact 側（構造採点）
npm run smoke:effect       # Effect 側（型診断・シム経由）
npm run smoke:scratch      # スクラッチ編（実行採点）
npm run audit:markup       # 教材テキストの記法が画面で解釈されているか
```

`verify:curriculum` は重要です。教材の `starterCode` / `modelAnswer` は**テンプレート文字列なので
`tsc` の対象外**であり、放置すると模範解答がコンパイルできない状態に気づけません。
このハーネスが以下を保証します。

1. 全レッスンの模範コードに型エラーが無いこと
2. 各 `checkpoint.verify` が模範解答に対して正しく合格すること（採点仕様自体の正しさ）
3. `relatedIds` が実在する教材を指していること
4. 診断レッスンの欠陥コードが**型チェックを通ること**（型で気づけては診断練習にならない）
5. 複数ファイル教材で、採点仕様が **starter のままなら落ちること**
   （常に合格する採点は検証として無意味なので、合格側と不合格側の両方を見る）
6. Compact 教材でも同じく、模範解答で全項目に合格し、**starter / 欠陥コードでは落ちること**

ブラウザ側の採点と同じ React シム・同じ前提（`curriculum/verifySupport.ts`）を使い、
Svelte / SvelteKit の判定ロジックも同じ実装（`curriculum/checks.ts`）を共有するため、
ここで通れば実際の採点でも同じ結果になります。

## ファイル構成

```
typesLearning/
├── curriculum/                     # 教材データ
│   ├── types.ts                    # Lesson は kind / language による判別可能Union
│   ├── verifySupport.ts            # 採点の共通前提（ブラウザ/Node で共有）
│   ├── checks.ts                   # Svelte/SvelteKit 採点ロジック本体（ブラウザ/Node で共有）
│   ├── phase1-type-basics/ 〜 phase6-modern-ts/
│   ├── phase7-judgment/            # 回収レッスン + 診断レッスン
│   ├── svelte/                     # Svelte 5（runes）16件
│   ├── sveltekit/                  # SvelteKit 編 9件（連続チュートリアル）
│   ├── guardrails/                 # ガードレール編 6件（型・Lint・CI）
│   ├── scratch/                    # スクラッチ編 11件（starter が空）
│   ├── compact/                    # Compact 編 9件（連続チュートリアル）
│   └── effect/                     # Effect 編 5件（独立言語。採点は TS の型診断）
├── scripts/
│   └── verify-curriculum.mjs       # 教材検証ハーネス（CI で実行）
└── src/
    ├── app/lesson/[id]/
    │   ├── PracticeClient.tsx      # kind で振り分け（assertNever で分岐漏れ検出）
    │   ├── WritePractice.tsx       # 白紙練習モード
    │   ├── DiagnosePractice.tsx    # 診断モード
    │   └── LessonChrome.tsx        # 両モード共通の表示部品
    ├── components/
    │   ├── CheckpointPanel.tsx     # 自動採点 UI
    │   └── ...
    ├── hooks/
    │   ├── useProgress.ts          # 進捗管理（保存はデバウンス）
    │   └── useEditorPrefs.ts       # テーマ・型エラー表示
    └── lib/
        ├── labels.ts               # Record<Category,...> で追加漏れを型で検出
        ├── studyGuide.ts           # 言語ごとのランク分け（分類漏れをCIで検出）
        ├── monaco/setup.ts         # TS 設定・React シム・インスタンス共有
        └── verify/
            ├── browserEngine.ts    # TypeScript 採点（型診断）
            ├── svelteEngine.ts     # Svelte 採点（単一ファイル）
            ├── kitEngine.ts        # SvelteKit 採点（複数ファイル）
            ├── compactEngine.ts    # Compact 採点（構造チェック・コンパイラ不要）
            └── runEngine.ts        # 実行採点（動かして結果を見る）
```

## 教材の追加方法

1. `curriculum/phaseN-*/ts-XX-topic.ts` を作成し、`WriteLesson` / `DiagnoseLesson` / `ProjectLesson` として定義
2. `kind` を必ず指定する（判別可能Unionの判別子）
3. フェーズの `index.ts` の配列に追加
4. `npm run verify:curriculum` で模範解答と採点仕様を検証
5. `npm run build` で確認

`checkpoint.verify` は任意です。付けない場合は従来どおり自己申告のチェックボックスになります。
**カバー率より正確さを優先**してください。検証できないものに無理に付けると誤判定になります。

## Vercel デプロイ

GitHub リポジトリを Vercel と連携すると自動デプロイされます。

## ライセンス

MIT
