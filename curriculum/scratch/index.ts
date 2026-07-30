// ─────────────────────────────────────────────────────────────
// スクラッチ編
//
// ①→⑥で ToDoアプリのロジックを白紙から組み立てる連続チュートリアル。
//
// 他の編と決定的に違うのは starter に「コードが1行も無い」こと。
// 他の編は穴埋めの枠を用意しているが、それでは
// 「白紙のファイルを前にして何も書けない」という壁を越えられない。
// ここでは要件だけを渡し、最初の1行から自分で決めさせる。
//
// 採点は型だけでは足りない。型だけを見ると
// (list, text) => list のように「型は合うが何もしない」実装が通ってしまい、
// チェックポイントが嘘をつく。実行して挙動を確かめる（kind: "run"）。
//
// ⑥は卒業試験。要件を全部並べ、順番も渡さない。
// 手本なしで書き切れたら「作れる」ということ。
// ─────────────────────────────────────────────────────────────

import { scLesson01 } from "./sc-01-decide-the-type";
import { scLesson02 } from "./sc-02-hold-the-list";
import { scLesson03 } from "./sc-03-toggle-and-remove";
import { scLesson04 } from "./sc-04-derive-dont-store";
import { scLesson05 } from "./sc-05-save-and-load";
import { scLesson06 } from "./sc-06-from-scratch";
import type { Lesson } from "../types";

export const scratchLessons: Lesson[] = [
  scLesson01,
  scLesson02,
  scLesson03,
  scLesson04,
  scLesson05,
  scLesson06,
];
