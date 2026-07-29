"use client";

// ─────────────────────────────────────────────────────────────
// Compact 採点エンジン（Midnight / 現 LFDT Minokawa）
//
// 判定ロジック本体は curriculum/checks.ts にある。
// ここはブラウザ向けの薄い層。
//
// svelteEngine / kitEngine と違い、コンパイラを一切読み込まない。
// Compact は TypeScript でも Svelte でもパースできない独自言語であり、
// ブラウザで動く Compact コンパイラも無いため、構造チェックで採点する。
// 問いたいのは文法の暗記ではなく「何を公開し、何を秘匿するか」の
// 設計判断なので、宣言と disclose の構造が読めれば十分に採点できる。
//
// 検証ハーネス（scripts/verify-curriculum.mjs）も同じ checks.ts を使うので、
// CI で通った採点仕様はブラウザでも同じ結果になる。
// ─────────────────────────────────────────────────────────────

import type { Checkpoint, CheckSpec } from "@curriculum/types";
import { runCompactCheck, isCompactSpecKind } from "@curriculum/checks";
import type { CheckResult } from "./browserEngine";

/** このエンジンが扱える採点仕様か */
export function isCompactGradable(spec: CheckSpec): boolean {
  return isCompactSpecKind(spec.kind);
}

/** 単一ファイル教材でも複数ファイル教材でも同じ入口で採点する */
export function gradeCompactCheckpoints(
  files: Record<string, string>,
  checkpoints: Checkpoint[],
  defaultFile: string
): CheckResult[] {
  return checkpoints.map((cp) => {
    if (!cp.verify || !isCompactGradable(cp.verify)) {
      return {
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      };
    }
    const { pass, message } = runCompactCheck(files, cp.verify, defaultFile);
    return { id: cp.id, description: cp.description, graded: true, pass, message };
  });
}
