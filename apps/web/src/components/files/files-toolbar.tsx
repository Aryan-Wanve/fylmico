"use client";

import {
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FilesTab = "all" | "shared" | "trash";
export type FilesViewMode = "grid" | "list";

const TABS: Array<{ value: FilesTab; label: string }> = [
  { value: "all", label: "All Files" },
  { value: "shared", label: "Shared with me" },
  { value: "trash", label: "Trash" }
];

export function FilesToolbar({
  activeTab,
  onTabChange,
  counts
}: {
  activeTab: FilesTab;
  onTabChange: (tab: FilesTab) => void;
  counts: Record<FilesTab, string>;
}) {
  return (
    <Tabs
      className="max-w-full min-w-0 overflow-x-auto"
      onValueChange={(value) => onTabChange(value as FilesTab)}
      value={activeTab}
    >
      <TabsList className="shrink-0" variant="default">
        {TABS.map((tab) => (
          <TabsTrigger className="group" key={tab.value} value={tab.value}>
            {tab.label}
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black/[0.06] px-1 text-xs font-bold text-[#4b5268] group-data-active:bg-[#654cff]/10 group-data-active:text-[#654cff]">
              {counts[tab.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function FilesBreadcrumb({ path }: { path: string[] }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      {path.map((segment, index) => (
        <span className="flex min-w-0 items-center gap-1.5" key={segment}>
          {index > 0 ? (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#c3c7d4]" />
          ) : null}
          <span
            className={`truncate ${
              index === path.length - 1
                ? "font-bold text-[#11142c]"
                : "font-semibold text-[#8a90a3]"
            }`}
          >
            {segment}
          </span>
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
    <div className="flex shrink-0 items-center gap-3">
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
      <button
        className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#4b5268] hover:bg-black/[0.03]"
        type="button"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
    </div>
  );
}
