// ─────────────────────────────────────────────────────────────
// Monaco の TypeScript 言語設定（エディタ・ビューア・採点エンジンで共有）
//
// React 教材は JSX を含むため、jsx オプションと React の型が無いと
// 正しいコードにも赤波線が出てしまう。ここで一元的に設定する。
// ─────────────────────────────────────────────────────────────

import type { Monaco } from "@monaco-editor/react";
import type { LessonLanguage } from "@curriculum/types";

// 採点の前提はブラウザ/Node で共通の定義を使う（curriculum/verifySupport.ts）
export { PRELUDE, REACT_SHIM } from "@curriculum/verifySupport";
import { REACT_SHIM } from "@curriculum/verifySupport";

// ── Monaco インスタンスの共有 ───────────────────────────────
// エディタのマウント時に登録し、採点エンジンから参照する。
// （採点だけのために Monaco を二重ロードしないため）
let instance: Monaco | null = null;
let waiters: ((m: Monaco) => void)[] = [];

export function registerMonaco(monaco: Monaco): void {
  instance = monaco;
  waiters.forEach((resolve) => resolve(monaco));
  waiters = [];
}

/** エディタがマウントされて Monaco が利用可能になるまで待つ */
export function whenMonacoReady(): Promise<Monaco> {
  if (instance) return Promise.resolve(instance);
  return new Promise((resolve) => waiters.push(resolve));
}

let configured = false;

/**
 * TypeScript の言語サービスを教材向けに設定する。
 * 複数のエディタから呼ばれるため冪等。
 */
export function configureTypeScript(monaco: Monaco): void {
  if (configured) return;
  configured = true;

  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    allowNonTsExtensions: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    skipLibCheck: true,
    esModuleInterop: true,
  });
  ts.typescriptDefaults.setEagerModelSync(true);
  ts.typescriptDefaults.addExtraLib(
    REACT_SHIM,
    "file:///node_modules/@types/react/index.d.ts"
  );
}

/**
 * 教材の言語 → Monaco の言語ID。
 * Monaco に Svelte の言語サービスは無いので html を使う。
 * テンプレートも `<script>` 内の JS も妥当に色分けされる。
 */
export function monacoLanguageFor(language: LessonLanguage): string {
  return language === "svelte" ? "html" : "typescript";
}

/** モデルのパス。拡張子で TypeScript 側の解析対象かどうかが決まる */
export function modelPathFor(language: LessonLanguage, name: string): string {
  return language === "svelte"
    ? `file:///${name}.svelte`
    : `file:///${name}.tsx`;
}

/** 型エラーの赤波線を ON/OFF する */
export function applyDiagnostics(monaco: Monaco, enabled: boolean): void {
  const opts = {
    noSemanticValidation: !enabled,
    noSyntaxValidation: !enabled,
  };
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(opts);
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(opts);
}
