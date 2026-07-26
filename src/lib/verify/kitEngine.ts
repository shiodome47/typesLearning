"use client";

// ─────────────────────────────────────────────────────────────
// SvelteKit 採点エンジン（複数ファイル）
//
// 判定ロジック本体は curriculum/checks.ts にある。
// ここはブラウザ向けの薄い層で、svelte/compiler の遅延ロードだけを担う。
// 検証ハーネス（scripts/verify-curriculum.mjs）も同じ checks.ts を使うので、
// CI で通った採点仕様はブラウザでも同じ結果になる。
// ─────────────────────────────────────────────────────────────

import type { Checkpoint, CheckSpec } from "@curriculum/types";
import {
  runCheck,
  isKitSpecKind,
  isSvelteSpecKind,
  type FileMap,
  type SvelteApi,
} from "@curriculum/checks";
import type { CheckResult } from "./browserEngine";

// svelte/compiler は重いので、最初に必要になった時点で読み込む
let apiPromise: Promise<SvelteApi> | null = null;

export function loadSvelteApi(): Promise<SvelteApi> {
  if (!apiPromise) {
    apiPromise = import("svelte/compiler").then(
      (m) => ({ parse: m.parse, compile: m.compile }) as unknown as SvelteApi
    );
  }
  return apiPromise;
}

/** 複数ファイル教材でこのエンジンが扱える採点仕様か */
export function isKitGradable(spec: CheckSpec): boolean {
  return isKitSpecKind(spec.kind) || isSvelteSpecKind(spec.kind);
}

/**
 * チェックポイント群を採点する。
 * defaultFile は file を省略した svelte-* 仕様の対象になる。
 */
export async function gradeKitCheckpoints(
  files: FileMap,
  checkpoints: Checkpoint[],
  defaultFile: string
): Promise<CheckResult[]> {
  const api = await loadSvelteApi();
  return checkpoints.map((cp) => {
    if (!cp.verify || !isKitGradable(cp.verify)) {
      return {
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      };
    }
    const { pass, message } = runCheck(api, files, cp.verify, defaultFile);
    return { id: cp.id, description: cp.description, graded: true, pass, message };
  });
}
