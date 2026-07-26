// ─────────────────────────────────────────────────────────────
// 教材検証ハーネス
//
// 教材コードはテンプレート文字列なので tsc の対象外になり、これまで
// 一度も型チェックされていなかった。このスクリプトが以下を保証する。
//
//   1. 全レッスンの模範コードに型エラーが無いこと
//   2. 各 checkpoint.verify のアサーションが模範コードに対して
//      正しく「合格」すること（＝採点仕様そのものが正しいこと）
//   3. relatedIds が実在するレッスンを指していること
//
// ブラウザ側の採点と同じ React シム・同じ PRELUDE を使うため、
// ここで通れば実際の採点でも同じ結果になる。
// ─────────────────────────────────────────────────────────────

import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  ".."
);
// 並列実行しても衝突しないようプロセスごとに分ける
const TMP = path.join(ROOT, `.verify-tmp-${process.pid}`);
const require = createRequire(import.meta.url);
const ts = require(path.join(ROOT, "node_modules/typescript/lib/typescript.js"));

// ── 教材データを読み込む ────────────────────────────────────
function loadCurriculum() {
  fs.rmSync(TMP, { recursive: true, force: true });
  execSync(
    `node node_modules/typescript/bin/tsc curriculum/index.ts curriculum/verifySupport.ts ` +
      `--outDir ${TMP} --module commonjs --target es2020 ` +
      `--esModuleInterop --skipLibCheck --moduleResolution node`,
    { cwd: ROOT, stdio: "pipe" }
  );
  return require(path.join(TMP, "index.js"));
}

const { allLessons } = loadCurriculum();
const { PRELUDE, REACT_SHIM } = require(path.join(TMP, "verifySupport.js"));

// ── 型チェック ──────────────────────────────────────────────
const SHIM_PATH = path.join(ROOT, "__react_shim__.d.ts");
const CHECK_PATH = path.join(ROOT, "__check__.tsx");

const OPTIONS = {
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  esModuleInterop: true,
  lib: ["lib.es2020.d.ts", "lib.dom.d.ts"],
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  // react はブラウザ側と同じシムに解決させる（実際の @types/react を使わない）
  paths: {
    react: [SHIM_PATH],
    "react/jsx-runtime": [SHIM_PATH],
  },
  baseUrl: ROOT,
  types: [],
};

/** コードを型チェックし、診断メッセージ一覧を返す */
function diagnose(code) {
  // 末尾の export {} でモジュール扱いにする（ブラウザ側の採点と条件を揃える）
  const source = `${PRELUDE}\n${code}\nexport {};`;
  const virtual = new Map([
    [CHECK_PATH, source],
    [SHIM_PATH, REACT_SHIM],
  ]);

  const host = ts.createCompilerHost(OPTIONS, true);
  const origGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, lang, onErr, shouldCreate) => {
    if (virtual.has(name)) {
      return ts.createSourceFile(
        name,
        virtual.get(name),
        lang,
        true,
        name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );
    }
    return origGet(name, lang, onErr, shouldCreate);
  };
  const origExists = host.fileExists.bind(host);
  host.fileExists = (name) => virtual.has(name) || origExists(name);
  const origRead = host.readFile.bind(host);
  host.readFile = (name) => (virtual.has(name) ? virtual.get(name) : origRead(name));

  const program = ts.createProgram([CHECK_PATH, SHIM_PATH], OPTIONS, host);
  const sf = program.getSourceFile(CHECK_PATH);
  return [
    ...program.getSyntacticDiagnostics(sf),
    ...program.getSemanticDiagnostics(sf),
  ].map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "));
}

// ── 検証本体 ────────────────────────────────────────────────
const failures = [];
let checkedLessons = 0;
let gradedCheckpoints = 0;

function fail(lessonId, what, detail) {
  failures.push({ lessonId, what, detail });
}

// 0) 学習の手引きのランク分けが全レッスンを過不足なく覆っているか
//    （レッスンを追加したとき、手引きから漏れたまま気づかないのを防ぐ）
{
  const guideSrc = fs.readFileSync(
    path.join(ROOT, "src/lib/studyGuide.ts"),
    "utf8"
  );
  const tiered = [...guideSrc.matchAll(/"((?:ts|sv)-[a-z0-9-]+)"/g)].map((m) => m[1]);
  const counts = new Map();
  for (const id of tiered) counts.set(id, (counts.get(id) ?? 0) + 1);

  for (const lesson of allLessons) {
    const n = counts.get(lesson.id) ?? 0;
    if (n === 0) {
      fail(lesson.id, "学習の手引き", "どのランクにも分類されていない");
    } else if (n > 1) {
      fail(lesson.id, "学習の手引き", `${n} 個のランクに重複している`);
    }
  }
  const lessonIds = new Set(allLessons.map((l) => l.id));
  for (const id of counts.keys()) {
    if (!lessonIds.has(id)) {
      fail(id, "学習の手引き", "存在しない教材が分類されている");
    }
  }
}

