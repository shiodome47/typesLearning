"use client";

import { useState, useCallback } from "react";
import { MonacoViewer } from "./MonacoViewer";

interface ModelAnswerProps {
  code: string;
  defaultVisible?: boolean;
  diagramUrl?: string;
  theme?: string;
}

export function ModelAnswer({ code, defaultVisible = false, diagramUrl, theme = "vs-dark" }: ModelAnswerProps) {
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
          <MonacoViewer code={code} theme={theme} />
          <div className="absolute top-2 right-2 z-10">
            {copied ? (
              <span className="text-xs text-green-400 select-none px-1">コピーしました</span>
            ) : (
              <button
                onClick={handleCopy}
                aria-label="手本コードをコピー"
                title="手本コードをコピー"
                className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
