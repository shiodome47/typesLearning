// ─────────────────────────────────────────────────────────────
// curriculum/checks.ts
// Svelte / SvelteKit の採点ロジック本体（フレームワーク非依存）
//
// ブラウザ（src/lib/verify/*.ts）と検証ハーネス（scripts/verify-curriculum.mjs）
// の両方がこのモジュールを使う。実装が 1 つなので、CI が通れば
// 実際の採点も同じ結果になる。
//
// svelte/compiler はブラウザでは遅延ロードしたいので、直接 import せず
// 呼び出し側から渡してもらう（SvelteApi）。
// ─────────────────────────────────────────────────────────────

import type { CheckSpec, SvelteQuery } from "./types";

// ── コンパイラの最小インターフェース ────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SvelteApi {
  parse: (source: string, options: { modern: true }) => any;
  compile: (
    source: string,
    options: { generate: "client"; runes: true }
  ) => { warnings: { code: string; message: string }[] };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface CheckOutcome {
  pass: boolean;
  message?: string;
}

interface AstNode {
  type?: string;
  [key: string]: unknown;
}

/** ファイル名 → 中身 */
export type FileMap = Record<string, string>;

// ── AST 走査 ────────────────────────────────────────────────
export function walk(node: unknown, visit: (n: AstNode) => void): void {
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

function nodeName(n: unknown): string | undefined {
  return (n as { name?: string } | undefined)?.name;
}

// ── ファイルの解析 ──────────────────────────────────────────

/** .svelte 以外（.ts / .js）か */
export function isScriptFile(path: string): boolean {
  return !path.endsWith(".svelte");
}

/**
 * この採点エンジンが解析できる拡張子か。
 * 教材には参考として YAML などを添えることがあるので、
 * 解析対象を明示して「読めないファイルで落ちる」のを防ぐ。
 */
export function isParsableFile(path: string): boolean {
  return /\.(svelte|ts|js|mjs|json)$/.test(path);
}

/**
 * ファイルを解析して Svelte 形式の AST を返す。
 *
 * .ts / .js は `<script lang="ts">` で包んで Svelte のパーサに渡す。
 * Svelte 5 のパーサは lang="ts" のとき TypeScript を解析できるので、
 * これだけで型注釈込みの本物の AST が手に入る。
 * TypeScript 本体をブラウザに持ち込まずに済むのが利点。
 */
export function parseFile(
  api: SvelteApi,
  path: string,
  source: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (path.endsWith(".json")) {
    // JSON 単体は式なので、代入の右辺にして構文として成立させる
    return api.parse(`<script lang="ts">\nconst __json = ${source};\n</script>`, {
      modern: true,
    });
  }
  if (isScriptFile(path)) {
    return api.parse(`<script lang="ts">\n${source}\n</script>`, {
      modern: true,
    });
  }
  return api.parse(source, { modern: true });
}

/** <script> と <script module> の中身をまとめて走査する */
function walkScripts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ast: any,
  visit: (n: AstNode) => void
): void {
  walk(ast?.instance, visit);
  walk(ast?.module, visit);
}

// ── Svelte（単一ファイル）のクエリ ──────────────────────────

const BLOCK_NODE: Record<string, string> = {
  each: "EachBlock",
  if: "IfBlock",
  await: "AwaitBlock",
  key: "KeyBlock",
};

