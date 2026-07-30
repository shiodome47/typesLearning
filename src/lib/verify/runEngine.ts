"use client";

// ─────────────────────────────────────────────────────────────
// 実行採点エンジン（ブラウザ側）
//
// 学習者コードを Monaco 同梱の TypeScript ワーカーで JS に変換し、
// アサーションと一緒に実行する。例外が出なければ合格。
//
// なぜ型だけでは足りないか:
//   アプリを組み立てる練習では「動くか」が本質になる。
//   型だけを見る採点では `(list, text) => list` のように
//   「型は合っているが何もしない」実装が通ってしまい、
//   チェックポイントが嘘をつくことになる。
//
// 実行環境の前提（localStorage シム、assertEqual など）は
// curriculum/verifySupport.ts の RUN_PRELUDE に置き、
// 検証ハーネス（Node）と共有する。同じ前提で走るので結果が一致する。
// ─────────────────────────────────────────────────────────────

import type { Monaco } from "@monaco-editor/react";
import type { CheckSpec, Checkpoint } from "@curriculum/types";
import { RUN_PRELUDE, configureTypeScript } from "@/lib/monaco/setup";
import type { CheckResult } from "./browserEngine";

let seq = 0;

/** この仕様は実行採点か */
export function isRunSpec(
  spec: CheckSpec
): spec is Extract<CheckSpec, { kind: "run" }> {
  return spec.kind === "run";
}

/**
 * TypeScript を JS に変換する。
 * 型エラーがあっても emit はできるので、変換の失敗は構文エラーのときだけ。
 */
async function transpile(monaco: Monaco, source: string): Promise<string> {
  const uri = monaco.Uri.parse(`file:///__run_${seq++}.ts`);
  const model = monaco.editor.createModel(source, "typescript", uri);
  try {
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await getWorker(uri);
    const out = await client.getEmitOutput(uri.toString());
    const file = out.outputFiles?.[0];
    if (!file) {
      // ここに来るのは設定で emit が止められているとき。
      // configureTypeScript の noEmit を確認する。
      throw new Error(
        out.emitSkipped
          ? "コードを変換できませんでした（emit が無効）"
          : "コードを変換できませんでした"
      );
    }
    return file.text;
  } finally {
    model.dispose();
  }
}

/**
 * 1件の実行チェックを判定する。
 *
 * 学習者コードとアサーションを1つのソースに繋いでから変換する。
 * 別々に変換するとトップレベルの const がアサーション側から見えない。
 */
export async function runOne(
  monaco: Monaco,
  learnerCode: string,
  assertCode: string
): Promise<{ pass: boolean; message?: string }> {
  let js: string;
  try {
    js = await transpile(monaco, `${learnerCode}\n${assertCode}`);
  } catch (e) {
    return {
      pass: false,
      message: e instanceof Error ? e.message : "変換に失敗しました",
    };
  }

  try {
    // 学習者自身のコードを学習者のブラウザで走らせるだけなので、
    // サンドボックスは張らない。ただし無限ループは止められないため、
    // 練習コードは localStorage に自動保存している（失っても復帰できる）。
    new Function(`"use strict";\n${RUN_PRELUDE}\n${js}`)();
    return { pass: true };
  } catch (e) {
    return {
      pass: false,
      message: e instanceof Error ? e.message : "実行に失敗しました",
    };
  }
}

/** 実行採点だけを担当する（型採点は browserEngine 側） */
export async function gradeRunCheckpoints(
  monaco: Monaco,
  learnerCode: string,
  checkpoints: Checkpoint[]
): Promise<CheckResult[]> {
  configureTypeScript(monaco);
  const results: CheckResult[] = [];
  for (const cp of checkpoints) {
    if (!cp.verify || !isRunSpec(cp.verify)) {
      results.push({
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      });
      continue;
    }
    const { pass, message } = await runOne(monaco, learnerCode, cp.verify.assert);
    results.push({ id: cp.id, description: cp.description, graded: true, pass, message });
  }
  return results;
}
