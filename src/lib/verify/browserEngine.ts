"use client";

// ─────────────────────────────────────────────────────────────
// 採点エンジン（ブラウザ側）
// Monaco に同梱された TypeScript ワーカーを使い、学習者コードに
// 「隠しアサーション」を連結して型診断を取得し、機械的に合否判定する。
//
// 判定方式:
//   kind "type"         : アサーションを連結し、診断が出なければ合格
//   kind "expect-error" : プローブを連結し、診断が「出れば」合格
// ─────────────────────────────────────────────────────────────

import { loader } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";

export interface CheckSpec {
  id: string;
  description: string;
  kind: "type" | "expect-error";
  assert: string;
}

export interface CheckResult {
  id: string;
  description: string;
  pass: boolean;
  firstMessage?: string;
}

// 型同一性・any 検出のためのヘルパー（全チェックの先頭に連結する）
export const PRELUDE = `
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type NotAny<T> = 0 extends (1 & T) ? false : true;
`;

// 最小 React シム（@types/react をブラウザに持ち込まずに JSX を検証するため）
const REACT_SHIM = `
declare namespace JSX {
  interface Element { readonly __jsx: unique symbol }
  interface ElementAttributesProperty { props: {} }
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicElements { [elem: string]: any }
}
declare module "react" {
  export type ReactNode =
    | string | number | boolean | null | undefined
    | JSX.Element | Iterable<ReactNode>;
  export type Key = string | number;
}
declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
`;

let monacoPromise: Promise<Monaco> | null = null;

export function initMonaco(): Promise<Monaco> {
  if (!monacoPromise) {
    // CDN ではなく自己ホストした monaco を使う（オフライン動作・版固定）
    loader.config({ paths: { vs: "/monaco/vs" } });
    monacoPromise = loader.init().then((monaco) => {
      const ts = monaco.languages.typescript;
      ts.typescriptDefaults.setCompilerOptions({
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        noEmit: true,
        allowNonTsExtensions: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        skipLibCheck: true,
      });
      ts.typescriptDefaults.setEagerModelSync(true);
      ts.typescriptDefaults.addExtraLib(
        REACT_SHIM,
        "file:///node_modules/@types/react/index.d.ts"
      );
      return monaco as Monaco;
    });
  }
  return monacoPromise;
}

let seq = 0;

/** 学習者コード + 1件のチェックを型診断にかけ、メッセージ一覧を返す */
async function diagnose(
  monaco: Monaco,
  learnerCode: string,
  assertCode: string
): Promise<string[]> {
  const uri = monaco.Uri.parse(`file:///__check_${seq++}.tsx`);
  const source = `${PRELUDE}\n${learnerCode}\n${assertCode}`;
  const model = monaco.editor.createModel(source, "typescript", uri);
  try {
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const client = await getWorker(uri);
    const [syn, sem] = await Promise.all([
      client.getSyntacticDiagnostics(uri.toString()),
      client.getSemanticDiagnostics(uri.toString()),
    ]);
    return [...syn, ...sem].map((d) =>
      typeof d.messageText === "string"
        ? d.messageText
        : (d.messageText?.messageText ?? "diagnostic")
    );
  } finally {
    model.dispose();
  }
}

/** 学習者コードをチェック仕様で採点する */
export async function grade(
  learnerCode: string,
  checks: CheckSpec[]
): Promise<CheckResult[]> {
  const monaco = await initMonaco();
  const results: CheckResult[] = [];
  for (const c of checks) {
    const messages = await diagnose(monaco, learnerCode, c.assert);
    const hasError = messages.length > 0;
    results.push({
      id: c.id,
      description: c.description,
      pass: c.kind === "expect-error" ? hasError : !hasError,
      firstMessage: messages[0],
    });
  }
  return results;
}