/** Svelte の AST に対する述語を評価する */
export function evalSvelteQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ast: any,
  query: SvelteQuery
): boolean {
  // rune:$state など。<script> 側を見る
  if (query.startsWith("rune:")) {
    const name = query.slice("rune:".length);
    let found = false;
    walkScripts(ast, (n) => {
      if (
        n.type === "CallExpression" &&
        (n.callee as AstNode | undefined)?.type === "Identifier" &&
        nodeName(n.callee) === name
      ) {
        found = true;
      }
      // $props() は分割代入の右辺にも現れる
      if (n.type === "Identifier" && nodeName(n) === name) found = true;
    });
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
      if (indexName && key.type === "Identifier" && nodeName(key) === indexName) {
        ok = false; // index をキーにしている
      }
    });
    return ok;
  }

  // $effect の中で代入していないか（$derived で書くべきものを effect で同期していないか）
  if (query === "effect:no-assignment") {
    let clean = true;
    walkScripts(ast, (n) => {
      if (!isCallTo(n, "$effect")) return;
      walk(n.arguments, (inner) => {
        if (
          inner.type === "AssignmentExpression" ||
          inner.type === "UpdateExpression"
        ) {
          clean = false;
        }
      });
    });
    return clean;
  }

  // $effect が後片付けの関数を返しているか
  if (query === "effect:has-teardown") {
    let found = false;
    walkScripts(ast, (n) => {
      if (!isCallTo(n, "$effect")) return;
      walk(n.arguments, (inner) => {
        if (inner.type === "ReturnStatement" && inner.argument) found = true;
      });
    });
    return found;
  }

  const FRAGMENT_NODE: Record<string, string> = {
    "html-tag": "HtmlTag",
    "directive:bind": "BindDirective",
    snippet: "SnippetBlock",
    render: "RenderTag",
  };
  const target = FRAGMENT_NODE[query];
  if (target) {
    let found = false;
    walk(ast.fragment, (n) => {
      if (n.type === target) found = true;
    });
    return found;
  }

  return false;
}

function isCallTo(n: AstNode, name: string): boolean {
  return (
    n.type === "CallExpression" &&
    (n.callee as AstNode | undefined)?.type === "Identifier" &&
    nodeName(n.callee) === name
  );
}

// ── SvelteKit（複数ファイル）のクエリ ───────────────────────

/**
 * サーバーでしか動かないファイルか。
 *
 * SvelteKit はファイル名でこれを決める。`.server.` を含むファイルと
 * src/lib/server/ 配下は、ビルド時にクライアントバンドルから除外される。
 * つまりここに書いた秘密はブラウザに届かない。
 */
export function isServerOnlyFile(path: string): boolean {
  return /\.server\.[jt]s$/.test(path) || path.includes("/lib/server/");
}

/** 指定ファイルが export している名前の一覧 */
export function exportedNames(
  api: SvelteApi,
  path: string,
  source: string
): string[] {
  const ast = parseFile(api, path, source);
  const names: string[] = [];
  const body: AstNode[] = ast?.instance?.content?.body ?? [];
  for (const n of body) {
    if (n.type === "ExportNamedDeclaration") {
      const decl = n.declaration as AstNode | undefined;
      if (decl?.type === "VariableDeclaration") {
        for (const d of (decl.declarations as AstNode[]) ?? []) {
          const id = d.id as AstNode | undefined;
          if (id?.type === "Identifier") names.push(nodeName(id)!);
        }
      } else if (decl && nodeName(decl.id)) {
        names.push(nodeName(decl.id)!);
      }
      // export { a, b } 形式
      for (const s of (n.specifiers as AstNode[]) ?? []) {
        const exported = nodeName(s.exported);
        if (exported) names.push(exported);
      }
    }
    if (n.type === "ExportDefaultDeclaration") names.push("default");
  }
  return names;
}

interface ImportInfo {
  source: string;
  names: string[];
}

/** 指定ファイルの import 一覧 */
export function importsOf(
  api: SvelteApi,
  path: string,
  source: string
): ImportInfo[] {
  const ast = parseFile(api, path, source);
  const out: ImportInfo[] = [];
  walkScripts(ast, (n) => {
    if (n.type !== "ImportDeclaration") return;
    const src = (n.source as { value?: string } | undefined)?.value;
    if (typeof src !== "string") return;
    const names = ((n.specifiers as AstNode[]) ?? [])
      .map((s) => nodeName(s.imported) ?? nodeName(s.local))
      .filter((v): v is string => Boolean(v));
    out.push({ source: src, names });
  });
  return out;
}

