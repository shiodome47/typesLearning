import type { Lesson } from "../types";

export const lesson14: Lesson = {
  id: "ts-14-error-handling",
  order: 14,
  title: "try/catch とエラー型",
  category: "error-handling",
  difficulty: 2,

  goal: "catch節のエラーを unknown 型として受け取り、instanceof で型を絞り込んで安全に扱えるようになる",
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
    { id: "cp-14-4", description: "`any` を使わずに書けているか？" },
  ],

  tags: ["try", "catch", "unknown", "instanceof", "Error", "エラーハンドリング"],
  relatedIds: ["ts-13-async-await", "ts-15-api-fetch"],
};
