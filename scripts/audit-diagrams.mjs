#!/usr/bin/env node
/**
 * 図解リンク監査スクリプト
 * - 全レッスンの lesson.id を curriculum TS ファイルからテキスト解析で取得
 * - LESSON_DIAGRAM_LINKS マップの登録状況を確認
 * - public/diagrams/lessons/ の実ファイルを確認
 * - 不整合を検出して報告（不整合があれば exit code 1）
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── 1. 全 lesson.id を curriculum TS ファイルから取得 ──────────────────────
const CURRICULUM_DIRS = [
  "curriculum/phase1-type-basics",
  "curriculum/phase2-type-safety",
  "curriculum/phase3-real-app",
  "curriculum/phase4-react",
  "curriculum/phase5-advanced-patterns",
];

const lessonIds = [];
for (const dir of CURRICULUM_DIRS) {
  const absDir = path.join(ROOT, dir);
  const files = fs.readdirSync(absDir).filter(
    (f) => f.startsWith("ts-") && f.endsWith(".ts")
  );
  for (const file of files) {
    const content = fs.readFileSync(path.join(absDir, file), "utf-8");
    const match = content.match(/^\s+id:\s+"([^"]+)"/m);
    if (match) lessonIds.push(match[1]);
  }
}
lessonIds.sort();

// ── 2. LESSON_DIAGRAM_LINKS のキーを取得 ───────────────────────────────────
const mapFile = path.join(ROOT, "src/lib/lessonDiagramLinks.ts");
const mapContent = fs.readFileSync(mapFile, "utf-8");
const mapEntries = {};
for (const match of mapContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  mapEntries[match[1]] = match[2];
}

// ── 3. public/diagrams/lessons/ の実ファイルを取得 ─────────────────────────
const DIAGRAMS_DIR = path.join(ROOT, "public/diagrams/lessons");
const htmlFiles = fs.existsSync(DIAGRAMS_DIR)
  ? fs.readdirSync(DIAGRAMS_DIR).filter((f) => f.endsWith(".html"))
  : [];
const htmlIds = new Set(htmlFiles.map((f) => f.replace(".html", "")));

// ── 4. 監査 ────────────────────────────────────────────────────────────────
const mapIds = new Set(Object.keys(mapEntries));
const lessonIdSet = new Set(lessonIds);
const EXPECTED_URL_PREFIX = "/diagrams/lessons/";

// マップ未登録（lesson あり、map なし）
const mapMissing = lessonIds.filter((id) => !mapIds.has(id));

// ファイル未作成（lesson あり、HTML なし）
const fileMissing = lessonIds.filter((id) => !htmlIds.has(id));

// マップ余剰（map にあるが lesson なし）
const mapExtra = [...mapIds].filter((id) => !lessonIdSet.has(id));

// ファイル余剰（HTML はあるが lesson なし）
const fileExtra = [...htmlIds].filter((id) => !lessonIdSet.has(id));

// URL 形式違反（/diagrams/lessons/<lesson.id>.html でない）
const urlViolations = Object.entries(mapEntries).filter(([id, url]) => {
  return url !== `${EXPECTED_URL_PREFIX}${id}.html`;
});

// ── 5. 出力 ────────────────────────────────────────────────────────────────
console.log("=".repeat(56));
console.log("  図解リンク監査レポート");
console.log("=".repeat(56));
console.log(`  総レッスン数          : ${lessonIds.length} 件`);
console.log(`  マップ登録数          : ${mapIds.size} 件`);
console.log(`  図解HTMLファイル数    : ${htmlFiles.length} 件`);
console.log("=".repeat(56));

let hasError = false;

function report(label, items) {
  if (items.length === 0) {
    console.log(`✅ ${label}: 0件`);
  } else {
    hasError = true;
    console.log(`❌ ${label}: ${items.length}件`);
    items.forEach((item) => console.log(`   - ${item}`));
  }
}

report("マップ未登録レッスン（lesson あり・map なし）", mapMissing);
report("図解HTML未作成レッスン（lesson あり・HTML なし）", fileMissing);
report("マップ余剰（map にあるが lesson が存在しない）", mapExtra);
report("ファイル余剰（HTML はあるが lesson が存在しない）", fileExtra);

if (urlViolations.length === 0) {
  console.log(`✅ URL形式違反: 0件`);
} else {
  hasError = true;
  console.log(`❌ URL形式違反: ${urlViolations.length}件`);
  urlViolations.forEach(([id, url]) =>
    console.log(`   - ${id}: "${url}" (期待: "${EXPECTED_URL_PREFIX}${id}.html")`)
  );
}

console.log("=".repeat(56));
if (hasError) {
  console.log("❌ 図解監査: 不整合あり → 修正してください");
  process.exit(1);
} else {
  console.log("✅ 図解監査: すべて整合しています");
  process.exit(0);
}
