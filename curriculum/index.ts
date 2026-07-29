import { phase1Lessons } from "./phase1-type-basics";
import { phase2Lessons } from "./phase2-type-safety";
import { phase3Lessons } from "./phase3-real-app";
import { phase4Lessons } from "./phase4-react";
import { phase5Lessons } from "./phase5-advanced-patterns";
import { phase6Lessons } from "./phase6-modern-ts";
import { phase7Lessons } from "./phase7-judgment";
import { svelteLessons } from "./svelte";
import { svelteKitLessons } from "./sveltekit";
import { guardrailLessons } from "./guardrails";
import { compactLessons } from "./compact";
import { effectLessons } from "./effect";
import type { Curriculum, Lesson } from "./types";

// 全教材: order でソートして学習順を統一
export const allLessons: Lesson[] = [
  ...phase1Lessons,
  ...phase2Lessons,
  ...phase3Lessons,
  ...phase4Lessons,
  ...phase5Lessons,
  ...phase6Lessons,
  ...phase7Lessons,
  ...svelteLessons,
  ...svelteKitLessons,
  ...guardrailLessons,
  ...compactLessons,
  ...effectLessons,
  // 言語ごとに order を独立採番しているので、言語→order の順に並べる
].sort((a, b) =>
  a.language === b.language
    ? a.order - b.order
    : a.language.localeCompare(b.language)
);

export const curriculum: Curriculum = {
  version: "1.0.0",
  lessons: allLessons,
};

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

// フェーズごとのエクスポート（将来の拡張用）
export {
  phase1Lessons,
  phase2Lessons,
  phase3Lessons,
  phase4Lessons,
  phase5Lessons,
  phase6Lessons,
  phase7Lessons,
  svelteLessons,
  svelteKitLessons,
  guardrailLessons,
  compactLessons,
  effectLessons,
};

// 型の再エクスポート（appからのimportを簡略化）
export type {
  Lesson,
  WriteLesson,
  DiagnoseLesson,
  ProjectLesson,
  ProjectFile,
  Curriculum,
  Hint,
  Checkpoint,
  CheckSpec,
  Defect,
  Difficulty,
  Category,
  LessonLanguage,
  Why,
  SvelteQuery,
} from "./types";
export {
  isWriteLesson,
  isDiagnoseLesson,
  isProjectLesson,
  editableFiles,
} from "./types";
