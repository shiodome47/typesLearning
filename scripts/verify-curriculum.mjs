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
      `curriculum/checks.ts ` +
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
  const tiered = [...guideSrc.matchAll(/"((?:ts|sv|sk|gr)-[a-z0-9-]+)"/g)].map(
    (m) => m[1]
  );
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

// ── Svelte / SvelteKit 用の検証 ────────────────────────────
//
// 採点ロジックはブラウザ側と同じ curriculum/checks.ts を使う。
// 実装が 1 つなので、ここで通れば実際の採点でも同じ結果になる。
// （以前はハーネス側が AST クエリを判定できず素通りしていた）
const svelte = require(path.join(ROOT, "node_modules/svelte/src/compiler/index.js"));
const checks = require(path.join(TMP, "checks.js"));
const svelteApi = { parse: svelte.parse, compile: svelte.compile };

const SINGLE = "main.svelte";

function svelteCompileErrors(code) {
  try {
    svelte.compile(code, { generate: "client", runes: true });
    return null;
  } catch (e) {
    return String(e.message).split("\n")[0];
  }
}

/** 単一ファイル Svelte 教材の採点仕様を、模範解答に対して判定する */
function svelteCheck(code, spec) {
  return checks.runCheck(svelteApi, { [SINGLE]: code }, spec, SINGLE);
}

// 2) 模範コードの検証 + 3) 採点仕様の検証
for (const lesson of allLessons) {
  // ── 複数ファイル教材（SvelteKit） ──
  if (lesson.kind === "project") {
    checkedLessons++;

    if (lesson.files.length === 0) {
      fail(lesson.id, "files", "ファイルが1件も定義されていない");
      continue;
    }
    if (lesson.files.every((f) => f.readOnly)) {
      fail(lesson.id, "files", "編集できるファイルが1つも無い");
    }

    const modelFiles = Object.fromEntries(
      lesson.files.map((f) => [f.path, f.model])
    );
    const starterFiles = Object.fromEntries(
      lesson.files.map((f) => [f.path, f.starter])
    );
    const defaultFile =
      lesson.files.find((f) => !f.readOnly)?.path ?? lesson.files[0].path;

    // 模範コードの .svelte が実際にコンパイルできること
    for (const f of lesson.files) {
      if (!f.path.endsWith(".svelte")) continue;
      const err = svelteCompileErrors(f.model);
      if (err) {
        fail(lesson.id, `模範コードがコンパイルできない (${f.path})`, err);
      }
    }

    // 採点仕様が「模範解答で合格し、かつ starter では落ちる」こと。
    // 後者を見ないと、常に合格する無意味なチェックに気づけない。
    let anyStarterFails = false;
    for (const cp of lesson.checkpoints) {
      if (!cp.verify) continue;
      gradedCheckpoints++;

      const onModel = checks.runCheck(
        svelteApi,
        modelFiles,
        cp.verify,
        defaultFile
      );
      if (!onModel.pass) {
        fail(
          lesson.id,
          `採点仕様 ${cp.id} が模範解答で不合格`,
          onModel.message ?? cp.verify.kind
        );
      }

      const onStarter = checks.runCheck(
        svelteApi,
        starterFiles,
        cp.verify,
        defaultFile
      );
      if (!onStarter.pass) anyStarterFails = true;
    }

    if (lesson.checkpoints.some((c) => c.verify) && !anyStarterFails) {
      fail(
        lesson.id,
        "採点が機能していない",
        "starter のままでも全項目に合格してしまう（練習になっていない）"
      );
    }
    continue;
  }

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
      if (!r.pass) {
        fail(
          lesson.id,
          `採点仕様 ${cp.id} が模範解答で不合格`,
          r.message ?? cp.verify.kind
        );
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