/** return しているオブジェクトのキー（load の戻り値を見るのに使う） */
function returnedKeys(
  api: SvelteApi,
  path: string,
  source: string,
  exportName: string
): string[] {
  const ast = parseFile(api, path, source);
  const body: AstNode[] = ast?.instance?.content?.body ?? [];
  const keys: string[] = [];

  const collect = (node: unknown) => {
    walk(node, (n) => {
      if (n.type !== "ReturnStatement") return;
      const arg = n.argument as AstNode | undefined;
      if (arg?.type !== "ObjectExpression") return;
      for (const p of (arg.properties as AstNode[]) ?? []) {
        if (p.type === "Property") {
          const k = p.key as AstNode | undefined;
          const name = nodeName(k) ?? (k?.value as string | undefined);
          if (typeof name === "string") keys.push(name);
        }
        // { ...rest } は中身が分からないので目印として残す
        if (p.type === "SpreadElement") keys.push("...");
      }
    });
  };

  for (const n of body) {
    if (n.type !== "ExportNamedDeclaration") continue;
    const decl = n.declaration as AstNode | undefined;
    if (decl?.type === "VariableDeclaration") {
      for (const d of (decl.declarations as AstNode[]) ?? []) {
        if (nodeName(d.id) === exportName) collect(d.init);
      }
    } else if (decl && nodeName(decl.id) === exportName) {
      collect(decl.body);
    }
  }
  return keys;
}

/** $props() の分割代入で受け取っているキー */
function propsKeys(api: SvelteApi, path: string, source: string): string[] {
  const ast = parseFile(api, path, source);
  const keys: string[] = [];
  walkScripts(ast, (n) => {
    if (n.type !== "VariableDeclarator") return;
    const init = n.init as AstNode | undefined;
    if (!init || !isCallTo(init, "$props")) return;
    const id = n.id as AstNode | undefined;
    if (id?.type !== "ObjectPattern") return;
    for (const p of (id.properties as AstNode[]) ?? []) {
      const name = nodeName(p.key);
      if (name) keys.push(name);
    }
  });
  return keys;
}

/** 属性値を文字列として取り出す（`method="POST"` の "POST"） */
function attrText(attr: AstNode): string | null {
  const value = attr.value;
  if (value === true) return "";
  if (!Array.isArray(value)) return null;
  const parts = value.map((v) => {
    const node = v as AstNode;
    if (node.type === "Text") return (node.data as string) ?? "";
    return null;
  });
  return parts.every((p) => p !== null) ? parts.join("") : null;
}

function requireFile(files: FileMap, path: string): string {
  const source = files[path];
  if (source === undefined) {
    throw new Error(`ファイルがありません: ${path}`);
  }
  return source;
}

// ── 採点の実行 ──────────────────────────────────────────────

/** Svelte 単一ファイル用の採点仕様か */
export function isSvelteSpecKind(kind: CheckSpec["kind"]): boolean {
  return (
    kind === "svelte-compile" ||
    kind === "svelte-ast" ||
    kind === "svelte-no-warning"
  );
}

/** SvelteKit（複数ファイル）用の採点仕様か */
export function isKitSpecKind(kind: CheckSpec["kind"]): boolean {
  return kind.startsWith("kit-");
}

/**
 * 採点仕様を 1 件判定する。
 * files は「パス → 現在の中身」。単一ファイル教材でも
 * { "main.svelte": code } の形にして渡す。
 */
export function runCheck(
  api: SvelteApi,
  files: FileMap,
  spec: CheckSpec,
  defaultFile: string
): CheckOutcome {
  try {
    return runCheckInner(api, files, spec, defaultFile);
  } catch (e) {
    // 解析できないコードは、どのチェックも判定不能＝不合格
    const message =
      e instanceof Error ? e.message.split("\n")[0] : "解析できません";
    return { pass: false, message };
  }
}

