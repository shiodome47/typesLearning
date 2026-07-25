"use client";

// ─────────────────────────────────────────────────────────────
// 採点エンジン（ブラウザ側）
//
// Monaco に同梱された TypeScript ワーカーへ、学習者コード + 隠しアサーション
// を渡して型診断を取得し、チェックポイントを機械的に判定する。
// サーバーも外部APIも使わず、ブラウザ内で完結する。
// ─────────────────────────────────────────────────────────────

import type { Monaco } from "@monaco-editor/react";
import type { CheckSpec, Checkpoint } from "@curriculum/types";
import { PRELUDE, configureTypeScript } from "@/lib/monaco/setup";

export interface CheckResult {
  id: string;
  description: string;
  /** 自動採点されたか（verify が無いチェックポイントは false） */
  graded: boolean;
  pass: boolean;
  message?: string;
}

let seq = 0;

/** 学習者コード + アサーションを型診断にかけ、診断メッセージを返す */
async function diagnose(
  monaco: Monaco,
  learnerCode: string,
  assertCode: string
): Promise<string[]> {
  // 一時モデルは毎回ユニークな URI で作る（.tsx で JSX を解析させる）
  const uri = monaco.Uri.parse(`file:///__grade_${seq++}.tsx`);
  // 末尾の export {} で「モジュール」にする。
  // これが無いとスクリプト扱いになり、練習エディタ側のモデルと
  // グローバル宣言が衝突して Duplicate identifier になる。
  const source = `${PRELUDE}\n${learnerCode}\n${assertCode}\nexport {};`;
  const model = monaco.editor.createModel(source, "typescript", uri);
  try {
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await getWorker(uri);
    const [syn, sem] = await Promise.all([
      client.getSyntacticDiagnostics(uri.toString()),
      client.getSemanticDiagnostics(uri.toString()),
    ]);
    return [...syn, ...sem].map((d) =>
      typeof d.messageText === "string"
        ? d.messageText
        : (d.messageText?.messageText ?? "型エラー")
    );
  } finally {
    model.dispose();
  }
}

/** 1件のチェック仕様を判定する */
export async function runCheck(
  monaco: Monaco,
  learnerCode: string,
  spec: CheckSpec
): Promise<{ pass: boolean; message?: string }> {
  const messages = await diagnose(monaco, learnerCode, spec.assert);
  const hasError = messages.length > 0;
  // expect-error は「エラーが出れば合格」（不正な使い方を型で弾けている）
  const pass = spec.kind === "expect-error" ? hasError : !hasError;
  return { pass, message: messages[0] };
}

/**
 * チェックポイント群を採点する。
 * verify を持たないものは graded: false で返し、UI 側で自己申告に落とす。
 */
export async function gradeCheckpoints(
  monaco: Monaco,
  learnerCode: string,
  checkpoints: Checkpoint[]
): Promise<CheckResult[]> {
  configureTypeScript(monaco);
  const results: CheckResult[] = [];
  for (const cp of checkpoints) {
    if (!cp.verify) {
      results.push({
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      });
      continue;
    }
    const { pass, message } = await runCheck(monaco, learnerCode, cp.verify);
    results.push({
      id: cp.id,
      description: cp.description,
      graded: true,
      pass,
      message,
    });
  }
  return results;
}

/** 学習者コード自体に型エラーが無いかを確認する */
export async function checkCompiles(
  monaco: Monaco,
  learnerCode: string
): Promise<{ ok: boolean; messages: string[] }> {
  configureTypeScript(monaco);
  const messages = await diagnose(monaco, learnerCode, "");
  return { ok: messages.length === 0, messages };
}
