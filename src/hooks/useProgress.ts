"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AppProgress,
  LessonProgress,
  loadProgress,
  saveProgress,
  createEmptyProgress,
  getOrCreateLessonProgress,
} from "@/lib/progress";

// コード入力のような高頻度更新で localStorage 書き込みをまとめる遅延（ms）
const SAVE_DEBOUNCE_MS = 400;

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(createEmptyProgress());
  const [isLoaded, setIsLoaded] = useState(false);

  // デバウンス保存用: 未書き込みの最新スナップショットと保存タイマー
  const pendingSaveRef = useRef<AppProgress | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 保留中のデバウンス保存を取り消す（即時保存で最新状態を書く前に呼ぶ）
  const cancelScheduledSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    pendingSaveRef.current = null;
  }, []);

  // 即時保存: 保留中のデバウンス保存を破棄し、最新状態を確定書き込みする
  const persistNow = useCallback(
    (next: AppProgress) => {
      cancelScheduledSave();
      saveProgress(next);
    },
    [cancelScheduledSave]
  );

  // 遅延保存: 最新スナップショットを保持し、一定時間後にまとめて書き込む
  const scheduleSave = useCallback((next: AppProgress) => {
    pendingSaveRef.current = next;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (pendingSaveRef.current) saveProgress(pendingSaveRef.current);
      pendingSaveRef.current = null;
      saveTimerRef.current = null;
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // localStorage は SSR では使えないため、マウント後に読み込む
  useEffect(() => {
    setProgress(loadProgress());
    setIsLoaded(true);
  }, []);

  // アンマウント時・離脱時に保留中の保存をフラッシュ（末尾の入力を取りこぼさない）
  useEffect(() => {
    const flush = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      if (pendingSaveRef.current) {
        saveProgress(pendingSaveRef.current);
        pendingSaveRef.current = null;
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
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
        persistNow(next);
        return next;
      });
    },
    [persistNow]
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

  const markUncompleted = useCallback(
    (lessonId: string) => {
      updateLesson(lessonId, {
        completed: false,
        lastAttemptAt: new Date().toISOString(),
      });
    },
    [updateLesson]
  );

  // コード入力は高頻度なので、in-memory 状態は即時更新しつつ
  // localStorage 書き込みだけをデバウンスする
  const saveCode = useCallback(
    (lessonId: string, code: string) => {
      setProgress((prev) => {
        const current = getOrCreateLessonProgress(prev, lessonId);
        const next: AppProgress = {
          ...prev,
          lastOpenedLessonId: lessonId,
          lessons: {
            ...prev.lessons,
            [lessonId]: { ...current, savedCode: code },
          },
        };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
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
        persistNow(next);
        return next;
      });
    },
    [persistNow]
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
        persistNow(next);
        return next;
      });
    },
    [persistNow]
  );

  const setLastOpened = useCallback(
    (lessonId: string) => {
      setProgress((prev) => {
        const next = { ...prev, lastOpenedLessonId: lessonId };
        persistNow(next);
        return next;
      });
    },
    [persistNow]
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
    markUncompleted,
    saveCode,
    addHintUsed,
    incrementAttempt,
    setLastOpened,
    updateLesson,
  };
}
