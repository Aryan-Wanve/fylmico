"use client";

import { LayoutGrid, List, Minus, Plus, Play } from "lucide-react";
import type { Board } from "@/components/storyboard/storyboard-data";

export type BoardViewMode = "grid" | "list";

export function BoardToolbar({
  board,
  viewMode,
  onViewModeChange,
  zoom,
  onZoomChange,
  onPresent
}: {
  board: Board;
  viewMode: BoardViewMode;
  onViewModeChange: (mode: BoardViewMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPresent: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-[#11142c]">{board.name}</h2>
          {board.badge ? (
            <span className="rounded-full bg-[#654cff]/10 px-2 py-0.5 text-xs font-bold text-[#654cff]">
              {board.badge}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-[#8a90a3]">
          {board.shots.length} frames &bull; Updated {board.updatedLabel}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
          onClick={onPresent}
          type="button"
        >
          <Play className="h-4 w-4" />
          Presentation
        </button>

        <div className="flex items-center gap-1 rounded-lg bg-black/[0.04] p-1">
          <button
            aria-pressed={viewMode === "grid"}
            className={`grid h-7 w-8 place-items-center rounded-md ${
              viewMode === "grid"
                ? "bg-white text-[#11142c] shadow-sm"
                : "text-[#8a90a3] hover:text-[#4b5268]"
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
                ? "bg-white text-[#11142c] shadow-sm"
                : "text-[#8a90a3] hover:text-[#4b5268]"
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
              className="grid h-7 w-7 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] disabled:opacity-40"
              disabled={zoom <= 0}
              onClick={() => onZoomChange(Math.max(0, zoom - 25))}
              type="button"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              aria-label="Zoom level"
              className="w-24 accent-[#654cff]"
              max={100}
              min={0}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              step={25}
              type="range"
              value={zoom}
            />
            <button
              aria-label="Zoom in"
              className="grid h-7 w-7 place-items-center rounded-md text-[#8a90a3] hover:bg-black/[0.04] disabled:opacity-40"
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
