// ─────────────────────────────────────────────────────────────
// 教材テキストの記法が画面で解釈されているかを確認する（手動実行）
//
//   npm run dev
//   npm run audit:markup
//
// InlineCodeText はフル Markdown ではないので、対応していない記法を
// 教材に書くと生の記号がそのまま出る。以前 ** が画面に出ていたのは
// 太字が未実装だったため。この監査はその再発を検出する。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
// レッスンIDは curriculum を読まずに一覧ページから拾う（ビルド不要）
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);

const ids = new Set();
for (const lang of ["Compact", "Effect", "Svelte", "TypeScript"]) {
  const btn = page.getByRole("button", { name: new RegExp("^" + lang) }).first();
  if (!(await btn.isVisible().catch(() => false))) continue;
  await btn.click();
  await page.waitForTimeout(700);
  for (const href of await page.locator('a[href^="/lesson/"]').evaluateAll((as) =>
    as.map((a) => a.getAttribute("href"))
  )) {
    if (href) ids.add(href.replace("/lesson/", ""));
  }
}
console.log(`対象: ${ids.size} 件`);

// 生の記号が残っていないか。誤検出を避けるため、コード欄（pre/code）は除く
const bad = [];
for (const id of [...ids].sort()) {
  await page.goto(`${BASE}/lesson/${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const leaks = await page.evaluate(() => {
    // script/style は Next.js が教材データを丸ごと埋め込むので必ず除く。
    // pre/code とエディタは、記号がそのまま出ていて当然の場所。
    const skip = (el) =>
      el.closest("script, style, noscript, pre, code, .monaco-editor, textarea");
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.parentElement || skip(n.parentElement)) continue;
      const t = n.nodeValue ?? "";
      if (t.includes("**")) out.push("**: " + t.trim().slice(0, 60));
      if (t.includes("```")) out.push("```: " + t.trim().slice(0, 60));
    }
    return out;
  });
  if (leaks.length) {
    bad.push({ id, leaks });
    console.log(`❌ ${id}`);
    leaks.slice(0, 3).forEach((l) => console.log(`     ${l}`));
  }
}

console.log("");
if (bad.length === 0) {
  console.log(`✅ 生の記号は残っていない（${ids.size} 件を確認）`);
} else {
  console.log(`❌ ${bad.length} 件のレッスンで記号が残っている`);
}
await browser.close();
process.exit(bad.length === 0 ? 0 : 1);
