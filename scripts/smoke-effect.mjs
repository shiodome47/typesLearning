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


// ── ③④ も starter では落ち、模範で通ること ──
await open("ef-03-dependency-in-type");
const c1 = await grade();
log(c1.total > 0 && c1.got < c1.total, "ef-03: starter のままでは不合格", `${c1.got} / ${c1.total}`);
await replaceCode(`import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

interface HttpClient {
  readonly get: (url: string) => Effect.Effect<unknown, NetworkError>;
}

const HttpClient = Context.GenericTag<HttpClient, HttpClient>("HttpClient");

const getUser = (
  id: string
): Effect.Effect<User, NetworkError, HttpClient> =>
  Effect.gen(function* () {
    const http = yield* Effect.service(HttpClient);
    const raw = yield* http.get("/api/users/" + id);
    return raw as User;
  });

const testable: Effect.Effect<User, NetworkError, never> =
  Effect.provideService(getUser("1"), HttpClient, {
    get: () => Effect.succeed({ id: "1", name: "テスト" }),
  });

export const run = () => Effect.runPromise(testable);
`);
const c2 = await grade();
log(c2.total > 0 && c2.got === c2.total, "ef-03: 依存を型に出すと全合格", `${c2.got} / ${c2.total}`);

await open("ef-04-retry-timeout");
const r1 = await grade();
log(r1.total > 0 && r1.got < r1.total, "ef-04: starter のままでは不合格", `${r1.got} / ${r1.total}`);
await replaceCode(`import { Effect, Data, Schedule, Cause } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch("/api/users/" + id).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

const withRetry = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.retry(fetchUser(id), Schedule.exponential("100 millis"));

const withTimeout = (
  id: string
): Effect.Effect<User, NetworkError | Cause.TimeoutException> =>
  Effect.timeout(fetchUser(id), "3 seconds");

const robust = (
  id: string
): Effect.Effect<User, NetworkError | Cause.TimeoutException> =>
  Effect.retry(
    Effect.timeout(fetchUser(id), "3 seconds"),
    Schedule.exponential("100 millis")
  );

export { withRetry, withTimeout, robust };
`);
const r2 = await grade();
log(r2.total > 0 && r2.got === r2.total, "ef-04: リトライ/タイムアウトの型差を書けると全合格", `${r2.got} / ${r2.total}`);


// ── ⑤ 診断: 依存が型から消えている ──
await open("ef-05-diagnose-lost-dependency");
const dl1 = await grade();
log(dl1.total > 0 && dl1.got < dl1.total, "ef-05: 依存が消えたままでは不合格", `${dl1.got} / ${dl1.total}`);
await replaceCode(`import { Effect, Context, Data } from "effect";

type User = { id: string; name: string };

class QueryError extends Data.TaggedError("QueryError")<{}> {}

interface Database {
  readonly query: (sql: string) => Effect.Effect<User[], QueryError>;
  readonly insert: (sql: string) => Effect.Effect<void, QueryError>;
}
const Database = Context.GenericTag<Database, Database>("Database");

interface Clock {
  readonly now: () => number;
}
const Clock = Context.GenericTag<Clock, Clock>("Clock");

const listUsers = (): Effect.Effect<User[], QueryError, Database> =>
  Effect.gen(function* () {
    const database = yield* Effect.service(Database);
    return yield* database.query("select * from users");
  });

const seedTestData = (): Effect.Effect<void, QueryError, Database> =>
  Effect.gen(function* () {
    const database = yield* Effect.service(Database);
    return yield* database.insert("insert into users values ('t1', 'test')");
  });

const stamped = (): Effect.Effect<number, never, Clock> =>
  Effect.gen(function* () {
    const clock = yield* Effect.service(Clock);
    return clock.now();
  });

const testDatabase: Database = {
  query: () => Effect.succeed([{ id: "t1", name: "テスト" }]),
  insert: () => Effect.succeed(undefined),
};

export const runList = () =>
  Effect.runPromise(Effect.provideService(listUsers(), Database, testDatabase));

export const runSeed = () =>
  Effect.runPromise(
    Effect.provideService(seedTestData(), Database, testDatabase)
  );

export const runStamp = () =>
  Effect.runPromise(
    Effect.provideService(stamped(), Clock, { now: () => 0 })
  );
`);
const dl2 = await grade();
log(dl2.total > 0 && dl2.got === dl2.total, "ef-05: 依存を型に戻すと全合格", `${dl2.got} / ${dl2.total}`);

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
