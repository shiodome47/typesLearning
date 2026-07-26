"use client";

// ─────────────────────────────────────────────────────────────
// 確認ポイント
// verify を持つチェックポイントは TypeScript の型診断で自動採点する。
// 持たないものは従来どおり自己申告（チェックボックス）にする。
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import type { Checkpoint, LessonLanguage } from "@curriculum/types";
import { InlineCodeText } from "./InlineCodeText";
import { whenMonacoReady } from "@/lib/monaco/setup";
import { gradeCheckpoints, type CheckResult } from "@/lib/verify/browserEngine";
import { gradeSvelteCheckpoints } from "@/lib/verify/svelteEngine";

interface CheckpointPanelProps {
  checkpoints: Checkpoint[];
  /** 採点対象のコード */
  code: string;
  /** 言語によって採点エンジンが変わる */
  language: LessonLanguage;
  /** レッスンが変わったら結果を捨てるためのキー */
  resetKey?: string;
}

type Status = "idle" | "grading" | "done" | "error";

export function CheckpointPanel({
  checkpoints,
  code,
  language,
}: CheckpointPanelProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<CheckResult[]>([]);
  const [selfChecked, setSelfChecked] = useState<Set<string>>(new Set());

  const gradableCount = checkpoints.filter((c) => c.verify).length;

  const handleGrade = useCallback(async () => {
    setStatus("grading");
    try {
      // TypeScript は Monaco の型診断、Svelte は svelte/compiler で採点する
      const r =
        language === "svelte"
          ? await gradeSvelteCheckpoints(code, checkpoints)
          : await gradeCheckpoints(await whenMonacoReady(), code, checkpoints);
      setResults(r);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }, [code, checkpoints, language]);

  const toggleSelf = useCallback((id: string) => {
    setSelfChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resultById = new Map(results.map((r) => [r.id, r]));
  const passedCount = results.filter((r) => r.graded && r.pass).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          確認ポイント
        </h2>
        {gradableCount > 0 && (
          <div className="flex items-center gap-2">
            {status === "done" && (
              <span
                className={[
                  "text-xs font-medium",
                  passedCount === gradableCount
                    ? "text-green-700"
                    : "text-orange-600",
                ].join(" ")}
              >
                {passedCount} / {gradableCount} 合格
              </span>
            )}
            <button
              onClick={handleGrade}
              disabled={status === "grading"}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {status === "grading" ? "採点中..." : "自動採点"}
            </button>
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="text-xs text-red-600 mb-2">
          採点に失敗しました。エディタが読み込まれてから再試行してください。
        </p>
      )}

      <ul className="space-y-2">
        {checkpoints.map((cp) => {
          const r = resultById.get(cp.id);
          const isGraded = Boolean(cp.verify) && r?.graded;
          const isSelf = selfChecked.has(cp.id);

          return (
            <li
              key={cp.id}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              {isGraded ? (
                <span
                  className={[
                    "mt-0.5 select-none font-bold",
                    r!.pass ? "text-green-600" : "text-red-500",
                  ].join(" ")}
                  title={r!.pass ? "合格" : "不合格"}
                >
                  {r!.pass ? "✓" : "✕"}
                </span>
              ) : cp.verify ? (
                // 採点可能だがまだ採点していない
                <span className="text-blue-300 mt-0.5 select-none" title="自動採点できます">
                  ◇
                </span>
              ) : (
                // 自動採点できないものは自己申告
                <button
                  onClick={() => toggleSelf(cp.id)}
                  className={[
                    "mt-0.5 select-none leading-none",
                    isSelf ? "text-green-600" : "text-gray-300 hover:text-gray-400",
                  ].join(" ")}
                  aria-pressed={isSelf}
                  title="自己採点"
                >
                  {isSelf ? "☑" : "☐"}
                </button>
              )}

              <span className={isGraded && !r!.pass ? "text-gray-700" : undefined}>
                <InlineCodeText text={cp.description} />
                {isGraded && !r!.pass && r!.message && (
                  <span className="block text-xs text-red-500 mt-0.5">
                    {r!.message}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {gradableCount > 0 && status === "idle" && (
        <p className="text-xs text-gray-400 mt-3">
          ◇ の項目は「自動採点」で機械的に判定できます
        </p>
      )}
    </div>
  );
}
