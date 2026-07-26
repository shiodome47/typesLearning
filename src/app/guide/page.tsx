// 学習の手引き（Server Component）
// 「全部を同じようにやらなくていい」を伝えることが目的のページ。

import Link from "next/link";
import { allLessons } from "../../../curriculum";
import { InlineCodeText } from "@/components/InlineCodeText";
import {
  TIER_INFO,
  TIER_LESSONS,
  type Tier,
} from "@/lib/studyGuide";

export const metadata = {
  title: "学習の手引き | TypeScript 判断力トレーニング",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function TierBlock({ tier }: { tier: Tier }) {
  const info = TIER_INFO[tier];
  const ids = TIER_LESSONS[tier];
  const lessons = ids
    .map((id) => allLessons.find((l) => l.id === id))
    .filter((l) => l !== undefined)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={`rounded-xl border-2 p-4 mb-4 ${info.accent}`}>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="font-bold">{info.label}</h3>
        <span className="text-xs opacity-70 whitespace-nowrap">
          {lessons.length} 件
        </span>
      </div>
      <p className="text-sm leading-relaxed mb-1.5">{info.summary}</p>
      <p className="text-sm leading-relaxed font-medium mb-3">{info.howTo}</p>

      <ul className="space-y-1 bg-white/70 rounded-lg p-3">
        {lessons.map((l) => (
          <li key={l.id} className="text-sm">
            <Link
              href={`/lesson/${l.id}`}
              className="text-blue-700 hover:text-blue-900 hover:underline"
            >
              {l.order}. {l.title}
            </Link>
            {l.kind === "diagnose" && (
              <span className="ml-1.5 text-xs text-purple-700">［診断］</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            ← 一覧へ
          </Link>
          <span className="text-sm text-gray-500">学習の手引き</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">学習の手引き</h1>
        <p className="text-sm text-gray-500 mb-8">
          この教材をどう使うと効率がいいか
        </p>

        {/* ── 結論 ── */}
        <div className="bg-white rounded-xl border-2 border-green-300 p-4 mb-10">
          <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
            <li>
              ・<strong>全部を白紙で書けるようになる必要はありません。</strong>
              構文を覚えることは、いまいちばん価値が下がった能力です
            </li>
            <li>
              ・大事なのは<strong>読んで判断できること</strong>。
              AIが書いたコードを見て「これは危ない」と気づけるかどうかです
            </li>
            <li>
              ・<strong>37件は同じ重さではありません。</strong>
              下の「時間をかける」8件だけ、繰り返す価値があります
            </li>
          </ul>
        </div>

        {/* ── 1レッスンの進め方 ── */}
        <Section title="1レッスンの進め方">
          <ol className="space-y-2.5 text-sm text-gray-700 leading-relaxed">
            <li>
              <strong>1.「なぜ必要か」を読む。</strong>
              ここだけは必ず読んでください。これが分からないまま手を動かしても身につきません
            </li>
            <li>
              <strong>2. 手本コードを読む。</strong>
              分からない行があったら、そこで止まって考えます
            </li>
            <li>
              <strong>3. 手本を見ながら書き写す。</strong>
              写経でかまいません。指を動かすと引っかかりに気づきます
            </li>
            <li>
              <strong>4. 手本を隠して、思い出せるところだけ書く。</strong>
              詰まったらすぐ開いていいです。
              <span className="text-gray-900 font-medium">
                思い出せるまで繰り返す必要はありません
              </span>
            </li>
            <li>
              <strong>5.「自動採点」を押す。</strong>
              ◇ の項目は機械が判定します。✕ が出たら、その理由を読んで直します
            </li>
            <li>
              <strong>6. もう一度「なぜ必要か」を読む。</strong>
              手を動かしたあとだと、意味の見え方が変わります
            </li>
          </ol>
        </Section>

        {/* ── 完了の基準 ── */}
        <Section title="「完了」を押す基準">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              暗記できたかどうかではありません。
              <strong className="text-gray-900">
                「これが無いと何が起きるのか」を自分の言葉で説明できるか
              </strong>
              です。
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2.5">
              説明できるなら、コードを見ずに書けなくても完了で構いません。逆に、書けるけれど
              なぜそう書くのか説明できないなら、まだ終わっていません。
            </p>
          </div>
        </Section>

        {/* ── ランク ── */}
        <Section title="37件を3つに分けています">
          {(["focus", "foundation", "reference"] as const).map((tier) => (
            <TierBlock key={tier} tier={tier} />
          ))}
        </Section>

        {/* ── おすすめの順番 ── */}
        <Section title="おすすめの順番">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ol className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>
                <strong>1.「読んで理解する」14件を軽く通す。</strong>
                1件10分。ここで止まらないでください
              </li>
              <li>
                <strong>2.「時間をかける」8件をじっくり。</strong>
                ここが本体です。1件30分かける価値があります
              </li>
              <li>
                <strong>3.「必要になったら引く」15件は、今はやらない。</strong>
                仕事で出てきたときに開いてください
              </li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              一覧ページの「種類」で<strong>診断</strong>だけに絞り込めます。
              「時間をかける」8件のうち4件は診断問題です。
            </p>
          </div>
        </Section>

        {/* ── やらなくていいこと ── */}
        <Section title="やらなくていいこと">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>
                ・<strong>全37件を白紙で再現できるようにすること。</strong>
                構文はAIが書きます。あなたが判断できることのほうが重要です
              </li>
              <li>
                ・
                <strong>
                  型パズル（<InlineCodeText text="Mapped Types" />・
                  <InlineCodeText text="keyof" />
                  など）を暗記すること。
                </strong>
                出てきたときに調べれば間に合います
              </li>
              <li>
                ・<strong>完走すること自体を目標にすること。</strong>
                進捗率は目的ではありません
              </li>
            </ul>
          </div>
        </Section>

        {/* ── 詰まったら ── */}
        <Section title="詰まったら">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>
                ・<strong>用語が分からない</strong> → 各レッスンの「関連教材」にある
                <span className="text-gray-500">「↑ 前提」</span>
                に戻ってください
              </li>
              <li>
                ・<strong>型エラーの意味が分からない</strong> →
                エディタ右上の「型エラー: ON」にすると、その場で赤線と説明が出ます
              </li>
              <li>
                ・<strong>「なぜ必要か」が腑に落ちない</strong> →
                飛ばして構いません。説明のほうに問題がある可能性があります
              </li>
            </ul>
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm text-white transition-colors"
          >
            教材一覧へ →
          </Link>
        </div>
      </main>
    </div>
  );
}
