"use client";

import { useState } from "react";
import type { Hint } from "@curriculum/types";

const HINT_LABELS: Record<number, string> = {
  1: "方向性",
  2: "構文ヒント",
  3: "ほぼ答え",
};

interface HintPanelProps {
  hints: Hint[];
  initialRevealed?: number[];
  onReveal?: (level: number) => void;
}

export function HintPanel({
  hints,
  initialRevealed = [],
  onReveal,
}: HintPanelProps) {
  const [revealed, setRevealed] = useState<number[]>(initialRevealed);

  const sorted = [...hints].sort((a, b) => a.level - b.level);
  const nextHint = sorted.find((h) => !revealed.includes(h.level));

  const revealNext = () => {
    if (!nextHint) return;
    setRevealed((prev) => [...prev, nextHint.level]);
    onReveal?.(nextHint.level);
  };

  if (hints.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">ヒント</h3>
        {nextHint ? (
          <button
            onClick={revealNext}
            className="text-xs px-3 py-1.5 rounded-md bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-300 transition-colors"
          >
            ヒント{nextHint.level}（{HINT_LABELS[nextHint.level]}）を見る
          </button>
        ) : (
          <span className="text-xs text-gray-400">すべてのヒントを表示済み</span>
        )}
      </div>

      <div className="space-y-2">
        {sorted
          .filter((h) => revealed.includes(h.level))
          .map((hint) => (
            <div
              key={hint.level}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            >
              <span className="text-xs font-semibold text-yellow-700 mr-2">
                ヒント{hint.level}（{HINT_LABELS[hint.level]}）:
              </span>
              <span className="text-sm text-gray-700">{hint.text}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
