// ─────────────────────────────────────────────────────────────
// Svelte 教材まわりの実ブラウザ確認（手動実行）
//
//   npm run build && npm run start -- -p 3111
//   npx playwright install chromium   # 初回のみ
//   node scripts/smoke-svelte.mjs
//
// playwright は任意依存のため CI には組み込んでいない。
// 採点エンジンや言語切り替えを変更したときはこれを流して実機で確認する。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3111";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 120)));

const results = [];
function log(ok, label, extra = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  results.push(ok);
}

async function typeInto(code) {
  const editor = page.locator(".monaco-editor").last();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  await page.waitForTimeout(1200);
}

async function grade() {
  await page.getByRole("button", { name: "自動採点" }).click();
  await page.waitForFunction(
    () => !document.body.innerText.includes("採点中..."),
    { timeout: 60000 }
  );
  return (
    (await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent()) ?? ""
  );
}

function parseScore(text) {
  const [got, total] = text.replace(" 合格", "").split(" / ").map(Number);
  return { got, total };
}

// ── 1. Svelte 白紙練習: 正答で全合格 ──
await page.goto(`${BASE}/lesson/sv-01-reactive-basics`, {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector(".monaco-editor", { timeout: 60000 });
await page.waitForTimeout(2500);
await typeInto(
  `<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>+1</button>\n<p>{count}</p>`
);
const good = parseScore(await grade());
log(
  good.total > 0 && good.got === good.total,
  "Svelte 正答で全合格",
  `${good.got} / ${good.total}`
);

// ── 2. 誤答（$state を使わない = 画面が更新されない）を検出できるか ──
await typeInto(
  `<script>\n  let count = 0;\n</script>\n\n<button onclick={() => count++}>+1</button>\n<p>{count}</p>`
);
const bad = parseScore(await grade());
log(
  bad.got < bad.total,
  "Svelte 誤答（$state 無し）で不合格を検出",
  `${bad.got} / ${bad.total}`
);

// ── 3. a11y のコンパイラ警告が採点に効くか ──
await page.goto(`${BASE}/lesson/sv-11-diagnose-a11y`, {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector(".monaco-editor", { timeout: 60000 });
await page.waitForTimeout(2500);
await typeInto(`<img src="a.png">`);
const a11y = parseScore(await grade());
log(
  a11y.got < a11y.total,
  "a11y 警告のあるコードで不合格",
  `${a11y.got} / ${a11y.total}`
);

// ── 4. 一覧の言語切り替え ──
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Svelte/ }).click();
await page.waitForTimeout(500);
// Svelte 16 件 + SvelteKit 9 件
const shown = await page.locator("text=/\\d+ 件表示/").first().textContent();
log(Boolean(shown?.includes("25")), "一覧で Svelte に切り替わる", shown ?? "");

// ── 5. 手引きに両言語の配分がある ──
await page.goto(`${BASE}/guide`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
const hasTs = await page.locator("text=TypeScriptの配分").first().isVisible();
const hasSv = await page.locator("text=Svelteの配分").first().isVisible();
log(hasTs && hasSv, "手引きに両言語の配分がある");

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
