// バッククォート記法（`...`）をインラインコード表示に変換する軽量コンポーネント
// dangerouslySetInnerHTML は使わない安全な実装

interface InlineCodeTextProps {
  text: string;
}

export function InlineCodeText({ text }: InlineCodeTextProps) {
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
