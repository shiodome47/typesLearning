// Server Component
// - generateStaticParams: 全教材をビルド時に静的生成（Vercel 最適）
// - lesson データをサーバーで取得 → PracticeClient に渡す
import { notFound } from "next/navigation";
import { allLessons, getLessonById } from "../../../../curriculum";
import { PracticeClient } from "./PracticeClient";

// 全教材IDを静的生成パラメータとして登録
export function generateStaticParams() {
  return allLessons.map((lesson) => ({ id: lesson.id }));
}

// ページタイトルを動的に設定
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLessonById(id);
  return {
    title: lesson ? `${lesson.title} | TypeScript 白紙練習` : "教材が見つかりません",
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLessonById(id);

  if (!lesson) {
    notFound();
  }

  return <PracticeClient lesson={lesson} allLessons={allLessons} />;
}
