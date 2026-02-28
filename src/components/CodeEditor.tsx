"use client";

// ─────────────────────────────────────────────────────────────
// CodeEditor.tsx
// Monaco Editor ラッパー。
// - TypeScript シンタックスハイライト（vs-dark テーマ）
// - Tab キーでスペース2個インデント（Monaco ネイティブ）
// - 縦リサイズ可能 + 高さを localStorage に保存/復元
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

// SSR を無効にして Monaco をロード（Next.js 必須）
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-900 rounded-lg animate-pulse" />
    ),
  }
);

// Monaco の TypeScript 診断（赤波線）をグローバルに設定する
function applyDiagnostics(monaco: Monaco, enabled: boolean) {
  const opts = {
    noSemanticValidation: !enabled,
    noSyntaxValidation: !enabled,
  };
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(opts);
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(opts);
}

const STORAGE_KEY_HEIGHT = "ts-practice-editor-height";
const DEFAULT_HEIGHT = 360;
const MIN_HEIGHT = 160;

// 既存の props インターフェースを維持（minHeight は後方互換のため残す）
export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;    // Monaco は placeholder 非対応のため無視
  readOnly?: boolean;
  minHeight?: string;      // 後方互換のため残す（Monaco では使用しない）
  diagnosticsEnabled?: boolean; // TypeScript 診断（赤波線）の ON/OFF
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  diagnosticsEnabled = false,
}: CodeEditorProps) {
  const [containerHeight, setContainerHeight] = useState(DEFAULT_HEIGHT);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // マウント時に localStorage から高さを復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HEIGHT);
    if (saved) {
      const h = parseInt(saved, 10);
      if (!isNaN(h) && h >= MIN_HEIGHT) setContainerHeight(h);
    }
  }, []);

  // diagnosticsEnabled が変わったら Monaco 設定に即時反映
  useEffect(() => {
    if (monacoRef.current) {
      applyDiagnostics(monacoRef.current, diagnosticsEnabled);
    }
  }, [diagnosticsEnabled]);

  // Monaco マウント時: インスタンスを保存して初期診断設定を適用
  const handleMount = useCallback(
    (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = monaco;
      applyDiagnostics(monaco, diagnosticsEnabled);
    },
    [diagnosticsEnabled]
  );

  // ドラッグリサイズ後（mouseup）に高さを保存
  const handleMouseUp = useCallback(() => {
    if (!wrapperRef.current) return;
    const h = wrapperRef.current.offsetHeight;
    if (h >= MIN_HEIGHT && h !== containerHeight) {
      setContainerHeight(h);
      localStorage.setItem(STORAGE_KEY_HEIGHT, String(h));
    }
  }, [containerHeight]);

  return (
    <div
      ref={wrapperRef}
      style={{ height: containerHeight, minHeight: MIN_HEIGHT, resize: "vertical", overflow: "hidden" }}
      onMouseUp={handleMouseUp}
      className="rounded-lg border border-gray-700"
    >
      <MonacoEditor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          readOnly,
          automaticLayout: true,   // コンテナリサイズに追従
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,      // Tab → スペース2個
          renderLineHighlight: "all",
          padding: { top: 12, bottom: 12 },
          overviewRulerLanes: 0,
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
        }}
      />
    </div>
  );
}
