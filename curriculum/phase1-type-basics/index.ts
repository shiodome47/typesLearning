import { lesson01 } from "./ts-01-variable-types";
import { lesson04 } from "./ts-04-type-alias";
import { lesson06 } from "./ts-06-union-literal";
import { lesson11 } from "./ts-11-generics-basics";
import { lesson13 } from "./ts-13-async-await";
import type { Lesson } from "../types";

export const phase1Lessons: Lesson[] = [
  lesson01,
  lesson04,
  lesson06,
  lesson11,
  lesson13,
];
