// ─────────────────────────────────────────────────────────────
// Compact 編の実ブラウザ確認（手動実行）
//
//   npm run dev
//   npm run smoke:compact
//
// 確認するのは「採点が本当に機能しているか」。
// starter / 欠陥コードのままなら落ち、直せば通ること。
// 常に合格する採点はテストとして無意味なので、両方を見る。
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const SHOT = process.env.SMOKE_SHOT_DIR ?? ".";
const b = await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const page = await b.newPage({viewport:{width:1440,height:1000}});
page.on("pageerror", e=>console.log("PAGEERROR:", e.message.slice(0,200)));
const results=[];
const log=(ok,label,extra="")=>{console.log(`${ok?"✅":"❌"} ${label}${extra?" — "+extra:""}`);results.push(ok);};

async function open(id){
  await page.goto(`${BASE}/lesson/${id}`,{waitUntil:"domcontentloaded"});
  await page.waitForSelector(".monaco-editor",{timeout:60000});
  await page.waitForTimeout(3000);
}
async function grade(){
  await page.getByRole("button",{name:"自動採点"}).click();
  await page.waitForFunction(()=>!document.body.innerText.includes("採点中..."),{timeout:60000});
  const t=(await page.locator("text=/\\d+ \\/ \\d+ 合格/").first().textContent())??"";
  const [got,total]=t.replace(" 合格","").split(" / ").map(Number);
  return {got,total};
}
async function replaceCode(code){
  const ed=page.locator(".monaco-editor").last();
  await ed.click(); await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code); await page.waitForTimeout(900);
}

// ── 一覧に Compact が出るか ──
await page.goto(`${BASE}/`,{waitUntil:"domcontentloaded"});
await page.waitForTimeout(1500);
const hasBtn = await page.getByRole("button",{name:/Compact/}).isVisible().catch(()=>false);
log(hasBtn,"一覧に Compact ボタンが出る");
if(hasBtn){ await page.getByRole("button",{name:/Compact/}).click(); await page.waitForTimeout(800); }
await page.screenshot({path:`${SHOT}/01-list.png`});

// ── cp-01: starter では落ち、模範なら通る ──
await open("cp-01-ledger-circuit");
await page.screenshot({path:`${SHOT}/02-cp01.png`});
const a=await grade();
log(a.total>0&&a.got<a.total,"cp-01: starter のままでは不合格",`${a.got} / ${a.total}`);
await replaceCode(`pragma language_version >= 0.20;
import CompactStandardLibrary;

export ledger round: Counter;

export circuit increment(): [] {
  round.increment(1);
}
`);
const a2=await grade();
log(a2.total>0&&a2.got===a2.total,"cp-01: 正しく書くと全合格",`${a2.got} / ${a2.total}`);
await page.screenshot({path:`${SHOT}/03-cp01-pass.png`});

// ── ②〜⑤ も starter のままでは落ちること ──
// 常に合格する採点は練習にならないので、全回について不合格側を見る
for (const id of [
  "cp-02-witness-secret",
  "cp-03-assert-guard",
  "cp-04-authorization",
  "cp-05-selective-disclosure",
]) {
  await open(id);
  const r = await grade();
  log(r.total > 0 && r.got < r.total, `${id}: starter のままでは不合格`, `${r.got} / ${r.total}`);
}

// ── ④ を正しく直すと全合格（認可の作法が採点できているか）──
await open("cp-04-authorization");
await replaceCode(`pragma language_version 0.23;
import CompactStandardLibrary;

export enum State { VACANT, OCCUPIED }

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
}

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "occupied");
  owner = disclose(publicKey(localSecretKey()));
  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): [] {
  assert(state == State.OCCUPIED, "empty");
  assert(owner == publicKey(localSecretKey()), "not the owner");
  state = State.VACANT;
  message = none<Opaque<"string">>();
}
`);
const au = await grade();
log(au.total > 0 && au.got === au.total, "cp-04: 派生値で認可すると全合格", `${au.got} / ${au.total}`);

// ── cp-06: 欠陥コードは落ちる ──
await open("cp-06-diagnose-secret-leak");
await page.screenshot({path:`${SHOT}/04-cp02.png`});
const d=await grade();
log(d.total>0&&d.got<d.total,"cp-06: 秘密鍵を漏らしたままでは不合格",`${d.got} / ${d.total}`);
const msg=await page.locator("text=/公開台帳に載り/").first().isVisible().catch(()=>false);
log(msg,"cp-06: 漏洩を名指しで指摘している");
await page.screenshot({path:`${SHOT}/05-cp02-fail.png`});

