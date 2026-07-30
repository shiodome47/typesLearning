// 教材テキストの軽量レンダラ。
//
// バッククォート（`...`）をインラインコードに、アスタリスク2つ（**...**）を
// 太字にする。dangerouslySetInnerHTML は使わない。
//
// Markdown ライブラリを入れていないのは、教材テキストで使う記法が
// この2つに限られるため。逆に言えば、ここで対応していない記法を
// 教材に書くと生の記号がそのまま画面に出る。
// （以前は太字が未実装で、** が画面に出ていた）

interface InlineCodeTextProps {
  text: string;
}

/** `...` だけを処理する（太字の内側でも使う） */
function CodeSpans({ text }: InlineCodeTextProps) {
  const parts = text.split(/(`[^`\n]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="bg-gray-100 text-gray-800 text-[0.85em] px-1 py-0.5 rounded font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function InlineCodeText({ text }: InlineCodeTextProps) {
  // 太字を先に切り出す。太字の中にコード片が入ることがあるため
  // （例: **`R` に `any` があるのは合図**）、内側でさらに CodeSpans を通す。
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-bold text-gray-900">
              <CodeSpans text={part.slice(2, -2)} />
            </strong>
          );
        }
        return <CodeSpans key={i} text={part} />;
      })}
    </>
  );
}
