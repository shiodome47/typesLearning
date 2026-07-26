"use client";

// kind による判別可能Union の振り分け。
// 新しいモードを追加したとき、ここで分岐漏れがコンパイルエラーになる。

import type { Lesson } from "@curriculum/types";
import { WritePractice } from "./WritePractice";
import { DiagnosePractice } from "./DiagnosePractice";
import { ProjectPractice } from "./ProjectPractice";

interface PracticeClientProps {
  lesson: Lesson;
  allLessons: Lesson[];
}

export function PracticeClient({ lesson, allLessons }: PracticeClientProps) {
  switch (lesson.kind) {
    case "write":
      return <WritePractice lesson={lesson} allLessons={allLessons} />;
    case "diagnose":
      return <DiagnosePractice lesson={lesson} allLessons={allLessons} />;
    case "project":
      return <ProjectPractice lesson={lesson} allLessons={allLessons} />;
    default:
      return assertNever(lesson);
  }
}

function assertNever(x: never): never {
  throw new Error(`未対応のレッスン種別: ${JSON.stringify(x)}`);
}
