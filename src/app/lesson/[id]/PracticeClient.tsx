"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { CodeEditor } from "@/components/CodeEditor";
import { ModelAnswer } from "@/components/ModelAnswer";
import { HintPanel } from "@/components/HintPanel";
import type { Lesson } from "@curriculum/types";
import { LESSON_DIAGRAM_LINKS } from "@/lib/lessonDiagramLinks";

const DIAGNOSTICS_STORAGE_KEY = "ts-practice-editor-diagnostics-enabled";
const THEME_STORAGE_KEY = "ts-practice-editor-theme";
type EditorTheme = "vs-dark" | "vs";


const CATEGORY_LABELS: Record<string, string> = {
  "type-basics": "型の基礎",
  functions: "関数",
  objects: "オブジェクト",
  "union-literal": "Union/Literal",
  "type-guards": "型ガード",
  generics: "Generics",
  async: "非同期",
  "error-handling": "エラー処理",
  crud: "CRUD",
  "react-basics": "React",
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "入門",
  2: "基礎",
  3: "中級",
  4: "応用",
};

interface PracticeClientProps {
  lesson: Lesson;
  allLessons: Lesson[];
}

export function PracticeClient({ lesson, allLessons }: PracticeClientProps) {
  const {
    isLoaded,
    getLessonProgress,
    markCompleted,
    markUncompleted,
    saveCode,
    addHintUsed,
    incrementAttempt,
    setLastOpened,
  } = useProgress();

  // コードエディタの内容（null = ロード前）
  const [code, setCode] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  // 型エラー表示トグル（デフォルト OFF = 学習モード）
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(false);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>("vs-dark");
  const [resetCount, setResetCount] = useState(0);

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // localStorage 読み込み後に初期化
  useEffect(() => {
    if (!isLoaded) return;
    setLastOpened(lesson.id);
    const p = getLessonProgress(lesson.id);
    setIsCompleted(p.completed);
    setCode(p.savedCode || lesson.starterCode);
    // 型エラー表示の設定を復元
    const saved = localStorage.getItem(DIAGNOSTICS_STORAGE_KEY);
    if (saved !== null) setDiagnosticsEnabled(saved === "true");
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "vs-dark" || savedTheme === "vs") setEditorTheme(savedTheme);
  }, [isLoaded, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDiagnosticsToggle = useCallback(() => {
    setDiagnosticsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(DIAGNOSTICS_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const handleThemeToggle = useCallback(() => {
    setEditorTheme((prev) => {
      const next: EditorTheme = prev === "vs-dark" ? "vs" : "vs-dark";
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveCode(lesson.id, newCode);
  };

  const handleComplete = () => {
    if (isCompleted) {
      markUncompleted(lesson.id);
      setIsCompleted(false);
    } else {
      markCompleted(lesson.id);
      incrementAttempt(lesson.id);
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCode(lesson.starterCode);
    saveCode(lesson.id, lesson.starterCode);
    incrementAttempt(lesson.id);
    setResetCount((c) => c + 1); // HintPanel を再マウントして閉じる
  };

  const handleHintReveal = (level: number) => {
    addHintUsed(lesson.id, level);
  };

  // ロード前のヒント初期値（ハイドレーション後に HintPanel を mount）
  const initialHintsUsed = isLoaded
    ? getLessonProgress(lesson.id).hintsUsed
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            ← 一覧へ
          </Link>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {allLessons.length}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* タイトルエリア */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {CATEGORY_LABELS[lesson.category] ?? lesson.category}
            </span>
            <span className="text-xs text-gray-400">
              {DIFFICULTY_LABELS[lesson.difficulty]}
            </span>
            {isCompleted && (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                ✓ 完了済み
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.order}. {lesson.title}</h1>
          <p className="text-green-700 font-medium mt-1 text-sm">
            目標: {lesson.goal}
          </p>
        </div>

        {/* 2カラムレイアウト（PC向け） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── 左カラム: 参照エリア ── */}
          <div className="space-y-4">
            {/* 説明 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                説明
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {lesson.explanation}
              </p>
            </div>

            {/* 手本 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                手本コード
              </h2>
              <ModelAnswer
                code={lesson.modelAnswer}
                diagramUrl={LESSON_DIAGRAM_LINKS[lesson.id]}
                theme={editorTheme}
              />
            </div>

            {/* 確認ポイント */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                確認ポイント（自己採点）
              </h2>
              <ul className="space-y-2">
                {lesson.checkpoints.map((cp) => (
                  <li
                    key={cp.id}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-gray-300 mt-0.5 select-none">□</span>
                    <span>{cp.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 関連教材 */}
            {lesson.relatedIds.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  関連教材
                </h2>
                <ul className="space-y-1.5">
                  {lesson.relatedIds.map((relId) => {
                    const rel = allLessons.find((l) => l.id === relId);
                    if (!rel) return null;
                    const isBefore = rel.order < lesson.order;
                    return (
                      <li key={relId}>
                        <Link
                          href={`/lesson/${rel.id}`}
                          className="flex items-center gap-2 text-xs hover:underline"
                        >
                          <span className="text-gray-400 flex-shrink-0 w-10">
                            {isBefore ? "↑ 前提" : "→ 次へ"}
                          </span>
                          <span className="text-blue-600 hover:text-blue-800">
                            {rel.order}. {rel.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ── 右カラム: 練習エリア ── */}
          <div className="space-y-4">
            {/* コードエディタ */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  白紙練習エリア
                </h2>
                <div className="flex items-center gap-3">
                  {/* テーマ切替 */}
                  {isLoaded && (
                    <button
                      onClick={handleThemeToggle}
                      className={[
                        "text-xs px-2 py-1 rounded border transition-colors",
                        editorTheme === "vs-dark"
                          ? "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
                      ].join(" ")}
                      title="エディタテーマをダーク/ライトで切り替えます"
                    >
                      テーマ: {editorTheme === "vs-dark" ? "Dark" : "Light"}
                    </button>
                  )}
                  {/* 型エラー表示トグル */}
                  {isLoaded && (
                    <button
                      onClick={handleDiagnosticsToggle}
                      className={[
                        "text-xs px-2 py-1 rounded border transition-colors",
                        diagnosticsEnabled
                          ? "bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100"
                          : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
                      ].join(" ")}
                      title="TypeScriptの型エラー表示（赤波線）をON/OFFします"
                    >
                      型エラー: {diagnosticsEnabled ? "ON" : "OFF"}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                  >
                    リセット
                  </button>
                </div>
              </div>

              {/* ロード前はスケルトン表示（ハイドレーションミスマッチ防止） */}
              {code !== null ? (
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  minHeight="min-h-72"
                  diagnosticsEnabled={diagnosticsEnabled}
                  theme={editorTheme}
                />
              ) : (
                <div className="min-h-72 bg-gray-900 rounded-lg animate-pulse" />
              )}
            </div>

            {/* ヒント（ロード後のみ表示） */}
            {isLoaded && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <HintPanel
                  key={`${lesson.id}-${resetCount}`} // lesson変更 or リセットで再マウント
                  hints={lesson.hints}
                  initialRevealed={resetCount === 0 ? initialHintsUsed : []}
                  onReveal={handleHintReveal}
                />
              </div>
            )}

            {/* 完了ボタン */}
            <button
              onClick={handleComplete}
              className={[
                "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
                isCompleted
                  ? "bg-green-50 text-green-700 border-2 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
              ].join(" ")}
            >
              {isCompleted ? "✓ 完了済み（クリックで未完了に戻す）" : "完了！"}
            </button>
          </div>
        </div>

        {/* 前後ナビゲーション */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          {prevLesson ? (
            <Link
              href={`/lesson/${prevLesson.id}`}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              ← {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white transition-colors"
            >
              {nextLesson.title} →
            </Link>
          ) : (
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white transition-colors"
            >
              一覧へ戻る
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
