// ─────────────────────────────────────────────────────────────
// Effect 編の実ブラウザ確認（手動実行）
//
//   npm run dev
//   npm run smoke:effect
//
// 見るのは「Monaco がシム経由で effect を解決できているか」。
// Node 側の検証が通っても、ブラウザで解決できなければ採点は動かない。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SHOT = process.env.SMOKE_SHOT_DIR ?? ".";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 200)));
const results = [];
const log = (ok, label, extra = "") => {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra ? " — " + extra : ""}`);
  results.push(ok);
};

async function open(id) {
  await page.goto(`${BASE}/lesson/${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".monaco-editor", { timeout: 60000 });
  await page.waitForTimeout(4000);
}
async function grade() {
  await page.getByRole("button", { name: "自動採点" }).click();
  await page.waitForFunction(() => !document.body.innerText.includes("採点中..."), { timeout: 60000 });
  const t = (await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent()) ?? "";
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

const MODEL = `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ParseError extends Data.TaggedError("ParseError")<{}> {}

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json()),
    catch: () => new NetworkError({ status: 500 }),
  });

const parseUser = (raw: unknown): Effect.Effect<User, ParseError> =>
  Effect.succeed(raw as User);

const getUser = (id: string): Effect.Effect<User, NetworkError | ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet("/api/users/" + id);
    return yield* parseUser(raw);
  });
`;

// ── ①: starter では落ち、正しく書けば通る ──
await open("ef-01-error-in-type");
const a = await grade();
log(a.total > 0 && a.got < a.total, "ef-01: starter のままでは不合格", `${a.got} / ${a.total}`);
await replaceCode(MODEL);
const a2 = await grade();
log(a2.total > 0 && a2.got === a2.total, "ef-01: 失敗を型に出すと全合格", `${a2.got} / ${a2.total}`);
await page.screenshot({ path: `${SHOT}/08-effect-pass.png` });

// ── ②診断: 握りつぶしたままでは落ちる ──
await open("ef-02-diagnose-swallowed-error");
const d = await grade();
log(d.total > 0 && d.got < d.total, "ef-02: 握りつぶしたままでは不合格", `${d.got} / ${d.total}`);
await page.screenshot({ path: `${SHOT}/09-effect-diagnose.png` });

// ── ②診断: 直すと全合格 ──
await replaceCode(`import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ParseError extends Data.TaggedError("ParseError")<{}> {}

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json()),
    catch: () => new NetworkError({ status: 500 }),
  });

const parseUser = (raw: unknown): Effect.Effect<User, ParseError> =>
  Effect.succeed(raw as User);

const getUser = (id: string): Effect.Effect<User, NetworkError | ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet("/api/users/" + id);
    return yield* parseUser(raw);
  });

export const getUserWithRetryHint = (
  id: string
): Effect.Effect<User | "retry", ParseError> =>
  Effect.catchTag(getUser(id), "NetworkError", () =>
    Effect.succeed("retry" as const)
  );
`);
const d2 = await grade();
log(d2.total > 0 && d2.got === d2.total, "ef-02: エラーを型に戻すと全合格", `${d2.got} / ${d2.total}`);
await page.screenshot({ path: `${SHOT}/10-effect-fixed.png` });

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
