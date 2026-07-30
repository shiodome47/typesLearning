// 「なぜ必要か」を練習画面の最上部に置くカード。
// 仕組みの説明（explanation）より前に読ませることを意図している。

import type { Why } from "@curriculum/types";
import { InlineCodeText } from "./InlineCodeText";

type Block =
  | { type: "text"; content: string }
  | { type: "code"; content: string };

/**
 * ``` で囲んだ部分をコードブロックとして切り出し、残りを本文として返す。
 *
 * why では「正しい書き方 / 間違った書き方」を数行並べて見せたい場面があり、
 * インラインコード（`...`）は改行を含められないためフェンスを使っている。
 * ここで扱わないと ``` が生のまま画面に出る。
 *
 * 段落分割（\n\n）より先にフェンスを取り出すのが要点。
 * コードの中に空行があると、後から分割したのでは
 * フェンスが2つの段落に割れて検出できなくなる。
 */
function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const fence = /```[^\n]*\n([\s\S]*?)```/g;
  let last = 0;

  for (let m = fence.exec(text); m !== null; m = fence.exec(text)) {
    if (m.index > last) {
      blocks.push({ type: "text", content: text.slice(last, m.index) });
    }
    blocks.push({ type: "code", content: m[1].replace(/\s+$/, "") });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    blocks.push({ type: "text", content: text.slice(last) });
  }
  return blocks;
}

function Paragraphs({ text }: { text: string }) {
  let key = 0;
  return (
    <>
      {parseBlocks(text).map((block) => {
        if (block.type === "code") {
          return (
            <pre
              key={key++}
              className={[
                "bg-gray-900 text-gray-100 rounded-lg px-3 py-2.5 my-2.5",
                "text-[0.8em] font-mono leading-relaxed overflow-x-auto",
              ].join(" ")}
            >
              <code>{block.content}</code>
            </pre>
          );
        }
        // 本文側だけを段落に割る
        return block.content
          .split("\n\n")
          .map((para) => para.trim())
          .filter((para) => para.length > 0)
          .map((para) => (
            <p key={key++} className="mt-2.5 first:mt-0">
              <InlineCodeText text={para} />
            </p>
          ));
      })}
    </>
  );
}

export function WhyCard({ why }: { why: Why }) {
  return (
    <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
      <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
        <h2 className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
          なぜ必要か
        </h2>
      </div>

      {/* 全幅で置くため、内部で2カラムに分ける。
          1行が長くなりすぎるのを防ぎ、縦の高さも抑えられる。 */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="text-sm text-gray-700 leading-relaxed">
          <Paragraphs text={why.problem} />
        </div>

        <div className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-6">
          <Paragraphs text={why.insight} />
        </div>
      </div>
    </div>
  );
}
