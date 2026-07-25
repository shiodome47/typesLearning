// Monaco を CDN からではなく自前で配信するため、node_modules から public/ へコピーする。
// 外部CDNに依存しないぶん、オフラインでも動き、バージョンが node_modules と一致する。
// dev / build の前に自動実行される（package.json の predev / prebuild）。

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  ".."
);
const SRC = path.join(ROOT, "node_modules/monaco-editor/min/vs");
const DEST = path.join(ROOT, "public/monaco/vs");
const STAMP = path.join(ROOT, "public/monaco/.version");

const version = JSON.parse(
  fs.readFileSync(path.join(ROOT, "node_modules/monaco-editor/package.json"), "utf8")
).version;

if (!fs.existsSync(SRC)) {
  console.error("monaco-editor が見つかりません。npm install を実行してください。");
  process.exit(1);
}

// 同じバージョンが既にあるならスキップ（毎回16MBコピーしない）
if (fs.existsSync(STAMP) && fs.readFileSync(STAMP, "utf8").trim() === version) {
  console.log(`monaco ${version} は配置済み`);
  process.exit(0);
}

fs.rmSync(path.join(ROOT, "public/monaco"), { recursive: true, force: true });
fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.cpSync(SRC, DEST, { recursive: true });
fs.writeFileSync(STAMP, version);

console.log(`monaco ${version} を public/monaco へ配置`);
