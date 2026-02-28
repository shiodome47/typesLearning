import { phase1Lessons } from "./phase1-type-basics";
import { phase2Lessons } from "./phase2-type-safety";
import { phase3Lessons } from "./phase3-real-app";
import { phase4Lessons } from "./phase4-react";
import { phase5Lessons } from "./phase5-advanced-patterns";
import type { Curriculum, Lesson } from "./types";

// 全教材: order でソートして学習順を統一
export const allLessons: Lesson[] = [
  ...phase1Lessons,
  ...phase2Lessons,
  ...phase3Lessons,
  ...phase4Lessons,
  ...phase5Lessons,
].sort((a, b) => a.order - b.order);

export const curriculum: Curriculum = {
  version: "1.0.0",
  lessons: allLessons,
};

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

// フェーズごとのエクスポート（将来の拡張用）
export { phase1Lessons, phase2Lessons, phase3Lessons, phase4Lessons, phase5Lessons };

// 型の再エクスポート（appからのimportを簡略化）
export type { Lesson, Curriculum, Hint, Checkpoint, Difficulty, Category } from "./types";
