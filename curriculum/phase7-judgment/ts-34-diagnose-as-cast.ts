import type { Lesson } from "../types";

export const lesson34: Lesson = {
  kind: "diagnose",
  id: "ts-34-diagnose-as-cast",
  order: 34,
  title: "診断: 型が通るのに本番で落ちるAPI呼び出し",
  category: "runtime-safety",
  difficulty: 4,

  goal: "`as` による型アサーションが実行時を何も保証しないことを理解し、境界で検証するコードに直せるようになる",
  explanation:
    "TypeScript の型は「コンパイル時の約束」であって、実行時のデータを検査しません。" +
    "`as User` は「これは User だと信じてくれ」と型チェッカーに宣言するだけで、実際のJSONが違っていても何も起きません。" +
    "外部APIは仕様書どおりに返ってこないことがあります（項目名の違い、`null` の混入、配列が空でなく `null`）。" +
    "受託開発で最も多い事故のひとつが、この「型はあるのに本番で落ちる」パターンです。" +
    "境界（外部との接点）では `unknown` で受けて実行時に検証するのが原則です。",

  symptom:
    "ローカルでは動くのに、本番環境で `TypeError: Cannot read properties of null (reading 'toLowerCase')` がときどき出る。TypeScript の型エラーは1件も出ていない。",

  brokenCode: `type User = {
  id: number;
  name: string;
  email: string;
};

async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`);
  const data = await response.json() as User;
  return data;
}

async function main(): Promise<void> {
  const user = await fetchUser(1);
  console.log(user.email.toLowerCase());
}

main();`,

  defects: [
    {
      id: "d-34-1",
      summary: "`as User` は実行時に何も検証していない",
      why:
        "`.json()` の戻り値は本来 `any`/`unknown` です。`as` は型チェッカーを黙らせるだけで、" +
        "実際に届いたJSONが User の形をしているかは一切確認されません。" +
        "`email` が `null` で返ってきても型の上では `string` のままなので、`toLowerCase()` で初めて落ちます。",
      marker: "const data = await response.json() as User;",
    },
    {
      id: "d-34-2",
      summary: "`response.ok` を確認していない",
      why:
        "fetch は 404 や 500 でも例外を投げません。エラーレスポンスのJSON（`{ \"error\": \"not found\" }` など）が" +
        "そのまま User として扱われ、後続で undefined 参照になります。",
      marker: "const response = await fetch(...);",
    },
    {
      id: "d-34-3",
      summary: "検証に失敗したときの扱いが決まっていない",
      why:
        "境界で検証する場合、「不正なデータが来たらどうするか」を決める必要があります。" +
        "例外を投げて呼び出し側の try/catch に委ねるのが基本形です。呼び出し側も `unknown` で受けて絞り込みます。",
    },
  ],

  fixedCode: `type User = {
  id: number;
  name: string;
  email: string;
};

// 境界では unknown で受け、実行時に形を検証してから User と名乗らせる。
// 戻り値を \`value is User\` にすることで、true を返した後は User として扱える。
function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.email === "string"
  );
}

async function fetchUser(userId: number): Promise<User> {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`);

  // fetch は 4xx/5xx でも例外を投げないので自分で確認する
  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }

  const data: unknown = await response.json();

  if (!isUser(data)) {
    throw new Error("APIレスポンスが User の形をしていません");
  }

  return data;
}

async function main(): Promise<void> {
  try {
    const user = await fetchUser(1);
    console.log(user.email.toLowerCase());
  } catch (e: unknown) {
    console.error(e instanceof Error ? e.message : "不明なエラー");
  }
}

main();`,

  hints: [
    {
      level: 1,
      text: "`as` を消すところから始めます。`const data: unknown = await response.json()` として、そこから先へ進むには検証が必要な状態にしてしまうのがコツです。",
    },
    {
      level: 2,
      text: "検証関数の戻り値型を `value is User`（型述語, #07）にします。`typeof v.id === \"number\"` のようにプロパティを1つずつ確認します。実務では zod や valibot といったライブラリでこの検証を宣言的に書きますが、やっていることは同じです。",
    },
    {
      level: 3,
      text: "`if (!response.ok) throw new Error(...)` → `const data: unknown = await response.json()` → `if (!isUser(data)) throw new Error(...)` → `return data` の順です。最後の `return data` で型エラーが出なければ、型ガードが正しく効いています。",
    },
  ],

  checkpoints: [
    {
      id: "cp-34-1",
      description: "`isUser` が型述語（`value is User`）として定義されているか？",
      verify: {
        kind: "type",
        assert: `
const _v: unknown = null;
function _narrow(): User | null {
  // isUser が型述語ならこのブロック内で User に絞り込まれる
  if (isUser(_v)) return _v;
  return null;
}
type _c1 = Expect<Equal<ReturnType<typeof _narrow>, User | null>>;`,
      },
    },
    {
      id: "cp-34-2",
      description: "`isUser` の引数が `unknown` を受け取れるか（`any` に逃げていないか）？",
      verify: {
        kind: "type",
        assert: `
type _P = Parameters<typeof isUser>[0];
type _c2 = Expect<Equal<_P, unknown>>;`,
      },
    },
    {
      id: "cp-34-3",
      description: "`fetchUser` の戻り値型が `Promise<User>` のままか？",
      verify: {
        kind: "type",
        assert: `
type _c3 = Expect<Equal<ReturnType<typeof fetchUser>, Promise<User>>>;`,
      },
    },
    {
      id: "cp-34-4",
      description: "検証していない `unknown` をそのまま User として返せないようになっているか？",
      verify: {
        kind: "expect-error",
        assert: `
const _raw: unknown = { id: 1 };
const _bad: User = _raw;`,
      },
    },
  ],

  tags: ["as", "型アサーション", "型ガード", "unknown", "実行時検証", "fetch", "境界", "zod"],
  relatedIds: ["ts-15-api-fetch", "ts-07-type-guards", "ts-14-error-handling"],
};
