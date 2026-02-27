import { phase1Lessons } from "./phase1-type-basics";
import type { Curriculum, Lesson } from "./types";

// 全教材（フェーズをまたいで結合）
export const allLessons: Lesson[] = [
  ...phase1Lessons,
  // 将来: ...phase2Lessons, ...phase3Lessons,
];

export const curriculum: Curriculum = {
  version: "1.0.0",
  lessons: allLessons,
};

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

// フェーズごとのエクスポート（将来の拡張用）
export { phase1Lessons };

// 型の再エクスポート（appからのimportを簡略化）
export type { Lesson, Curriculum, Hint, Checkpoint, Difficulty, Category } from "./types";
