// 「なぜ必要か」を練習画面の最上部に置くカード。
// 仕組みの説明（explanation）より前に読ませることを意図している。

import type { Why } from "@curriculum/types";
import { InlineCodeText } from "./InlineCodeText";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className={i > 0 ? "mt-2.5" : undefined}>
          <InlineCodeText text={para} />
        </p>
      ))}
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
