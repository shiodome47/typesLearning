import type { Lesson } from "../types";

export const lesson14: Lesson = {
  kind: "write",
  language: "typescript",
  id: "ts-14-error-handling",
  order: 14,
  title: "try/catch とエラー型",
  category: "error-handling",
  difficulty: 2,

  goal: "catch節のエラーを unknown 型として受け取り、instanceof で型を絞り込んで安全に扱えるようになる",

  why: {
    problem:
      "保存ボタンです。失敗したら理由を出す。書き方は決まりきっています。" +
      "`catch (e) { alert(\"エラー: \" + e.message); }`\n\n" +
      "だいたいの場合はうまくいきます。通信が切れたときは、ちゃんと「エラー: Failed to fetch」と出ます。\n\n" +
      "ところが、ある利用者から「エラー: undefined と出て何も分かりません」という問い合わせが来ます。" +
      "調べると、使っているライブラリの一部が `throw new Error(...)` ではなく `throw \"timeout\"` と" +
      "文字列を投げていました。文字列に `message` という項目は無いので `undefined` になります。\n\n" +
      "JavaScript の `throw` は何を投げても構いません。文字列も、数値も、`{ code: 500 }` のようなオブジェクトも。" +
      "つまり `catch` が受け取る値は「何が来るか本当に分からない値」です。" +
      "それを確かめずに `.message` と書くのは、中身を見ないまま箱を開けているのと同じです。\n\n" +
      "そして厄介なのは、この事故がエラー処理の中で起きることです。" +
      "本来なら原因を教えてくれるはずの場所が、原因を消してしまいます。" +
      "利用者にも開発者にも、何が起きたのか分かりません。",
    insight:
      "TypeScript が `catch` の値に付ける型は `unknown` です。" +
      "意地悪ではなく、事実をそのまま書いているだけです。何が投げられてくるか、本当に分からないのですから。\n\n" +
      "`unknown` は**中身を確かめるまで何にも使えない**型です。" +
      "`error.message` と書くと赤線が出ます。不便に見えますが、「確かめてから使え」と言われているだけです。\n\n" +
      "確かめ方が `error instanceof Error` です。" +
      "「この値は `Error` から作られたものですか」と実行時に聞きます。" +
      "true が返ったブロックの中でだけ、TypeScript はその値を `Error` として扱い、`.message` を許してくれます。\n\n" +
      "大事なのは `else` を書かされることです。「Error じゃなかったら何を出すか」を考えさせられます。" +
      "そこに「予期しないエラーが発生しました」と書いておけば、" +
      "少なくとも `undefined` が利用者に表示されることはありません。\n\n" +
      "`catch (error: any)` と書けば赤線は消えます。" +
      "ただしそれは問題を解いたのではなく、質問を黙らせただけです。投げられてくるものは何も変わりません。",
  },
  explanation:
    "TypeScript では `catch (error)` の `error` の型は `unknown` です。" +
    "`any` に逃がさず、`instanceof Error` で型を絞り込んでから `.message` にアクセスします。" +
    "カスタムエラークラスを使うと、エラーの種類を型で判別できます。" +
    "`unknown` を強制することで「エラーを握りつぶすミス」をコンパイル時に防げます。",

  starterCode: `// parseJSON関数を定義してください
// - 引数: jsonStr: string
// - 戻り値: unknown（パース結果）
// - JSON.parse を try/catch で囲む
// - catch 節では error を unknown として受け取り、
//   instanceof Error で絞り込んでから message を表示する
//   instanceof Error でなければ "Unknown error" と表示する

// 呼び出し例:
// parseJSON('{"name":"Alice"}');  // 成功
// parseJSON('invalid json');      // エラー
`,

  modelAnswer: `function parseJSON(jsonStr: string): unknown {
  try {
    const result: unknown = JSON.parse(jsonStr);
    console.log("パース成功:", result);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("パースエラー:", error.message);
    } else {
      console.error("Unknown error");
    }
    return null;
  }
}

parseJSON('{"name":"Alice"}'); // パース成功: { name: 'Alice' }
parseJSON("invalid json");     // パースエラー: Unexpected token...`,

  hints: [
    {
      level: 1,
      text: "`catch (error: unknown)` と書くと、TypeScriptが `error` を `unknown` 型として扱います。`.message` に直接アクセスするとエラーになります。",
    },
    {
      level: 2,
      text: "`if (error instanceof Error)` のブロック内では、TypeScriptが `error` を `Error` 型に絞り込むので `.message` が使えます。",
    },
    {
      level: 3,
      text: "`try { ... } catch (error: unknown) { if (error instanceof Error) { console.error(error.message); } else { console.error('Unknown error'); } }`",
    },
  ],

  checkpoints: [
    { id: "cp-14-1", description: "`catch (error: unknown)` と型注釈を明示できているか？" },
    { id: "cp-14-2", description: "`instanceof Error` で絞り込んでから `.message` にアクセスしているか？" },
    { id: "cp-14-3", description: "`instanceof Error` でない場合のフォールバック処理を書いているか？" },
    {
      id: "cp-14-4",
      description: "`any` を使わずに書けているか？",
      verify: {
        kind: "type",
        // any は値の使用可否では見抜けないので、型の同一性そのものを問う
        assert: `
type _c4a = Expect<Equal<Parameters<typeof parseJSON>[0], string>>;
type _c4b = Expect<NotAny<ReturnType<typeof parseJSON>>>;
type _c4c = Expect<Equal<ReturnType<typeof parseJSON>, unknown>>;`,
      },
    },
  ],

  tags: ["try", "catch", "unknown", "instanceof", "Error", "エラーハンドリング"],
  relatedIds: ["ts-13-async-await", "ts-15-api-fetch"],
};
