"use client";

// ─────────────────────────────────────────────────────────────
// 診断モード
//   1. 欠陥のあるコードを読む
//   2. 「どこが危険か」を自分で考えてから、欠陥を1件ずつ開示して答え合わせ
//   3. 修正版を書き、自動採点で確認する
//
// AI が書いたコードをレビューする実務に対応する。
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useEditorPrefs } from "@/hooks/useEditorPrefs";
import { CodeEditor } from "@/components/CodeEditor";
import { MonacoViewer } from "@/components/MonacoViewer";
import { ModelAnswer } from "@/components/ModelAnswer";
import { CheckpointPanel } from "@/components/CheckpointPanel";
import { WhyCard } from "@/components/WhyCard";
import { InlineCodeText } from "@/components/InlineCodeText";
import type { Lesson, DiagnoseLesson } from "@curriculum/types";
import { LESSON_DIAGRAM_LINKS } from "@/lib/lessonDiagramLinks";
import { monacoLanguageFor, modelPathFor } from "@/lib/monaco/setup";
import {
  LessonHeader,
  LessonTitle,
  ExplanationCard,
  RelatedLessons,
  CompleteButton,
  LessonNav,
  EditorToggles,
} from "./LessonChrome";

interface DiagnosePracticeProps {
  lesson: DiagnoseLesson;
  allLessons: Lesson[];
}

export function DiagnosePractice({ lesson, allLessons }: DiagnosePracticeProps) {
  const {
    isLoaded,
    getLessonProgress,
    markCompleted,
    markUncompleted,
    saveCode,
    incrementAttempt,
    setLastOpened,
  } = useProgress();
  const prefs = useEditorPrefs();

  const [code, setCode] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  useEffect(() => {
    if (!isLoaded) return;
    setLastOpened(lesson.id);
    const p = getLessonProgress(lesson.id);
    setIsCompleted(p.completed);
    // 修正作業は欠陥コードから始める
    setCode(p.savedCode || lesson.brokenCode);
  }, [isLoaded, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setCode(lesson.brokenCode);
    saveCode(lesson.id, lesson.brokenCode);
    incrementAttempt(lesson.id);
    setRevealedCount(0);
  };

  const allRevealed = revealedCount >= lesson.defects.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonHeader currentIndex={currentIndex} total={allLessons.length} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <LessonTitle lesson={lesson} isCompleted={isCompleted} />

        {/* なぜ必要か: 全幅。左カラムだけに置くと縦に伸びて
            手本コードと練習エリアの高さがずれ、見比べられなくなる */}
        <div className="mb-5">
          <WhyCard why={lesson.why} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── 左カラム: 診断対象 ──
              症状（短い）→ レビュー対象のコード の順に置き、
              右カラムの修正エリアと高さを揃える。説明はその下に回す。 */}
          <div className="space-y-4">
            {/* 症状 */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <h2 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
                症状
              </h2>
              <p className="text-sm text-amber-900 leading-relaxed">
                <InlineCodeText text={lesson.symptom} />
              </p>
            </div>

            {/* 欠陥コード */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                レビュー対象のコード
              </h2>
              <MonacoViewer
                code={lesson.brokenCode}
                theme={prefs.editorTheme}
                path={modelPathFor(lesson.language, `broken-${lesson.id}`)}
                editorLanguage={monacoLanguageFor(lesson.language)}
              />
              <p className="text-xs text-gray-400 mt-2">
                このコードは型チェックを通ります。それでも危険な箇所があります。
              </p>
            </div>

            {/* 欠陥の段階開示 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  欠陥（{revealedCount} / {lesson.defects.length} 開示）
                </h2>
                {!allRevealed ? (
                  <button
                    onClick={() => setRevealedCount((c) => c + 1)}
                    className="text-xs px-3 py-1.5 rounded-md bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-300 transition-colors"
                  >
                    欠陥を1つ開示する
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">すべて開示済み</span>
                )}
              </div>

              {revealedCount === 0 ? (
                <p className="text-sm text-gray-500">
                  まず自分で探してみてください。「本番で落ちるのはどんな入力か？」を考えるのがコツです。
                </p>
              ) : (
                <ul className="space-y-3">
                  {lesson.defects.slice(0, revealedCount).map((d, i) => (
                    <li
                      key={d.id}
                      className="border border-red-200 bg-red-50 rounded-lg p-3"
                    >
                      <p className="text-sm font-semibold text-red-800">
                        {i + 1}. <InlineCodeText text={d.summary} />
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <InlineCodeText text={d.why} />
                      </p>
                      {d.marker && (
                        <code className="block text-xs bg-white border border-red-200 rounded px-2 py-1 mt-2 font-mono text-red-700 overflow-x-auto">
                          {d.marker}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ExplanationCard text={lesson.explanation} />

            <RelatedLessons lesson={lesson} allLessons={allLessons} />
          </div>

          {/* ── 右カラム: 修正エリア ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  修正エリア
                </h2>
                <div className="flex items-center gap-3">
                  {prefs.isLoaded && (
                    <EditorToggles
                      editorTheme={prefs.editorTheme}
                      onToggleTheme={prefs.toggleTheme}
                      diagnosticsEnabled={prefs.diagnosticsEnabled}
                      onToggleDiagnostics={prefs.toggleDiagnostics}
                      showDiagnosticsToggle={lesson.language === "typescript"}
                    />
                  )}
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                  >
                    リセット
                  </button>
                </div>
              </div>

              {code !== null ? (
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  diagnosticsEnabled={prefs.diagnosticsEnabled}
                  theme={prefs.editorTheme}
                  path={modelPathFor(lesson.language, `fix-${lesson.id}`)}
                  editorLanguage={monacoLanguageFor(lesson.language)}
                />
              ) : (
                <div className="min-h-72 bg-gray-900 rounded-lg animate-pulse" />
              )}
            </div>

            {/* 修正版の自動採点 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <CheckpointPanel
                key={lesson.id}
                checkpoints={lesson.checkpoints}
                code={code ?? ""}
                language={lesson.language}
              />
            </div>

            {/* 模範修正は欠陥を全部見てから */}
            {allRevealed && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  模範修正
                </h2>
                <ModelAnswer
                  code={lesson.fixedCode}
                  diagramUrl={LESSON_DIAGRAM_LINKS[lesson.id]}
                  theme={prefs.editorTheme}
                  path={modelPathFor(lesson.language, `fixed-${lesson.id}`)}
                  editorLanguage={monacoLanguageFor(lesson.language)}
                />
              </div>
            )}

            <CompleteButton isCompleted={isCompleted} onClick={handleComplete} />
          </div>
        </div>

        <LessonNav prevLesson={prevLesson} nextLesson={nextLesson} />
      </main>
    </div>
  );
}
