"use client";

import { useProgress } from "@/hooks/useProgress";
import { LessonCard } from "./LessonCard";
import type { Lesson } from "@curriculum/types";

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  const { progress, isLoaded } = useProgress();

  const completedCount = isLoaded
    ? Object.values(progress.lessons).filter((l) => l.completed).length
    : 0;

  return (
    <div>
      {/* 進捗サマリー */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoaded ? (
            <>
              <span className="font-semibold text-green-700">{completedCount}</span>
              <span className="text-gray-500"> / {lessons.length} 完了</span>
            </>
          ) : (
            <span className="text-gray-400">読み込み中...</span>
          )}
        </p>

        {isLoaded && completedCount > 0 && (
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* 教材カード一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isCompleted={
              isLoaded ? (progress.lessons[lesson.id]?.completed ?? false) : false
            }
            isLastOpened={
              isLoaded ? progress.lastOpenedLessonId === lesson.id : false
            }
          />
        ))}
      </div>
    </div>
  );
}
