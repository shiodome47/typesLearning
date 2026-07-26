import type { Lesson } from "../types";

export const grLesson02: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-02-app-d-ts",
  order: 27,
  title: "② `app.d.ts` で locals に型を付ける — 打ち間違いが素通りする場所",
  category: "tooling",
  difficulty: 3,

  goal: "`app.d.ts` の `App.Locals` を書いて、`hooks.server.ts` で入れた値と各ページで読む値の型を一致させられるようになる",

  why: {
    problem:
      "SvelteKit編の⑧で認証を作りました。`hooks.server.ts` で `event.locals.user` に入れて、" +
      "各ページで `locals.user` を読む。動きました。\n\n" +
      "ここに穴があります。**`locals` は初期状態では「何でも入る箱」です。**\n\n" +
      "だから、こう書いても何も言われません。\n\n" +
      "`if (!locals.usre) redirect(303, \"/login\");`\n\n" +
      "`user` ではなく `usre` です。タイプミスです。\n" +
      "`locals.usre` は常に `undefined` なので、`!undefined` は `true`。" +
      "**つまり全員がログイン画面に飛ばされます。**\n\n" +
      "……これはまだマシなほうです。逆を考えてください。\n\n" +
      "`if (locals.usre) { /* 管理者だけの処理 */ }`\n\n" +
      "この場合、条件は常に `false` なので、管理者向けの処理が**誰に対しても実行されません**。" +
      "画面には何も出ない。エラーも出ない。「この機能、まだ作ってないんだっけ？」で終わります。\n\n" +
      "もっと怖いのはこちらです。\n\n" +
      "`if (!locals.user?.isAdmin) error(403);`\n\n" +
      "`hooks.server.ts` が入れているのは `{ name, role }` で、`isAdmin` なんてありません。" +
      "`undefined?.isAdmin` は `undefined`、`!undefined` は `true`……ではなく、" +
      "ユーザーがいれば `user.isAdmin` は `undefined` なので `!undefined` は `true`。" +
      "**403 になります。** 一見「守れている」ように見えますが、" +
      "書き方を1つ間違えれば逆になります。**チェックが機能しているかどうかを、目で見て確かめる方法がありません。**",
    insight:
      "`src/app.d.ts` に、この箱の中身を宣言します。\n\n" +
      "```\n" +
      "declare global {\n" +
      "  namespace App {\n" +
      "    interface Locals {\n" +
      "      user: { name: string; role: string } | null;\n" +
      "    }\n" +
      "  }\n" +
      "}\n" +
      "```\n\n" +
      "これを書いた瞬間、`locals.usre` は**赤くなります**。存在しないプロパティだからです。" +
      "`locals.user.isAdmin` も赤くなります。宣言に無いからです。\n\n" +
      "そして `| null` を付けているのが効きます。" +
      "`locals.user.name` と直接書くと「null かもしれない」と怒られるので、" +
      "**先に `if (!locals.user)` を書かざるを得なくなります。** " +
      "認証チェックを書き忘れる、ということが型のレベルで起きにくくなります。\n\n" +
      "この宣言が特殊なのは、**1か所書けばアプリ全体に効く**ことです。" +
      "`declare global` なので import は要りません。" +
      "`hooks.server.ts` で入れる側も、各ページで読む側も、同じ型を見ます。" +
      "片方だけ直して食い違う、ということが起きません。\n\n" +
      "SvelteKit のプロジェクトを作ると `app.d.ts` は最初から空で置かれています。" +
      "**空のまま放置されているプロジェクトは、ここが全部素通りしている**ということです。",
  },
  explanation:
    "`src/app.d.ts` は SvelteKit がアプリ全体の型を宣言するための場所です。" +
    "`App.Locals` は `event.locals` の型、`App.PageData` は全ページ共通の `data` の型、" +
    "`App.Error` は `error()` に渡すオブジェクトの型を決めます。" +
    "`declare global` の中に書くため import は不要で、宣言した時点でアプリ全体に効きます。" +
    "`Locals` を宣言していない状態では `locals` は実質的に何でも受け付けるため、" +
    "プロパティ名の打ち間違いや、存在しないフィールドへのアクセスが検出されません。" +
    "`user: X | null` のように null を含めておくと、参照する前に存在チェックを書かないと型エラーになるため、" +
    "認証チェックの書き忘れを型が防ぎます。" +
    "なお `app.d.ts` は SvelteKit のプロジェクト生成時に空の状態で作られます。",

  files: [
    {
      path: "src/app.d.ts",
      role: "アプリ全体の型宣言。1か所書けば全ファイルに効く",
      starter: `// src/app.d.ts
//
// SvelteKit が最初から置いてくれているファイルです。
// 空のまま放置されているプロジェクトは、locals の打ち間違いが
// 全部素通りしている状態です。

declare global {
  namespace App {
    // 1. Locals という interface を宣言してください
    //
    //    中身は hooks.server.ts が入れているものと合わせます:
    //      user: { name: string; role: string } | null
    //
    //    | null を付けるのが大事です。
    //    こう書くと locals.user.name を直接書けなくなり、
    //    先に存在チェックを書かざるを得なくなります。
  }
}

export {};
`,
      model: `// src/app.d.ts

declare global {
  namespace App {
    // declare global の中なので import は不要。
    // ここに書いた時点でアプリ全体に効く。
    //
    // hooks.server.ts で入れる側も、各ページで読む側も、同じ型を見る。
    // 片方だけ直して食い違う、ということが起きない。
    interface Locals {
      // | null が効く。
      // locals.user.name と直接書くと「null かもしれない」と怒られるので、
      // 先に if (!locals.user) を書かざるを得なくなる。
      // 認証チェックの書き忘れが、型のレベルで起きにくくなる。
      user: { name: string; role: string } | null;
    }

    // 必要なら他にも宣言できる
    //   interface Error { code?: string }        error() に渡す形
    //   interface PageData { site?: SiteInfo }   全ページ共通の data
  }
}

export {};
`,
    },
    {
      path: "src/routes/kanri/+page.server.ts",
      role: "打ち間違いが2か所あります。型を書いてから直してください",
      starter: `// src/routes/kanri/+page.server.ts
//
// app.d.ts に Locals を書くまで、下の間違いは何も言われません。

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // 2. ここに打ち間違いがあります。
  //    app.d.ts を書けば赤くなるはずです。
  if (!locals.usre) {
    redirect(303, "/login");
  }

  // 3. ここにも間違いがあります。
  //    hooks.server.ts が入れているのは { name, role } です。
  return { user: locals.user, isAdmin: locals.user.admin };
};
`,
      model: `// src/routes/kanri/+page.server.ts

import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // locals.usre は赤くなる。Locals に無いプロパティだから。
  //
  // この打ち間違いが怖いのは、動いてしまうこと。
  // locals.usre は常に undefined なので !undefined は true になり、
  // 全員がログイン画面に飛ばされる。
  // 逆に if (locals.usre) と書けば、誰に対しても中身が実行されない。
  if (!locals.user) {
    redirect(303, "/login");
  }

  // ここを通った時点で locals.user は null ではないと型が知っている。
  // admin ではなく role。宣言に無いものは書けない。
  return { user: locals.user, isAdmin: locals.user.role === "admin" };
};
`,
    },
    {
      path: "src/hooks.server.ts",
      role: "値を入れる側。ここと app.d.ts が同じ形になっている必要があります（参照のみ）",
      readOnly: true,
      starter: `// src/hooks.server.ts
//
// 入れる側。app.d.ts の Locals は、これと同じ形にします。

const SESSIONS: Record<string, { name: string; role: string }> = {
  "valid-session-token": { name: "管理者", role: "admin" },
};

export const handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session");
  //                    ↓ この形が app.d.ts の Locals.user と一致する
  event.locals.user = token ? (SESSIONS[token] ?? null) : null;
  return resolve(event);
};
`,
      model: `// src/hooks.server.ts

const SESSIONS: Record<string, { name: string; role: string }> = {
  "valid-session-token": { name: "管理者", role: "admin" },
};

export const handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session");
  event.locals.user = token ? (SESSIONS[token] ?? null) : null;
  return resolve(event);
};
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`app.d.ts` に書くのは「`locals` の中身はこういう形です」という宣言だけです。`namespace App` の中に `interface Locals` を作ります。",
    },
    {
      level: 2,
      text: "`interface Locals { user: { name: string; role: string } | null; }` です。`| null` を忘れないでください。これがあるおかげで、参照する前に存在チェックを書かざるを得なくなります。",
    },
    {
      level: 3,
      text: "ページ側は2か所直します。`locals.usre` → `locals.user`。`locals.user.admin` → `locals.user.role === \"admin\"`（`hooks.server.ts` が入れているのは `name` と `role` だけなので）。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-02-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-02-2",
      description: "`app.d.ts` に `Locals` を宣言し、`user` を持たせたか？",
      verify: {
        kind: "kit-declares",
        file: "src/app.d.ts",
        name: "Locals",
        members: ["user"],
      },
    },
    {
      id: "cp-gr-02-3",
      description: "`locals.usre` の打ち間違いを直したか？",
      verify: {
        kind: "kit-member",
        file: "src/routes/kanri/+page.server.ts",
        object: "locals",
        property: "usre",
        expect: false,
      },
    },
    {
      id: "cp-gr-02-4",
      description: "`locals.user` を使っているか？",
      verify: {
        kind: "kit-member",
        file: "src/routes/kanri/+page.server.ts",
        object: "locals",
        property: "user",
      },
    },
    {
      id: "cp-gr-02-5",
      description: "存在しない `admin` をやめて `role` で判定しているか？",
      verify: {
        kind: "kit-contains-string",
        file: "src/routes/kanri/+page.server.ts",
        value: "admin",
      },
    },
    {
      id: "cp-gr-02-6",
      description: "未ログインを `redirect()` で弾いているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/+page.server.ts",
        name: "redirect",
      },
    },
  ],

  tags: ["SvelteKit", "app.d.ts", "App.Locals", "declare global", "型宣言"],
  relatedIds: ["sk-08-hooks-auth", "gr-01-types-annotation", "gr-03-eslint"],
};
