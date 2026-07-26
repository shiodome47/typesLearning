// ─────────────────────────────────────────────────────────────
// Svelte 5（runes）カリキュラム
//
// 目的が TypeScript 版と違う。こちらは「AIが使えない状況でも書ける」
// という保険としての能力を作ることが主眼なので、中核の構文は手が
// 覚えるまでやる価値がある。ただし Svelte の中核は小さいので16件で足りる。
//
// 一方で Svelte の失敗は「落ちない。動く。でも間違っている」が主戦場。
// 書く練習では原理的に気づけないため、診断の比率を TypeScript 版より
// 意図的に上げてある。
// ─────────────────────────────────────────────────────────────

import type { Lesson } from "../types";
import { svLesson01 } from "./sv-01-reactive-basics";
import { svLesson02 } from "./sv-02-derived-values";
import { svLesson03 } from "./sv-03-diagnose-effect-sync";
import { svLesson04 } from "./sv-04-effect-teardown";
import { svLesson05 } from "./sv-05-component-props";
import { svLesson06 } from "./sv-06-diagnose-props-mutation";
import { svLesson07 } from "./sv-07-bindable";
import { svLesson08 } from "./sv-08-snippet";
import { svLesson09 } from "./sv-09-diagnose-each-key";
import { svLesson10 } from "./sv-10-form-validation";
import { svLesson11 } from "./sv-11-diagnose-a11y";
import { svLesson12 } from "./sv-12-shared-state-class";
import { svLesson13 } from "./sv-13-routing-layout";
import { svLesson14 } from "./sv-14-load-data";
import { svLesson15 } from "./sv-15-diagnose-server-shared-state";
import { svLesson16 } from "./sv-16-diagnose-legacy-syntax";

export const svelteLessons: Lesson[] = [
  svLesson01, svLesson02, svLesson03, svLesson04,
  svLesson05, svLesson06, svLesson07, svLesson08,
  svLesson09, svLesson10, svLesson11, svLesson12,
  svLesson13, svLesson14, svLesson15, svLesson16,
];
