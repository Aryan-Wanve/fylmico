"use client";

import { LayoutGrid, List, Minus, Plus, Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Board, ScriptSummary } from "@/types/base";

export type BoardViewMode = "grid" | "list";

export function BoardToolbar({
  board,
  viewMode,
  onViewModeChange,
  zoom,
  onZoomChange,
  onPresent,
  scripts,
  onLinkScript
}: {
  board: Board;
  viewMode: BoardViewMode;
  onViewModeChange: (mode: BoardViewMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPresent: () => void;
  scripts: ScriptSummary[];
  onLinkScript: (scriptId: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-black text-[#11142c] dark:text-[#f1f2f8]">
          {board.name}
        </h2>
        <p className="text-sm text-[#667085] dark:text-[#7d8299]">
          {board.shots.length} frames &bull; Updated{" "}
          {formatRelativeTime(board.updatedAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Select
          items={{
            none: "No linked script",
            ...Object.fromEntries(
              scripts.map((script) => [script.id, script.title])
            )
          }}
          onValueChange={(next) =>
            onLinkScript(next && next !== "none" ? next : "")
          }
          value={board.scriptId || "none"}
        >
          <SelectTrigger className="h-9 bg-white dark:bg-[#171a28]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No linked script</SelectItem>
            {scripts.map((script) => (
              <SelectItem key={script.id} value={script.id}>
                {script.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03] dark:border-white/10 dark:bg-[#171a28] dark:text-[#c7cad9] dark:hover:bg-white/[0.05]"
          onClick={onPresent}
          type="button"
        >
          <Play className="h-4 w-4" />
          Presentation
        </button>

        <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]">
          <button
            aria-pressed={viewMode === "grid"}
            className={`grid h-7 w-8 place-items-center rounded-md ${
              viewMode === "grid"
                ? "bg-white text-[#11142c] shadow-sm dark:bg-[#171a28] dark:text-[#f1f2f8]"
                : "text-[#667085] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
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
                : "text-[#667085] hover:text-[#4b5268] dark:text-[#7d8299] dark:hover:text-[#c7cad9]"
            }`}
            onClick={() => onViewModeChange("list")}
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {viewMode === "grid" ? (
          <div className="flex items-center gap-2">
            <button
              aria-label="Zoom out"
              className="grid h-7 w-7 place-items-center rounded-md text-[#667085] hover:bg-black/[0.04] disabled:opacity-40 dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              disabled={zoom <= 0}
              onClick={() => onZoomChange(Math.max(0, zoom - 25))}
              type="button"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              aria-label="Zoom level"
              className="w-24 accent-[var(--fylmico-accent)]"
              max={100}
              min={0}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              step={25}
              type="range"
              value={zoom}
            />
            <button
              aria-label="Zoom in"
              className="grid h-7 w-7 place-items-center rounded-md text-[#667085] hover:bg-black/[0.04] disabled:opacity-40 dark:text-[#7d8299] dark:hover:bg-white/[0.06]"
              disabled={zoom >= 100}
              onClick={() => onZoomChange(Math.min(100, zoom + 25))}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
