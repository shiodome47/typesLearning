"use client";

// エディタの表示設定（テーマ・型エラー表示）を localStorage に永続化する。
// write / diagnose どちらのモードからも使う。

import { useState, useEffect, useCallback } from "react";

const DIAGNOSTICS_STORAGE_KEY = "ts-practice-editor-diagnostics-enabled";
const THEME_STORAGE_KEY = "ts-practice-editor-theme";

export type EditorTheme = "vs-dark" | "vs";

export function useEditorPrefs() {
  // 型エラー表示のデフォルトは OFF（学習モード）
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("vs-dark");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DIAGNOSTICS_STORAGE_KEY);
    if (saved !== null) setDiagnosticsEnabled(saved === "true");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "vs-dark" || savedTheme === "vs") setEditorTheme(savedTheme);
    setIsLoaded(true);
  }, []);

  const toggleDiagnostics = useCallback(() => {
    setDiagnosticsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(DIAGNOSTICS_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setEditorTheme((prev) => {
      const next: EditorTheme = prev === "vs-dark" ? "vs" : "vs-dark";
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return {
    isLoaded,
    diagnosticsEnabled,
    editorTheme,
    toggleDiagnostics,
    toggleTheme,
  };
}
