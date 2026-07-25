"use client";

// write / diagnose 両モードで共有する画面まわりの部品（表示専用）

import Link from "next/link";
import type { Lesson } from "@curriculum/types";
import { InlineCodeText } from "@/components/InlineCodeText";
import { categoryLabel, DIFFICULTY_LABELS } from "@/lib/labels";

export function LessonHeader({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
        >
          ← 一覧へ
        </Link>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {total}
        </span>
      </div>
    </header>
  );
}

export function LessonTitle({
  lesson,
  isCompleted,
}: {
  lesson: Lesson;
  isCompleted: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {categoryLabel(lesson.category)}
        </span>
        <span className="text-xs text-gray-400">
          {DIFFICULTY_LABELS[lesson.difficulty]}
        </span>
        {lesson.kind === "diagnose" && (
          <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            診断
          </span>
        )}
        {isCompleted && (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            ✓ 完了済み
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">
        {lesson.order}. {lesson.title}
      </h1>
      <p className="text-green-700 font-medium mt-1 text-sm">
        目標: <InlineCodeText text={lesson.goal} />
      </p>
    </div>
  );
}

export function ExplanationCard({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        説明
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">
        <InlineCodeText text={text} />
      </p>
    </div>
  );
}

export function RelatedLessons({
  lesson,
  allLessons,
}: {
  lesson: Lesson;
  allLessons: Lesson[];
}) {
  if (lesson.relatedIds.length === 0) return null;

  return (
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
  );
}

export function CompleteButton({
  isCompleted,
  onClick,
}: {
  isCompleted: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
        isCompleted
          ? "bg-green-50 text-green-700 border-2 border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
      ].join(" ")}
    >
      {isCompleted ? "✓ 完了済み（クリックで未完了に戻す）" : "完了！"}
    </button>
  );
}

export function LessonNav({
  prevLesson,
  nextLesson,
}: {
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}) {
  return (
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
  );
}

/** テーマ・型エラー表示のトグル（エディタ見出しの右側） */
export function EditorToggles({
  editorTheme,
  onToggleTheme,
  diagnosticsEnabled,
  onToggleDiagnostics,
}: {
  editorTheme: string;
  onToggleTheme: () => void;
  diagnosticsEnabled: boolean;
  onToggleDiagnostics: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleTheme}
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
      <button
        onClick={onToggleDiagnostics}
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
    </div>
  );
}
