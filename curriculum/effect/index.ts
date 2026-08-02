// ─────────────────────────────────────────────────────────────
// Effect 編
//
// Effect は学習コストが高く、全体を手で覚えるのは割に合わない。
// そこで白紙練習では攻めず、この編の中心を「診断」に置いている。
//
// Effect を使う理由は結局 1 つで、
//   Effect<成功する値, 起きうるエラー, 必要な依存>
// の 2 つ目の型引数に尽きる。失敗が型に出て、握りつぶすと
// コンパイルが通らない。そこだけを扱う。
//
// 逆に言えば「Effect を使いながらエラー型を never に潰す」書き方が
// 存在し、それは見た目にはまったく正しく見える。
// AI が最も自然にやってしまう修正でもあるので、診断の題材として強い。
//
// ①〜⑤で「失敗と依存が型に出る」を扱ったあと、⑥〜⑩では
// Promise では書けないもの——中断・後始末・構造化並行性・境界の検証——を扱う。
// ここが Effect を使う実利で、①〜⑤が土台になっている。
// 順番は入れ替えられない（⑦の Scope は③の R、⑧の中断は⑥の Fiber を前提にしている）。
//
// 採点は TypeScript 側の型診断をそのまま使う（新しいエンジンは要らない）。
// ただし effect 本体は数百ファイルあるのでブラウザに持ち込まず、
// React シムと同じ考え方で最小の型シムを置いている
// （curriculum/verifySupport.ts の EFFECT_SHIM）。
// ─────────────────────────────────────────────────────────────

import { efLesson01 } from "./ef-01-error-in-type";
import { efLesson02 } from "./ef-02-diagnose-swallowed-error";
import { efLesson03 } from "./ef-03-dependency-in-type";
import { efLesson04 } from "./ef-04-retry-timeout";
import { efLesson05 } from "./ef-05-diagnose-lost-dependency";
import { efLesson06 } from "./ef-06-interruption";
import { efLesson07 } from "./ef-07-acquire-release";
import { efLesson08 } from "./ef-08-structured-concurrency";
import { efLesson09 } from "./ef-09-schema-boundary";
import { efLesson10 } from "./ef-10-diagnose-leak-and-runaway";
import type { Lesson } from "../types";

export const effectLessons: Lesson[] = [
  efLesson01,
  efLesson02,
  efLesson03,
  efLesson04,
  efLesson05,
  efLesson06,
  efLesson07,
  efLesson08,
  efLesson09,
  efLesson10,
];
