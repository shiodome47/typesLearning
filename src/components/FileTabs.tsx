"use client";

// ─────────────────────────────────────────────────────────────
// FileTabs
// 複数ファイル教材のファイル切り替え。
//
// SvelteKit ではファイル名そのものが仕様なので、パスを省略せずに出す。
// 「どのフォルダの、何という名前のファイルか」を毎回見せることが
// そのまま教材になる。
// ─────────────────────────────────────────────────────────────

import type { ProjectFile } from "@curriculum/types";

interface FileTabsProps {
  files: ProjectFile[];
  activePath: string;
  onSelect: (path: string) => void;
  /** 採点で不合格になったファイル（タブに印を付ける） */
  failedPaths?: Set<string>;
}

/** src/routes/blog/+page.svelte → ["src/routes/blog/", "+page.svelte"] */
function splitPath(path: string): [string, string] {
  const i = path.lastIndexOf("/");
  return i === -1 ? ["", path] : [path.slice(0, i + 1), path.slice(i + 1)];
}

export function FileTabs({
  files,
  activePath,
  onSelect,
  failedPaths,
}: FileTabsProps) {
  const active = files.find((f) => f.path === activePath);

  return (
    <div>
      <div
        role="tablist"
        aria-label="ファイル"
        className="flex flex-wrap gap-1 border-b border-gray-200 pb-px"
      >
        {files.map((f) => {
          const [dir, name] = splitPath(f.path);
          const isActive = f.path === activePath;
          const failed = failedPaths?.has(f.path);
          return (
            <button
              key={f.path}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(f.path)}
              title={f.path}
              className={[
                "px-2.5 py-1.5 text-xs rounded-t-md border border-b-0 transition-colors font-mono whitespace-nowrap",
                isActive
                  ? "bg-white border-gray-200 text-gray-900 -mb-px"
                  : "bg-gray-50 border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100",
              ].join(" ")}
            >
              <span className="opacity-50">{dir}</span>
              <span className="font-semibold">{name}</span>
              {f.readOnly && (
                <span className="ml-1 opacity-60" title="参照のみ">
                  🔒
                </span>
              )}
              {failed && <span className="ml-1 text-red-500">✕</span>}
            </button>
          );
        })}
      </div>

      {active?.role && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {active.readOnly && (
            <span className="text-gray-400">［参照のみ］ </span>
          )}
          {active.role}
        </p>
      )}
    </div>
  );
}
