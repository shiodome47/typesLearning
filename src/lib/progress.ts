// ─────────────────────────────────────────────────────────────
// src/lib/progress.ts
// localStorage による進捗管理のコア型 + ユーティリティ
// ─────────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  attemptCount: number;
  lastAttemptAt: string; // ISO 8601
  hintsUsed: number[];   // 開示済みヒントレベル [1, 2, 3]
  savedCode: string;     // 最後に入力したコード
}

export interface AppProgress {
  version: string;
  lastOpenedLessonId: string | null;
  lessons: Record<string, LessonProgress>;
}

const STORAGE_KEY = "ts-practice-progress";
const PROGRESS_VERSION = "1.0";

export function createEmptyProgress(): AppProgress {
  return {
    version: PROGRESS_VERSION,
    lastOpenedLessonId: null,
    lessons: {},
  };
}

// localStorage から読み込んだ値が AppProgress の最低限の形をしているか検証する。
// version が一致していても lessons が欠損した壊れたデータを弾き、
// Object.values(progress.lessons) 等で落ちるのを防ぐ。
function isValidProgress(value: unknown): value is AppProgress {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "string" &&
    typeof v.lessons === "object" &&
    v.lessons !== null &&
    (v.lastOpenedLessonId === null || typeof v.lastOpenedLessonId === "string")
  );
}

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") {
    return createEmptyProgress();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidProgress(parsed)) return createEmptyProgress();
    // バージョン違いはリセット（将来マイグレーション対応可能）
    if (parsed.version !== PROGRESS_VERSION) return createEmptyProgress();
    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: AppProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage 使用不可（プライベートブラウザなど）は静かに無視
    console.warn("[progress] Failed to save to localStorage");
  }
}

export function getOrCreateLessonProgress(
  progress: AppProgress,
  lessonId: string
): LessonProgress {
  return (
    progress.lessons[lessonId] ?? {
      lessonId,
      completed: false,
      attemptCount: 0,
      lastAttemptAt: new Date().toISOString(),
      hintsUsed: [],
      savedCode: "",
    }
  );
}
