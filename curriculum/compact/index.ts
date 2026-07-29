// ─────────────────────────────────────────────────────────────
// Compact 編（Midnight / 現 LFDT Minokawa）
//
// Compact は「公開・秘匿・証明の境界を、文法として設計させる」言語。
// 引数と witness は既定で private で、disclose を通したものだけが公開される。
// つまり公開事故は必ず disclose の位置に現れるので、
// SvelteKit 編の「秘密がブラウザに配られる」と同じ構図を、
// 今度は言語仕様のレベルで扱える。
//
// 採点はコンパイラ無しの構造チェック（curriculum/checks.ts）。
// ZK 証明を実際に走らせなくても、境界の設計判断は構造で問える。
// ─────────────────────────────────────────────────────────────

import { cpLesson01 } from "./cp-01-ledger-circuit";
import { cpLesson02 } from "./cp-02-diagnose-secret-leak";
import type { Lesson } from "../types";

export const compactLessons: Lesson[] = [cpLesson01, cpLesson02];
