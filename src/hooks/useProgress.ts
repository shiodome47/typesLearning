"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AppProgress,
  LessonProgress,
  loadProgress,
  saveProgress,
  createEmptyProgress,
  getOrCreateLessonProgress,
} from "@/lib/progress";

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(createEmptyProgress());
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage は SSR では使えないため、マウント後に読み込む
  useEffect(() => {
    setProgress(loadProgress());
    setIsLoaded(true);
  }, []);

  // 特定教材の進捗を更新（状態 + localStorage を同時更新）
  const updateLesson = useCallback(
    (lessonId: string, updates: Partial<LessonProgress>) => {
      setProgress((prev) => {
        const current = getOrCreateLessonProgress(prev, lessonId);
        const next: AppProgress = {
          ...prev,
          lastOpenedLessonId: lessonId,
          lessons: {
            ...prev.lessons,
            [lessonId]: { ...current, ...updates },
          },
        };
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const markCompleted = useCallback(
    (lessonId: string) => {
      updateLesson(lessonId, {
        completed: true,
        lastAttemptAt: new Date().toISOString(),
      });
    },
    [updateLesson]
  );

  const saveCode = useCallback(
    (lessonId: string, code: string) => {
      updateLesson(lessonId, { savedCode: code });
    },
    [updateLesson]
  );

  const addHintUsed = useCallback(
    (lessonId: string, hintLevel: number) => {
      setProgress((prev) => {
        const current = getOrCreateLessonProgress(prev, lessonId);
        if (current.hintsUsed.includes(hintLevel)) return prev;
        const next: AppProgress = {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              ...current,
              hintsUsed: [...current.hintsUsed, hintLevel].sort(),
            },
          },
        };
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const incrementAttempt = useCallback(
    (lessonId: string) => {
      setProgress((prev) => {
        const current = getOrCreateLessonProgress(prev, lessonId);
        const next: AppProgress = {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              ...current,
              attemptCount: current.attemptCount + 1,
              lastAttemptAt: new Date().toISOString(),
            },
          },
        };
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const setLastOpened = useCallback(
    (lessonId: string) => {
      setProgress((prev) => {
        const next = { ...prev, lastOpenedLessonId: lessonId };
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgress =>
      getOrCreateLessonProgress(progress, lessonId),
    [progress]
  );

  return {
    progress,
    isLoaded,
    getLessonProgress,
    markCompleted,
    saveCode,
    addHintUsed,
    incrementAttempt,
    setLastOpened,
    updateLesson,
  };
}
