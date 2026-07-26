"use client";

// ─────────────────────────────────────────────────────────────
// Svelte 採点エンジン（単一ファイル）
//
// TypeScript の採点は「型について型で問う」方式だったが、Svelte で
// 確かめたいことは型では一切問えない。
//   ・$state を使ったか（使わないと画面が更新されない）
//   ・$derived の代わりに $effect で同期していないか
//   ・{#each} に key があるか（無いと並べ替えでずれる）
//   ・a11y の警告が出ていないか
// これらはコンパイラの AST と警告で判定する。
//
// 判定ロジック本体は curriculum/checks.ts にある（ハーネスと共有）。
// ─────────────────────────────────────────────────────────────

import type { Checkpoint, CheckSpec } from "@curriculum/types";
import { runCheck, isSvelteSpecKind } from "@curriculum/checks";
import type { CheckResult } from "./browserEngine";
import { loadSvelteApi } from "./kitEngine";

/** 単一ファイル教材の仮想パス。.svelte として解析させる */
const MAIN = "main.svelte";

export function isSvelteSpec(spec: CheckSpec): boolean {
  return isSvelteSpecKind(spec.kind);
}

/** 1件のチェック仕様を判定する */
export async function runSvelteCheck(
  source: string,
  spec: CheckSpec
): Promise<{ pass: boolean; message?: string }> {
  const api = await loadSvelteApi();
  return runCheck(api, { [MAIN]: source }, spec, MAIN);
}

/** チェックポイント群を採点する */
export async function gradeSvelteCheckpoints(
  source: string,
  checkpoints: Checkpoint[]
): Promise<CheckResult[]> {
  const api = await loadSvelteApi();
  const files = { [MAIN]: source };
  return checkpoints.map((cp) => {
    if (!cp.verify || !isSvelteSpec(cp.verify)) {
      return {
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      };
    }
    const { pass, message } = runCheck(api, files, cp.verify, MAIN);
    return { id: cp.id, description: cp.description, graded: true, pass, message };
  });
}
