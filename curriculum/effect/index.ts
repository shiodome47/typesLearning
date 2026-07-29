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
// 採点は TypeScript 側の型診断をそのまま使う（新しいエンジンは要らない）。
// ただし effect 本体は数百ファイルあるのでブラウザに持ち込まず、
// React シムと同じ考え方で最小の型シムを置いている
// （curriculum/verifySupport.ts の EFFECT_SHIM）。
// ─────────────────────────────────────────────────────────────

import { efLesson01 } from "./ef-01-error-in-type";
import { efLesson02 } from "./ef-02-diagnose-swallowed-error";
import type { Lesson } from "../types";

export const effectLessons: Lesson[] = [efLesson01, efLesson02];
