// ─────────────────────────────────────────────────────────────
// 実ブラウザでの動作確認（手動実行）
//
//   npm run build && npm run start -- -p 3111
//   npx playwright install chromium   # 初回のみ
//   node scripts/smoke-e2e.mjs
//
// playwright は任意依存のため CI には組み込んでいない。
// 採点まわりを変更したときはこれを流して実機で確認する。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3111";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

function log(ok, label, extra = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  return ok;
}
const results = [];

// ── 1. 白紙練習: 正しい模範解答を貼って自動採点が全部合格するか ──
await page.goto(`${BASE}/lesson/ts-15-api-fetch`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".monaco-editor", { timeout: 60000 });
await page.waitForTimeout(3000);

// 模範解答をエディタへ流し込む（右カラム=練習エディタ）
const MODEL = `type User = { id: number; name: string; email: string };
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "number" && typeof v.name === "string" && typeof v.email === "string";
}
async function fetchUser(userId: number): Promise<User> {
  const response = await fetch("https://api.example.com/users/" + userId);
  if (!response.ok) throw new Error("HTTP error");
  const data: unknown = await response.json();
  if (!isUser(data)) throw new Error("bad shape");
  return data;
}`;
async function typeIntoPracticeEditor(code) {
  const editor = page.locator(".monaco-editor").last();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  await page.waitForTimeout(1500);
}
await typeIntoPracticeEditor(MODEL);

await page.getByRole("button", { name: "自動採点" }).click();
await page.waitForFunction(
  () => !document.body.innerText.includes("採点中..."),
  { timeout: 60000 }
);
const gradeText = await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent();
results.push(log(gradeText === "4 / 4 合格", "正答で自動採点が全合格", gradeText ?? "表示なし"));

// ── 2. 誤答（as を使う）にすると不合格が出るか ──
await typeIntoPracticeEditor(`type User = { id: number; name: string; email: string };
function isUser(value: any): boolean { return true; }
async function fetchUser(userId: number): Promise<User> {
  const r = await fetch("x");
  return await r.json() as User;
}`);
await page.getByRole("button", { name: "自動採点" }).click();
await page.waitForFunction(() => !document.body.innerText.includes("採点中..."), { timeout: 60000 });
const badText = await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent();
const badCount = Number((badText ?? "9 /").split(" /")[0]);
results.push(log(badCount < 4, "誤答(as)で不合格を検出", badText ?? "表示なし"));

// ── 3. React教材で誤った赤波線が出ないか（JSX設定の確認）──
await page.goto(`${BASE}/lesson/ts-32-generic-react-component`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".monaco-editor", { timeout: 60000 });
await page.waitForTimeout(4000);
const jsxDiag = await page.evaluate(async () => {
  const monaco = window.monaco;
  const models = monaco.editor.getModels();
  const target = models.find((m) => m.uri.toString().includes("practice-"));
  // 模範解答（正しいJSX）を入れて診断を取る
  target.setValue(`import type { ReactNode } from "react";
function List<T extends { id: string | number }>({
  items, renderItem, emptyMessage = "なし",
}: { items: T[]; renderItem: (item: T) => ReactNode; emptyMessage?: string }) {
  if (items.length === 0) return <p>{emptyMessage}</p>;
  return <ul>{items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}</ul>;
}`);
  await new Promise((r) => setTimeout(r, 1500));
  const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
  const client = await getWorker(target.uri);
  const [syn, sem] = await Promise.all([
    client.getSyntacticDiagnostics(target.uri.toString()),
    client.getSemanticDiagnostics(target.uri.toString()),
  ]);
  return [...syn, ...sem].map((d) =>
    typeof d.messageText === "string" ? d.messageText : d.messageText?.messageText
  );
});
results.push(log(jsxDiag.length === 0, "正しいJSXで診断ゼロ", jsxDiag.slice(0, 2).join(" / ")));

// ── 4. 診断モードのページが表示されるか ──
await page.goto(`${BASE}/lesson/ts-34-diagnose-as-cast`, { waitUntil: "domcontentloaded" });
await page.waitForSelector(".monaco-editor", { timeout: 60000 });
const hasSymptom = await page.locator("text=症状").first().isVisible();
await page.getByRole("button", { name: "欠陥を1つ開示する" }).click();
await page.waitForTimeout(400);
const revealed = await page.locator("text=as User` は実行時に何も検証していない").first().isVisible().catch(() => false);
const revealText = await page.locator("text=/\\d+ \\/ \\d+ 開示/").first().textContent();
results.push(log(hasSymptom && Boolean(revealText?.includes("1 / 3")), "診断モードの段階開示", revealText ?? ""));

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
if (pageErrors.length) console.log("pageerror:", pageErrors.slice(0, 3).join(" | "));
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
