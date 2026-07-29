// ─────────────────────────────────────────────────────────────
// Compact 編（Midnight / 現 LFDT Minokawa）
//
// ①→⑨で会員制の掲示板とオークションを作り上げる連続チュートリアル。
//
// Compact は「公開・秘匿・証明の境界を、文法として設計させる」言語。
// 引数と witness は既定で private で、disclose を通したものだけが公開される。
// つまり公開事故は必ず disclose の位置に現れるので、
// SvelteKit 編の「秘密がブラウザに配られる」と同じ構図を、
// 今度は言語仕様のレベルで扱える。
//
// ①で「全部公開でよい世界」を書いてから、②で秘密が登場する。
// 何が増えたのかを差分で見せるための順番。
// ④で教えた認可の作法を⑨の診断で、⑤⑥の選択的開示を⑦の診断で回収する
// （SvelteKit 編の sk-04 → sk-09 と同じ構造）。
//
// 採点はコンパイラ無しの構造チェック（curriculum/checks.ts）。
// ZK 証明を実際に走らせなくても、境界の設計判断は構造で問える。
// ─────────────────────────────────────────────────────────────

import { cpLesson01 } from "./cp-01-ledger-circuit";
import { cpLesson02 } from "./cp-02-witness-secret";
import { cpLesson03 } from "./cp-03-assert-guard";
import { cpLesson04 } from "./cp-04-authorization";
import { cpLesson05 } from "./cp-05-selective-disclosure";
import { cpLesson06 } from "./cp-06-diagnose-secret-leak";
import { cpLesson07 } from "./cp-07-dapp-wiring";
import { cpLesson08 } from "./cp-08-range-proof";
import { cpLesson09 } from "./cp-09-diagnose-over-disclosure";
import type { Lesson } from "../types";

export const compactLessons: Lesson[] = [
  cpLesson01,
  cpLesson02,
  cpLesson03,
  cpLesson04,
  cpLesson05,
  cpLesson06,
  cpLesson07,
  cpLesson08,
  cpLesson09,
];
