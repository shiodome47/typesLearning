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


// ── 後半（⑥〜⑩）──────────────────────────────────────────
//
// 見たいのは1点。シムに足した Fiber / Scope / Schema が
// ブラウザの Monaco 側でも解決できているか。
// Node の検証が通っても、ここが解決できなければ採点は動かない。

/** starter では落ち、模範解答で全合格することを1レッスンぶん確かめる */
async function bothSides(id, label, model) {
  await open(id);
  const before = await grade();
  log(
    before.total > 0 && before.got < before.total,
    `${id}: 手を入れる前は不合格`,
    `${before.got} / ${before.total}`
  );
  await replaceCode(model);
  const after = await grade();
  log(
    after.total > 0 && after.got === after.total,
    `${id}: ${label}`,
    `${after.got} / ${after.total}`
  );
}

await bothSides("ef-06-interruption", "fork / interrupt / join を書けると全合格", `import { Effect, Data, Fiber } from "effect";

type Price = { symbol: string; value: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const fetchPrice = (symbol: string): Effect.Effect<Price, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch("/api/prices/" + symbol).then((r) => r.json() as Promise<Price>),
    catch: () => new NetworkError({ status: 500 }),
  });

const start = (
  symbol: string
): Effect.Effect<Fiber.Fiber<Price, NetworkError>> =>
  Effect.fork(fetchPrice(symbol));

const stop = (fiber: Fiber.Fiber<Price, NetworkError>): Effect.Effect<void> =>
  Fiber.interrupt(fiber);

const wait = (
  fiber: Fiber.Fiber<Price, NetworkError>
): Effect.Effect<Price, NetworkError> => Fiber.join(fiber);

export { start, stop, wait };
`);

await bothSides("ef-07-acquire-release", "Scope を型に出して閉じられると全合格", `import { Effect, Data, Scope } from "effect";

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class ConnError extends Data.TaggedError("ConnError")<{}> {}

declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

const connection: Effect.Effect<Conn, ConnError, Scope.Scope> =
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => openConnection(),
      catch: () => new ConnError({}),
    }),
    (c) => Effect.promise(() => closeConnection(c))
  );

const listTables = (): Effect.Effect<string[], ConnError, Scope.Scope> =>
  Effect.gen(function* () {
    const conn = yield* connection;
    return yield* Effect.tryPromise({
      try: () => conn.query("show tables"),
      catch: () => new ConnError({}),
    });
  });

const program = (): Effect.Effect<string[], ConnError> =>
  Effect.scoped(listTables());

const run = (): Promise<string[]> => Effect.runPromise(program());

export { connection, listTables, program, run };
`);

await bothSides("ef-08-structured-concurrency", "同時本数と race を書けると全合格", `import { Effect, Data } from "effect";

type User = { id: string; name: string };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class MirrorError extends Data.TaggedError("MirrorError")<{}> {}

const fetchUser = (id: string): Effect.Effect<User, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch("/api/users/" + id).then((r) => r.json() as Promise<User>),
    catch: () => new NetworkError({ status: 500 }),
  });

declare const fetchUserFromMirror: (
  id: string
) => Effect.Effect<User, MirrorError>;

const fetchAll = (
  ids: readonly string[]
): Effect.Effect<User[], NetworkError> =>
  Effect.all(
    ids.map((id) => fetchUser(id)),
    { concurrency: 5 }
  );

const allNames = (
  ids: readonly string[]
): Effect.Effect<string[], NetworkError> =>
  Effect.map(fetchAll(ids), (users) => users.map((user) => user.name));

const fastest = (
  id: string
): Effect.Effect<User, NetworkError | MirrorError> =>
  Effect.race(fetchUser(id), fetchUserFromMirror(id));

export { fetchAll, allNames, fastest };
`);

await bothSides("ef-09-schema-boundary", "境界で検証すると全合格", `import { Effect, Data, Schema, ParseResult } from "effect";

type User = { id: string; name: string; age: number };

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
});

const parseUser = (
  input: unknown
): Effect.Effect<User, ParseResult.ParseError> =>
  Schema.decodeUnknown(UserSchema)(input);

const getUser = (
  id: string
): Effect.Effect<User, NetworkError | ParseResult.ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet("/api/users/" + id);
    return yield* parseUser(raw);
  });

export { UserSchema, parseUser, getUser };
`);

await bothSides("ef-10-diagnose-leak-and-runaway", "4件の欠陥を直すと全合格", `import { Effect, Data, Fiber, Scope, Schema, ParseResult } from "effect";

type User = { id: string; name: string; age: number };

type Conn = {
  id: string;
  query: (sql: string) => Promise<string[]>;
};

class NetworkError extends Data.TaggedError("NetworkError")<{
  status: number;
}> {}
class ConnError extends Data.TaggedError("ConnError")<{}> {}

declare const openConnection: () => Promise<Conn>;
declare const closeConnection: (c: Conn) => Promise<void>;

const httpGet = (url: string): Effect.Effect<unknown, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json() as Promise<unknown>),
    catch: () => new NetworkError({ status: 500 }),
  });

const poll = (userId: string): Effect.Effect<void, NetworkError> =>
  Effect.tryPromise({
    try: () => fetch("/api/notify/" + userId).then(() => undefined),
    catch: () => new NetworkError({ status: 500 }),
  });

const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  age: Schema.Number,
});

const connection: Effect.Effect<Conn, ConnError, Scope.Scope> =
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => openConnection(),
      catch: () => new ConnError({}),
    }),
    (c) => Effect.promise(() => closeConnection(c))
  );

const listTablesScoped = (): Effect.Effect<string[], ConnError, Scope.Scope> =>
  Effect.gen(function* () {
    const conn = yield* connection;
    return yield* Effect.tryPromise({
      try: () => conn.query("show tables"),
      catch: () => new ConnError({}),
    });
  });

const listTables = (): Effect.Effect<string[], ConnError> =>
  Effect.scoped(listTablesScoped());

const startPolling = (
  userId: string
): Effect.Effect<Fiber.Fiber<void, NetworkError>> => Effect.fork(poll(userId));

const stopPolling = (
  fiber: Fiber.Fiber<void, NetworkError>
): Effect.Effect<void> => Fiber.interrupt(fiber);

const fetchUser = (
  id: string
): Effect.Effect<User, NetworkError | ParseResult.ParseError> =>
  Effect.gen(function* () {
    const raw = yield* httpGet("/api/users/" + id);
    return yield* Schema.decodeUnknown(UserSchema)(raw);
  });

const fetchAll = (
  ids: readonly string[]
): Effect.Effect<User[], NetworkError | ParseResult.ParseError> =>
  Effect.all(
    ids.map((id) => fetchUser(id)),
    { concurrency: 10 }
  );

export { listTables, listTablesScoped, startPolling, stopPolling, fetchUser, fetchAll };
`);

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
