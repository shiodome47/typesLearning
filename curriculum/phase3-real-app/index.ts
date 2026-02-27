// phase3-real-app: 実アプリ構造の基礎パターン（#12, #14, #15）
//
// #11 Generics基礎 と #13 async/await は
// MVP時に phase1-type-basics に先行追加済みのため重複なし。
// allLessons は order でソートされ、全18件で完全な学習順になります。

import { lesson12 } from "./ts-12-promise";
import { lesson14 } from "./ts-14-error-handling";
import { lesson15 } from "./ts-15-api-fetch";
import type { Lesson } from "../types";

export const phase3Lessons: Lesson[] = [lesson12, lesson14, lesson15];
