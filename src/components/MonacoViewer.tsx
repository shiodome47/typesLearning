"use client";

// 手本コード表示専用の Monaco 読み取り専用ビューア
// - シンタックスハイライト（vs-dark）
// - onDidContentSizeChange で実測高さを反映（最大480px）
// - 診断（エラー波線）は表示しない（readOnly表示に不要）

import { useState, useCallback } from "react";
import type { editor as MonacoEditorType } from "monaco-editor";
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

const MAX_HEIGHT = 510;

export function MonacoViewer({ code }: MonacoViewerProps) {
  // 初期値: 行数ベースの推定（実測前のレイアウトシフトを最小化）
  const [height, setHeight] = useState(
    Math.min(Math.max(code.split("\n").length * 21 + 24, 80), MAX_HEIGHT)
  );

  const handleMount = useCallback(
    (editor: MonacoEditorType.IStandaloneCodeEditor) => {
      const updateHeight = () => {
        const actual = editor.getContentHeight();
        setHeight(Math.min(Math.max(actual, 80), MAX_HEIGHT));
      };
      editor.onDidContentSizeChange(updateHeight);
      updateHeight();
    },
    []
  );

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
        onMount={handleMount}
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
