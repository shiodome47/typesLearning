"use client";

// 白紙練習モード: 手本を見て理解し、ゼロから再現する

import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useEditorPrefs } from "@/hooks/useEditorPrefs";
import { CodeEditor } from "@/components/CodeEditor";
import { ModelAnswer } from "@/components/ModelAnswer";
import { HintPanel } from "@/components/HintPanel";
import { CheckpointPanel } from "@/components/CheckpointPanel";
import { WhyCard } from "@/components/WhyCard";
import type { Lesson, WriteLesson } from "@curriculum/types";
import { LESSON_DIAGRAM_LINKS } from "@/lib/lessonDiagramLinks";
import {
  LessonHeader,
  LessonTitle,
  ExplanationCard,
  RelatedLessons,
  CompleteButton,
  LessonNav,
  EditorToggles,
} from "./LessonChrome";

interface WritePracticeProps {
  lesson: WriteLesson;
  allLessons: Lesson[];
}

export function WritePractice({ lesson, allLessons }: WritePracticeProps) {
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
  const prefs = useEditorPrefs();

  // コードエディタの内容（null = ロード前）
  const [code, setCode] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
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
    setCode(lesson.starterCode);
    saveCode(lesson.id, lesson.starterCode);
    incrementAttempt(lesson.id);
    setResetCount((c) => c + 1); // HintPanel を再マウントして閉じる
  };

  // ロード前のヒント初期値（ハイドレーション後に HintPanel を mount）
  const initialHintsUsed = isLoaded
    ? getLessonProgress(lesson.id).hintsUsed
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonHeader currentIndex={currentIndex} total={allLessons.length} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <LessonTitle lesson={lesson} isCompleted={isCompleted} />

        {/* 2カラムレイアウト（PC向け） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── 左カラム: 参照エリア ── */}
          <div className="space-y-4">
            <WhyCard why={lesson.why} />

            <ExplanationCard text={lesson.explanation} />

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                手本コード
              </h2>
              <ModelAnswer
                code={lesson.modelAnswer}
                diagramUrl={LESSON_DIAGRAM_LINKS[lesson.id]}
                theme={prefs.editorTheme}
                path={`file:///model-${lesson.id}.tsx`}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <CheckpointPanel
                key={lesson.id}
                checkpoints={lesson.checkpoints}
                code={code ?? ""}
              />
            </div>

            <RelatedLessons lesson={lesson} allLessons={allLessons} />
          </div>

          {/* ── 右カラム: 練習エリア ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  白紙練習エリア
                </h2>
                <div className="flex items-center gap-3">
                  {prefs.isLoaded && (
                    <EditorToggles
                      editorTheme={prefs.editorTheme}
                      onToggleTheme={prefs.toggleTheme}
                      diagnosticsEnabled={prefs.diagnosticsEnabled}
                      onToggleDiagnostics={prefs.toggleDiagnostics}
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

              {/* ロード前はスケルトン表示（ハイドレーションミスマッチ防止） */}
              {code !== null ? (
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  minHeight="min-h-72"
                  diagnosticsEnabled={prefs.diagnosticsEnabled}
                  theme={prefs.editorTheme}
                  path={`file:///practice-${lesson.id}.tsx`}
                />
              ) : (
                <div className="min-h-72 bg-gray-900 rounded-lg animate-pulse" />
              )}
            </div>

            {isLoaded && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <HintPanel
                  key={`${lesson.id}-${resetCount}`}
                  hints={lesson.hints}
                  initialRevealed={resetCount === 0 ? initialHintsUsed : []}
                  onReveal={(level) => addHintUsed(lesson.id, level)}
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