// 1) relatedIds の整合性
const knownIds = new Set(allLessons.map((l) => l.id));
for (const lesson of allLessons) {
  for (const rel of lesson.relatedIds) {
    if (!knownIds.has(rel)) {
      fail(lesson.id, "relatedIds", `存在しない教材ID: ${rel}`);
    }
  }
}

// ── Svelte 用の検証 ────────────────────────────────────────
const svelte = require(path.join(ROOT, "node_modules/svelte/src/compiler/index.js"));

function svelteCompileErrors(code) {
  try {
    svelte.compile(code, { generate: "client", runes: true });
    return null;
  } catch (e) {
    return String(e.message).split("\n")[0];
  }
}

/** svelteEngine.ts と同じ判定をハーネス側でも行う（採点仕様の正しさ検証用） */
function svelteCheck(code, spec) {
  try {
    if (spec.kind === "svelte-compile") {
      svelte.compile(code, { generate: "client", runes: true });
      return true;
    }
    if (spec.kind === "svelte-no-warning") {
      const { warnings } = svelte.compile(code, { generate: "client", runes: true });
      return warnings.every((w) => w.code !== spec.code);
    }
    // svelte-ast: クエリの詳細判定はブラウザ側エンジンに委ねる。
    // ここでは「解析できること」だけ確認する（誤った教材コードの検出が目的）
    svelte.parse(code, { modern: true });
    return null; // 判定不能（スキップ）
  } catch {
    return false;
  }
}

// 2) 模範コードの検証 + 3) 採点仕様の検証
for (const lesson of allLessons) {
  // モードごとに「正解とされるコード」を取り出す
  const reference =
    lesson.kind === "write" ? lesson.modelAnswer : lesson.fixedCode;

  // ── Svelte 教材 ──
  if (lesson.language === "svelte") {
    checkedLessons++;
    const err = svelteCompileErrors(reference);
    // .svelte.ts のような素の TS を扱う回はコンポーネントではないので
    // コンパイル検証の対象外にする。<script> かテンプレート構文がある
    // ものだけを .svelte として扱う（$state<Item[]>() の < に反応しないよう注意）
    // コメント内に使用例として <script> や {#each} が書かれていることが
    // あるので、コメントを除いてから判定する
    const codeOnly = reference
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    const looksLikeComponent =
      /<script[\s>]/.test(codeOnly) || /\{[#@]/.test(codeOnly);
    if (err && looksLikeComponent) {
      fail(lesson.id, "模範コードがコンパイルできない", err);
    }
    for (const cp of lesson.checkpoints) {
      if (!cp.verify) continue;
      gradedCheckpoints++;
      const r = svelteCheck(reference, cp.verify);
      if (r === false) {
        fail(lesson.id, `採点仕様 ${cp.id} が模範解答で不合格`, cp.verify.kind);
      }
    }
    if (lesson.kind === "diagnose" && lesson.defects.length === 0) {
      fail(lesson.id, "defects", "欠陥が1件も定義されていない");
    }
    continue;
  }

  const diags = diagnose(reference);
  if (diags.length > 0) {
    fail(lesson.id, "模範コードの型エラー", diags.slice(0, 3).join(" / "));
  }
  checkedLessons++;

  // 診断モードは「欠陥コードが型チェックを通る」ことが前提
  // （型では防げない欠陥を扱う教材なので）
  if (lesson.kind === "diagnose") {
    const brokenDiags = diagnose(lesson.brokenCode);
    if (brokenDiags.length > 0) {
      fail(
        lesson.id,
        "欠陥コードが型エラーになっている",
        `型で気づけてしまうと診断練習にならない: ${brokenDiags[0]}`
      );
    }
    if (lesson.defects.length === 0) {
      fail(lesson.id, "defects", "欠陥が1件も定義されていない");
    }
  }

  // 各 checkpoint の verify が模範コードに対して合格すること
  for (const cp of lesson.checkpoints) {
    if (!cp.verify) continue;
    gradedCheckpoints++;
    const messages = diagnose(`${reference}\n${cp.verify.assert}`);
    const hasError = messages.length > 0;
    const pass = cp.verify.kind === "expect-error" ? hasError : !hasError;
    if (!pass) {
      fail(
        lesson.id,
        `採点仕様 ${cp.id} が模範解答で不合格`,
        cp.verify.kind === "expect-error"
          ? "エラーが出るはずが出なかった"
          : messages[0]
      );
    }
  }
}

// ── 結果 ────────────────────────────────────────────────────
fs.rmSync(TMP, { recursive: true, force: true });

console.log(`教材: ${checkedLessons} 件を型チェック`);
console.log(`採点仕様: ${gradedCheckpoints} 件を検証`);

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} 件の問題:\n`);
  for (const f of failures) {
    console.error(`  [${f.lessonId}] ${f.what}`);
    console.error(`      ${f.detail}`);
  }
  process.exit(1);
}

console.log("\n✅ すべて問題なし");