// ── cp-06: 直すと通る（派生値だけ公開）──
await replaceCode(`pragma language_version 0.23;
import CompactStandardLibrary;

export enum State { VACANT, OCCUPIED }

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger sequence: Counter;
export ledger owner: Bytes<32>;

constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
  sequence.increment(1);
}

witness localSecretKey(): Bytes<32>;

export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "occupied");
  owner = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));
  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

export circuit takeDown(): Opaque<"string"> {
  assert(state == State.OCCUPIED, "empty");
  assert(owner == publicKey(localSecretKey(), sequence as Field as Bytes<32>), "not owner");
  const formerMsg = message.value;
  state = State.VACANT;
  sequence.increment(1);
  message = none<Opaque<"string">>();
  return formerMsg;
}

export circuit publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<3, Bytes<32>>>([pad(32, "bboard:pk:"), sequence, sk]);
}
`);
const d2=await grade();
log(d2.total>0&&d2.got===d2.total,"cp-06: 派生値だけ公開に直すと全合格",`${d2.got} / ${d2.total}`);
await page.screenshot({path:`${SHOT}/06-cp02-pass.png`});


// ── ⑥ dApp（複数ファイル）: タブが出て、両方直すと全合格 ──
await open("cp-07-dapp-wiring");
const tabs = await page.getByRole("tab").count();
log(tabs >= 3, "cp-07: ファイルタブが出る", `${tabs} タブ`);
const p1 = await grade();
log(p1.total > 0 && p1.got < p1.total, "cp-07: starter のままでは不合格", `${p1.got} / ${p1.total}`);

async function selectFile(name) {
  await page.getByRole("tab", { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }).click();
  await page.waitForTimeout(700);
}

await selectFile("bboard.compact");
await replaceCode(`pragma language_version 0.23;
import CompactStandardLibrary;

export ledger owner: Bytes<32>;
export ledger message: Maybe<Opaque<"string">>;

witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "bboard:pk:"), sk]);
}

export circuit post(newMessage: Opaque<"string">): [] {
  owner = disclose(publicKey(localSecretKey()));
  message = disclose(some<Opaque<"string">>(newMessage));
}
`);

await selectFile("witnesses.ts");
await replaceCode(`import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type { Ledger } from "./managed/bboard/contract/index.cjs";

export type BBoardPrivateState = {
  readonly secretKey: Uint8Array;
};

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, BBoardPrivateState>): [
    BBoardPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};
`);

const p2 = await grade();
log(p2.total > 0 && p2.got === p2.total, "cp-07: 2ファイルとも直すと全合格", `${p2.got} / ${p2.total}`);
await page.screenshot({ path: `${SHOT}/07-dapp.png` });


// ── ⑧ 選択的開示の応用: 3種類の事実 ──
await open("cp-08-range-proof");
const rp1 = await grade();
log(rp1.total > 0 && rp1.got < rp1.total, "cp-08: starter のままでは不合格", `${rp1.got} / ${rp1.total}`);
await replaceCode(`pragma language_version 0.23;
import CompactStandardLibrary;

export ledger memberId: Bytes<32>;
export ledger bidCount: Counter;

witness localBalance(): Uint<64>;
witness localPrefCode(): Uint<8>;
witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "auction:pk:"), sk]);
}

export circuit bid(): [] {
  const balance = localBalance();
  assert(balance >= 100000, "insufficient balance");

  const pref = localPrefCode();
  assert(pref == 13 || pref == 14 || pref == 12, "out of area");

  assert(memberId == publicKey(localSecretKey()), "not a member");

  bidCount.increment(1);
}
`);
const rp2 = await grade();
log(rp2.total > 0 && rp2.got === rp2.total, "cp-08: 3種類の事実を書けると全合格", `${rp2.got} / ${rp2.total}`);


// ── ⑦ 診断: 開示しすぎ（秘密は漏れていないのに特定される） ──
await open("cp-09-diagnose-over-disclosure");
const od1 = await grade();
log(od1.total > 0 && od1.got < od1.total, "cp-09: 開示しすぎのままでは不合格", `${od1.got} / ${od1.total}`);
await replaceCode(`pragma language_version 0.23;
import CompactStandardLibrary;

export ledger memberId: Bytes<32>;
export ledger bidCount: Counter;

witness localBalance(): Uint<64>;
witness localPrefCode(): Uint<8>;
witness localSecretKey(): Bytes<32>;

export circuit publicKey(sk: Bytes<32>): Bytes<32> {
  return persistentHash<Vector<2, Bytes<32>>>([pad(32, "auction:pk:"), sk]);
}

export circuit bid(): [] {
  const balance = localBalance();
  assert(balance >= 100000, "insufficient balance");

  const pref = localPrefCode();
  assert(pref == 13 || pref == 14 || pref == 12, "out of area");

  assert(memberId == publicKey(localSecretKey()), "not a member");

  bidCount.increment(1);
}
`);
const od2 = await grade();
log(od2.total > 0 && od2.got === od2.total, "cp-09: 粒度とドメイン分離を直すと全合格", `${od2.got} / ${od2.total}`);

console.log(`\n=== ${results.filter(Boolean).length}/${results.length} 合格 ===`);
await b.close();
process.exit(results.every(Boolean)?0:1);
