"use client";

import { useState, useCallback } from "react";
import { MonacoViewer } from "./MonacoViewer";

interface ModelAnswerProps {
  code: string;
  defaultVisible?: boolean;
  diagramUrl?: string;
}

export function ModelAnswer({ code, defaultVisible = false, diagramUrl }: ModelAnswerProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("コピーに失敗しました", e);
    }
  }, [code]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
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
        {diagramUrl && (
          <a
            href={diagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
          >
            図解を見る ↗
          </a>
        )}
      </div>

      {isVisible && (
        <div className="relative">
          <MonacoViewer code={code} />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <span className="text-xs text-gray-500 select-none">手本</span>
            <button
              onClick={handleCopy}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
