// 学習の手引き（Server Component）
// 「全部を同じようにやらなくていい」を伝えることが目的のページ。
// 配分の理由は TypeScript と Svelte で違うので、言語ごとに分けて示す。

import Link from "next/link";
import { allLessons } from "../../../curriculum";
import { InlineCodeText } from "@/components/InlineCodeText";
import {
  TIER_INFO,
  TIER_LESSONS,
  ROADMAP,
  LESSON_TIME_BREAKDOWN,
  stepLessonIds,
  formatMinutes,
  totalRoadmapMinutes,
  type Tier,
} from "@/lib/studyGuide";
import type { LessonLanguage } from "@curriculum/types";
import { LANGUAGE_LABELS } from "@/lib/labels";

export const metadata = {
  title: "学習の手引き | 判断力トレーニング",
};

const TIERS = ["focus", "tutorial", "foundation", "reference"] as const;

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

function TierBlock({
  language,
  tier,
}: {
  language: LessonLanguage;
  tier: Tier;
}) {
  const info = TIER_INFO[language][tier];
  const ids = TIER_LESSONS[language][tier];
  const lessons = ids
    .map((id) => allLessons.find((l) => l.id === id))
    .filter((l) => l !== undefined)
    .sort((a, b) => a.order - b.order);

  if (lessons.length === 0) return null;

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
            {l.kind === "project" && (
              <span className="ml-1.5 text-xs text-emerald-700">
                ［複数ファイル］
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LanguageGuide({
  language,
  lead,
}: {
  language: LessonLanguage;
  lead: React.ReactNode;
}) {
  const count = TIERS.reduce(
    (n, t) => n + TIER_LESSONS[language][t].length,
    0
  );
  if (count === 0) return null;

  return (
    <Section title={`${LANGUAGE_LABELS[language]}の配分（${count}件）`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 text-sm text-gray-700 leading-relaxed">
        {lead}
      </div>
      {TIERS.map((tier) => (
        <TierBlock key={tier} language={language} tier={tier} />
      ))}
    </Section>
  );
}

/** 進め方のロードマップ（ページ末尾のまとめ） */
function Roadmap() {
  const total = totalRoadmapMinutes();

  return (
    <section id="roadmap" className="scroll-mt-16">
      <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 mb-5">
        <h2 className="text-lg font-bold text-indigo-900 mb-1">
          まとめ：どの順番で、何時間かけるか
        </h2>
        <p className="text-sm text-indigo-900 leading-relaxed">
          全部で <strong>{formatMinutes(total)}</strong>{" "}
          です。1日2時間なら1週間強、集中してやるなら3〜4日。
          <br />
          <strong>順番に意味があります。</strong>
          後の段階は前の段階を前提にしているので、飛ばすと繋がりません。
        </p>
      </div>

      <ol className="space-y-4">
        {ROADMAP.map((step, i) => {
          const ids = stepLessonIds(step);
          const minutes = ids.length * step.minutesPerLesson;
          const isLast = i === ROADMAP.length - 1;

          return (
            <li
              key={step.title}
              className={[
                "rounded-xl border-2 p-4",
                isLast
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{step.title}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {ids.length > 0 && `${ids.length} 件 / `}
                  {minutes > 0 ? formatMinutes(minutes) : "期限なし"}
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {step.what}
              </p>

              <div
                className={[
                  "rounded-lg p-3 mb-2",
                  isLast ? "bg-white/70" : "bg-blue-50",
                ].join(" ")}
              >
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  ここまでやると、こうなります
                </p>
                <p className="text-sm text-gray-900 leading-relaxed font-medium">
                  {step.outcome}
                </p>
              </div>

              {step.source && (
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold">次へ進む目安：</span>
                  {step.gate}
                </p>
              )}

              {ids.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-700 cursor-pointer hover:underline">
                    対象の {ids.length} 件を見る
                  </summary>
                  <ul className="mt-2 space-y-1 pl-1">
                    {ids.map((id) => {
                      const lesson = allLessons.find((l) => l.id === id);
                      if (!lesson) return null;
                      return (
                        <li key={id} className="text-sm">
                          <Link
                            href={`/lesson/${id}`}
                            className="text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {lesson.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ol>

      {/* ── 1レッスンの時間の使い方 ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
        <h3 className="font-bold text-gray-900 mb-1">1レッスン30分の使い方</h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          時間をかけるべきは「書く」ところではありません。
          <strong className="text-gray-900">
            前後の「なぜ必要か」に10分使う
          </strong>
          のが、この教材の効かせどころです。
        </p>
        <ul className="space-y-1.5">
          {LESSON_TIME_BREAKDOWN.map((row) => (
            <li key={row.label} className="flex items-baseline gap-3 text-sm">
              <span className="text-xs font-mono text-gray-400 w-10 shrink-0 text-right">
                {row.minutes}分
              </span>
              <span className="text-gray-700">{row.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 leading-relaxed mt-3">
          詰まったら手本をすぐ開いて構いません。悩んでいる時間は学習になりません。
          ただし Svelte の「手が覚えるまでやる」だけは、見ずに書けるまで繰り返してください。
        </p>
      </div>

      {/* ── 終わりの判断 ── */}
      <div className="bg-white rounded-xl border-2 border-green-300 p-4 mt-4">
        <h3 className="font-bold text-gray-900 mb-2">
          「この教材を終えた」と言える条件
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          完走率ではありません。次の3つに自分の言葉で答えられたら終わりです。
          <strong className="text-gray-900">
            残りのレッスンは、やらなくて構いません。
          </strong>
        </p>
        <ol className="space-y-2 text-sm text-gray-800 leading-relaxed">
          <li>
            <strong>1.</strong>{" "}
            手元のファイルを1つ挙げて、「これはブラウザに配られるか？」に即答できる
          </li>
          <li>
            <strong>2.</strong>{" "}
            AIが書いたコードを受け取ったとき、最初に見る3か所を挙げられる
          </li>
          <li>
            <strong>3.</strong>{" "}
            型と Lint が「止められないもの」を3つ挙げられる
          </li>
        </ol>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          この3つに答えられる状態が、
          <strong className="text-gray-900">
            受託でAIを使いながら仕事をするための最低ライン
          </strong>
          です。ここから先は、教材ではなく実際の案件で伸びます。
        </p>
      </div>
    </section>
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
        <p className="text-sm text-gray-500 mb-4">
          この教材をどう使うと効率がいいか
        </p>

        {/* 長いページなので、結論（進め方）へ直接飛べるようにする */}
        <a
          href="#roadmap"
          className="inline-block mb-8 text-sm text-indigo-700 hover:text-indigo-900 hover:underline"
        >
          → 先に「どの順番で、何時間かけるか」を見る
        </a>

        {/* ── 結論 ── */}
        <div className="bg-white rounded-xl border-2 border-green-300 p-4 mb-10">
          <ul className="space-y-2 text-sm text-gray-800 leading-relaxed">
            <li>
              ・<strong>全部を同じようにやる必要はありません。</strong>
              各言語で「時間をかけるもの」だけ繰り返してください
            </li>
            <li>
              ・
              <strong>
                TypeScript と Svelte では、力を入れる場所が違います。
              </strong>
              TypeScript は「読んで判断できること」、Svelte は「手が覚えていること」が目的です
            </li>
            <li>
              ・<strong>進捗率は目的ではありません。</strong>
              完走を目標にしないでください
            </li>
          </ul>
        </div>

        {/* ── 1レッスンの進め方 ── */}
        <Section title="1レッスンの進め方（共通）">
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
              <strong>4. 手本を隠して書く。</strong>
              詰まったらすぐ開いていいです。
              <span className="text-gray-900 font-medium">
                ただし Svelte の「手が覚えるまでやる」だけは、見ずに書けるまで繰り返してください
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

        {/* ── 言語ごとの配分 ── */}
        <LanguageGuide
          language="typescript"
          lead={
            <>
              <p>
                <strong>構文を覚える必要はありません。</strong>
                いま価値があるのは、AIが書いたコードを読んで「これは危ない」と気づけることです。
              </p>
              <p className="mt-2">
                だから「時間をかける」8件は、境界の検証・状態の設計・網羅性・診断に絞ってあります。
                型パズル（<InlineCodeText text="Mapped Types" />・
                <InlineCodeText text="keyof" />
                など）は暗記せず、出てきたときに調べれば間に合います。
              </p>
            </>
          }
        />

        <LanguageGuide
          language="svelte"
          lead={
            <>
              <p>
                <strong>ここは TypeScript と方針が逆です。</strong>
                Svelte を学ぶ目的が「AIが使えない状況でも書けるという保険」なので、
                中核の構文は手が覚えているほうがいい。そろばんと同じ考え方です。
              </p>
              <p className="mt-2">
                幸い、<strong>Svelte の中核は驚くほど小さい</strong>です。
                <InlineCodeText text="$state" />・
                <InlineCodeText text="$derived" />・
                <InlineCodeText text="$props" />・
                <InlineCodeText text="bind:" />
                あたりが書ければ、たいていの画面は書けます。
              </p>
              <p className="mt-2">
                一方で Svelte の失敗は「
                <strong>落ちない。動く。でも間違っている</strong>
                」が主戦場です。書く練習では原理的に気づけないので、診断の比率を上げてあります。
              </p>
              <p className="mt-2">
                <strong>SvelteKit編（①〜⑨）だけは性質が違います。</strong>
                拾い読みする教材ではなく、1本の物件サイトを順番に作り上げる連続チュートリアルです。
                受託で実際に詰まるのは Svelte の文法ではなく
                <InlineCodeText text="どのファイルに書くか" />
                なので、案件に一番近いのはここです。
              </p>
            </>
          }
        />

        {/* ── やらなくていいこと ── */}
        <Section title="やらなくていいこと">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>
                ・<strong>TypeScript を白紙で再現できるようにすること。</strong>
                構文はAIが書きます。あなたが判断できることのほうが重要です
              </li>
              <li>
                ・<strong>Svelte の全16件を暗記すること。</strong>
                手が覚えるべきなのは「手が覚えるまでやる」の中核だけです
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
                エディタ右上の「型エラー: ON」にすると、その場で赤線と説明が出ます（TypeScript教材のみ）
              </li>
              <li>
                ・<strong>「なぜ必要か」が腑に落ちない</strong> →
                飛ばして構いません。説明のほうに問題がある可能性があります
              </li>
            </ul>
          </div>
        </Section>

        <div className="mt-10 pt-8 border-t-2 border-gray-200">
          <Roadmap />
        </div>

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
