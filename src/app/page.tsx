// Server Component: 教材データをサーバーサイドで読み込み、
// Client Component (LessonList) に渡す
import { allLessons } from "../../curriculum";
import { LessonList } from "@/components/LessonList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            TypeScript 白紙練習
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            手本を見て理解し、ゼロから再現する練習
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <LessonList lessons={allLessons} />
      </main>
    </div>
  );
}
