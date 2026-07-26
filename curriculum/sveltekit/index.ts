// ─────────────────────────────────────────────────────────────
// SvelteKit カリキュラム
//
// 単発の練習問題ではなく、1つの物件サイトを9回かけて作り上げる
// 連続チュートリアルにしてある。
//
// そうした理由は2つ。
//   1. SvelteKit の難しさは構文ではなく「どのファイルに書くか」にあり、
//      それは1画面の中で完結する問題ではないため
//   2. 動くものが1本仕上がるほうが、最後まで行く動機が続くため
//
// 各回は前の回の成果物を引き継ぐ。④（サーバー境界）と
// ⑨（診断）がこの章の中心で、他はそこへ至る足場という位置づけ。
// ─────────────────────────────────────────────────────────────

import type { Lesson } from "../types";
import { skLesson01 } from "./sk-01-routing";
import { skLesson02 } from "./sk-02-load";
import { skLesson03 } from "./sk-03-dynamic-route";
import { skLesson04 } from "./sk-04-server-boundary";
import { skLesson05 } from "./sk-05-layout";
import { skLesson06 } from "./sk-06-form-actions";
import { skLesson07 } from "./sk-07-enhance";
import { skLesson08 } from "./sk-08-hooks-auth";
import { skLesson09 } from "./sk-09-diagnose-review";

export const svelteKitLessons: Lesson[] = [
  skLesson01,
  skLesson02,
  skLesson03,
  skLesson04,
  skLesson05,
  skLesson06,
  skLesson07,
  skLesson08,
  skLesson09,
];
