"use client";

// ─────────────────────────────────────────────────────────────
// CodeEditor.tsx
// textarea の薄いラッパー。
// 将来 Monaco Editor に差し替える際は、このコンポーネントの
// 内部実装だけを変える（props インターフェースは維持）。
// ─────────────────────────────────────────────────────────────

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string; // Tailwind height class, e.g. "min-h-64"
}

export function CodeEditor({
  value,
  onChange,
  placeholder = "// ここにコードを書いてください",
  readOnly = false,
  minHeight = "min-h-64",
}: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      className={[
        "w-full",
        minHeight,
        "font-mono text-sm leading-relaxed",
        "bg-gray-900 text-gray-100",
        "p-4 rounded-lg border border-gray-700",
        "resize-y outline-none",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "placeholder-gray-500",
        "transition-colors",
        readOnly ? "opacity-60 cursor-default" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
