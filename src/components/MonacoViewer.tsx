"use client";

// 手本コード表示専用の Monaco 読み取り専用ビューア
// - シンタックスハイライト（vs-dark）
// - 行数に応じて高さを自動計算（最大480px）
// - 診断（エラー波線）は表示しない（readOnly表示に不要）

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 bg-gray-900 rounded-lg border border-gray-700 animate-pulse" />
    ),
  }
);

interface MonacoViewerProps {
  code: string;
}

export function MonacoViewer({ code }: MonacoViewerProps) {
  // 行数から高さを推定（1行 ≒ 19px + padding 24px、最大480px）
  const height = Math.min(Math.max(code.split("\n").length * 19 + 24, 80), 480);

  return (
    <div
      style={{ height }}
      className="rounded-lg border border-gray-700 overflow-hidden"
    >
      <MonacoEditor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={code}
        options={{
          readOnly: true,
          domReadOnly: true,
          automaticLayout: true,
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          renderLineHighlight: "none",
          padding: { top: 12, bottom: 12 },
          overviewRulerLanes: 0,
          scrollbar: { verticalScrollbarSize: 6 },
          contextmenu: false,
          folding: false,
          lineNumbers: "off",
          glyphMargin: false,
          lineDecorationsWidth: 8,
        }}
      />
    </div>
  );
}
