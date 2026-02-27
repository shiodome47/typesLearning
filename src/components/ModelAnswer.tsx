"use client";

import { useState } from "react";

interface ModelAnswerProps {
  code: string;
  defaultVisible?: boolean;
}

export function ModelAnswer({ code, defaultVisible = false }: ModelAnswerProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsVisible((v) => !v)}
        className={[
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
          isVisible
            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
            : "bg-blue-600 text-white border-transparent hover:bg-blue-700",
        ].join(" ")}
      >
        {isVisible ? "手本を隠す" : "手本を見る"}
      </button>

      {isVisible && (
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
            {code}
          </pre>
          <span className="absolute top-2 right-2 text-xs text-gray-500 select-none">
            手本
          </span>
        </div>
      )}
    </div>
  );
}
