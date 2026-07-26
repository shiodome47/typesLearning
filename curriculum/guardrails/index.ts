// ─────────────────────────────────────────────────────────────
// ガードレール編（納品できる状態にする）
//
// SvelteKit編までで扱った地雷を、今度は「機械に見つけさせる」章。
//
// AIが1日に数百行書く前提に立つと、レビュー能力を上げる戦略は
// 量が増えた時点で破綻する。人間の精度はコード量に対して一定だが、
// 型と Lint は何行来ても同じ精度で見る。
//
// この章の到達点は「機械が止められないものが3つに絞られる」こと。
// 秘密・認可・仕様。⑥はそれを確認するための診断。
// ─────────────────────────────────────────────────────────────

import type { Lesson } from "../types";
import { grLesson01 } from "./gr-01-types-annotation";
import { grLesson02 } from "./gr-02-app-d-ts";
import { grLesson03 } from "./gr-03-eslint";
import { grLesson04 } from "./gr-04-svelte-check";
import { grLesson05 } from "./gr-05-formdata-boundary";
import { grLesson06 } from "./gr-06-diagnose-guardrail-gap";

export const guardrailLessons: Lesson[] = [
  grLesson01,
  grLesson02,
  grLesson03,
  grLesson04,
  grLesson05,
  grLesson06,
];
