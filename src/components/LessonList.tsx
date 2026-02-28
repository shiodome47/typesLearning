"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/hooks/useProgress";
import { LessonCard } from "./LessonCard";
import type { Lesson } from "@curriculum/types";

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

type PhaseFilter = "all" | "phase1-4" | "phase5";
type StatusFilter = "all" | "incomplete" | "completed";

interface LessonListProps {
  lessons: Lesson[];
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-xs px-2.5 py-1 rounded-full border transition-colors",
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function LessonList({ lessons }: LessonListProps) {
  const { progress, isLoaded } = useProgress();
  const router = useRouter();

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // lessons 内に存在するカテゴリを出現順で抽出
  const categories = [...new Set(lessons.map((l) => l.category))];

  // フィルタ適用
  const filtered = lessons.filter((lesson) => {
    if (phaseFilter === "phase1-4" && lesson.order > 18) return false;
    if (phaseFilter === "phase5" && lesson.order < 19) return false;
    if (categoryFilter !== "all" && lesson.category !== categoryFilter) return false;
    if (isLoaded && statusFilter !== "all") {
      const completed = progress.lessons[lesson.id]?.completed ?? false;
      if (statusFilter === "completed" && !completed) return false;
      if (statusFilter === "incomplete" && completed) return false;
    }
    return true;
  });

  // 進捗カウント
  const completedCount = isLoaded
    ? Object.values(progress.lessons).filter((l) => l.completed).length
    : 0;
  const phase14Total = lessons.filter((l) => l.order <= 18).length;
  const phase5Total = lessons.filter((l) => l.order >= 19).length;
  const phase14Completed = isLoaded
    ? lessons.filter((l) => l.order <= 18 && (progress.lessons[l.id]?.completed ?? false)).length
    : 0;
  const phase5Completed = isLoaded
    ? lessons.filter((l) => l.order >= 19 && (progress.lessons[l.id]?.completed ?? false)).length
    : 0;

  // ランダム1問: 現在の絞り込み結果からランダムに選んで遷移
  const handleRandom = useCallback(() => {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/lesson/${pick.id}`);
  }, [filtered, router]);

  return (
    <div>
      {/* ── 進捗サマリー ── */}
      <div className="mb-5 bg-white rounded-xl border border-gray-200 p-4">
        {isLoaded ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-green-700 text-base">{completedCount}</span>
                <span className="text-gray-500"> / {lessons.length} 完了</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({Math.round((completedCount / lessons.length) * 100)}%)
                </span>
              </p>
              <div className="w-36 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / lessons.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>
                Phase1-4:{" "}
                <span
                  className={
                    phase14Completed === phase14Total
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  {phase14Completed}/{phase14Total}
                </span>
              </span>
              <span>
                Phase5:{" "}
                <span
                  className={
                    phase5Completed === phase5Total
                      ? "text-green-600 font-semibold"
                      : "text-gray-700"
                  }
                >
                  {phase5Completed}/{phase5Total}
                </span>
              </span>
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-400">読み込み中...</span>
        )}
      </div>

      {/* ── フィルタ ── */}
      <div className="mb-4 space-y-2">
        {/* Phase フィルタ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 w-16 flex-shrink-0">フェーズ</span>
          <FilterButton active={phaseFilter === "all"} onClick={() => setPhaseFilter("all")}>
            すべて
          </FilterButton>
          <FilterButton
            active={phaseFilter === "phase1-4"}
            onClick={() => setPhaseFilter("phase1-4")}
          >
            Phase1-4
          </FilterButton>
          <FilterButton
            active={phaseFilter === "phase5"}
            onClick={() => setPhaseFilter("phase5")}
          >
            Phase5
          </FilterButton>
        </div>

        {/* カテゴリフィルタ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 w-16 flex-shrink-0">カテゴリ</span>
          <FilterButton
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
          >
            すべて
          </FilterButton>
          {categories.map((cat) => (
            <FilterButton
              key={cat}
              active={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </FilterButton>
          ))}
        </div>

        {/* 状態フィルタ + ランダムボタン */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 w-16 flex-shrink-0">状態</span>
          <FilterButton
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          >
            すべて
          </FilterButton>
          <FilterButton
            active={statusFilter === "incomplete"}
            onClick={() => setStatusFilter("incomplete")}
          >
            未完了
          </FilterButton>
          <FilterButton
            active={statusFilter === "completed"}
            onClick={() => setStatusFilter("completed")}
          >
            完了済み
          </FilterButton>
          <button
            onClick={handleRandom}
            disabled={filtered.length === 0}
            className="ml-auto text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 disabled:opacity-40 transition-colors"
          >
            ランダム1問
          </button>
        </div>
      </div>

      {/* ── 件数表示 ── */}
      <p className="text-xs text-gray-400 mb-3">
        {filtered.length} 件表示
        {filtered.length !== lessons.length && ` / 全 ${lessons.length} 件`}
      </p>

      {/* ── 教材カード一覧 ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          該当する教材がありません
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((lesson) => (
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
      )}
    </div>
  );
}
