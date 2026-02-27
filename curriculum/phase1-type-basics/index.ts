import { lesson01 } from "./ts-01-variable-types";
import { lesson02 } from "./ts-02-function-types";
import { lesson03 } from "./ts-03-object-types";
import { lesson04 } from "./ts-04-type-alias";
import { lesson05 } from "./ts-05-interface";
import { lesson06 } from "./ts-06-union-literal";
import { lesson11 } from "./ts-11-generics-basics";
import { lesson13 } from "./ts-13-async-await";
import type { Lesson } from "../types";

export const phase1Lessons: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson11,
  lesson13,
];
