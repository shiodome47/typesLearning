// ─────────────────────────────────────────────────────────────
// スクラッチ編
//
// ①→⑪で ToDoアプリのロジックを白紙から組み立てる連続チュートリアル。
//
// 他の編と決定的に違うのは starter に「コードが1行も無い」こと。
// 他の編は穴埋めの枠を用意しているが、それでは
// 「白紙のファイルを前にして何も書けない」という壁を越えられない。
//
// 各回で新しいことは1つだけにしてある。
// 最初は6件だったが、①が「型」と「関数」を同時に要求し、しかも
// 説明していない書き方（=> ({...}) / 省略記法 / ++ / export）を
// 使っていたため手本すら読めなかった。刻み直した結果が11件。
//
// 手本では省略記法を使わない。text: text と書き、return を省かない。
// 短く書けることは知識として要らない。読めることが要る。
//
// 採点は型だけでは足りない。型だけを見ると
// (list, text) => list のように「型は合うが何もしない」実装が通り、
// チェックポイントが嘘をつく。実行して挙動を確かめる（kind: "run"）。
// ─────────────────────────────────────────────────────────────

import { scLesson01 } from "./sc-01-write-one-type";
import { scLesson02 } from "./sc-02-return-an-object";
import { scLesson03 } from "./sc-03-unique-id";
import { scLesson04 } from "./sc-04-add-without-breaking";
import { scLesson05 } from "./sc-05-toggle-one";
import { scLesson06 } from "./sc-06-remove-one";
import { scLesson07 } from "./sc-07-derive-dont-store";
import { scLesson08 } from "./sc-08-save-and-load-basic";
import { scLesson09 } from "./sc-09-survive-broken-json";
import { scLesson10 } from "./sc-10-check-the-shape";
import { scLesson11 } from "./sc-11-from-scratch";
import type { Lesson } from "../types";

export const scratchLessons: Lesson[] = [
  scLesson01,
  scLesson02,
  scLesson03,
  scLesson04,
  scLesson05,
  scLesson06,
  scLesson07,
  scLesson08,
  scLesson09,
  scLesson10,
  scLesson11,
];
