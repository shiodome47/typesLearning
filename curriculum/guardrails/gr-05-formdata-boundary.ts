import type { Lesson } from "../types";

export const grLesson05: Lesson = {
  kind: "project",
  language: "svelte",
  id: "gr-05-formdata-boundary",
  order: 30,
  title: "⑤ フォームから来た値は「文字列ですらない」— 境界で必ず検証する",
  category: "tooling",
  difficulty: 4,

  goal: "`formData()` の戻り値が `string | File | null` であることを理解し、数値として使う前に検証してから型を確定させられるようになる",

  why: {
    problem:
      "管理画面に「物件を登録する」フォームを作ります。家賃を入力してもらいます。\n\n" +
      "`<input name=\"rent\" type=\"number\">` と書きました。`type=\"number\"` です。" +
      "だからサーバーには数値が来る、と思っています。\n\n" +
      "サーバー側でこう書きます。\n\n" +
      "`const rent = data.get(\"rent\");`\n" +
      "`if (rent > 1000000) return fail(400, { error: \"家賃が高すぎます\" });`\n\n" +
      "動きます。テストもします。1500000 を入れると弾かれます。よし。\n\n" +
      "**ところが 90000 を入れても弾かれます。**\n\n" +
      "理由はこうです。`data.get(\"rent\")` が返すのは**文字列**です。" +
      "`\"90000\" > 1000000` を JavaScript がどう計算するかというと、" +
      "文字列と数値の比較なので数値に変換して……いや、実はこの場合は変換されて `false` になります。\n\n" +
      "では何が起きたか。`\"90000\"` ではなく `\"9万\"` を入れられた場合です。" +
      "`Number(\"9万\")` は `NaN`。`NaN > 1000000` は `false`。**検証を素通りします。**\n" +
      "そして `NaN` が家賃としてデータベースに入ります。\n\n" +
      "さらに悪いのは、`type=\"number\"` を信じていたことです。" +
      "**HTML の `type` 属性は、ブラウザの中でしか効きません。** " +
      "`curl` で直接 POST すれば、`rent=abc` でも `rent=<script>` でも何でも送れます。\n\n" +
      "そして最後に、もっと根本的な話。" +
      "`data.get(\"rent\")` の型は `string` ですらありません。**`string | File | null`** です。" +
      "ファイル入力があるフォームなら `File` が来ることがあり、" +
      "その項目が無ければ `null` が来ます。",
    insight:
      "ここで問い直すべきは「どこまでを信用するか」です。\n\n" +
      "**サーバーに入ってくる値は、すべて他人が書いた文字列だと思ってください。** " +
      "ブラウザで何を書いたかは関係ありません。ブラウザを経由しない送信ができるからです。\n\n" +
      "TypeScript 編の ts-15 でやったことと、まったく同じ話です。" +
      "外から来たデータは「型を付けた」だけでは何の保証にもならない。" +
      "**検証してはじめて、その型だと言える。**\n\n" +
      "手順は3段階です。\n\n" +
      "**1. 文字列として取り出す。** `String(data.get(\"rent\") ?? \"\")`\n" +
      "`?? \"\"` で `null` を潰し、`String()` で `File` が来ても文字列にします。" +
      "ここで型が `string` に確定します。\n\n" +
      "**2. 数値に変換する。** `Number(raw)`\n\n" +
      "**3. 変換が成功したか確かめる。** `Number.isFinite(rent)`\n" +
      "`isNaN` ではなく `Number.isFinite` を使ってください。" +
      "`isNaN` は `Infinity` を通してしまいます。`\"1e999\"` を送られると `Infinity` になります。\n\n" +
      "この3段階を通ってはじめて、`rent` は「数値である」と言えます。\n\n" +
      "そして重要なのは、**この検証を通った後だけ、型が `number` になる**ということです。" +
      "検証の前は `string`。検証を書かないと、そもそも `number` として扱えません。" +
      "**型が「検証しろ」と要求してくる**、という状態を作るのが狙いです。\n\n" +
      "（実務では zod や valibot といったライブラリでこれをまとめて書きます。" +
      "ただし中で起きていることは、いまやったことと同じです。" +
      "ライブラリを使う前に、何を代行してもらっているのかを知っておいてください）",
  },
  explanation:
    "`await request.formData()` が返す `FormData` の `get()` は " +
    "`FormDataEntryValue | null`（つまり `string | File | null`）を返します。" +
    "HTML の `type=\"number\"` や `required` はブラウザ内でのみ有効で、" +
    "直接 POST されれば適用されません。したがってサーバー側での検証が唯一の防御線です。" +
    "手順は「文字列に確定させる → 変換する → 変換の成否を確かめる」の3段階です。" +
    "`String(value ?? \"\")` で `null` と `File` を潰し、`Number()` で変換し、" +
    "`Number.isFinite()` で有効な数値かを確認します。" +
    "`isNaN()` は `Infinity` を通すため `Number.isFinite()` を使ってください。" +
    "検証に失敗したら `fail(400, {...})` で入力値ごと返し、利用者の入力を消さないようにします。" +
    "実務では zod / valibot などのスキーマライブラリでまとめて記述しますが、" +
    "行っていることはこの3段階と同じです。",

  files: [
    {
      path: "src/routes/kanri/toroku/+page.server.ts",
      role: "外から来た値を、検証してから数値として扱う",
      starter: `// src/routes/kanri/toroku/+page.server.ts
//
// AIが書いてきたコードです。動きます。
// ただし「9万」と入力されると NaN が保存されます。

import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // 1. name を文字列として確定させてください。
    //    data.get() は string | File | null を返します。
    //    String(... ?? "") で潰して .trim() します。
    const name = data.get("name");

    // 2. rent を検証してください。3段階です。
    //      a. 文字列として確定させる
    //      b. Number() で変換する
    //      c. Number.isFinite() で変換の成否を確かめる
    //         （isNaN ではありません。Infinity を通してしまうので）
    const rent = data.get("rent");

    // 3. name が空、または rent が有効な数値でなければ
    //    fail(400, { error, name, rent }) を返してください
    //    （入力値も返さないと、利用者が書いた内容が消えます）
    if (rent > 1000000) {
      return fail(400, { error: "家賃が高すぎます" });
    }

    return { success: true };
  },
};
`,
      model: `// src/routes/kanri/toroku/+page.server.ts

import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // ── 段階1: 文字列として確定させる ──
    //
    // data.get() が返すのは string | File | null。
    // ?? "" で null を潰し、String() で File が来ても文字列にする。
    // ここでようやく型が string になる。
    const name = String(data.get("name") ?? "").trim();
    const rentRaw = String(data.get("rent") ?? "").trim();

    // ── 段階2: 変換する ──
    const rent = Number(rentRaw);

    // ── 段階3: 変換の成否を確かめる ──
    //
    // isNaN ではなく Number.isFinite を使う。
    // isNaN は Infinity を通してしまうので、"1e999" が素通りする。
    //
    // ここを通ってはじめて「rent は数値である」と言える。
    // 型を付けただけでは何の保証にもならない、というのは
    // TypeScript編の ts-15 でやったことと同じ話。
    if (!name || !Number.isFinite(rent) || rent <= 0) {
      return fail(400, {
        error: "物件名と家賃（数字）を正しく入力してください。",
        // 入力値も返す。返さないと利用者が書いた内容が全部消える。
        name,
        rent: rentRaw,
      });
    }

    if (rent > 1000000) {
      return fail(400, { error: "家賃が高すぎます。", name, rent: rentRaw });
    }

    // ここまで来た rent は、検証済みの number。
    return { success: true };
  },
};

// なお HTML の type="number" や required はブラウザの中でしか効かない。
// curl で直接 POST すれば rent=abc でも送れる。
// サーバー側の検証が唯一の防御線。
`,
    },
    {
      path: "src/routes/kanri/toroku/+page.svelte",
      role: "入力欄。type=\"number\" はブラウザの中でしか効かない",
      starter: `<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<h1>物件を登録する</h1>

<!-- 4. method="POST" と use:enhance を付けてください -->
<form>
  {#if form?.error}
    <p role="alert">{form.error}</p>
  {/if}

  <!-- 5. エラーで戻ってきたときに入力が消えないよう、 -->
  <!--    value に form?.name / form?.rent を戻してください -->
  <label>
    物件名
    <input name="name" />
  </label>

  <label>
    家賃
    <input name="rent" type="number" />
  </label>

  <button type="submit">登録する</button>
</form>
`,
      model: `<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<h1>物件を登録する</h1>

<form method="POST" use:enhance>
  {#if form?.error}
    <p role="alert">{form.error}</p>
  {/if}

  <label>
    物件名
    <input name="name" value={form?.name ?? ""} />
  </label>

  <label>
    家賃
    <!--
      type="number" はブラウザの中でしか効かない。
      curl で直接 POST すれば rent=abc でも送れるので、
      これは「入力しやすさ」のためであって、検証ではない。
    -->
    <input name="rent" type="number" value={form?.rent ?? ""} />
  </label>

  <button type="submit">登録する</button>
</form>
`,
    },
  ],

  hints: [
    {
      level: 1,
      text: "`data.get()` の戻り値は `string` ではありません。`string | File | null` です。まずここを `string` に確定させないと、何も始まりません。",
    },
    {
      level: 2,
      text: "`const name = String(data.get(\"name\") ?? \"\").trim();` の形です。家賃も同じように文字列にしてから `Number()` で変換します。",
    },
    {
      level: 3,
      text: "検証は `if (!name || !Number.isFinite(rent) || rent <= 0)` です。`isNaN` ではなく `Number.isFinite` を使ってください（`isNaN` は `Infinity` を通します）。`fail(400, { error, name, rent: rentRaw })` のように入力値も返すと、エラー時に入力が消えません。",
    },
  ],

  checkpoints: [
    {
      id: "cp-gr-05-1",
      description: "すべてのファイルが解析できるか？",
      verify: { kind: "kit-parse" },
    },
    {
      id: "cp-gr-05-2",
      description: "`actions` を export しているか？",
      verify: {
        kind: "kit-export",
        file: "src/routes/kanri/toroku/+page.server.ts",
        name: "actions",
      },
    },
    {
      id: "cp-gr-05-3",
      description: "`String(...)` で文字列として確定させているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/toroku/+page.server.ts",
        name: "String",
      },
    },
    {
      id: "cp-gr-05-4",
      description: "`Number(...)` で数値に変換しているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/toroku/+page.server.ts",
        name: "Number",
      },
    },
    {
      id: "cp-gr-05-5",
      description:
        "`Number.isFinite()` で変換の成否を確かめているか（`isNaN` は `Infinity` を通す）？",
      verify: {
        kind: "kit-member",
        file: "src/routes/kanri/toroku/+page.server.ts",
        object: "Number",
        property: "isFinite",
      },
    },
    {
      id: "cp-gr-05-6",
      description: "検証に失敗したとき `fail()` を返しているか？",
      verify: {
        kind: "kit-calls",
        file: "src/routes/kanri/toroku/+page.server.ts",
        name: "fail",
      },
    },
    {
      id: "cp-gr-05-7",
      description: "`<form>` に `method=\"POST\"` があるか？",
      verify: {
        kind: "kit-attr",
        file: "src/routes/kanri/toroku/+page.svelte",
        element: "form",
        name: "method",
        value: "POST",
      },
    },
    {
      id: "cp-gr-05-8",
      description: "`use:enhance` が付いているか？",
      verify: {
        kind: "kit-use",
        file: "src/routes/kanri/toroku/+page.svelte",
        name: "enhance",
      },
    },
  ],

  tags: ["境界の検証", "formData", "バリデーション", "Number.isFinite", "zod"],
  relatedIds: ["sk-06-form-actions", "ts-15-api-fetch", "gr-06-diagnose-guardrail-gap"],
};
