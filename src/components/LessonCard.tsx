import Link from "next/link";
import type { Lesson } from "@curriculum/types";
import { InlineCodeText } from "./InlineCodeText";
import { categoryLabel, DIFFICULTY_LABELS, DIFFICULTY_STYLES } from "@/lib/labels";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isLastOpened?: boolean;
}

export function LessonCard({
  lesson,
  isCompleted,
  isLastOpened = false,
}: LessonCardProps) {
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div
        className={[
          "p-4 rounded-xl border-2 transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
          isCompleted
            ? "bg-green-50 border-green-300"
            : isLastOpened
              ? "bg-blue-50 border-blue-300"
              : "bg-white border-gray-200 hover:border-blue-300",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* バッジ */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={[
                  "text-xs font-medium px-2 py-0.5 rounded-full border",
                  DIFFICULTY_STYLES[lesson.difficulty] ??
                    "text-gray-600 bg-gray-50 border-gray-200",
                ].join(" ")}
              >
                {DIFFICULTY_LABELS[lesson.difficulty] ?? "?"}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {categoryLabel(lesson.category)}
              </span>
              {lesson.kind === "diagnose" && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full border text-purple-700 bg-purple-50 border-purple-200"
                  title="欠陥コードを見抜いて直す診断問題"
                >
                  診断
                </span>
              )}
            </div>

            {/* タイトル */}
            <h2 className="text-sm font-semibold text-gray-900">
              {lesson.order}. {lesson.title}
            </h2>

            {/* ゴール */}
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              <InlineCodeText text={lesson.goal} />
            </p>
          </div>

          {/* 完了/継続中インジケータ */}
          <div className="flex-shrink-0 pt-0.5">
            {isCompleted ? (
              <span className="text-green-600 font-bold text-lg" title="完了">
                ✓
              </span>
            ) : isLastOpened ? (
              <span className="text-blue-500 text-xs font-medium whitespace-nowrap">
                継続中
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
