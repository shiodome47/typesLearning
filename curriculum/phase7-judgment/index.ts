// ─────────────────────────────────────────────────────────────
// Phase 7: 判断力
//
// 「白紙から書ける」の先にある「書かれたコードを信用してよいか判断できる」
// を鍛えるフェーズ。
//   - #33: これまでの伏線（#06/#19/#20/#22/#27）を回収する実戦パターン
//   - #34〜#37: 欠陥コードを読み、危険を見抜いて直す診断モード
// ─────────────────────────────────────────────────────────────

import type { Lesson } from "../types";
import { lesson33 } from "./ts-33-async-state-union";
import { lesson34 } from "./ts-34-diagnose-as-cast";
import { lesson35 } from "./ts-35-diagnose-ssr-hook";
import { lesson36 } from "./ts-36-diagnose-any-leak";
import { lesson37 } from "./ts-37-diagnose-missing-exhaustive";

export const phase7Lessons: Lesson[] = [
  lesson33,
  lesson34,
  lesson35,
  lesson36,
  lesson37,
];
