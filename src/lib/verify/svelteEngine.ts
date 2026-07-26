"use client";

// ─────────────────────────────────────────────────────────────
// Svelte 採点エンジン
//
// TypeScript の採点は「型について型で問う」方式だったが、Svelte で
// 確かめたいことは型では一切問えない。
//   ・$state を使ったか（使わないと画面が更新されない）
//   ・$derived の代わりに $effect で同期していないか
//   ・{#each} に key があるか（無いと並べ替えでずれる）
//   ・a11y の警告が出ていないか
// これらはコンパイラの AST と警告で判定する。
//
// svelte/compiler はブラウザでも動くので、TypeScript と同じく
// サーバー無しで完結する。
// ─────────────────────────────────────────────────────────────

import type { Checkpoint, CheckSpec, SvelteQuery } from "@curriculum/types";
import type { CheckResult } from "./browserEngine";

/** このエンジンが扱う採点仕様 */
export type SvelteCheckSpec = Extract<
  CheckSpec,
  { kind: "svelte-compile" } | { kind: "svelte-ast" } | { kind: "svelte-no-warning" }
>;

export function isSvelteSpec(spec: CheckSpec): spec is SvelteCheckSpec {
  return (
    spec.kind === "svelte-compile" ||
    spec.kind === "svelte-ast" ||
    spec.kind === "svelte-no-warning"
  );
}

// svelte/compiler は重いので、最初に必要になった時点で読み込む
type SvelteCompiler = typeof import("svelte/compiler");
let compilerPromise: Promise<SvelteCompiler> | null = null;

function loadCompiler(): Promise<SvelteCompiler> {
  if (!compilerPromise) compilerPromise = import("svelte/compiler");
  return compilerPromise;
}

// ── AST 走査 ────────────────────────────────────────────────
interface AstNode {
  type?: string;
  [key: string]: unknown;
}

function walk(node: unknown, visit: (n: AstNode) => void): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, visit));
    return;
  }
  const obj = node as AstNode;
  if (typeof obj.type === "string") visit(obj);
  for (const [key, value] of Object.entries(obj)) {
    // parent は循環参照、loc は位置情報なので辿らない
    if (key === "parent" || key === "loc") continue;
    walk(value, visit);
  }
}

const BLOCK_NODE: Record<string, string> = {
  each: "EachBlock",
  if: "IfBlock",
  await: "AwaitBlock",
  key: "KeyBlock",
};

/** AST クエリを評価する */
function evalQuery(
  ast: { instance?: unknown; module?: unknown; fragment: unknown },
  query: SvelteQuery
): boolean {
  // rune:$state など。<script> 側を見る
  if (query.startsWith("rune:")) {
    const name = query.slice("rune:".length);
    let found = false;
    const visit = (n: AstNode) => {
      if (
        n.type === "CallExpression" &&
        (n.callee as AstNode | undefined)?.type === "Identifier" &&
        (n.callee as { name?: string }).name === name
      ) {
        found = true;
      }
      // $props() は分割代入の右辺にも現れる
      if (n.type === "Identifier" && (n as { name?: string }).name === name) {
        found = true;
      }
    };
    walk(ast.instance, visit);
    walk(ast.module, visit);
    return found;
  }

  // block:each など。テンプレート側を見る
  if (query.startsWith("block:")) {
    const target = BLOCK_NODE[query.slice("block:".length)];
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === target) found = true;
    });
    return found;
  }

  // すべての {#each} に key が付いているか
  if (query === "each:keyed") {
    let total = 0;
    let keyed = 0;
    walk(ast.fragment, (n) => {
      if (n.type === "EachBlock") {
        total++;
        if (n.key) keyed++;
      }
    });
    return total > 0 && total === keyed;
  }

  // {#each} のキーに index を使っていないか（index キーは並べ替えで壊れる）
  if (query === "each:not-index-key") {
    let ok = true;
    walk(ast.fragment, (n) => {
      if (n.type !== "EachBlock") return;
      const indexName = (n.index as string | undefined) ?? null;
      const key = n.key as AstNode | undefined;
      if (!key) {
        ok = false; // キーが無いのは論外
        return;
      }
      if (
        indexName &&
        key.type === "Identifier" &&
        (key as { name?: string }).name === indexName
      ) {
        ok = false; // index をキーにしている
      }
    });
    return ok;
  }

  // $effect の中で代入していないか（$derived で書くべきものを effect で同期していないか）
  if (query === "effect:no-assignment") {
    let clean = true;
    walk(ast.instance, (n) => {
      if (
        n.type !== "CallExpression" ||
        (n.callee as AstNode | undefined)?.type !== "Identifier" ||
        (n.callee as { name?: string }).name !== "$effect"
      ) {
        return;
      }
      walk(n.arguments, (inner) => {
        if (inner.type === "AssignmentExpression" || inner.type === "UpdateExpression") {
          clean = false;
        }
      });
    });
    return clean;
  }

  // $effect が後片付けの関数を返しているか
  if (query === "effect:has-teardown") {
    let found = false;
    walk(ast.instance, (n) => {
      if (
        n.type !== "CallExpression" ||
        (n.callee as AstNode | undefined)?.type !== "Identifier" ||
        (n.callee as { name?: string }).name !== "$effect"
      ) {
        return;
      }
      walk(n.arguments, (inner) => {
        if (inner.type === "ReturnStatement" && inner.argument) found = true;
      });
    });
    return found;
  }

  // {@html} の使用（XSS の危険）
  if (query === "html-tag") {
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === "HtmlTag") found = true;
    });
    return found;
  }

  if (query === "directive:bind") {
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === "BindDirective") found = true;
    });
    return found;
  }

  if (query === "snippet") {
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === "SnippetBlock") found = true;
    });
    return found;
  }

  if (query === "render") {
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === "RenderTag") found = true;
    });
    return found;
  }

  return false;
}

/** 1件のチェック仕様を判定する */
export async function runSvelteCheck(
  source: string,
  spec: SvelteCheckSpec
): Promise<{ pass: boolean; message?: string }> {
  const { parse, compile } = await loadCompiler();

  try {
    if (spec.kind === "svelte-compile") {
      compile(source, { generate: "client", runes: true });
      return { pass: true };
    }

    if (spec.kind === "svelte-no-warning") {
      const { warnings } = compile(source, { generate: "client", runes: true });
      const hit = warnings.filter((w) => w.code === spec.code);
      return {
        pass: hit.length === 0,
        message: hit[0]?.message?.split("\n")[0],
      };
    }

    // svelte-ast
    const ast = parse(source, { modern: true });
    const actual = evalQuery(ast, spec.query);
    const expected = spec.expect ?? true;
    return {
      pass: actual === expected,
      message: actual === expected ? undefined : `${spec.query} が ${actual} でした`,
    };
  } catch (e) {
    // コンパイルできないコードは、どのチェックも判定不能＝不合格
    const message = e instanceof Error ? e.message.split("\n")[0] : "解析できません";
    return { pass: false, message };
  }
}

/** チェックポイント群を採点する */
export async function gradeSvelteCheckpoints(
  source: string,
  checkpoints: Checkpoint[]
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (const cp of checkpoints) {
    if (!cp.verify || !isSvelteSpec(cp.verify)) {
      results.push({
        id: cp.id,
        description: cp.description,
        graded: false,
        pass: false,
      });
      continue;
    }
    const { pass, message } = await runSvelteCheck(source, cp.verify);
    results.push({
      id: cp.id,
      description: cp.description,
      graded: true,
      pass,
      message,
    });
  }
  return results;
}