function runCheckInner(
  api: SvelteApi,
  files: FileMap,
  spec: CheckSpec,
  defaultFile: string
): CheckOutcome {
  switch (spec.kind) {
    case "type":
    case "expect-error":
      // TypeScript の採点は Monaco 側が担当する
      return { pass: false, message: "このエンジンでは判定できません" };

    // ── Svelte 単一ファイル ──
    case "svelte-compile": {
      const path = spec.file ?? defaultFile;
      api.compile(requireFile(files, path), {
        generate: "client",
        runes: true,
      });
      return { pass: true };
    }

    case "svelte-no-warning": {
      const path = spec.file ?? defaultFile;
      const { warnings } = api.compile(requireFile(files, path), {
        generate: "client",
        runes: true,
      });
      const hit = warnings.filter((w) => w.code === spec.code);
      return { pass: hit.length === 0, message: hit[0]?.message.split("\n")[0] };
    }

    case "svelte-ast": {
      const path = spec.file ?? defaultFile;
      const ast = parseFile(api, path, requireFile(files, path));
      const actual = evalSvelteQuery(ast, spec.query);
      const expected = spec.expect ?? true;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${spec.query} が見つかりません`
              : `${spec.query} を使わないでください`,
      };
    }

    // ── SvelteKit ──
    case "kit-parse": {
      for (const [path, source] of Object.entries(files)) {
        if (!isParsableFile(path)) continue;
        try {
          parseFile(api, path, source);
        } catch (e) {
          const m = e instanceof Error ? e.message.split("\n")[0] : "解析失敗";
          return { pass: false, message: `${path}: ${m}` };
        }
      }
      return { pass: true };
    }

    case "kit-export": {
      const names = exportedNames(api, spec.file, requireFile(files, spec.file));
      const actual = names.includes(spec.name);
      const expected = spec.expect ?? true;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${spec.file} が ${spec.name} を export していません`
              : `${spec.file} は ${spec.name} を export すべきではありません`,
      };
    }

    case "kit-import": {
      const list = importsOf(api, spec.file, requireFile(files, spec.file));
      const hit = list.filter((i) => i.source === spec.source);
      const actual = spec.name
        ? hit.some((i) => i.names.includes(spec.name!))
        : hit.length > 0;
      const expected = spec.expect ?? true;
      const what = spec.name ? `${spec.name} を ${spec.source}` : spec.source;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${spec.file} が ${what} から import していません`
              : `${spec.file} は ${what} から import すべきではありません`,
      };
    }

    case "kit-load-returns": {
      const keys = returnedKeys(
        api,
        spec.file,
        requireFile(files, spec.file),
        "load"
      );
      const missing = (spec.keys ?? []).filter((k) => !keys.includes(k));
      if (missing.length > 0) {
        return {
          pass: false,
          message: `load が ${missing.join(", ")} を返していません`,
        };
      }
      const leaked = (spec.forbid ?? []).filter((k) => keys.includes(k));
      if (leaked.length > 0) {
        return {
          pass: false,
          message: `load の戻り値はブラウザに送られます。${leaked.join(", ")} を返してはいけません`,
        };
      }
      return { pass: true };
    }

    case "kit-props": {
      const keys = propsKeys(api, spec.file, requireFile(files, spec.file));
      const missing = spec.keys.filter((k) => !keys.includes(k));
      return {
        pass: missing.length === 0,
        message:
          missing.length === 0
            ? undefined
            : `$props() で ${missing.join(", ")} を受け取っていません`,
      };
    }

    case "kit-use": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let actual = false;
      walk(ast.fragment, (n) => {
        if (n.type === "UseDirective" && nodeName(n) === spec.name) actual = true;
      });
      const expected = spec.expect ?? true;
      return {
        pass: actual === expected,
        message:
          actual === expected ? undefined : `use:${spec.name} が付いていません`,
      };
    }

    case "kit-attr": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let found = false;
      let matched = false;
      walk(ast.fragment, (n) => {
        if (n.type !== "RegularElement" || nodeName(n) !== spec.element) return;
        found = true;
        for (const a of (n.attributes as AstNode[]) ?? []) {
          if (a.type !== "Attribute" || nodeName(a) !== spec.name) continue;
          if (spec.value === undefined) {
            matched = true;
            continue;
          }
          const text = attrText(a);
          if (text !== null && text.toLowerCase() === spec.value.toLowerCase()) {
            matched = true;
          }
        }
      });
      if (!found) {
        return { pass: false, message: `<${spec.element}> がありません` };
      }
      return {
        pass: matched,
        message: matched
          ? undefined
          : spec.value === undefined
            ? `<${spec.element}> に ${spec.name} がありません`
            : `<${spec.element} ${spec.name}="${spec.value}"> になっていません`,
      };
    }

    case "kit-calls": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let actual = false;
      walkScripts(ast, (n) => {
        if (isCallTo(n, spec.name)) actual = true;
      });
      const expected = spec.expect ?? true;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${spec.name}() を呼んでいません`
              : `${spec.name}() を使わないでください`,
      };
    }

    case "kit-declares": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let found = false;
      const members: string[] = [];
      walkScripts(ast, (n) => {
        const isDecl =
          n.type === "TSInterfaceDeclaration" ||
          n.type === "TSTypeAliasDeclaration";
        if (!isDecl || nodeName(n.id) !== spec.name) return;
        found = true;
        // interface の本体は body.body、type エイリアスは typeAnnotation.members
        const body =
          ((n.body as AstNode | undefined)?.body as AstNode[] | undefined) ??
          ((n.typeAnnotation as AstNode | undefined)?.members as
            | AstNode[]
            | undefined) ??
          [];
        for (const m of body) {
          const key = nodeName(m.key);
          if (key) members.push(key);
        }
      });
      if (!found) {
        return {
          pass: false,
          message: `${spec.file} に ${spec.name} の宣言がありません`,
        };
      }
      const missing = (spec.members ?? []).filter((m) => !members.includes(m));
      return {
        pass: missing.length === 0,
        message:
          missing.length === 0
            ? undefined
            : `${spec.name} に ${missing.join(", ")} がありません`,
      };
    }

    case "kit-annotated": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let declared = false;
      let annotation: string | null = null;
      walkScripts(ast, (n) => {
        if (n.type !== "VariableDeclarator" || nodeName(n.id) !== spec.name) {
          return;
        }
        declared = true;
        const ta = (n.id as AstNode).typeAnnotation as AstNode | undefined;
        const inner = ta?.typeAnnotation as AstNode | undefined;
        const name = nodeName(inner?.typeName);
        if (name) annotation = name;
      });
      if (!declared) {
        return { pass: false, message: `${spec.name} が見つかりません` };
      }
      if (annotation === null) {
        return {
          pass: false,
          message: `${spec.name} に型注釈が付いていません（: ${spec.type} を書いてください）`,
        };
      }
      return {
        pass: annotation === spec.type,
        message:
          annotation === spec.type
            ? undefined
            : `${spec.name} の型が ${annotation} になっています（期待: ${spec.type}）`,
      };
    }

    case "kit-contains-string": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let actual = false;
      walkScripts(ast, (n) => {
        if (n.type !== "Literal") return;
        const v = (n as { value?: unknown }).value;
        if (typeof v === "string" && v.includes(spec.value)) actual = true;
      });
      const expected = spec.expect ?? true;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${spec.file} に "${spec.value}" がありません`
              : `${spec.file} に "${spec.value}" を書かないでください`,
      };
    }

    case "kit-member": {
      const ast = parseFile(api, spec.file, requireFile(files, spec.file));
      let actual = false;
      const visit = (n: AstNode) => {
        if (n.type !== "MemberExpression") return;
        if (nodeName(n.object) !== spec.object) return;
        if (nodeName(n.property) !== spec.property) return;
        actual = true;
      };
      walkScripts(ast, visit);
      // .svelte はテンプレート側にも式が書ける（{data.bukken.name} など）
      walk(ast.fragment, visit);
      const expected = spec.expect ?? true;
      const what = `${spec.object}.${spec.property}`;
      return {
        pass: actual === expected,
        message:
          actual === expected
            ? undefined
            : expected
              ? `${what} が見つかりません`
              : `${what} は間違いです`,
      };
    }

    case "kit-server-only": {
      const leaks: string[] = [];
      for (const [path, source] of Object.entries(files)) {
        if (isServerOnlyFile(path) || !isParsableFile(path)) continue;
        const hit = importsOf(api, path, source).some(
          (i) => i.source === spec.source
        );
        if (hit) leaks.push(path);
      }
      return {
        pass: leaks.length === 0,
        message:
          leaks.length === 0
            ? undefined
            : `${leaks.join(", ")} が ${spec.source} を import しています。` +
              `このファイルはブラウザにも配られるので、中身が全世界に見えます`,
      };
    }
  }
}
