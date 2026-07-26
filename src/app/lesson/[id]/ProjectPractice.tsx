"use client";

// 複数ファイル練習モード（SvelteKit）
//
// 1ファイルのエディタでは SvelteKit の中心にある「どのファイルに書くか」を
// 練習できない。ここではファイルタブを持ち、手本と練習が常に
// 同じファイルを指すようにしている（「手本を見ながら書く」を壊さないため）。

import { useState, useEffect, useMemo, useCallback } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useEditorPrefs } from "@/hooks/useEditorPrefs";
import { CodeEditor } from "@/components/CodeEditor";
import { MonacoViewer } from "@/components/MonacoViewer";
import { FileTabs } from "@/components/FileTabs";
import { HintPanel } from "@/components/HintPanel";
import { CheckpointPanel } from "@/components/CheckpointPanel";
import { WhyCard } from "@/components/WhyCard";
import type { Lesson, ProjectLesson } from "@curriculum/types";
import type { CheckResult } from "@/lib/verify/browserEngine";
import { monacoLanguageForPath, projectModelPath } from "@/lib/monaco/setup";
import {
  LessonHeader,
  LessonTitle,
  ExplanationCard,
  RelatedLessons,
  CompleteButton,
  LessonNav,
} from "./LessonChrome";

interface ProjectPracticeProps {
  lesson: ProjectLesson;
  allLessons: Lesson[];
}

function starterMap(lesson: ProjectLesson): Record<string, string> {
  return Object.fromEntries(lesson.files.map((f) => [f.path, f.starter]));
}

export function ProjectPractice({ lesson, allLessons }: ProjectPracticeProps) {
  const {
    isLoaded,
    getLessonProgress,
    markCompleted,
    markUncompleted,
    saveFile,
    clearFiles,
    addHintUsed,
    incrementAttempt,
    setLastOpened,
  } = useProgress();
  const prefs = useEditorPrefs();

  const [contents, setContents] = useState<Record<string, string> | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const [failedPaths, setFailedPaths] = useState<Set<string>>(new Set());

  // 最初に開くのは編集対象の 1 枚目（参照専用ファイルではなく）
  const firstEditable =
    lesson.files.find((f) => !f.readOnly)?.path ?? lesson.files[0].path;
  const [activePath, setActivePath] = useState(firstEditable);

  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const activeFile =
    lesson.files.find((f) => f.path === activePath) ?? lesson.files[0];

  // localStorage 読み込み後に初期化
  useEffect(() => {
    if (!isLoaded) return;
    setLastOpened(lesson.id);
    const p = getLessonProgress(lesson.id);
    setIsCompleted(p.completed);
    // 保存済みが無いファイルは starter で埋める
    // （レッスン側にファイルが増えても壊れないように）
    setContents({ ...starterMap(lesson), ...(p.savedFiles ?? {}) });
    setActivePath(firstEditable);
  }, [isLoaded, lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    (value: string) => {
      setContents((prev) => (prev ? { ...prev, [activePath]: value } : prev));
      saveFile(lesson.id, activePath, value);
    },
    [activePath, lesson.id, saveFile]
  );

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
    setContents(starterMap(lesson));
    clearFiles(lesson.id);
    incrementAttempt(lesson.id);
    setFailedPaths(new Set());
    setResetCount((c) => c + 1);
  };

  // 採点結果を「どのファイルで落ちたか」に変換してタブに出す
  const handleResults = useCallback(
    (results: CheckResult[]) => {
      const byId = new Map(lesson.checkpoints.map((c) => [c.id, c.verify]));
      const failed = new Set<string>();
      for (const r of results) {
        if (!r.graded || r.pass) continue;
        const spec = byId.get(r.id);
        if (spec && "file" in spec && typeof spec.file === "string") {
          failed.add(spec.file);
        }
      }
      setFailedPaths(failed);
    },
    [lesson.checkpoints]
  );

  const initialHintsUsed = isLoaded
    ? getLessonProgress(lesson.id).hintsUsed
    : [];

  // 採点に渡すのは全ファイル（参照専用も含めてプロジェクト全体を見る）
  const gradeFiles = useMemo(() => contents ?? starterMap(lesson), [contents, lesson]);

  return (
    <div className="min-h-screen bg-gray-50">
      <LessonHeader currentIndex={currentIndex} total={allLessons.length} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <LessonTitle lesson={lesson} isCompleted={isCompleted} />

        <div className="mb-5">
          <WhyCard why={lesson.why} />
        </div>

        {/* ファイルタブは 2 カラムの外に置く。
            手本と練習が別々のファイルを指してしまうと、
            この教材の中核である「見ながら書く」が成立しない。 */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 pt-3 pb-3 mb-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ファイル構成
            </h2>
            <span className="text-xs text-gray-400">
              タブを切り替えると手本と練習エリアが連動します
            </span>
          </div>
          <FileTabs
            files={lesson.files}
            activePath={activePath}
            onSelect={setActivePath}
            failedPaths={failedPaths}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── 左カラム: 参照エリア ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  手本コード
                </h2>
                <button
                  onClick={() => setShowModel((v) => !v)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                    showModel
                      ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      : "bg-blue-600 text-white border-transparent hover:bg-blue-700",
                  ].join(" ")}
                >
                  {showModel ? "手本を隠す" : "手本を見る"}
                </button>
              </div>

              {showModel ? (
                <MonacoViewer
                  code={activeFile.model}
                  theme={prefs.editorTheme}
                  path={projectModelPath(lesson.id, "model", activeFile.path)}
                  editorLanguage={monacoLanguageForPath(activeFile.path)}
                />
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">
                  まず自分で書いてみてください
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <CheckpointPanel
                key={lesson.id}
                checkpoints={lesson.checkpoints}
                code=""
                language={lesson.language}
                files={gradeFiles}
                defaultFile={activePath}
                onResults={handleResults}
              />
            </div>

            <ExplanationCard text={lesson.explanation} />

            <RelatedLessons lesson={lesson} allLessons={allLessons} />
          </div>

          {/* ── 右カラム: 練習エリア ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeFile.readOnly ? "参照ファイル" : "白紙練習エリア"}
                </h2>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  すべてリセット
                </button>
              </div>

              {contents !== null ? (
                <CodeEditor
                  value={contents[activeFile.path] ?? activeFile.starter}
                  onChange={handleChange}
                  readOnly={activeFile.readOnly}
                  // SvelteKit のファイルは $app/... を import するため、
                  // Monaco の型診断を出すと存在しないモジュール扱いで赤線だらけになる
                  diagnosticsEnabled={false}
                  theme={prefs.editorTheme}
                  path={projectModelPath(lesson.id, "practice", activeFile.path)}
                  editorLanguage={monacoLanguageForPath(activeFile.path)}
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
