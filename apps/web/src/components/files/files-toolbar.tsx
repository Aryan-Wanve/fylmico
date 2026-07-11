"use client";

import { ChevronRight, LayoutGrid, List } from "lucide-react";

export type FilesViewMode = "grid" | "list";

export function FilesBreadcrumb({
  path,
  onNavigate
}: {
  path: Array<{ id: string | null; name: string }>;
  onNavigate: (id: string | null) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      {path.map((segment, index) => (
        <span
          className="flex min-w-0 items-center gap-1.5"
          key={segment.id ?? "root"}
        >
          {index > 0 ? (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#c3c7d4] dark:text-[#5c6178]" />
          ) : null}
          <button
            className={`truncate ${
              index === path.length - 1
                ? "font-bold text-[#11142c] dark:text-[#f1f2f8]"
                : "font-semibold text-[#8a90a3] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
            }`}
            onClick={() => onNavigate(segment.id)}
            type="button"
          >
            {segment.name}
          </button>
        </span>
      ))}
    </div>
  );
}

export function FilesViewControls({
  viewMode,
  onViewModeChange
}: {
  viewMode: FilesViewMode;
  onViewModeChange: (mode: FilesViewMode) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]">
      <button
        aria-pressed={viewMode === "grid"}
        className={`grid h-7 w-8 place-items-center rounded-md ${
          viewMode === "grid"
            ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
            : "text-[#8a90a3] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
        }`}
        onClick={() => onViewModeChange("grid")}
        type="button"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        aria-pressed={viewMode === "list"}
        className={`grid h-7 w-8 place-items-center rounded-md ${
          viewMode === "list"
            ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
            : "text-[#8a90a3] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
        }`}
        onClick={() => onViewModeChange("list")}
        type="button"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
