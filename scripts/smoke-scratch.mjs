// ─────────────────────────────────────────────────────────────
// スクラッチ編の実ブラウザ確認（手動実行）
//
//   npm run dev
//   npm run smoke:scratch
//
// 実行採点（kind: "run"）はブラウザでは Monaco の emit を使うので、
// Node の検証が通ってもブラウザで動くとは限らない。ここで実機を見る。
//
// 見るのは3点:
//   1. 白紙（starter）では落ちること
//   2. 模範解答で全部通ること
//   3. 「型は合うが何もしない」実装が落ちること ← 実行採点の存在意義
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SHOT = process.env.SMOKE_SHOT_DIR ?? ".";
const b = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await b.newPage({ viewport: { width: 1440, height: 1100 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 160)));
const results = [];
const log = (ok, label, extra = "") => {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  results.push(ok);
};

async function open(id) {
  await page.goto(`${BASE}/lesson/${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".monaco-editor", { timeout: 60000 });
  await page.waitForTimeout(3500);
}
async function grade() {
  await page.getByRole("button", { name: "自動採点" }).click();
  await page.waitForFunction(
    () => !document.body.innerText.includes("採点中..."),
    { timeout: 60000 }
  );
  const t =
    (await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent()) ?? "";
  const [got, total] = t.replace(" 合格", "").split(" / ").map(Number);
  return { got, total };
}
async function replaceCode(code) {
  const ed = page.locator(".monaco-editor").last();
  await ed.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  await page.waitForTimeout(1500);
}

const FULL = `type Todo = { id: string; text: string; done: boolean };

let nextId = 1;

const createTodo = (text: string): Todo => ({
  id: String(nextId++),
  text,
  done: false,
});

const addTodo = (list: Todo[], text: string): Todo[] => [...list, createTodo(text)];

const toggleTodo = (list: Todo[], id: string): Todo[] =>
  list.map((t) => (t.id === id ? { ...t, done: !t.done } : t));

const removeTodo = (list: Todo[], id: string): Todo[] =>
  list.filter((t) => t.id !== id);

const activeTodos = (list: Todo[]): Todo[] => list.filter((t) => !t.done);

const remainingCount = (list: Todo[]): number => activeTodos(list).length;

const STORAGE_KEY = "todos";

const saveTodos = (list: Todo[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const isTodo = (v: unknown): v is Todo =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as Todo).id === "string" &&
  typeof (v as Todo).text === "string" &&
  typeof (v as Todo).done === "boolean";

const loadTodos = (): Todo[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isTodo);
};
`;

// ── 全6件: 白紙では落ちること ──
for (const id of [
  "sc-01-decide-the-type",
  "sc-02-hold-the-list",
  "sc-03-toggle-and-remove",
  "sc-04-derive-dont-store",
  "sc-05-save-and-load",
  "sc-06-from-scratch",
]) {
  await open(id);
  const r = await grade();
  log(r.total > 0 && r.got < r.total, `${id}: 白紙では不合格`, `${r.got} / ${r.total}`);
}

// ── ⑥ 卒業試験: 模範で全合格 ──
await open("sc-06-from-scratch");
await replaceCode(FULL);
const full = await grade();
log(full.total > 0 && full.got === full.total, "sc-06: 模範解答で全合格", `${full.got} / ${full.total}`);
await page.screenshot({ path: `${SHOT}/17-scratch-pass.png` });

// ── 実行採点の存在意義: 型は合うが何もしない実装は落ちる ──
await replaceCode(
  FULL.replace(
    "const addTodo = (list: Todo[], text: string): Todo[] => [...list, createTodo(text)];",
    "const addTodo = (list: Todo[], text: string): Todo[] => list;"
  )
);
const lazy = await grade();
log(
  lazy.total > 0 && lazy.got < lazy.total,
  "sc-06: 型は合うが何もしない addTodo は落ちる",
  `${lazy.got} / ${lazy.total}`
);

// ── push で元を壊す実装も落ちる ──
await open("sc-02-hold-the-list");
await replaceCode(`type Todo = { id: string; text: string; done: boolean };
let nextId = 1;
const createTodo = (text: string): Todo => ({ id: String(nextId++), text, done: false });
const addTodo = (list: Todo[], text: string): Todo[] => {
  list.push(createTodo(text));
  return list;
};
`);
const mutating = await grade();
log(
  mutating.total > 0 && mutating.got < mutating.total,
  "sc-02: push で元を壊す実装は落ちる",
  `${mutating.got} / ${mutating.total}`
);
await page.screenshot({ path: `${SHOT}/18-scratch-mutation.png` });

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
