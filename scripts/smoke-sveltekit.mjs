// ─────────────────────────────────────────────────────────────
// SvelteKit（複数ファイル）教材の実ブラウザ確認（手動実行）
//
//   npm run build && npm run start -- -p 3111
//   node scripts/smoke-sveltekit.mjs
//
// 確認するのは「採点が本当に機能しているか」。
// 具体的には starter のままなら落ち、直せば通ること。
// 常に合格する採点はテストとして無意味なので、両方を見る。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3111";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 160)));

const results = [];
function log(ok, label, extra = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  results.push(ok);
}

async function openLesson(id) {
  await page.goto(`${BASE}/lesson/${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".monaco-editor", { timeout: 60000 });
  await page.waitForTimeout(2500);
}

/** ファイルタブを名前で選ぶ */
async function selectFile(fileName) {
  await page.getByRole("tab", { name: new RegExp(escapeRe(fileName)) }).click();
  await page.waitForTimeout(700);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** いま開いているファイルの中身を置き換える */
async function replaceActiveFile(code) {
  const editor = page.locator(".monaco-editor").last();
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  await page.waitForTimeout(900);
}

async function grade() {
  await page.getByRole("button", { name: "自動採点" }).click();
  await page.waitForFunction(
    () => !document.body.innerText.includes("採点中..."),
    { timeout: 60000 }
  );
  const text =
    (await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent()) ?? "";
  const [got, total] = text.replace(" 合格", "").split(" / ").map(Number);
  return { got, total };
}

// ── 1. ファイルタブが出ているか ──
await openLesson("sk-04-server-boundary");
const tabCount = await page.getByRole("tab").count();
log(tabCount >= 2, "複数ファイルのタブが表示される", `${tabCount} タブ`);

// ── 2. starter のままだと落ちる（＝採点が機能している） ──
const before = await grade();
log(
  before.total > 0 && before.got < before.total,
  "sk-04: starter のままでは不合格",
  `${before.got} / ${before.total}`
);

// ── 3. 秘密の漏洩を実際に検出できているか（メッセージを見る） ──
const leakMsg = await page
  .locator("text=/ブラウザにも配られる/")
  .first()
  .isVisible()
  .catch(() => false);
log(leakMsg, "sk-04: 秘密の漏洩を名指しで指摘している");

// ── 4. 2ファイルとも直せば全合格 ──
await selectFile("+page.server.ts");
await replaceActiveFile(`import { BUKKEN_API_KEY } from "$env/static/private";

export const load = async ({ fetch }) => {
  const res = await fetch("https://api.example.com/bukken", {
    headers: { Authorization: \`Bearer \${BUKKEN_API_KEY}\` },
  });
  const items = await res.json();
  return { items };
};
`);

await selectFile("+page.svelte");
await replaceActiveFile(`<script lang="ts">
  type Bukken = { id: string; name: string; rent: number };
  let { data }: { data: { items: Bukken[] } } = $props();
</script>

<h1>物件一覧</h1>
<ul>
  {#each data.items as item (item.id)}
    <li><a href="/bukken/{item.id}">{item.name}</a></li>
  {/each}
</ul>
`);

const after = await grade();
log(
  after.total > 0 && after.got === after.total,
  "sk-04: 2ファイルとも直すと全合格",
  `${after.got} / ${after.total}`
);

// ── 5. 手本がタブに連動しているか ──
await page.getByRole("button", { name: "手本を見る" }).click();
await page.waitForTimeout(1200);
const modelShowsSvelte = await page
  .locator("text=/判断に迷ったら/")
  .first()
  .isVisible()
  .catch(() => false);
await selectFile("+page.server.ts");
await page.waitForTimeout(1200);
const modelShowsServer = await page
  .locator("text=/ブラウザに送る箱/")
  .first()
  .isVisible()
  .catch(() => false);
log(
  modelShowsSvelte && modelShowsServer,
  "手本コードがファイルタブに連動する",
  `svelte:${modelShowsSvelte} server:${modelShowsServer}`
);

// ── 6. 診断回も採点が機能しているか ──
await openLesson("sk-09-diagnose-review");
const diag = await grade();
log(
  diag.total > 0 && diag.got < diag.total,
  "sk-09: AIが書いた欠陥コードを不合格にできる",
  `${diag.got} / ${diag.total}`
);

// ── 7. 一覧に SvelteKit 編が出ているか ──
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Svelte/ }).click();
await page.waitForTimeout(600);
const shown = await page.locator("text=/\\d+ 件表示/").first().textContent();
log(Boolean(shown?.includes("25")), "一覧に Svelte 25 件（16 + SvelteKit 9）", shown ?? "");

// ── 8. 手引きに「順番に通す」が出ているか ──
await page.goto(`${BASE}/guide`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
const hasTutorial = await page
  .locator("text=順番に通す（SvelteKit編）")
  .first()
  .isVisible()
  .catch(() => false);
log(hasTutorial, "手引きに SvelteKit 編のランクがある");

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
