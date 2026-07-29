// Server Component: 教材データをサーバーサイドで読み込み、
// Client Component (LessonList) に渡す
import Link from "next/link";
import { allLessons } from "../../curriculum";
import { LessonList } from "@/components/LessonList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-start justify-between gap-3">
          <div>
            {/* 言語が増えても直し忘れないよう、特定の言語名は入れない */}
            <h1 className="text-xl font-bold text-gray-900">
              判断力トレーニング
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              手本を見て書く練習と、欠陥を見抜く診断
            </p>
          </div>
          <Link
            href="/guide"
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
          >
            学習の手引き →
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <LessonList lessons={allLessons} />
      </main>
    </div>
  );
}
