"use client";

// PoC 検証ページ: 採点エンジンがブラウザ上で期待通り動くかの自己テスト。
// 結果は #poc-result に JSON で出力し、Playwright から読み取る。

import { useEffect, useState } from "react";
import { grade, type CheckSpec } from "@/lib/verify/browserEngine";

interface Scenario {
  name: string;
  code: string;
  checks: CheckSpec[];
  expected: boolean[];
}

const CRUD_CHECKS: CheckSpec[] = [
  {
    id: "cp-10-5",
    kind: "type",
    description: "getTodo の戻り値型が Todo | undefined か",
    assert: `type _c5 = Expect<Equal<ReturnType<typeof getTodo>, Todo | undefined>>;`,
  },
  {
    id: "cp-10-4",
    kind: "type",
    description: "deleteTodo が Todo[] を返すか",
    assert: `type _c4 = Expect<Equal<ReturnType<typeof deleteTodo>, Todo[]>>;`,
  },
];

const CRUD_BASE = `
type Todo = { id: number; title: string; done: boolean };
function deleteTodo(todos: Todo[], id: number): Todo[] {
  return todos.filter((t) => t.id !== id);
}`;

const SCENARIOS: Scenario[] = [
  {
    name: "S1-a CRUD 正答",
    code: `${CRUD_BASE}
function getTodo(todos: Todo[], id: number): Todo | undefined {
  return todos.find((t) => t.id === id);
}`,
    checks: CRUD_CHECKS,
    expected: [true, true],
  },
  {
    name: "S1-b CRUD 誤答（undefined 落ち）",
    code: `${CRUD_BASE}
function getTodo(todos: Todo[], id: number): Todo {
  return todos.find((t) => t.id === id) as Todo;
}`,
    checks: CRUD_CHECKS,
    expected: [false, true],
  },
  {
    name: "S2-a Union 正答（意図的エラーを検出）",
    code: `type Status = "idle" | "loading" | "success" | "error";`,
    checks: [
      {
        id: "cp-06-4",
        kind: "expect-error",
        description: 'Status に無い値を代入するとエラーになるか',
        assert: `const _bad: Status = "sleeping";`,
      },
    ],
    expected: [true],
  },
  {
    name: "S2-b Union 誤答（string で緩すぎる）",
    code: `type Status = string;`,
    checks: [
      {
        id: "cp-06-4",
        kind: "expect-error",
        description: 'Status に無い値を代入するとエラーになるか',
        assert: `const _bad: Status = "sleeping";`,
      },
    ],
    expected: [false],
  },
  {
    name: "S3 any 漏れ検出",
    code: `function parseUser(raw: unknown): any { return raw; }`,
    checks: [
      {
        id: "cp-any",
        kind: "type",
        description: "戻り値が any になっていないか",
        assert: `type _a = Expect<NotAny<ReturnType<typeof parseUser>>>;`,
      },
    ],
    expected: [false],
  },
  {
    name: "S4-a JSX Generics 正答",
    code: `
import type { ReactNode } from "react";
function List<T extends { id: string | number }>({
  items, renderItem, emptyMessage = "データがありません",
}: { items: T[]; renderItem: (item: T) => ReactNode; emptyMessage?: string }) {
  if (items.length === 0) return <p>{emptyMessage}</p>;
  return <ul>{items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}</ul>;
}`,
    checks: [
      {
        id: "cp-32-1",
        kind: "type",
        description: "List<T> でコールバック引数が具体型に推論されるか",
        assert: `
type _U = { id: number; name: string };
const _users: _U[] = [{ id: 1, name: "a" }];
const _el = <List items={_users} renderItem={(u) => {
  type _inferred = Expect<Equal<typeof u, _U>>;
  return <span>{u.name}</span>;
}} />;`,
      },
    ],
    expected: [true],
  },
  {
    name: "S4-b JSX any 化 誤答",
    code: `
import type { ReactNode } from "react";
function List({
  items, renderItem, emptyMessage = "データがありません",
}: { items: any[]; renderItem: (item: any) => ReactNode; emptyMessage?: string }) {
  if (items.length === 0) return <p>{emptyMessage}</p>;
  return <ul>{items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}</ul>;
}`,
    checks: [
      {
        id: "cp-32-1",
        kind: "type",
        description: "List<T> でコールバック引数が具体型に推論されるか",
        assert: `
type _U = { id: number; name: string };
const _users: _U[] = [{ id: 1, name: "a" }];
const _el = <List items={_users} renderItem={(u) => {
  type _inferred = Expect<Equal<typeof u, _U>>;
  return <span>{u.name}</span>;
}} />;`,
      },
    ],
    expected: [false],
  },
];

export default function PocVerifyPage() {
  const [output, setOutput] = useState<string>("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const report: unknown[] = [];
      try {
        for (const s of SCENARIOS) {
          const results = await grade(s.code, s.checks);
          const actual = results.map((r) => r.pass);
          report.push({
            name: s.name,
            ok: JSON.stringify(actual) === JSON.stringify(s.expected),
            expected: s.expected,
            actual,
            messages: results.map((r) => r.firstMessage ?? null),
          });
        }
        if (!cancelled) {
          const okCount = (report as { ok: boolean }[]).filter((r) => r.ok).length;
          setOutput(JSON.stringify({ okCount, total: report.length, report }, null, 2));
          setDone(true);
        }
      } catch (e) {
        if (!cancelled) {
          setOutput(JSON.stringify({ error: String(e) }, null, 2));
          setDone(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>採点エンジン PoC</h1>
      <div id="poc-done">{done ? "DONE" : "RUNNING"}</div>
      <pre id="poc-result">{output}</pre>
    </div>
  );
}
